const Document = require('../models/Document');

// Ajouter un document à un dossier médical
exports.addDocument = async (req, res) => {
    try {
        const { medicalFileId } = req.params;
        const { title, image, description,appointmentId } = req.body;

        const document = new Document({ medicalFile: medicalFileId, title, image, description,appointmentId });
        await document.save();

        res.status(201).json({ message: "Document ajouté avec succès", document });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
};

// Obtenir les détails d'un document
exports.getDocumentDetails = async (req, res) => {
    try {
        const { medicalFileId, itemId } = req.params;

        const document = await Document.findOne({ _id: itemId, medicalFile: medicalFileId });

        if (!document) {
            return res.status(404).json({ message: "Document introuvable" });
        }

        res.json(document);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
};
