const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isPdf = file.mimetype === "application/pdf";
    return {
      folder: "aapda-prabandhan/documents",
      format: isPdf ? "pdf" : undefined, // Cloudinary handles images automatically
      resource_type: isPdf ? "raw" : "auto", // PDF must be 'raw' or 'auto' for original extension storage
      public_id: `${file.fieldname}-${Date.now()}`,
    };
  },
});

module.exports = {
  cloudinary,
  storage,
};
