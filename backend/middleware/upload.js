// middleware/upload.js
// Configures multer to handle PDF file uploads

const multer = require("multer");
const path = require("path");

// --- Storage Configuration ---
// Tells multer where to save files and what to name them
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save all uploads to the /uploads folder
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    // Create a unique filename: timestamp + original name
    // Example: 1718123456789-mybook.pdf
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// --- File Filter ---
// Only allow PDF files to be uploaded
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true); // Accept the file
  } else {
    cb(new Error("Only PDF files are allowed!"), false); // Reject the file
  }
};

// --- Export multer instance ---
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // Max file size: 20MB
  },
});

module.exports = upload;
