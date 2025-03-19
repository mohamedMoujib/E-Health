const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
    {
        medicalFile: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalFile', required: true }, 
        titre: { type: String, required: true },
        content: { type: String}, 
         appointmentId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Appointment',
                    required: true 
                }
    },
    { timestamps: true }
);

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
