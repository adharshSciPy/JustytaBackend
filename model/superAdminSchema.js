import mongoose, { Schema } from "mongoose";
import { isValidNumber } from "libphonenumber-js";
const Super_Admin = process.env.Super_Admin;

const superAdminSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        default: Super_Admin
    },
    email: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        requited: true,
        validate: {
            validator: (value) => isValidNumber(value, "AE"),
            message: "Invalid UAE phone number"
        }
    },
    password: {
        type: String,
        required: true
    }
})

// 🔐 HASH PASSWORD BEFORE SAVE
superAdminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

superAdminSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            id: this._id,
            name: this.name,
            email: this.email,
            role: this.role,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};
superAdminSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            id: this._id,
            name: this.name,
            email: this.email,
            role: this.role,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};

// 🔐 PASSWORD CHECK METHOD
superAdminSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const SuperAdmin = mongoose.model("Superadmin", superAdminSchema)
export default SuperAdmin 