const { default: mongoose } = require("mongoose");
const Admin = require("../models/adminSchema");
const Property = require("../models/propertySchema");
const Photo = require("../models/photoSchema");
const Blog = require("../models/blogSchema");
const User = require("../models/userSchema");
const Booking = require("../models/bookingSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_TOKEN } = require("../config/crypto");
const { deleteKeys } = require("../utils/redisUtils");
const cloudinary = require("../config/cloudinaryConfig");

exports.addAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });
    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!role) return res.status(400).json({ message: "Role is required" });
    if (!password)
      return res.status(400).json({ message: "Password is required" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({
      name: name,
      email: email,
      password: hashedPassword,
      adminRole: role,
    });
    const savedAdmin = await newAdmin.save();
    deleteKeys("/accounts*");
    res.status(201).json({ message: "admin added" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.delAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const objectId = new mongoose.Types.ObjectId(id);
    if (objectId.equals(req.id)) {
      return res.status(400).json({ message: "Cannot delete logged in Admin" });
    }
    const del = await Admin.deleteOne({ _id: id });
    deleteKeys("/accounts*");
    res.status(200).json({ message: "admin deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email: email });
    if (!admin) return res.status(404).json({ message: "Admin not found!" });
    const IsMatch = await bcrypt.compare(password, admin.password);
    if (!IsMatch) return res.status(401).json({ message: "Wrong password!" });
    let payload = { id: admin._id };
    const token = jwt.sign(payload, SECRET_TOKEN);
    res.cookie("adminToken", token, {
      httpOnly: true,
      path: "/",
      sameSite: "None",
      // maxAge: 60 * 60 * 1000,
      secure: true,
    });
    res.status(200).json({ role: admin.adminRole });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.SignOut = async (req, res) => {
  try {
    res.clearCookie("adminToken", {
      httpOnly: true,
      path: "/",
      sameSite: "None",
      secure: true,
    });
    return res.status(200).json({ message: "admin Sign out successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    const adminsWithOutPassword = admins.map((admin) => {
      return {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.adminRole,
      };
    });
    res.json(adminsWithOutPassword);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.changePass = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const { id } = req.id;
    const admin = await Admin.findById(id);
    const IsMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!IsMatch)
      return res.status(400).json({ message: "incorrect password" });
    const newPassHash = await bcrypt.hash(newPassword, 10);
    admin.password = newPassHash;
    await admin.save();
    res.status(200).json({ message: "password changed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOverview = async (req, res) => {
  try {
    const propertyCount = await Property.countDocuments();
    const blogCount = await Blog.countDocuments();
    const userCount = await User.countDocuments();
    const bookingCount = await Booking.countDocuments({
      bookingStatus: "Confirmed",
    });
    const data = { propertyCount, blogCount, userCount, bookingCount };
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const { limit = 5, page = 1 } = req.query;
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = pageNumber - 1 * pageSize;
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .populate({ path: "user", select: "name email" })
      .populate({
        path: "property",
        select: "name featuredImage",
        populate: { path: "featuredImage" },
      });

    const newUsers = await User.find().sort({ createdAt: -1 }).limit(pageSize);

    const userData = newUsers.map((user) => {
      const n = { _id: user._id, name: user.name, email: user.email };
      return n;
    });

    const latestAddedProperties = await Property.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({ path: "featuredImage photos" });
    const latestUpdatedProperties = await Property.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate({ path: "featuredImage photos" });
    const properties = {
      latestAdded: latestAddedProperties,
      latestUpated: latestUpdatedProperties,
    };
    const latestAddedBlogs = await Blog.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({ path: "image" });
    const latestUpdatedBlog = await Blog.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate({ path: "image" });
    const blogs = {
      latestAdded: latestAddedBlogs,
      latestUpated: latestUpdatedBlog,
    };
    res.status(200).json({ recentBookings, userData, properties, blogs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRecentUsers = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = pageNumber - 1 * pageSize;

    const newUsers = await User.find().sort({ createdAt: -1 }).limit(pageSize);

    const userData = newUsers.map((user) => {
      const n = { _id: user._id, name: user.name, email: user.email };
      return n;
    });
    res.status(200).json({
      page: pageNumber,
      limit: pageSize,
      results: userData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addProperty = async (req, res) => {
  try {
    const {
      name,
      maxOccupancy,
      surfaceArea,
      bedding,
      airCon,
      price,
      availabile,
      category,
      featuredImageId,
      photosIds = [],
      metaTitle = "",
      metaDescription = "",
      metaTags = "",
      description,
    } = req.body;

    if (!name) return res.status(400).json({ message: "Name is Required" });
    if (!maxOccupancy)
      return res.status(400).json({ message: "Max Occupancy is Required" });
    if (!surfaceArea)
      return res.status(400).json({ message: "Surface Area is Required" });
    if (!bedding)
      return res.status(400).json({ message: "Bedding type is Required" });
    if (!description)
      return res.status(400).json({ message: "Description type is Required" });
    if (!price)
      return res.status(400).json({ message: "Price Per Night is Required" });
    if (!category)
      return res.status(400).json({ message: "Category is Required" });
    if (featuredImageId && req.featuredImage)
      return res
        .status(400)
        .json({ message: "Cannot set two featured images" });
    if (!featuredImageId && !req.featuredImage)
      return res.status(400).json({ message: "featured image required" });

    const newProperty = new Property({
      name,
      maxOccupancy,
      surfaceArea,
      bedding,
      airCon,
      price,
      availabile,
      category,
      featuredImage: featuredImageId,
      photos: [...photosIds],
      metaTitle,
      metaDescription,
      metaTags,
      description,
    });
    await newProperty.save();
    deleteKeys("/properties*");
    deleteKeys("/recents*");
    res.status(200).json({ message: "Property Added" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.delProperty = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "invalid ID" });
    const property = await Property.findById(id);
    if (!property)
      return res.status(404).json({ message: "Property not found" });
    await Property.deleteOne({ _id: id });
    deleteKeys("/properties*");
    deleteKeys("/recents*");

    res.status(200).json({ message: "Property deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const {
      name,
      maxOccupancy,
      surfaceArea,
      bedding,
      airCon,
      price,
      availabile,
      category,
      featuredImageId,
      photoIds = [],
      metaTitle,
      metaDescription,
      metaTags,
      description,
    } = req.body;
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "invalid ID" });
    const property = await Property.findById(id);
    if (!property)
      return res.status(404).json({ message: "Property not found" });

    property.name = name || property.name;
    property.maxOccupancy = maxOccupancy || property.maxOccupancy;
    property.surfaceArea = surfaceArea || property.surfaceArea;
    property.bedding = bedding || property.bedding;
    property.airCon = airCon || property.airCon;
    property.availabile = availabile || property.availabile;
    property.category = category || property.category;
    property.price = price || property.price;
    property.featuredImage =
      featuredImageId || req.featuredImage || property.featuredImage;
    property.photos = [...photoIds] || property.photos;
    property.metaTitle = metaTitle || property.metaTitle;
    property.metaTags = metaTags || property.metaTags;
    property.metaDescription = metaDescription || property.metaDescription;
    property.description = description || property.description;
    await property.save();
    deleteKeys("/properties*");
    deleteKeys("/recents*");
    res.status(200).json({ message: "Property updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProperties = async (req, res) => {
  try {
    const {
      query,
      sortfield = "",
      sortorder = "asc",
      available,
      minPrice,
      maxPrice,
      category,
      page = 1,
      limit = 10,
    } = req.query;
    const filter = {};

    if (query) {
      filter.name = { $regex: query, $options: "i" };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) {
        filter.price.$gte = minPrice;
      }
      if (maxPrice) {
        filter.price.$lte = maxPrice;
      }
    }
    if (category) {
      filter.category = { $regex: category, $options: "i" };
    }
    if (available) {
      filter.availabile = available;
    }

    let sortF;
    if (sortfield === "price") {
      sortF = "price";
    }
    if (sortfield === "date") {
      sortF = "createdAt";
    }

    const validsortfields = ["price", "createdAt"];
    const validsortorder = ["asc", "desc"];
    let sortCriteria = {};

    if (
      sortfield &&
      validsortfields.includes(sortF) &&
      validsortorder.includes(sortorder)
    ) {
      sortCriteria[sortF] = sortorder === "asc" ? 1 : -1;
    } else {
      sortCriteria = { _id: 1 }; // Default sort by _id if invalid or not provided
    }

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    const totalCount = await Property.countDocuments(filter);

    const properties = await Property.find(filter)
      .sort(sortCriteria)
      .populate("featuredImage photos")
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .exec();

    res.status(200).json({
      page: pageNumber,
      limit: pageSize,
      totalResults: totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      results: properties,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addPhotos = async (req, res) => {
  try {
    if (!req.files)
      return res.status(400).json({ error: "atlease one image is required" });
    const imagePromises = req.files["photos"].map(async (photo) => {
      const newPhoto = new Photo({ url: photo.path });
      return await newPhoto.save();
    });
    const savedPhotos = await Promise.all(imagePromises);
    deleteKeys("/photos*");
    res.status(200).json({ message: "Photo Added" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePhoto = async (req, res) => {
  try {
    const { title = "" } = req.body;
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "invalid ID" });
    const photo = await Photo.findById(id);
    if (!photo) return res.status(404).json({ message: "photo not found" });
    photo.title = title;
    await photo.save();
    deleteKeys("/photos*");
    deleteKeys("/properties*");
    deleteKeys("/blogs*");
    deleteKeys("/recents*");
    res.status(200).json({ message: "Photo updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.delPhoto = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids)
      return res.status(400).json({ message: "atlease one id is required" });
    const photos = await Photo.find({ _id: { $in: ids } });
    if (photos.length > 0) {
      const promises = photos.map(async (phot) => {
        const publicId = phot?.url?.split("property-images/")[1].split(".")[0];
        return await cloudinary.uploader.destroy(`property-images/${publicId}`);
      });
      const x = await Promise.all(promises);
    }
    await Photo.deleteMany({ _id: { $in: ids } });
    deleteKeys("/photos*");
    deleteKeys("/properties*");
    deleteKeys("/blogs*");
    deleteKeys("/recents*");
    res.status(200).json({ message: "Photos deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addBlogs = async (req, res) => {
  try {
    const {
      title,
      content,
      author,
      publishDate,
      tags,
      excrept,
      imageId,
      metaTitle = "",
      metaDescription = "",
      metaTags = "",
    } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });
    if (!content)
      return res.status(400).json({ message: "Content is required" });
    if (!author) return res.status(400).json({ message: "Author is required" });
    // if (!publishDate)
    //   return res.status(400).json({ message: "Publish Date is required" });
    if (!tags) return res.status(400).json({ message: "Tags are required" });
    if (!excrept)
      return res.status(400).json({ message: "excrept is required" });

    const imageURL = req?.file?.path;
    if (!imageURL && !imageId)
      return res.status(400).json({ message: "Image is required" });
    if (imageURL && imageId)
      return res.status(400).json({ message: "cannot add two images" });
    let newPhoto;
    let savedPhoto;
    if (!imageId) {
      newPhoto = new Photo({ url: imageURL });
      savedPhoto = await newPhoto.save();
    }
    const newBlog = new Blog({
      title,
      content,
      author,
      publishDate,
      tags,
      excrept,
      image: savedPhoto?._id || imageId,
      metaTitle,
      metaDescription,
      metaTags,
    });
    await newBlog.save();
    deleteKeys("/blogs*");
    deleteKeys("/recents*");

    res.status(200).json({ message: "Blog Post Added" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.delBlogs = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "invalid ID" });
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: "Event not found" });
    await Blog.deleteOne({ _id: id });
    deleteKeys("/blogs*");
    deleteKeys("/recents*");

    res.status(200).json({ message: "blog deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBlogs = async (req, res) => {
  try {
    const {
      title,
      content,
      author,
      publishDate,
      tags,
      excrept,
      imageId,
      metaTitle,
      metaDescription,
      metaTags,
    } = req.body;
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "invalid ID" });
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: "Event not found" });
    const imageURL = req?.file?.path;
    let newPhoto;
    let savedPhoto;
    if (!imageId && imageURL) {
      newPhoto = new Photo({ url: imageURL });
      savedPhoto = await newPhoto.save();
    }
    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.author = author || blog.author;
    blog.publishDate = publishDate || blog.publishDate;
    blog.tags = tags || blog.tags;
    blog.excrept = excrept || blog.excrept;
    blog.image = imageId || savedPhoto?._id || blog.image;
    blog.metaTitle = metaTitle || blog.metaTitle;
    blog.metaTags = metaTags || blog.metaTags;
    blog.metaDescription = metaDescription || blog.metaDescription;
    await blog.save();
    deleteKeys("/blogs*");
    deleteKeys("/recents*");

    res.status(200).json({ message: "blog updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, query } = req.query;
    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * pageSize;

    let filter = {};

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ];
    }
    const users = await User.find(filter)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 });
    const totalCount = await User.countDocuments(filter);
    const toSend = users.map((user) => {
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.number,
        address: user.address,
      };
    });
    res.status(200).json({
      page: pageNumber,
      limit: pageSize,
      totalResults: totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      results: toSend,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(400).json({ message: "User not Found" });
    await User.deleteOne({ _id: user._id });
    deleteKeys("/users*");
    deleteKeys("/recents/users*");
    res.status(200).json({ message: "User Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.check = async (req, res) => {
  try {
    res.status(200).json({ message: "Logged in" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
