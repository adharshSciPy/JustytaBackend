import multer from "multer";
import fs from "fs";
import path from "path";

// Base upload directory
const basePath = "uploads/firmAdmin";

// Allowed formats
const allowedFileTypes = [".jpg", ".jpeg", ".png", ".pdf"];

// Folder map
const folderMap = {
  logo: "logo",

  tradeLicense: "tradeLicense",

  emiratesIdFront: "emiratesIdFront",
  emiratesIdBack: "emiratesIdBack",
  residenceVisa: "residenceVisa",

  passport: "passport",
  cardOfLaw: "cardOfLaw",
};

// Auto-create directories
Object.values(folderMap).forEach((folder) => {
  const fullPath = `${basePath}/${folder}`;
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = folderMap[file.fieldname];

    if (!folder) {
      return cb(
        new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname)
      );
    }

    cb(null, `${basePath}/${folder}`);
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName =
      `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

    cb(null, uniqueName);
  },
});

// File Filter
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

// Main Upload Middleware
export const uploadFirmAdminDocs = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 7, // avoid extra files
  },
}).fields([
  { name: "logo", maxCount: 1 },
  { name: "tradeLicense", maxCount: 1 },

  { name: "emiratesIdFront", maxCount: 1 },
  { name: "emiratesIdBack", maxCount: 1 },
  { name: "residenceVisa", maxCount: 1 },

  { name: "passport", maxCount: 1 },
  { name: "cardOfLaw", maxCount: 1 },
]);

