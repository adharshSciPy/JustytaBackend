import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const FIRM_ADMIN_ROLE=process.env.FIRM_ADMIN_ROLE || 800
//firm details
const firmDetailsSchema = new Schema({
  lawFirmName: {
    type: String,
    required: [true, "Law firm name is required"],
    trim: true,
  },

  aboutFirm: { type: String, maxlength: 500 },

//   email: {
//     type: String,
//     required: [true, "Firm email is required"],
//     lowercase: true,
//     trim: true,
//     match: [/\S+@\S+\.\S+/, "Please provide a valid email address"],
//   },

  phone: {
    type: String,
    required: true,
  },

  websiteUrl: { type: String },

  logo: { type: String }, 

  officeAddress: { type: String },

  emirate: {
    type: String,
    required: true,
    enum: [
      "Abu Dhabi",
      "Dubai",
      "Sharjah",
      "Ajman",
      "Umm Al-Quwain",
      "Ras Al Khaimah",
      "Fujairah",
    ],
  },

  trn: { type: String },//vat number

  subscriptionPlan: {
    type: String,
    required: true,
    enum: ["Gold", "Silver", "Platinum", "Basic"],
  },

  tradeLicense: {
    type: String,
    required: [true, "Trade license document is required"],
  },

  tradeLicenseExpiry: {
    type: Date,
    required: true,
  },
});

const ownerDetailsSchema = new Schema({
  fullName: {
    type: String,
    required: [true, "Owner name is required"],
  },

//   email: {
//     type: String,
//     required: [true, "Owner email is required"],
//     lowercase: true,
//   },

  phone: {
    type: String,
    required: [true, "Owner phone number is required"],
  },

  emiratesIdFront: { type: String, required: true },
  emiratesIdBack: { type: String, required: true },
  emiratesIdExpiry: { type: Date, required: true },

  residenceVisa: { type: String },
  residenceVisaExpiry: { type: Date },

  passport: { type: String, required: true },
  passportExpiry: { type: Date, required: true },

  cardOfLaw: { type: String, required: true },
  cardOfLawExpiry: { type: Date, required: true },
});

//main schema 
const firmAdminSchema = new Schema(
  {
    firmDetails: {
      type: firmDetailsSchema,
      required: true,
    },

    ownerDetails: {
      type: ownerDetailsSchema,
      required: true,
    },

  
   email: {
      type: String,
      required: [true, "Admin email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please provide a valid email"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      default: FIRM_ADMIN_ROLE,
    },

    status: {
      type: String,
      enum: ["pending_verification", "approved", "rejected"],
      default: "pending_verification",
    },
    staffs: {
  HR: [
    { type: Schema.Types.ObjectId, ref: "FirmStaff" }
  ],
  Secretary: [
    { type: Schema.Types.ObjectId, ref: "FirmStaff" }
  ],
  LegalResearcher: [
    { type: Schema.Types.ObjectId, ref: "FirmStaff" }
  ],
  Accountant: [
    { type: Schema.Types.ObjectId, ref: "FirmStaff" }
  ],
  ResearchAssistant: [
    { type: Schema.Types.ObjectId, ref: "FirmStaff" }
  ],
  Lawyer: [
    { type: Schema.Types.ObjectId, ref: "FirmStaff" }
  ],
}
,

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: { type: Date },
  },
  { timestamps: true }
);


firmAdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});



// Password validation
firmAdminSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Firm label for UI
firmAdminSchema.methods.getFirmLabel = function () {
  return `${this.firmDetails.lawFirmName} (${this.ownerDetails.fullName})`;
};

// Toggle active/inactive state
firmAdminSchema.methods.toggleActive = function () {
  this.isActive = !this.isActive;
  return this.isActive;
};

// Access Token
firmAdminSchema.methods.generateAccessToken = function (role = FIRM_ADMIN_ROLE) {
  return jwt.sign(
    {
      adminId: this._id,
      name: this.ownerDetails.fullName,
      email: this.email,
      role,
      subscription: this.firmDetails.subscriptionPlan,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

// Refresh Token
firmAdminSchema.methods.generateRefreshToken = function (role = FIRM_ADMIN_ROLE) {
  return jwt.sign(
    {
      adminId: this._id,
      name: this.ownerDetails.fullName,
      email: this.email,
      role,
      subscription: this.firmDetails.subscriptionPlan,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};



export default mongoose.model("FirmAdmin", firmAdminSchema);
