export const multerErrorHandler = (err, req, res, next) => {
  console.error("Multer Error:", err);

  // -------------------------
  // Multer Errors
  // -------------------------
  if (err instanceof multer.MulterError) {
    
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(400).json({
          success: false,
          message: "File too large. Max allowed size is 5MB.",
        });

      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          success: false,
          message: `Unexpected file field: ${err.field}`,
        });

      case "LIMIT_FILE_COUNT":
        return res.status(400).json({
          success: false,
          message: "Too many files uploaded.",
        });

      case "LIMIT_FIELD_KEY":
        return res.status(400).json({
          success: false,
          message: "Field name too long.",
        });

      case "LIMIT_FIELD_VALUE":
        return res.status(400).json({
          success: false,
          message: "Field value too long.",
        });

      case "LIMIT_INVALID_FORMAT":
        return res.status(400).json({
          success: false,
          message: "Invalid file type. Only JPG, JPEG, PNG, PDF allowed.",
        });

      default:
        return res.status(400).json({
          success: false,
          message: err.message || "Upload error",
        });
    }
  }

  // -------------------------
  // Custom or Unknown Errors
  // -------------------------
  return res.status(500).json({
    success: false,
    message: "Upload failed due to a server error.",
    error: err.message,
  });
};
