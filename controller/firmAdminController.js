import mongoose from "mongoose";
import FirmAdmin from "../model/firmAdminSchema.js";
import {
  nameValidator,
  emailValidator,
  phoneValidator,
  passwordValidator,
} from "../utils/validator.js";
import FirmStaff from "../model/firmStaffSchema.js";

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
 const firmAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }
    const admin = await FirmAdmin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    const isPasswordValid = await admin.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    if (admin.status === "pending_verification") {
      return res.status(403).json({
        success: false,
        message: "Your account is not verified yet.",
      });
    }
    if (admin.status === "rejected") {
      return res.status(403).json({
        success: false,
        message: "Your registration was rejected. Contact support.",
      });
    }
    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Please contact support.",
      });
    }
    const accessToken = admin.generateAccessToken();
    const refreshToken = admin.generateRefreshToken();
    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });
    return res.status(200).json({
      success: true,
      message: "Login successful",

      tokens: {
        accessToken,
        refreshToken,
      },

      data: {
        _id: admin._id,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin,
        status: admin.status,
        isActive: admin.isActive,

        firmDetails: admin.firmDetails,
        ownerDetails: admin.ownerDetails,
      },
    });
  } catch (err) {
    console.error("❌ Error in firmAdminLogin:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error during login",
      error: err.message,
    });
  }
};
const getAllLawFirms = async (req, res) => {
  try {
    const {
      emirate,
      subscriptionPlan,
      page = 1,
      limit = 10,
      search = ""
    } = req.query;

    // Convert pagination to numbers
    const pageNum = Number(page);
    const limitNum = Number(limit);

    // Build filters
    const query = {};

    if (emirate) query["firmDetails.emirate"] = emirate;
    if (subscriptionPlan) query["firmDetails.subscriptionPlan"] = subscriptionPlan;

    // Search by firm name or owner name
    if (search) {
      query.$or = [
        { "firmDetails.lawFirmName": { $regex: search, $options: "i" } },
        { "ownerDetails.fullName": { $regex: search, $options: "i" } }
      ];
    }

    const lawFirms = await FirmAdmin
      .find(query)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .select("-password -refreshToken"); // hide sensitive fields

    const total = await FirmAdmin.countDocuments(query);

    return res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: lawFirms
    });
  } catch (err) {
    console.error("Error fetching law firms:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch law firms",
      error: err.message
    });
  }
};
const getLawFirmById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid law firm ID format",
      });
    }
    const firm = await FirmAdmin.findById(id).select(
      "-password -refreshToken"
    );

    if (!firm) {
      return res.status(404).json({
        success: false,
        message: "Law firm not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: firm,
    });
  } catch (err) {
    console.error("Error fetching law firm by ID:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch law firm",
      error: err.message,
    });
  }
};
const registerStaff = async (req, res) => {
  try {
    const {
      firmId,
      fullName,
      dob,
      gender,
      maritalStatus,

      workEmail,
      personalEmail,
      phone,
      address,

      department,
      managerId,

      nationalId,

      lawyerIdUAE,
      barMembershipNumber,
      practicingSince,
      specialization,

      email,
      password,
    } = req.body;

    if (!firmId)
      return res.status(400).json({ success: false, message: "firmId required" });

    const firm = await FirmAdmin.findById(firmId);
    if (!firm)
      return res.status(404).json({ success: false, message: "Firm not found" });

    const files = req.files;

    const lawyerFields = [
      "lawyerIdUAE",
      "barMembershipNumber",
      "practicingSince",
      "specialization",
    ];

    const lawyerFileFields = [
      "lawyerIdCardFile",
      "barMembershipCardFile",
      "specializationFiles",
    ];

    if (department !== "Lawyer") {
      for (const field of lawyerFileFields) {
        if (files?.[field]) {
          return res.status(400).json({
            success: false,
            message: `${field} is allowed only for Lawyer department`,
          });
        }
      }

      lawyerFields.forEach((f) => delete req.body[f]);
    }

    const staffData = {
      firmId,
      personal: { fullName, dob, gender, maritalStatus },

      nationalId,

      contact: {
        workEmail,
        personalEmail,
        phone,
        address,
      },

      employment: {
        department,
        managerId,
      },

      email,
      password,
    };

    if (department === "Lawyer") {
      staffData.lawyerIdUAE = lawyerIdUAE;
      staffData.barMembershipNumber = barMembershipNumber;
      staffData.practicingSince = practicingSince;
      staffData.specialization = specialization ? JSON.parse(specialization) : [];
    }

    // NORMALIZE PATHS (Fix)
    const normalize = (p) => p.replace(/\\/g, "/");

    if (files?.passportFile)
      staffData.passportFile = normalize(files.passportFile[0].path);

    if (files?.emiratesIdFrontFile)
      staffData.emiratesIdFrontFile = normalize(files.emiratesIdFrontFile[0].path);

    if (files?.emiratesIdBackFile)
      staffData.emiratesIdBackFile = normalize(files.emiratesIdBackFile[0].path);

    if (files?.visaFile)
      staffData.visaFile = normalize(files.visaFile[0].path);

    if (department === "Lawyer") {
      if (files?.lawyerIdCardFile)
        staffData.lawyerIdCardFile = normalize(files.lawyerIdCardFile[0].path);

      if (files?.barMembershipCardFile)
        staffData.barMembershipCardFile = normalize(files.barMembershipCardFile[0].path);

      if (files?.specializationFiles)
        staffData.specializationFiles = files.specializationFiles.map((f) =>
          normalize(f.path)
        );
    }

    const staff = await FirmStaff.create(staffData);

    const key = department.replace(/\s+/g, "");

    if (firm.staffs[key]) {
      firm.staffs[key].push(staff._id);
    } else {
      firm.staffs[key] = [staff._id];
    }

    await firm.save();

    return res.status(201).json({
      success: true,
      message: "Staff registered successfully",
      staff,
      firm,
      employeeNumber: staff.employment.employeeNumber,
    });

  } catch (err) {
    console.error("Register Staff Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
const getFirmStaffs = async (req, res) => {
  try {
    const { id:firmId } = req.params;
    const { department, page = 1, limit = 10, search = "", staffId } = req.query;

    if (!firmId) {
      return res.status(400).json({
        success: false,
        message: "firmId is required",
      });
    }

    // 1️⃣ Fetch firm with all relations
    const firm = await FirmAdmin.findById(firmId).populate({
      path: Object.keys(FirmAdmin.schema.paths.staffs.schema.paths),
      model: "FirmStaff",
    });

    if (!firm) {
      return res.status(404).json({
        success: false,
        message: "Firm not found",
      });
    }

    // 2️⃣ If staffId passed -> return that staff only
    if (staffId) {
      const allStaffs = Object.values(firm.staffs).flat();
      const staff = allStaffs.find((s) => s._id.toString() === staffId);

      if (!staff) {
        return res.status(404).json({
          success: false,
          message: "Staff not found inside this firm",
        });
      }

      return res.status(200).json({
        success: true,
        staff,
      });
    }

    // 3️⃣ Get department staff or all staff
    let staffList = [];

    if (department) {
      if (!firm.staffs[department]) {
        return res.status(400).json({
          success: false,
          message: "Invalid department",
        });
      }

      staffList = firm.staffs[department]; // Only this department
    } else {
      // Merge ALL depts
      staffList = Object.values(firm.staffs).flat();
    }

    // 4️⃣ Search by employeeNumber (employment.employeeNumber)
    if (search) {
      staffList = staffList.filter((staff) =>
        staff.employment.employeeNumber
          ?.toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    // 5️⃣ Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedData = staffList.slice(startIndex, endIndex);

    return res.status(200).json({
      success: true,
      totalStaff: staffList.length,
      page: Number(page),
      limit: Number(limit),
      department: department || "All",
      result: paginatedData,
    });
  } catch (err) {
    console.error("Get Firm Staffs Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};







export{registerFirmAdmin,firmAdminLogin,getAllLawFirms,getLawFirmById,registerStaff,getFirmStaffs}