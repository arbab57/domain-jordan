const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinaryConfig");
const { v4: uuidv4 } = require("uuid");

const formatDate = (date) => {
  return date
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, 14);
};

const formatFilename = (originalName) => {
  const name = originalName.substring(0, originalName.lastIndexOf("."));
  const extension = originalName.substring(originalName.lastIndexOf(".") + 1);

  const sanitizedFileName = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-");

  return `${sanitizedFileName}`;
};

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "property-images",
    format: async (req, file) => {
      const ext = file.mimetype.split("/")[1];
      return ["jpeg", "png", "webp", "bmp", "tiff"].includes(ext)
        ? ext
        : "jpeg";
    },
    public_id: (req, file) => {
      const sanitizedFileName = formatFilename(file.originalname);
      return `${uuidv4()}-${formatDate(new Date())}-${sanitizedFileName}`;
    },
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|bmp|tiff/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(
    file.originalname.toLowerCase().split(".").pop()
  );

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 4000000 }, // 1MB limit
  fileFilter: fileFilter,
}).fields([
  { name: "featuredImage", maxCount: 1 },
  { name: "photos", maxCount: 20 },
]);

exports.multipleImages = (req, res, next) => {
  try {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        switch (err.code) {
          case "LIMIT_FILE_SIZE":
            return res
              .status(400)
              .json({ message: "File size exceeds the 1MB limit." });
          case "LIMIT_UNEXPECTED_FILE":
            return res
              .status(400)
              .json({ message: "Only image files are allowed!" });
          default:
            return res.status(400).json({ message: err.message });
        }
      } else if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ message: "An error occurred while uploading the file." });
      }

      next();
    });
  } catch (error) {
    console.log(error);
  }
};
