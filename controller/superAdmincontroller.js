import SuperAdmin from "../model/superAdminSchema.js";
import { emailValidator, passwordValidator, nameValidator, phoneValidator } from "../utils/validator.js";
import crypto from "crypto"

const register = async (req, res) => {
    try {
        const { name, email, phoneNumber, password } = req.body;
        if (!nameValidator(name)) {
            res.status(400).json({ message: "Invalid Name Format" })
        }
        if (!emailValidator(email)) {
            res.status(400).json({ message: "Invalid Email Format" })
        }
        if (!phoneValidator(phoneNumber)) {
            res.status(400).json({ message: "Invalid Phone Number" })
        }
        if (!passwordValidator(password)) {
            res.status(400).json({ message: "Invalid Password" })
        }
        const existingUser = await SuperAdmin.findOne({ $or: [{ email }, { phoneNumber }] });
        if (existingUser) {
            if (existingUser.email === email)
                return res.status(400).json({ message: "Email already exists" });
            else
                return res.status(400).json({ message: "Phone number already exists" });
        }

        // Create user
        const newSuperAdmin = new SuperAdmin({ name, email, password, phoneNumber });
        await newSuperAdmin.save();

        const accessToken = newSuperAdmin.generateAccessToken();
        const refreshToken = newSuperAdmin.generateRefreshToken();

        res.status(201).json({
            message: "SuperAdmin registered successfully",
            superAdmin: {
                id: newSuperAdmin._id,
                name: newSuperAdmin.name,
                email: newSuperAdmin.email,
                phoneNumber: newSuperAdmin.phoneNumber,
                role: newSuperAdmin.role,
            },
            accessToken,
            refreshToken,
        });
    } catch (error) {
        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ message: `${duplicateField} already exists` });
        }
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!emailValidator(email)) {
            res.status(400).json({ message: "Invalid Email" })
        }
        if (!passwordValidator(password)) {
            res.status(400).json({ message: "Invalid Password" })
        }
        const superAdmin = await SuperAdmin.findOne({ email });
        if (!superAdmin)
            return res.status(401).json({ message: "Email or password is incorrect" });


        const isMatch = await superAdmin.isPasswordCorrect(password);
        if (!isMatch)
            return res.status(401).json({ message: "Email or password is incorrect" });


        const accessToken = superAdmin.generateAccessToken();
        const refreshToken = superAdmin.generateRefreshToken();
        res.status(200).json({
            message: "Login successful",
            superAdmin: {
                id: superAdmin._id,
                name: superAdmin.name,
                email: superAdmin.email,
                phoneNumber: superAdmin.phoneNumber,
                role: superAdmin.role,
            },
            accessToken,
            refreshToken,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        if (!emailValidator(email)) {
            return res.status(400).json({ message: "Invalid Email Format" });
        }

        const superAdmin = await SuperAdmin.findOne({ email });
        if (!superAdmin) {
            return res.status(404).json({ message: "Email not found" });
        }

        // Generate token
        const resetToken = crypto.randomBytes(32).toString("hex");

        superAdmin.resetPasswordToken = resetToken;
        superAdmin.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        await superAdmin.save();

        // TODO: send email using nodemailer/sendgrid etc.
        // Example reset link:
        const resetLink = `https://yourfrontend.com/reset-password/${resetToken}`;

        res.status(200).json({
            message: "Password reset link generated",
            resetLink, // Remove this in production and send via email
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        if (!passwordValidator(newPassword)) {
            return res.status(400).json({ message: "Invalid password format" });
        }

        const superAdmin = await SuperAdmin.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } // Token not expired
        });

        if (!superAdmin) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        // Update password
        superAdmin.password = newPassword;
        superAdmin.resetPasswordToken = undefined;
        superAdmin.resetPasswordExpires = undefined;

        await superAdmin.save();

        res.status(200).json({ message: "Password reset successful" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

export {
    register, login, requestPasswordReset, resetPassword
}