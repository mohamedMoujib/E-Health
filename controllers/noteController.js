const Note = require('../models/Note');

// Ajouter une note à un dossier médical
exports.addNote = async (req, res) => {
    try {
        const { titre, content,appointmentId } = req.body;

        const note = new Note({  titre, content,appointmentId });
        await note.save();

        res.status(201).json({ message: "Note ajoutée avec succès", note });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
};

// Obtenir les détails d'une note
exports.getNoteDetails = async (req, res) => {
    try {
        const { medicalFileId, itemId } = req.params;

        const note = await Note.findOne({ _id: itemId, medicalFile: medicalFileId });

        if (!note) {
            return res.status(404).json({ message: "Note introuvable" });
        }

        res.json(note);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
};
const mongoose = require("mongoose");

exports.getNotesbyPatient = async (req, res) => {
    console.log("Function called with params:", req.params);
    try {
        // Get the ID from the route parameter
        const medicalFileId = req.params.id;
        
        console.log("Medical File ID extracted:", medicalFileId);
        
        if (!medicalFileId || !mongoose.Types.ObjectId.isValid(medicalFileId)) {
            return res.status(400).json({
                message: "L'ID médical fourni n'est pas valide",
                receivedValue: medicalFileId
            });
        }
        
        const notes = await Note.find({ medicalFile: medicalFileId });
        console.log("notes found:", notes.length);
        
        return res.json(notes);
    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({ message: "Erreur serveur", error });
    }
};