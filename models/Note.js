const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
    {
        medicalFile: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalFile', required: true }, 
        content: { type: String, required: true }, 
    },
    { timestamps: true }
);

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
