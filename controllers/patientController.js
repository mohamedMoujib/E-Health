const Patient = require("../models/Patient");
const MedicalFile = require("../models/MedicalFile");
const Appointment = require("../models/appointment");

// Get patient by ID
exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).select("-password");
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Search Patients by Name
exports.searchPatients = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    const patients = await Patient.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { $expr: { $regexMatch: { input: { $concat: ["$firstName", " ", "$lastName"] }, regex: query, options: 'i' } } },
        { $expr: { $regexMatch: { input: { $concat: ["$lastName", " ", "$firstName"] }, regex: query, options: 'i' } } }


      ]
    })
      .select("firstName lastName cin phone address image dateOfBirth")  
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
 

// get doctors for specific patient
exports.getPatientDoctors = async (req, res) => {
    try {
        const patientId = req.params.id;
        const medicalFiles = await MedicalFile.find({ patient: patientId}).populate ({
            path: "doctor",
        })
        const doctors = medicalFiles.map((file) => file.doctor);
        res.json(doctors);
        console.log(doctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//get Patients appointments
exports.getPatientAppointments = async (req, res) => {
  try {
      const { patientId } = req.params;

      const appointments = await Appointment.find({ patient: patientId })
      .populate("doctor", "name speciality")
      .sort({ date: 1 , time: 1 });

      res.json({ appointments });
  } catch (error) {
      res.status(500).json({ message: "Server error", error });
  }
};

