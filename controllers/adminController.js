const Admin = require('../models/Admin');
const Doctor = require('../models/Doctor');

exports.getDoctorsPending = async (req, res) => {
    try {
        const Doctors = await Doctor.find({ status: 'pending' });
        res.status(200).json(Doctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.confirmDoctor = async (req, res) => {
    try {
        const { idDoctor } = req.body;
        const doctor = await Doctor.findByIdAndUpdate(idDoctor, { status: "active" }, { new: true });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor non trouvé' });
        }
        res.status(200).json({ message: 'Doctor confirmé avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteDoctor = async (req, res) => {
    const { idDoctor } = req.body;
    try {
        const doctor = await Doctor.findByIdAndDelete(idDoctor,{new:true});
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor non trouvé' });
        }
        res.status(200).json({ message: 'Doctor supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};