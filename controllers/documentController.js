const Document = require('../models/Document');

exports.addDocument = async (req, res) => {
    try {
        const { medicalFileId } = req.params;
        const { title, description, appointmentId } = req.body;

        // Vérifier si un fichier a été téléchargé
        if (!req.file) {
            return res.status(400).json({ message: "Aucun fichier n'a été téléchargé" });
        }

        // Récupérer l'URL du fichier stocké sur Cloudinary
        const fileUrl = req.file.path;

        // Créer et sauvegarder le document
        const document = new Document({ 
            medicalFile: medicalFileId, 
            title, 
            file: fileUrl, 
            description, 
            appointmentId 
        });

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
