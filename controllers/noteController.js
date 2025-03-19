const Note = require('../models/Note');

// Ajouter une note à un dossier médical
exports.addNote = async (req, res) => {
    try {
        const { medicalFileId } = req.params;
        const { titre, content,appointmentId } = req.body;

        const note = new Note({ medicalFile: medicalFileId, titre, content,appointmentId });
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
