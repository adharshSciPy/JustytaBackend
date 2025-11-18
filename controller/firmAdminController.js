import mongoose from "mongoose";
import FirmAdmin from "../model/firmAdminSchema.js";
import {
  nameValidator,
  emailValidator,
  phoneValidator,
  passwordValidator,
} from "../utils/validator.js";

const isEmpty = (v) => !v || v === "" || v === undefined || v === null;

const isValidFutureDate = (dateStr) => {
  const d = new Date(dateStr);
  return d instanceof Date && !isNaN(d) && d > new Date();
};
const registerFirmAdmin = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // BASIC FIELDS (normal text fields)
    const {
      email,
      password,

      // Firm fields
      lawFirmName,
      phone: firmPhone,
      emirate,
      subscriptionPlan,
      tradeLicenseExpiry,

      // Owner fields
      fullName,
      ownerPhone,
      emiratesIdExpiry,
      passportExpiry,
      cardOfLawExpiry,
      residenceVisaExpiry,
    } = req.body;

    // FILES
    const files = req.files || {};
    const filePath = (field) =>
      files[field] ? files[field][0].path.replace(/\\/g, "/") : null;

    // -------------------------
    // VALIDATION
    // -------------------------

    if (!emailValidator(email))
      return res.status(400).json({ success: false, message: "Invalid email" });

    if (!passwordValidator(password))
      return res.status(400).json({
        success: false,
        message:
          "Password must contain uppercase, lowercase, number, symbol (8–64 chars)",
      });

    // Email uniqueness
    const existing = await FirmAdmin.findOne({ email }).session(session);
    if (existing)
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });

    // Required firm fields
    const firmRequired = {
      lawFirmName,
      firmPhone,
      emirate,
      subscriptionPlan,
      tradeLicenseExpiry,
    };

    for (const [key, value] of Object.entries(firmRequired)) {
      if (!value || value.trim() === "") {
        return res.status(400).json({
          success: false,
          message: `Firm field '${key}' is required`,
        });
      }
    }

    if (!nameValidator(lawFirmName))
      return res
        .status(400)
        .json({ success: false, message: "Invalid law firm name" });

    if (!phoneValidator(firmPhone))
      return res.status(400).json({
        success: false,
        message: "Invalid firm phone number",
      });

    const emirateList = [
      "Abu Dhabi",
      "Dubai",
      "Sharjah",
      "Ajman",
      "Umm Al-Quwain",
      "Ras Al Khaimah",
      "Fujairah",
    ];
    if (!emirateList.includes(emirate))
      return res
        .status(400)
        .json({ success: false, message: "Invalid emirate" });

    const planList = ["Gold", "Silver", "Platinum", "Basic"];
    if (!planList.includes(subscriptionPlan))
      return res
        .status(400)
        .json({ success: false, message: "Invalid subscription plan" });

    if (!isValidFutureDate(tradeLicenseExpiry))
      return res.status(400).json({
        success: false,
        message: "Trade license expiry must be a future date",
      });

    // Owner validation
    const ownerRequired = {
      fullName,
      ownerPhone,
      emiratesIdExpiry,
      passportExpiry,
      cardOfLawExpiry,
    };

    for (const [key, value] of Object.entries(ownerRequired)) {
      if (!value || value.trim() === "") {
        return res.status(400).json({
          success: false,
          message: `Owner field '${key}' is required`,
        });
      }
    }

    if (!nameValidator(fullName))
      return res
        .status(400)
        .json({ success: false, message: "Invalid owner full name" });

    if (!phoneValidator(ownerPhone))
      return res.status(400).json({
        success: false,
        message: "Invalid owner phone number",
      });

    if (!isValidFutureDate(emiratesIdExpiry))
      return res.status(400).json({
        success: false,
        message: "Emirates ID expiry must be a future date",
      });

    if (!isValidFutureDate(passportExpiry))
      return res.status(400).json({
        success: false,
        message: "Passport expiry must be a future date",
      });

    if (!isValidFutureDate(cardOfLawExpiry))
      return res.status(400).json({
        success: false,
        message: "Card of Law expiry must be a future date",
      });

    if (
      residenceVisaExpiry &&
      !isValidFutureDate(residenceVisaExpiry)
    ) {
      return res.status(400).json({
        success: false,
        message: "Residence visa expiry must be a future date",
      });
    }

    // -------------------------
    // BUILD SUBSCHEMA OBJECTS
    // -------------------------

    const firmDetails = {
      lawFirmName,
      phone: firmPhone,
      emirate,
      subscriptionPlan,
      tradeLicenseExpiry,
      logo: filePath("logo"),
      tradeLicense: filePath("tradeLicense"),
    };

    const ownerDetails = {
      fullName,
      phone: ownerPhone,
      emiratesIdExpiry,
      passportExpiry,
      cardOfLawExpiry,
      residenceVisaExpiry,
      emiratesIdFront: filePath("emiratesIdFront"),
      emiratesIdBack: filePath("emiratesIdBack"),
      residenceVisa: filePath("residenceVisa"),
      passport: filePath("passport"),
      cardOfLaw: filePath("cardOfLaw"),
    };

    // -------------------------
    // SAVE
    // -------------------------

    const created = await FirmAdmin.create(
      [
        {
          email,
          password,
          firmDetails,
          ownerDetails,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "Firm admin registered successfully",
      data: created[0],
    });
  } catch (err) {
    console.error("❌ Error in registerFirmAdmin:", err);
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      success: false,
      message: "Internal server error during firm registration",
      error: err.message,
    });
  }
};
export{registerFirmAdmin}