const Doctor = require("../models/Doctor");
const MedicalFile = require("../models/MedicalFile");
const Appointment = require("../models/appointment");
//View Doctor Details by ID
exports.viewDoctorDetails = async (req , res) => {
    try{
        const doctor = await Doctor.findById(req.params.id).select("-password");
        if(!doctor) return res.status(404).json({message : "Doctor not found"});
        res.json(doctor);
    }catch (error){
        res.status(500).json({message : error.message});
    }
        
};

//Search Doctor by Name, Speciality, or Address
exports.searchDoctors = async (req, res) => {
    try {
        const { query, page = 1 , limit= 10} = req.query;
        const searchQuery = String(query); 

        const doctors = await Doctor.find({
            $or: [
                {firstName: { $regex: searchQuery, $options: 'i' }},
                {lastName: { $regex: searchQuery, $options: 'i' }},
                {speciality: { $regex: searchQuery, $options: 'i' }},
                {address: { $regex: searchQuery, $options: 'i' }},
                { $expr: { $regexMatch: { input: { $concat: ["$firstName", " ", "$lastName"] }, regex: searchQuery, options: 'i' } } },
                { $expr: { $regexMatch: { input: { $concat: ["$lastName", " ", "$firstName"] }, regex: searchQuery, options: 'i' } } }


            ]
        })      
    .select("firstName lastName speciality phone address image")  
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
    res.json(doctors);
    }catch (error){
        res.status(500).json({message : error.message});
    }
};


// List All Doctors
exports.listAllDoctors = async (req, res) => {
    try {
      const doctors = await Doctor.find();
      res.json(doctors);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  
  
  // Get Patients Specific to a Doctor
  exports.getDoctorPatients = async (req, res) => {
    try {
      const doctorId = req.params.id;
      // Find all medical files where the doctorId matches the provided doctor ID
      const medicalFiles = await MedicalFile.find({ doctor : doctorId }).populate({
        path: "patient",
        select: "-password"
    });
      const patients = medicalFiles.map(file => file.patient);
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // Get Doctor's appointments
  exports.getDoctorAppointments = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const appointments = await Appointment.find({ Doctor: doctorId })
            .populate("patient", "firstName lastName phone email")
            .sort({ date: 1  , time : 1 }); 
        res.json({ appointments });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Get Doctor's appointments with specific patient
const mongoose = require("mongoose");

exports.getDoctorSpecificAppointments = async (req, res) => {
  try {
    const doctor = req.user.id; // Récupération de l'ID du docteur depuis le token
    const { patient } = req.params;

    console.log("Doctor ID:", doctor);
    console.log("Patient ID:", patient);

    if (!mongoose.Types.ObjectId.isValid(doctor)) {
      return res.status(400).json({ message: "doctorId invalide" });
    }

    if (!mongoose.Types.ObjectId.isValid(patient)) {
      return res.status(400).json({ message: "patientId invalide" });
    }

    const appointments = await Appointment.find({
      doctor: new mongoose.Types.ObjectId(doctor),
      patient: new mongoose.Types.ObjectId(patient)
    }).sort({ date: -1, time: -1 });

    console.log("Found Appointments:", appointments);
    res.json({ appointments });

  } catch (error) {
    console.error("Erreur lors de la récupération des rendez-vous :", error);
    res.status(500).json({ message: "Server error", error: error.message || error });
  }
};

