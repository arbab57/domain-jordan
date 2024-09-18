const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String },
    phone: { type: Number },
    propertyName: { type: String },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    numberOfGuests: { type: Number, required: true },
    bookingStatus: {
      type: String,
      enum: ["Pending", "Cancelled", "Confirmed"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Unpaid"],
      default: "Unpaid",
    },
    property: { type: mongoose.Types.ObjectId, ref: "Property" },
    user: { type: mongoose.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
