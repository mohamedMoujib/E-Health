const mongoose = require('mongoose');

const dietSchema = new mongoose.Schema(
    {
        medicalFile: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalFile', required: false }, 
        dietType: { type: String, required: true }, 
        description: { type: String }, 
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
            required: true 
        }
        
    },
    { timestamps: true }
);

const Diet = mongoose.model('Diet', dietSchema);

module.exports = Diet;
