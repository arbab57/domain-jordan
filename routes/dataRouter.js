const router = require("express").Router()
const dataControl = require("../controllers/dataControl")
const {checkCache} = require("../middleware/redis")


router.get("/properties/featured",checkCache(), dataControl.getFeatured)
router.get("/properties/:id",checkCache(), dataControl.getSingleById)
router.get("/photos",checkCache(), dataControl.getPhotos)
router.get("/reviews",checkCache(), dataControl.getReviews)
router.get("/blogs",checkCache(), dataControl.getBlogs)


module.exports = router
