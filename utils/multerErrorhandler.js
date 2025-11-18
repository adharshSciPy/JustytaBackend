import multer from "multer";
import fs from "fs";
import path from "path";

const basePath = "uploads/firmAdmin";
const absoluteBasePath = path.resolve(basePath);

const allowedFileTypes = [".jpg", ".jpeg", ".png", ".pdf"];

const folderMap = {
  logo: "logo",
  tradeLicense: "tradeLicense",
  emiratesIdFront: "emiratesIdFront",
  emiratesIdBack: "emiratesIdBack",
  residenceVisa: "residenceVisa",
  passport: "passport",
  cardOfLaw: "cardOfLaw",
};

// AUTO-CREATE DIRECTORIES
Object.values(folderMap).forEach((folder) => {
  const fullPath = path.join(absoluteBasePath, folder);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// MULTER STORAGE
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = folderMap[file.fieldname];

    if (!folder) {
      return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
    }

    cb(null, path.join(absoluteBasePath, folder));
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${file.fieldname}-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${ext}`;
    cb(null, uniqueName);
  },
});

// FILE FILTER
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedFileTypes.includes(ext)) {
    return cb(
      new multer.MulterError("LIMIT_INVALID_FORMAT", file.originalname),
      false
    );
  }

  cb(null, true);
};

export const uploadFirmAdminDocs = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 7 },
}).fields([
  { name: "logo", maxCount: 1 },
  { name: "tradeLicense", maxCount: 1 },
  { name: "emiratesIdFront", maxCount: 1 },
  { name: "emiratesIdBack", maxCount: 1 },
  { name: "residenceVisa", maxCount: 1 },
  { name: "passport", maxCount: 1 },
  { name: "cardOfLaw", maxCount: 1 },
]);

export const multerErrorHandler = (err, req, res, next) => {
  console.error("Multer Error:", err);

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ success: false, message: "File too large. Max size 5MB." });
    }

    if (err.code === "LIMIT_INVALID_FORMAT") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid file type. Only JPG, PNG, PDF allowed." });
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res
        .status(400)
        .json({ success: false, message: `Unexpected file field: ${err.field}` });
    }

    return res.status(400).json({ success: false, message: err.message });
  }

  return res.status(500).json({
    success: false,
    message: "Upload failed",
    error: err.message,
  });
};
