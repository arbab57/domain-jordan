const router = require("express").Router();
const adminControl = require("../controllers/adminControl");
const dataControl = require("../controllers/dataControl");
const bookingControl = require('../controllers/bookingControl')
const { verifyAdminToken } = require("../middleware/verifyAdminToken");
const { uploadHandler } = require("../middleware/upload");
const { multipleImages } = require("../middleware/multipleImages");
const { checkCache } = require("../middleware/redis")

//auth
router.put("/accounts",verifyAdminToken, adminControl.addAdmin);
router.delete("/accounts/:id",verifyAdminToken, adminControl.delAdmin);
router.post("/accounts/login", adminControl.Login);
router.post("accounts/signout",verifyAdminToken, adminControl.SignOut);
router.get("/accounts",verifyAdminToken, checkCache(), adminControl.getAdmins);
router.patch("/accounts/password",verifyAdminToken, adminControl.changePass);
router.get("/accounts/editors",verifyAdminToken, checkCache(), adminControl.getEditors);
router.delete("/accounts/editors/:id",verifyAdminToken, adminControl.delEditor);
router.put("/accounts/editors",verifyAdminToken, adminControl.addEditors);
router.get("/overview", verifyAdminToken, checkCache(), adminControl.getOverview);
router.get("/recents/bookings",verifyAdminToken, checkCache(), adminControl.getRecentBookings);
router.get("/recents/users", verifyAdminToken, checkCache(), adminControl.getRecentUsers);
//Properties
router.get("/properties/recents",checkCache(), adminControl.getRecentProperties);
router.put("/properties", multipleImages, adminControl.processPhotos, adminControl.addProperty);
router.delete("/properties/:id", adminControl.delProperty);
router.patch("/properties/:id", multipleImages,adminControl.processPhotos, adminControl.updateProperty);
router.get("/properties",checkCache(), adminControl.getProperties);
router.get("/properties/:id",checkCache(), dataControl.getSingleById);
//bookings
router.get("/properties/bookings/search", checkCache(), bookingControl.getBookingsAdmin);
router.put("/properties/bookings",  bookingControl.addBookingAdmin);
router.patch("/properties/bookings/:id",  bookingControl.editBooking);
router.patch("/properties/bookings/confirmation/:id",  bookingControl.confirmBooking);
router.delete("/properties/bookings/cancellation/:id",  bookingControl.cancelBookingAdmin);
router.delete("/properties/bookings/:id",  bookingControl.deleteBookingAdmin);
//blogs
router.get("/blogs/recents",checkCache(), adminControl.getRecentBlogs);
router.get("/blogs",checkCache(), dataControl.getBlogs);
router.put("/blogs", uploadHandler, adminControl.addBlogs);
router.patch("/blogs/:id", uploadHandler, adminControl.updateBlogs);
router.delete("/blogs/:id", adminControl.delBlogs);
//photos
router.get("/photos",checkCache(), dataControl.getPhotos);
router.put("/photos", multipleImages, adminControl.addPhotos);
router.patch("/photos/:id", uploadHandler, adminControl.updatePhoto);
router.delete("/photos", adminControl.delPhoto);
//reviews
router.get("/reviews",checkCache(), dataControl.getReviews);
router.post("/reviews", uploadHandler, adminControl.addReview);
router.delete("/reviews/:id", adminControl.delReview);

module.exports = router;
