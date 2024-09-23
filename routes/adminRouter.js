const router = require("express").Router();
const adminControl = require("../controllers/adminControl");
const dataControl = require("../controllers/dataControl");
const bookingControl = require('../controllers/bookingControl')
const { verifyAdminToken } = require("../middleware/verifyAdminToken");
const { multipleImages } = require("../middleware/multipleImages");
const { checkCache } = require("../middleware/redis")
const {checkRole} = require("../middleware/checkRole")

//auth
router.put("/accounts",verifyAdminToken, checkRole, adminControl.addAdmin);
router.delete("/accounts/:id",verifyAdminToken,checkRole, adminControl.delAdmin);
router.post("/accounts/login", adminControl.Login);
router.post("/accounts/signout",adminControl.SignOut);
router.get("/accounts",verifyAdminToken, checkRole, checkCache(), adminControl.getAdmins);
router.patch("/accounts/password",verifyAdminToken, adminControl.changePass);
router.get("/recents/overview", verifyAdminToken, checkRole, checkCache(), adminControl.getOverview);
router.get("/recents",verifyAdminToken, checkRole, checkCache(), adminControl.getRecentActivity);
router.get("/recents/users", verifyAdminToken, checkRole, checkCache(), adminControl.getRecentUsers);
//Properties
router.put("/properties",verifyAdminToken,  adminControl.addProperty);
router.delete("/properties/:id",verifyAdminToken, checkRole, adminControl.delProperty);
router.patch("/properties/:id",verifyAdminToken,  adminControl.updateProperty);
router.get("/properties",verifyAdminToken, checkCache(), adminControl.getProperties);
router.get("/properties/:id",verifyAdminToken,checkCache(), dataControl.getSingleById);
//photos
router.put("/photos",verifyAdminToken,  multipleImages, adminControl.addPhotos);
router.patch("/photos/:id",verifyAdminToken, adminControl.updatePhoto);
router.delete("/photos",verifyAdminToken, checkRole, adminControl.delPhoto);
router.get("/photos",verifyAdminToken,checkCache(), dataControl.getPhotos);
router.get("/photos/:id",verifyAdminToken,checkCache(),  dataControl.getPhotoById);
//blogs
router.get("/blogs",verifyAdminToken, checkCache(), dataControl.getBlogs);
router.put("/blogs",verifyAdminToken, adminControl.addBlogs);
router.patch("/blogs/:id",verifyAdminToken,  adminControl.updateBlogs);
router.delete("/blogs/:id",verifyAdminToken, checkRole, adminControl.delBlogs);
//users
router.get("/users",verifyAdminToken, checkRole, checkCache(), adminControl.getUsers);
router.delete("/users/:id",verifyAdminToken, checkRole, adminControl.deleteUser);
//checking if admin is logged in
router.get("/check",verifyAdminToken, adminControl.check);
//bookings
router.get("/properties/bookings/search",verifyAdminToken, checkRole, checkCache(), bookingControl.getBookingsAdmin);
router.put("/properties/bookings",verifyAdminToken, checkRole, bookingControl.addBookingAdmin);
router.patch("/properties/bookings/:id",verifyAdminToken, checkRole, bookingControl.editBooking);
router.patch("/properties/bookings/confirmation/:id",verifyAdminToken, checkRole, bookingControl.confirmBooking);
router.delete("/properties/bookings/cancellation/:id",verifyAdminToken, checkRole, bookingControl.cancelBookingAdmin);
router.delete("/properties/bookings/:id",verifyAdminToken, checkRole, bookingControl.deleteBookingAdmin);





module.exports = router;
