const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const bcrypt = require('bcrypt');
const jwt =require('jsonwebtoken');


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