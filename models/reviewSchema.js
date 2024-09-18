const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: {type: String},
    rating: {type: Number, required: true},
    text: {type: String},
    platform: {type: String},
    image: {type: String}
});

module.exports = mongoose.model("Review", reviewSchema);
