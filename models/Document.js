const mongoose = require('mongoose');

// Schéma pour les documents médicaux
const documentSchema = new mongoose.Schema(
    {
        medicalFile: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalRecord', required: false }, 
        title: { type: String, required: true }, 
        image: { type: String, required: true }, 
        description: { type: String },
         appointmentId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Appointment',
                    required: true 
                }
    },
    { timestamps: true }
);

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
