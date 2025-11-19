import multer from "multer";
import fs from "fs";
import path from "path";

// BASE FOLDERS
const baseAdminPath = "uploads/firmAdmin";
const baseStaffPath = "uploads/firmStaff";

const allowedFileTypes = [".jpg", ".jpeg", ".png", ".pdf"];

// -----------------------------
// ADMIN FILE → STATIC FOLDERS
// -----------------------------
const adminFolderMap = {
  logo: "logo",
  tradeLicense: "tradeLicense",
  emiratesIdFront: "emiratesIdFront",
  emiratesIdBack: "emiratesIdBack",
  residenceVisa: "residenceVisa",
  passport: "passport",
  cardOfLaw: "cardOfLaw",
};

// auto-create folders
Object.values(adminFolderMap).forEach((folder) => {
  const dir = path.join(baseAdminPath, folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// -----------------------------
// STAFF FIELDS
// -----------------------------
const staffFolderMap = {
  passportFile: "passport",
  emiratesIdFrontFile: "emiratesIdFront",
  emiratesIdBackFile: "emiratesIdBack",
  visaFile: "visa",

  // lawyer-only fields
  lawyerIdCardFile: "lawyerIdCard",
  barMembershipCardFile: "barMembershipCard",
  specializationFiles: "specialization",
};

const lawyerOnlyFields = [
  "lawyerIdCardFile",
  "barMembershipCardFile",
  "specializationFiles",
];

// -----------------------------
// MULTER STORAGE ENGINE
// -----------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { uploadType, jobTitle, department } = req.body;

    // Admin Upload
    if (uploadType === "admin") {
      const folder = adminFolderMap[file.fieldname];
      return cb(null, path.join(baseAdminPath, folder));
    }

    // Staff Upload
    if (uploadType === "staff") {
      if (!department)
        return cb(new Error("department is required for staff uploads"));

      const field = file.fieldname;

      // ❌ Reject lawyer files for non-lawyers
      if (lawyerOnlyFields.includes(field) && jobTitle !== "Lawyer") {
        return cb(
          new multer.MulterError(
            "LIMIT_UNEXPECTED_FILE",
            `${field} allowed only for Lawyer`
          )
        );
      }

      const mappedFolder = staffFolderMap[field];
      if (!mappedFolder)
        return cb(
          new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname)
        );

      const staffDir = path.join(baseStaffPath, department, mappedFolder);

      if (!fs.existsSync(staffDir)) fs.mkdirSync(staffDir, { recursive: true });

      return cb(null, staffDir);
    }

    return cb(new Error("Invalid uploadType"));
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${file.fieldname}-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${ext}`;
    cb(null, uniqueName);
  },
});

// -----------------------------
// FILE FILTER
// -----------------------------
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

// -----------------------------
// EXPORT CONFIG
// -----------------------------
export const uploadDocs = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 20 },
}).fields([
  // General staff fields
  { name: "passportFile", maxCount: 1 },
  { name: "emiratesIdFrontFile", maxCount: 1 },
  { name: "emiratesIdBackFile", maxCount: 1 },
  { name: "visaFile", maxCount: 1 },

  // Lawyer-only
  { name: "lawyerIdCardFile", maxCount: 1 },
  { name: "barMembershipCardFile", maxCount: 1 },
  { name: "specializationFiles", maxCount: 10 },

  // Admin
  { name: "logo", maxCount: 1 },
  { name: "tradeLicense", maxCount: 1 },
  { name: "emiratesIdFront", maxCount: 1 },
  { name: "emiratesIdBack", maxCount: 1 },
  { name: "residenceVisa", maxCount: 1 },
  { name: "passport", maxCount: 1 },
  { name: "cardOfLaw", maxCount: 1 },
]);
