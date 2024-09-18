const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema(
  {
    title: { type: String },
    url: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Photo", photoSchema);
