const mongoose = require('mongoose');

// Schéma pour le régime alimentaire
const dietSchema = new mongoose.Schema(
    {
        medicalFile: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalFile', required: true }, 
        dietType: { type: String, required: true }, 
        description: { type: String }, 
    },
    { timestamps: true }
);

const Diet = mongoose.model('Diet', dietSchema);

module.exports = Diet;
