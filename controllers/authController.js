const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const Admin = require('../models/Admin');


const generateAccessToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7h" });
};

const generateRefreshToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

// user registration
exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, cin, phone, address, dateOfBirth, role, speciality } = req.body;

        // Check if user exists with same email within the SAME ROLE only
        let existingUser = await User.findOne({ email, role });
        if (existingUser) {
            return res.status(400).json({ 
                message: `${role} with this email already exists` 
            });
        }

        // Check if user exists with same CIN within the SAME ROLE only
        existingUser = await User.findOne({ cin, role });
        if (existingUser) {
            return res.status(400).json({ 
                message: `${role} with this CIN already exists` 
            });
        }

        // Check if user exists with same phone within the SAME ROLE only
        existingUser = await User.findOne({ phone, role });
        if (existingUser) {
            return res.status(400).json({ 
                message: `${role} with this phone number already exists` 
            });
        }

        // Create user based on role
        let user;
        if (role === "doctor") {
            user = new Doctor({ firstName, lastName, email, password, cin, phone, address, dateOfBirth, role, speciality });
        } else if (role === "patient") {
            user = new Patient({ firstName, lastName, email, password, cin, phone, address, dateOfBirth, role });
        } else if (role === "admin") {
            user = new Admin({ firstName, lastName, email, password, cin, phone, address, dateOfBirth, role });
        } else {
            return res.status(400).json({ message: "Invalid role" });
        }

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
        console.log("Entered password:", password);
        console.log("Stored hashed password:", user.password);
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid password" });

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Store refresh token in HTTP-only cookie
        res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "Strict" });

        res.json({ accessToken , role: user.role,status: user.status });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        console.log("Received refresh token:", req.cookies.refreshToken);

        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.status(403).json({ message: "Refresh Token is required" });

        // Verify refresh token
        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
            if (err) return res.status(403).json({ message: "Invalid Refresh Token" });
            console.log("Decoded refresh token:", decoded);

            const newAccessToken = generateAccessToken({ _id: decoded.id, role: decoded.role });
            res.json({ accessToken: newAccessToken , role: decoded.role });
        });
    } catch (error) {
        console.error("Error in refresh token endpoint:", error.message);

        res.status(500).json({ message: "Server error" });
    }
};

// 🔹 Get Profile
// authController.js
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // If user is a doctor, fetch the Doctor model instead
    if (user.role === 'doctor') {
      const doctor = await Doctor.findById(req.user.id);
      return res.json(doctor);
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const users = {}; // Un objet pour stocker les OTP et leur expiration (clé = email)
 
 exports.requestReset = async (req, res) => {
     const { email } = req.body; // Récupération de l'email depuis le corps de la requête
     if (!email) return res.status(400).json({ message: "Email requis" }); // Vérifie que l'email est fourni
 
     // Génération d'un code OTP à 4 chiffres
     const otp = Math.floor(1000 + Math.random() * 9000);
     // Sauvegarde du OTP avec une expiration de 5 minutes (300000ms)
     users[email] = { otp, expiresAt: Date.now() + 300000 };
 
     const transporter = nodemailer.createTransport({
         service: "gmail",
         auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
     });
 
     // Contenu de l'email envoyé
     const mailOptions = {
         from: process.env.EMAIL_USER,
         to: email,
         subject: "Code de vérification",
         text: `Votre code de vérification est : ${otp}`,
     };
 
     // Envoi de l'email
     transporter.sendMail(mailOptions, (error) => {
         if (error)
             return res.status(500).json({ message: "Erreur d'envoi de l'email" });
         res.json({ message: "Code envoyé avec succès" }); // Réponse en cas de succès
     });
 };
 
// Vérification de l'OTP
exports.verifyOtp = (req, res) => {
  const { email, otp } = req.body;
  if (!users[email] || users[email].expiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP expiré ou invalide" });
  }

  if (users[email].otp != otp) {
      return res.status(400).json({ message: "Code incorrect" });
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "10m" });
  res.json({ message: "Code validé", token });
};

exports.resetPasswordPatient = async (req, res) => {
  try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
          return res.status(400).json({ message: "Token et nouveau mot de passe requis" });
      }

      // Vérification du token JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const email = decoded.email;

      // Hachage du mot de passe
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Mise à jour dans la base de données
      const patient = await Patient.findOneAndUpdate(
          { email },
          { password: hashedPassword },
          { new: true }
      );

      if (!patient) {
          return res.status(404).json({ message: "Patient non trouvé" });
      }

      res.status(200).json({ message: "Mot de passe changé avec succès" });

  } catch (error) {
      if (error.name === "JsonWebTokenError") {
          return res.status(401).json({ message: "Token invalide" });
      } else if (error.name === "TokenExpiredError") {
          return res.status(401).json({ message: "Token expiré" });
      }

      res.status(500).json({ message: "Erreur serveur" });
  }
};



exports.updateProfile = async (req, res) => {
  try {
    
        console.log('Received update request:', req.body);
       
        
  
    if (req.body.schedule && typeof req.body.schedule === 'string') {
      try {
        req.body.schedule = JSON.parse(req.body.schedule);
        req.body.schedule.forEach(day => {
          if (day._id) delete day._id;
          if (day.periods) {
            day.periods.forEach(period => {
              if (period._id) delete period._id;
            });
          }
        });
      } catch (error) {
        console.error("Error parsing schedule JSON:", error);
      }
    }

    // Separate fields for user and doctor
    const userFields = {};
    const doctorFields = {};
    Object.keys(req.body).forEach(key => {
      if (['speciality', 'status', 'schedule'].includes(key)) {
        doctorFields[key] = req.body[key];
      } else {
        userFields[key] = req.body[key];
      }
    });

    const userRole = req.user.role;
    let user;
    let updatedDoctor = null;

    if (userRole === 'doctor') {

      // Update user fields
      if (Object.keys(userFields).length > 0) {
        await User.findByIdAndUpdate(
          req.user.id,
          { $set: userFields },
          { new: true, runValidators: true }
        );
      }

      // Update doctor fields (e.g. speciality, status, schedule)
      if (Object.keys(doctorFields).length > 0) {
        updatedDoctor = await Doctor.findByIdAndUpdate(
          req.user.id,
          { $set: doctorFields },
          { new: true, runValidators: true }
        );

        console.log("Doctor update result:", updatedDoctor);
      }

      if (!updatedDoctor) {
        console.log("Doctor not found after update attempt. Fetching manually...");
        updatedDoctor = await Doctor.findById(req.user.id);
      }

      if (!updatedDoctor) {
        console.log("Doctor still not found.");
        return res.status(404).json({ message: "Doctor not found" });
      }

      user = updatedDoctor.toObject ? updatedDoctor.toObject() : updatedDoctor;
      console.log("Final Doctor object sent to frontend:", user);

    } else {
      user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!user) {
        console.log("User not found after update attempt. Fetching manually...");
        user = await User.findById(req.user.id);
      }
    }

    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    // Remove sensitive data
    if (user.password) user.password = undefined;

    res.status(200).json({
      message: "Profil mis à jour avec succès",
      user: user
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: error.message });
  }
};



exports.updateProfileImage = async (req, res) => {
    try {
        const idUser = req.user.id;
        const imageUrl = req.file.path;
    
        const updatedUser = await User.findByIdAndUpdate(
          idUser,
          { image: imageUrl }, // Update only the image field
          { new: true, runValidators: true }
        );
    
        if (!updatedUser) {
          return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
    
        res.status(200).json({
          message: "Image de profil mise à jour avec succès",
          user: updatedUser,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la mise à jour de l'image", error: error.message });
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
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
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
            from: 'healora.ehealth@gmail.com',
            to: email,
            subject: "Réinitialisation de votre mot de passe",
            html: `<p>Cliquez <a href="${resetLink}">ici</a> pour réinitialiser votre mot de passe.</p>`,
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

exports.logout = (req, res) => {
  try {
    // Optional: Clear session if using sessions
    if (req.session) {
      req.session.destroy(() => {
        console.log("Session destroyed");
      });
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      path: '/', // match cookie path
    });

    // Optional: Clear other cookies manually if needed
    // res.clearCookie('accessToken', {...});

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Logout failed" });
  }
};


exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Ancien et nouveau mot de passe requis" });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Ancien mot de passe incorrect" });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: "Mot de passe modifié avec succès" });
    } catch (error) {
        console.error("Erreur lors de la modification du mot de passe:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
