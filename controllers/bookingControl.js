const Booking = require("../models/bookingSchema");
const Property = require("../models/propertySchema");
const redisClient = require("../config/redis");
const User = require("../models/userSchema");
const { default: mongoose } = require("mongoose");
const { clearCache, deleteKeys } = require("../utils/redisUtils");
const { sendOtpEmail } = require("../config/nodemailer");
const { options } = require("../routes/adminRouter");

async function isPropertyAvailable(propertyId, checkInDate, checkOutDate) {
  try {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    const overlappingBookings = await Booking.find({
      property: propertyId,
      $or: [
        // =======
        //  ====
        {
          checkInDate: { $gte: checkIn },
          checkOutDate: { $lte: checkOut },
        },
        //  =======
        //  =====
        {
          checkInDate: { $lte: checkIn },
          checkOutDate: { $gte: checkIn },
        },
        //  =======
        //        =============
        {
          checkInDate: { $lte: checkOut },
          checkOutDate: { $gte: checkOut },
        },
        //  =======
        //  =============
        {
          checkInDate: { $lte: checkIn },
          checkOutDate: { $gte: checkOut },
        },
      ],
    });
    const result = {
      status: overlappingBookings.length === 0,
      overlappingBookings,
    };
    return result;
  } catch (error) {
    console.log(error.message);
  }
}

exports.addBookingAdmin = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      numberOfGuests,
      property,
      checkInDate,
      checkOutDate,
      paymentStatus,
      bookingStatus,
    } = req.body;
    const prop = await Property.findById(property);
    if (!prop) return res.status(400).json({ message: "Property not Found" });
    if (!name) return res.status(400).json({ message: "Name is Required" });
    if (!numberOfGuests)
      return res.status(400).json({ message: "Number of guests is Required" });
    if (!email && !phone)
      return res
        .status(400)
        .json({ message: "Email or Phone Number is Required" });
    if (!checkInDate)
      return res.status(400).json({ message: "Check In date is Required" });
    if (!checkOutDate)
      return res.status(400).json({ message: "Check out date is Required" });
    if (checkOutDate < checkInDate)
      return res
        .status(400)
        .json({ message: "Check out cannot be after check in" });
    if (!property)
      return res.status(400).json({ message: "Property is Required" });

    const available = await isPropertyAvailable(
      property,
      checkInDate,
      checkOutDate
    );
    if (!available.status) {
      return res.status(400).json({
        message: "Property is not available for the selected dates.",
        overlapping: available.overlappingBookings,
      });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    const newBooking = new Booking({
      name: name,
      email: email,
      phone: phone,
      numberOfGuests: numberOfGuests,
      property: property,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      paymentStatus: paymentStatus,
      bookingStatus: bookingStatus,
      propertyName: prop?.name,
    });
    await newBooking.save();
    prop.bookings.push(newBooking);
    await prop.save();
    deleteKeys("/properties/bookings/search*");
    deleteKeys("/recents*");
    deleteKeys("/properties*");


    return res.status(201).json({ message: "New Booking Added" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.addBookingUser = async (req, res) => {
  try {
    const userId = req.id;
    const {
      name,
      email,
      phone,
      numberOfGuests,
      propertyId,
      checkInDate,
      checkOutDate,
    } = req.body;
    if (!propertyId)
      return res.status(400).json({ message: "Property is Required" });
    const prop = await Property.findById(propertyId);
    if (!prop) return res.status(400).json({ message: "Property not Found" });
    if (!checkInDate)
      return res.status(400).json({ message: "Check In date is Required" });
    if (!checkOutDate)
      return res.status(400).json({ message: "Check out date is Required" });
    const available = await isPropertyAvailable(
      propertyId,
      checkInDate,
      checkOutDate
    );
    if (!available) {
      return res
        .status(400)
        .json({ message: "Property is not available for the selected dates." });
    }
    if (!name) return res.status(400).json({ message: "Name is Required" });
    if (!numberOfGuests)
      return res.status(400).json({ message: "Number of guests is Required" });
    if (numberOfGuests > prop.maxOccupancy)
      return res.status(400).json({ message: "Max occupancy reached" });
    if (!email && !phone)
      return res
        .status(400)
        .json({ message: "Email or Phone Number is Required" });

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const user = await User.findById(userId);

    const newBooking = new Booking({
      name: name,
      email: email || user.email,
      phone: phone,
      numberOfGuests: numberOfGuests,
      property: propertyId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      propertyName: prop?.name,
      user: userId,
    });
    const savedBooking = await newBooking.save();
    prop.bookings.push(newBooking);
    await prop.save();
    user.bookings.push(newBooking);
    await user.save();
    deleteKeys(`/bookings/${userId}*`);
    deleteKeys("/properties*");
    deleteKeys("/recents*");
    const info = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Booking Notification</title>
</head>
<body>
    <h1>New Booking Received!</h1>
    <p>Hello Admin,</p>
    <p>A new booking has been made on your platform.</p>
    <p><strong>Booking Details:</strong></p>
    <ul>
        <li><strong>Booking ID:</strong> ${savedBooking._id}</li>
        <li><strong>Property:</strong> ${savedBooking.propertyName}</li>
        <li><strong>Guest Name:</strong> ${savedBooking.name}</li>
        <li><strong>Check-In Date:</strong> ${savedBooking.checkInDate}}</li>
        <li><strong>Check-Out Date:</strong> ${savedBooking.checkOutDate}</li>
    </ul>
    <p>Please log in to the admin panel to view and manage the booking.</p>
    <p>Thank you,</p>
    <p>Your Team</p>
</body>
</html>`;
    sendOtpEmail(process.env.ADMIN_EMAIL, info, "New Booking");
    return res.status(201).json({ message: "New Booking Added" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getBookingsAdmin = async (req, res) => {
  try {
    const {
      query,
      bookingStatus,
      paymentStatus,
      checkInDate,
      checkOutDate,
      page = 1,
      limit = 10,
      sortorder,
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;
    sortObjectAsc = { createdAt: -1 };
    sortObjectDesc = { createdAt: 1 };
    const sortCriteria = sortorder === "desc" ? sortObjectDesc : sortObjectAsc;

    let filter = {};
    if (query) {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(query);
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ];

      if (isValidObjectId) {
        filter.$or.push({ _id: new mongoose.Types.ObjectId(query) });
      }
    }

    if (bookingStatus) {
      filter.bookingStatus = bookingStatus;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    if (checkInDate || checkOutDate) {
      if (checkInDate) filter.checkInDate = { $gte: new Date(checkInDate) };
      if (checkOutDate) filter.checkOutDate = { $lte: new Date(checkOutDate) };
    }

    const bookings = await Booking.find(filter)
      .sort(sortCriteria)
      .skip(skip)
      .limit(pageSize)
      .populate({ path: "property", select: "name" })
      .populate({ path: "user", select: "name email" });

    const totalCount = await Booking.countDocuments(filter);

    res.status(200).json({
      page: pageNumber,
      limit: pageSize,
      totalResults: totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      results: bookings,
    });
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ message: error.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.id;
    const { sortorder } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    sortObjectAsc = { createdAt: -1 };
    sortObjectDesc = { createdAt: 1 };
    const sort = sortorder === "desc" ? sortObjectDesc : sortObjectAsc;

    const user = await User.findById(userId)
      .populate({
        path: "bookings",
        options: { skip, limit, sort },
        populate: {
          path: "property",
          select: "name price featuredImage category",
          populate: { path: "featuredImage", select: "url title" },
        },
      })
      .exec();
    const totalCount = user.bookings.length;

    res.status(200).json({
      page: page,
      limit: limit,
      totalResults: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      results: user.bookings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserUpcommingBookings = async (req, res) => {
  try {
    const userId = req.id;
    const { sortorder } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    sortObjectAsc = { createdAt: -1 };
    sortObjectDesc = { createdAt: 1 };
    const sort = sortorder === "desc" ? sortObjectDesc : sortObjectAsc;
    const user = await User.findById(userId);
    const currentDate = new Date(Date.now());
    const bookings = await Booking.find({
      _id: { $in: user.bookings },
      checkInDate: { $gte: currentDate },
    })
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .populate({
        path: "property",
        select: "name price featuredImage category",
        populate: { path: "featuredImage", select: "url title" },
      })
      .populate({ path: "user", select: "name email" });
    const totalCount = user.bookings.length;

    res.status(200).json({
      page: page,
      limit: limit,
      totalResults: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      results: bookings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserPastBookings = async (req, res) => {
  try {
    const userId = req.id;
    const { sortorder } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    sortObjectAsc = { createdAt: -1 };
    sortObjectDesc = { createdAt: 1 };
    const sort = sortorder === "desc" ? sortObjectDesc : sortObjectAsc;
    const user = await User.findById(userId);
    const currentDate = new Date(Date.now());
    const bookings = await Booking.find({
      _id: { $in: user.bookings },
      checkInDate: { $lte: currentDate },
    })
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .populate({
        path: "property",
        select: "name price featuredImage category",
        populate: { path: "featuredImage", select: "url title" },
      })
      .populate({ path: "user", select: "name email" });
    const totalCount = user.bookings.length;

    res.status(200).json({
      page: page,
      limit: limit,
      totalResults: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      results: bookings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.editBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      numberOfGuests,
      property,
      checkInDate,
      checkOutDate,
      paymentStatus,
      bookingStatus,
    } = req.body;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(400).json({ message: "Booking not found" });
    if (checkInDate || checkOutDate) {
      const available = await isPropertyAvailable(
        booking.property,
        checkInDate || booking.checkInDate,
        checkOutDate || booking.checkOutDate
      );
      if (!available.status) {
        return res.status(400).json({
          message: "Property is not available for the selected dates.",
          overlapping: available.overlappingBookings,
        });
      }
    }
    let checkIn;
    let checkOut;

    if (checkInDate) {
      checkIn = new Date(checkInDate);
    } else {
      checkIn = booking.checkInDate;
    }
    if (checkOutDate) {
      checkOut = new Date(checkOutDate);
    } else {
      checkIn = booking.checkOutDate;
    }

    booking.name = name || booking.name;
    booking.email = email || booking.email;
    booking.phone = phone || booking.phone;
    booking.numberOfGuests = numberOfGuests || booking.numberOfGuests;
    booking.property = property || booking.property;
    booking.checkInDate = checkIn || booking.checkInDate;
    booking.checkOutDate = checkOut || booking.checkOutDate;
    booking.paymentStatus = paymentStatus || booking.paymentStatus;
    booking.bookingStatus = bookingStatus || booking.bookingStatus;
    const savedBooking = await booking.save();
    deleteKeys("/bookings*");
    deleteKeys("/recents*");
    deleteKeys("/properties*");

    if (
      (checkInDate && savedBooking?.user) ||
      (checkOutDate && savedBooking?.user)
    ) {
      const user = await User.findById(savedBooking.user);
      const info = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Update</title>
</head>
<body>
    <h1>Booking Update</h1>
    <p>Hello ${user.name},</p>
    <p>We wanted to let you know that your booking has been updated.</p>
    <p><strong>Updated Booking Details:</strong></p>
    <ul>
        <li><strong>Booking ID:</strong> ${savedBooking._id}}</li>
        <li><strong>Property:</strong> ${savedBooking.propertyName}</li>
        <li><strong>Check-In Date:</strong> ${savedBooking.checkInDate}</li>
        <li><strong>Check-Out Date:</strong> ${savedBooking.checkOutDate}</li>
    </ul>
    <p>If you have any questions, feel free to contact us.</p>
    <p>Thank you,</p>
    <p>Your Team</p>
</body>
</html>
`;
      sendOtpEmail(user.email, info, "Booking Update");
    }
    res.status(200).json({ message: "Booking Updated Successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.confirmBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(400).json({ message: "Booking not found" });
    booking.bookingStatus = "Confirmed";
    await booking.save();
    const user = await User.findById(booking.user);
    deleteKeys("/bookings*");
    deleteKeys("/recents*");
    deleteKeys("/properties*");
    const info = `<!DOCTYPE html>
      <html lang="en">
      <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmation</title>
    </head>
    <body>
    <h1>Booking Confirmed!</h1>
    <p>Hello ${user.name},</p>
    <p>Your booking has been successfully confirmed.</p>
    <p><strong>Booking Details:</strong></p>
    <ul>
        <li><strong>Booking ID:</strong> ${booking._id}</li>
        <li><strong>Property:</strong> ${booking.propertyName}</li>
        <li><strong>Check-In Date:</strong> ${booking.checkInDate}</li>
        <li><strong>Check-Out Date:</strong> ${booking.checkOutDate}</li>
    </ul>
    <p>We look forward to hosting you!</p>
    <p>Thank you,</p>
    <p>Your Team</p>
    </body>
    </html>
      `;
    console.log(user.email);
    sendOtpEmail(user.email, info, "Booking Confirmation");
    res.status(200).json({ message: "Booking confirmed Successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.cancelBookingAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(400).json({ message: "Booking not found" });
    booking.bookingStatus = "Cancelled";
    await booking.save();
    const user = await User.findById(booking.user);
    deleteKeys("/bookings*");
    deleteKeys("/recents*");
    deleteKeys("/properties*");
    const info = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Cancellation</title>
</head>
<body>
    <h1>Booking Cancelled</h1>
    <p>Hello ${user.name},</p>
    <p>We regret to inform you that your booking has been cancelled.</p>
    <p><strong>Cancelled Booking Details:</strong></p>
    <ul>
        <li><strong>Booking ID:</strong> ${booking._id}</li>
        <li><strong>Property:</strong> ${booking.propertyName}</li>
        <li><strong>Check-In Date:</strong> ${booking.checkInDate}</li>
        <li><strong>Check-Out Date:</strong> ${booking.checkOutDate}</li>
    </ul>
    <p>If you have any questions or need further assistance, please contact us.</p>
    <p>Thank you,</p>
    <p>Your Team</p>
</body>
</html>
`;
    console.log(user.email);
    sendOtpEmail(user.email, info, "Booking Update");
    res.status(200).json({ message: "Booking Cancelled Successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const userId = req.id;
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(400).json({ message: "Booking not found" });
    if (!booking?.user.equals(userId))
      return res
        .status(400)
        .json({ message: "Not Authorized to delete this booking" });

    const timeToCheckIn = Date.parse(booking.checkInDate) - Date.now();
    const timeToCheckInInDays = timeToCheckIn / (1000 * 60 * 60 * 24);

    if (timeToCheckInInDays <= 3) {
      return res
        .status(400)
        .json({ message: "Cannot cancel within 3 days of check-in time." });
    }
    booking.bookingStatus = "Cancelled";
    const savedBooking = await booking.save();
    deleteKeys(`/bookings/${userId}*`);
    deleteKeys("/properties/bookings/search*");
    const info = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Booking Notification</title>
</head>
<body>
    <h1>Booking Cancelled</h1>
    <p>Hello Admin,</p>
    <p>A booking has been cancelled.</p>
    <p><strong>Booking Details:</strong></p>
    <ul>
        <li><strong>Booking ID:</strong> ${savedBooking._id}</li>
        <li><strong>Property:</strong> ${savedBooking.propertyName}</li>
        <li><strong>Guest Name:</strong> ${savedBooking.name}</li>
        <li><strong>Check-In Date:</strong> ${savedBooking.checkInDate}}</li>
        <li><strong>Check-Out Date:</strong> ${savedBooking.checkOutDate}</li>
    </ul>
    <p>Please log in to the admin panel to view and manage the booking.</p>
    <p>Thank you,</p>
    <p>Your Team</p>
</body>
</html>`;
    sendOtpEmail(process.env.ADMIN_EMAIL, info, "Booking Cancelled");
    return res.status(200).json({ message: "Booking canceled Successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteBookingAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(400).json({ message: "Booking not found" });
    const property = await Property.findById(booking.property);
    if (property) {
      property.bookings = property?.bookings.filter(
        (bookin) => !bookin._id.equals(booking._id)
      );
      await property.save();
    }
    if (booking?.user) {
      const user = await User.findById(booking.user);
      user.bookings = user.bookings?.filter(
        (bookin) => !bookin._id.equals(booking._id)
      );
      await user.save();
    }
    await Booking.deleteOne({ _id: id });
    deleteKeys("/bookings*");
    deleteKeys("/recents*");
    deleteKeys("/properties*");
    return res.status(200).json({ message: "Booking Deleted Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};
