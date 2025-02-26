const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");




const generateAccessToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

// user registration
exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, cin, phone, address, dateOfBirth, role, speciality } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        user = await User.findOne({ cin });
        if (user) return res.status(400).json({ message: "User already exists" });

        // Create user based on role
        if (role === "doctor") {
            user = new Doctor({ firstName, lastName, email, password, cin, phone, address, dateOfBirth, role, speciality });
        } else if (role === "patient") {
            user = new Patient({ firstName, lastName, email, password, cin, phone, address, dateOfBirth, role });
        } else {
            return res.status(400).json({ message: "Invalid role" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Store refresh token in HTTP-only cookie
        res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "Strict" });

        res.status(201).json({ accessToken });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// user login

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid password" });

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Store refresh token in HTTP-only cookie
        res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "Strict" });

        res.json({ accessToken });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.status(403).json({ message: "Refresh Token is required" });

        // Verify refresh token
        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
            if (err) return res.status(403).json({ message: "Invalid Refresh Token" });

            const newAccessToken = generateAccessToken({ _id: decoded.id, role: decoded.role });
            res.json({ accessToken: newAccessToken });
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// 🔹 Get Profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// 🔹 Update Profile
exports.updateProfile = async (req, res) => {
    try {
        // Vérifie si une image a été téléchargée
        if (req.file) {
            req.body.image = req.file.path; // Sauvegarde l'URL de l'image Cloudinary
        }

        const { idUser } = req.params; // On prend l'id de l'utilisateur dans les paramètres de la requête
        const user = await User.findByIdAndUpdate(idUser, req.body, { new: true }); // On met à jour l'utilisateur avec l'id correspondant

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.status(200).json({
            message: "Profil mis à jour avec succès",
            user
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//forget password
exports.forgetPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Generate reset token (valid for 1 hour)
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        // Create password reset link
        const resetLink = `${process.env.FRONTEND_URL}/ResetPassword/${token}`;
        console.log("FRONTEND_URL:", process.env.FRONTEND_URL);


        // Send email using Nodemailer
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset Request",
            html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
        });

        res.json({ message: "Password reset email sent!" });

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};


// Reset Password
exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: "Invalid token" });


        user.password = newPassword;

        await user.save();
        console.log("New password saved:", user.password);
        res.json({ message: "Password reset successful!" });

    } catch (error) {
        res.status(400).json({ message: "Invalid or expired token" });
    }
};

exports.logout = async (req, res) => {
    try {
        res.clearCookie("refreshToken");
        res.json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
