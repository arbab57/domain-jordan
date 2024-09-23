const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    image: { type: mongoose.Types.ObjectId, ref: "Photo", required: true },
    publishDate: { type: Date },
    tags: [{ type: String, required: true }],
    excrept: { type: String, required: true },
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaTags: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);
