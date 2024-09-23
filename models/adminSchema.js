const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [
      /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
      "Please enter a valid email address",
    ],
  },
  password: { type: String, required: true },
  adminRole: { type: String, required: true, enum: ["superAdmin", "editor"] },
});

module.exports = mongoose.model("Admin", adminSchema);
