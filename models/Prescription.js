const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
    {
        medicalFile: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalFile', required: false }, 
        description: { type: String, required: true }, 
         appointmentId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Appointment',
                    required: true 
                }
    },

    { timestamps: true }
);

const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;
