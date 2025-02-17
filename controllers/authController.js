const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const bcrypt = require('bcrypt');
const jwt =require('jsonwebtoken');
const nodemailer = require("nodemailer");



const generateToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
  };

  // user registration
exports.register = async (req , res ) => {
    try{
        const { firstName , lastName , email , password ,cin , phone , address, dateOfBirth , image , role , speciality , status , schedule} = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    user = await User.findOne({ cin}) ; 
    if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      
      if (role === "doctor") {
            user = new Doctor({firstName , lastName , email , password ,cin , phone , address, dateOfBirth , image , role , speciality , status , schedule});
        } else if (role=== "patient") {
            user = new Patient({firstName , lastName , email , password ,cin , phone , address, dateOfBirth , image , role , status});
        } else {
            return res.status(400).json( { message : "Invalide role" })
        }
        await user.save();
        const token = generateToken(user);
        res.status(201).json({user , token});
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message})
    }
};

// user login

exports.login = async (req, res) => {
    try{
        const { email , password } = req.body ;
        const user = await User.findOne({ email});
        if (!user || !(await bcrypt.compare(password , user.password))) {
            return res.status(400).json({message : "Invalid email or password"});
        }
        const token = generateToken(user);
        res.json({user, token});
    } catch (error) {
        res.status(500).json({message : error.message});
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
      const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true });
      res.json(user);
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
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

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
exports.resetPassword =  async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return res.status(404).json({ message: "Invalid token" });

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();

      res.json({ message: "Password reset successful!" });

  } catch (error) {
      res.status(400).json({ message: "Invalid or expired token" });
  }};