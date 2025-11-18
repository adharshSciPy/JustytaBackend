import SuperAdmin from "../model/superAdminSchema";
import { emailValidator, passwordValidator, nameValidator, phoneValidator } from "../utils/validator.js";

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

export {
    register, login
}