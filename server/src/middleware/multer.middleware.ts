import multer from "multer";
import path from "path";
import fs from "fs";

/**
 * Multer Middleware & Helpers
 *
 * Provides single and multiple file upload middlewares with:
 * • Dynamic disk storage location (`uploads/`) – created on startup if missing.
 * • File-type whitelisting for images, documents, videos and audio.
 * • 10 MB size limit and max 5 files when using `uploadMultiple`.
 * • Express error-handling middleware `handleMulterError` for graceful responses.
 */

// Create uploads directory if it doesn't exist
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and random string
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    const fileName = file.fieldname + "-" + uniqueSuffix + fileExtension;
    cb(null, fileName);
  },
});

// File filter function
const fileFilter = (req: any, file: any, cb: any) => {
  // Define allowed file types
  const allowedImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const allowedDocumentTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
  ];
  const allowedVideoTypes = ["video/mp4", "video/avi", "video/mov", "video/wmv"];
  const allowedAudioTypes = ["audio/mp3", "audio/wav", "audio/mpeg"];

  const allAllowedTypes = [
    ...allowedImageTypes,
    ...allowedDocumentTypes,
    ...allowedVideoTypes,
    ...allowedAudioTypes,
  ];

  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only images, documents, videos, and audio files are allowed.")
    );
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
});

// Middleware for single file upload
export const uploadSingle = upload.single("file");

// Middleware for multiple files upload
export const uploadMultiple = upload.array("files", 5); // Max 5 files

// Export the upload instance for custom usage
export { upload };

// Error handling middleware
export const handleMulterError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File too large. Maximum size is 10MB.",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        error: "Too many files. Maximum is 5 files.",
      });
    }
  }
  if (
    err.message ===
    "Invalid file type. Only images, documents, videos, and audio files are allowed."
  ) {
    return res.status(400).json({
      error: err.message,
    });
  }
  next(err);
};
