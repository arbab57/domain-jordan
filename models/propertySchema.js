const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    maxOccupancy: { type: Number, required: true },
    surfaceArea: { type: Number, required: true },
    bedding: { type: String, required: true },
    airCon: { type: Boolean, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    availabile: { type: Boolean, required: true, default: true },
    category: { type: String, required: true },
    featuredImage: { type: mongoose.Types.ObjectId, ref: "Photo" },
    photos: [{ type: mongoose.Types.ObjectId, ref: "Photo" }],
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaTags: [{ type: String }],
    bookings: [{ type: mongoose.Types.ObjectId, ref: "Booking" }],
    bookingCount: {type: Number, default: 0}
  },
  { timestamps: true }
);

propertySchema.pre('save', function(next){
  const bookingNumber = this.bookings.length
  this.bookingCount = bookingNumber
  next()
})

module.exports = mongoose.model("Property", propertySchema);
