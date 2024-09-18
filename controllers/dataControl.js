const Photo = require("../models/photoSchema");
const Review = require("../models/reviewSchema");
const Blog = require("../models/blogSchema");
const Property = require("../models/propertySchema");
// const Reservation = require("../models/bookingSchema");
const redisClient = require("../config/redis");
const { default: mongoose } = require("mongoose");

exports.getFeatured = async (req, res) => {
  try {
    // const key = req.originalUrl;
    const properties = await Property.find()
      .sort({ price: -1 })
      .limit(6)
      .populate({ path: "featuredImage" });
    // redisClient.setEx(key, 60, JSON.stringify(properties));
    res.json(properties);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getSingleById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "invalid ID" });
    const property = await Property.findById(id).populate({
      path: "featuredImage photos",
    });
    if (!property)
      return res.status(400).json({ message: "Property not found" });
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addReservation = async (req, res) => {
  try {
    const { persons, area } = req.body;
    const newReservation = new Reservation({ name, area });
    await newReservation.save();
    res.status(201).json({ message: "Reservation added" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPhotos = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * pageSize;

    const photos = await Photo.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);
    const totalCount = await Photo.countDocuments();

    res.status(200).json({
      page: pageNumber,
      limit: pageSize,
      totalResults: totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      results: photos,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * pageSize;

    const reviews = await Review.find().skip(skip).limit(pageSize);
    const totalCount = await Review.countDocuments();

    res.status(200).json({
      page: pageNumber,
      limit: pageSize,
      totalResults: totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      results: reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBlogs = async (req, res) => {
  try {
    const {
      title,
      tags,
      author,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortorder,
    } = req.query;
    const filter = {};

    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    if (tags) {
      filter.tags = { $in: tags.split(",").map((tag) => new RegExp(tag, "i")) };
    }

    if (author) {
      filter.author = { $regex: author, $options: "i" };
    }

    if (startDate || endDate) {
      filter.publishDate = {};
      if (startDate) {
        filter.publishDate.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.publishDate.$lte = new Date(endDate);
      }
    }
    sortObjectAsc = { createdAt: -1 };
    sortObjectDesc = { createdAt: 1 };
    const sortCriteria = sortorder === "desc" ? sortObjectDesc : sortObjectAsc;

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    const totalCount = await Blog.countDocuments(filter);

    const blogs = await Blog.find(filter)
      .sort(sortCriteria)
      .populate("image")
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .exec();

    res.status(200).json({
      page: pageNumber,
      limit: pageSize,
      totalResults: totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      results: blogs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
