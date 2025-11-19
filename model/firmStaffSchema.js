import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { config } from "dotenv";
import FirmAdmin from "./firmAdminSchema.js"
config();

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, "hex");

const encryptText = (text) => {
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    ENCRYPTION_KEY,
    iv
  );

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
};

const decryptText = (encryptedText) => {
  const [ivHex, encrypted] = encryptedText.split(":");

  const iv = Buffer.from(ivHex, "hex");

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    ENCRYPTION_KEY,
    iv
  );

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};

const FirmStaffSchema = new Schema(
  {
    firmId: {
      type: Schema.Types.ObjectId,
      ref: "FirmAdmin",
      required: true,
      index: true,
    },

    personal: {
      fullName: { type: String, required: true },
      dob: { type: Date },
      gender: { type: String, enum: ["Male", "Female", "Other"] },
      maritalStatus: {
        type: String,
        enum: ["Single", "Married", "Divorced", "Widowed"],
      },
    },

    passportFile: String,
    passportExpiry: Date,
    emiratesIdFrontFile: String,
    emiratesIdBackFile: String,
    emiratesIdExpiry: Date,
    visaFile: String,
    visaExpiry: Date,

    nationalId: { type: String, index: true },

    contact: {
      workEmail: { type: String, required: true, lowercase: true, trim: true },
      personalEmail: { type: String, lowercase: true },
      phone: String,
      address: String,
    },

    employment: {
     department: {
  type: String,
  enum: [
    "HR",
    "Secretarial",
    "Legal",
    "Accounts",
    "Research",
    "Lawyer",
  ],
  required: true,
},

      employeeNumber: { type: String, index: true, unique: true },
      managerId: { type: Schema.Types.ObjectId, ref: "FirmStaff" },
    },

    lawyerIdUAE: { type: String, index: true },
    barMembershipNumber: String,
    specialization: [String],
    practicingSince: Date,
    lawyerIdCardFile: String,
    barMembershipCardFile: String,

    compensation: {
      basicSalary: Number,
      allowances: Number,
      bankDetails: {
        bankName: String,
        accountNumber: String,
        iban: String,
      },
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },

    password: { type: String, required: true },

    encryptedPassword: { type: String,},

    status: {
      type: String,
      enum: ["Active", "Onboarding", "Probation", "Leave", "Terminated"],
      default: "Active",
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

FirmStaffSchema.pre("save", async function (next) {

  // 1. Encrypt + hash password
  if (this.isModified("password")) {
    this.encryptedPassword = encryptText(this.password);
    this.password = await bcrypt.hash(this.password, 10);
  }

  // 2. Auto-generate employee number (NO external function)
  if (this.isNew && !this.employment.employeeNumber) {
    const firm = await FirmAdmin.findById(this.firmId);
    if (!firm) return next(new Error("Invalid firmId - Firm not found"));

    const firmName = firm.firmDetails.lawFirmName;
    const department = this.employment.department;

    // ------------------------------
    // INLINE EMPLOYEE-ID GENERATION
    // ------------------------------

    const firmCode = firmName
      .replace(/[^A-Za-z]/g, "")
      .slice(0, 3)
      .toUpperCase();

    const deptCode = department
      .replace(/[^A-Za-z]/g, "")
      .slice(0, 3)
      .toUpperCase();

    const randomDigits = Math.floor(1000 + Math.random() * 9000);

    const employeeId = `${firmCode}-${deptCode}-${randomDigits}`;

    this.employment.employeeNumber = employeeId;
  }

  next();
});



FirmStaffSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

FirmStaffSchema.methods.getDecryptedPassword = function () {
  return decryptText(this.encryptedPassword);
};

FirmStaffSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      firmId: this.firmId,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

FirmStaffSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      firmId: this.firmId,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export default mongoose.model("FirmStaff", FirmStaffSchema);
