const router = require("express").Router()
const editorControl = require("../controllers/editorControl")
const adminControl = require("../controllers/adminControl");
const { uploadHandler } = require("../middleware/upload");
const { multipleImages } = require("../middleware/multipleImages");
const dataControl = require("../controllers/dataControl");


router.get("/login", editorControl.Login)
router.get("/signout", editorControl.SignOut)
router.put("/properties", multipleImages, adminControl.processPhotos ,adminControl.addProperty);
router.patch("/properties/:id", multipleImages,adminControl.processPhotos, adminControl.updateProperty);
router.get("/properties", adminControl.getProperties);
router.get("/properties/:id", dataControl.getSingleById);

router.get("/photos", dataControl.getPhotos);
router.put("/photos", multipleImages, adminControl.addPhotos);
router.patch("/photos/:id", uploadHandler, adminControl.updatePhoto);

router.get("/blogs", dataControl.getBlogs);
router.put("/blogs", uploadHandler, adminControl.addBlogs);
router.patch("/blogs/:id", uploadHandler, adminControl.updateBlogs);

module.exports = router
