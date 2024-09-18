const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinaryConfig');
const { v4: uuidv4 } = require('uuid');

const formatDate = (date) => {
  return date.toISOString().replace(/[^0-9]/g, '').slice(0, 14); // YYYYMMDDHHMMSS format
};


const formatFilename = (originalName) => {
  return originalName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-');
};

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'property-images',
    format: async (req, file) => {
      const ext = file.mimetype.split('/')[1];
      return ['jpeg', 'png', 'webp', 'bmp', 'tiff'].includes(ext) ? ext : 'jpeg';
    },
    public_id: (req, file) =>
      `${uuidv4()}-${Date.now()}-${formatFilename(file.originalname)}`,
  },
});


const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|bmp|tiff/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file), false); // Pass a multer error
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 1000000 }, // 1MB limit
  fileFilter: fileFilter,
}).single('uploadedImage'); 

exports.uploadHandler = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      switch (err.code) {
        case 'LIMIT_FILE_SIZE':
          return res.status(400).json({ message: 'File size exceeds the 1MB limit.' });
        case 'LIMIT_UNEXPECTED_FILE':
          return res.status(400).json({ message: 'Only image files are allowed!' });
        default:
          return res.status(400).json({ message: err.message });
      }
    } else if (err) {
      return res.status(500).json({ message: 'An error occurred while uploading the file.' });
    }
    next();
  });
};

