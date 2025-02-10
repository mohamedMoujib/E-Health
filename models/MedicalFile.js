const mongoose = require('mongoose');

const medicalFile = new mongoose.Schema(
    {
        patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },  
    },
    { timestamps: true }
);

const MedicalFile = mongoose.model('Medical', medicalFile);

module.exports = MedicalFile;
