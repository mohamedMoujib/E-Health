const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
    {
        medicalFile: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalFile', required: true }, 
        description: { type: String, required: true }, 
    },
    { timestamps: true }
);

const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;
