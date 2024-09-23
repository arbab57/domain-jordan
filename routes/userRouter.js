const router = require("express").Router()
const userControl = require('../controllers/userControl')
const bookingControl = require("../controllers/bookingControl")
const {verifyUserToken} = require("../middleware/verifyUserToken")
const {checkCache} = require("../middleware/redis")
const passport = require("passport")

router.post("/register", userControl.register);
router.post("/login", userControl.login);
router.post("/login/google", userControl.googleAuth);
router.get('/login/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.post("/signout", userControl.SignOut);
router.delete("/delete",verifyUserToken, userControl.deleteUser);
router.post("/change-password", verifyUserToken, userControl.changePassword);
router.get("/check", verifyUserToken,  userControl.check)
router.get("/details", verifyUserToken, checkCache(), userControl.userData)
router.patch("/change-details", verifyUserToken, userControl.changeDetails)
router.put("/bookings", verifyUserToken, bookingControl.addBookingUser)
router.get("/bookings",verifyUserToken, checkCache(), bookingControl.getUserBookings)
router.get("/bookings/upcomming",verifyUserToken, checkCache(), bookingControl.getUserUpcommingBookings)
router.get("/bookings/past",verifyUserToken, checkCache(), bookingControl.getUserPastBookings)
router.delete("/bookings/:id",verifyUserToken, bookingControl.cancelBooking)


router.get('/auth/facebook/callback',
    passport.authenticate('facebook', { session: false }),
    (req, res) => {
      const { user, token } = req.user;
      res.cookie('userToken', token, {
        httpOnly: true,
      });
      res.status(200).json({
        message: 'User successfully logged in',
        user: user
      });
    }
  );




module.exports = router
