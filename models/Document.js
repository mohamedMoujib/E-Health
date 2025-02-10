const mongoose = require('mongoose');

// Schéma pour les documents médicaux
const documentSchema = new mongoose.Schema(
    {
        medicalRecord: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalRecord', required: true }, 
        title: { type: String, required: true }, 
        image: { type: String, required: true }, 
        description: { type: String },
    },
    { timestamps: true }
);

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
