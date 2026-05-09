const multer = require("multer");
const { storage } = require("../config/cloudinary.config");

/**
 * File filter to allow only PDFs and Images
 */
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF and Image formats are allowed."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Increased to 10MB for high-res disaster photos
  },
});

module.exports = upload;
