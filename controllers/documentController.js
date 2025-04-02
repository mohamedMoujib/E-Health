const Document = require('../models/Document');

// Ajouter un document à un dossier médical
exports.addDocument = async (req, res) => {
    try {
        console.log("Données reçues:", req.body);
        console.log("Fichier reçu:", req.file);

        const { title, description, appointmentId } = req.body;
        const image = req.file ? req.file.path : null; // Vérifie si l’image est reçue

        if (!image) {
            return res.status(400).json({ message: "L'image est requise" });
        }

        const document = new Document({ title, image, description, appointmentId });
        await document.save();

        res.status(201).json({ message: "Document ajouté avec succès", document });
    } catch (error) {
        console.error("Erreur lors de l'ajout du document :", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
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

const mongoose = require("mongoose");

exports.getDocumentsbyPatient = async (req, res) => {
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
        
        const documents = await Document.find({ medicalFile: medicalFileId });
        console.log("Documents found:", documents.length);
        
        return res.json(documents);
    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({ message: "Erreur serveur", error });
    }
};

// exports.getDocumentsByAppointment = async (req, res) => {
//     console.log("Function called with params:", req.params);
//     try {
//         // Get the ID from the route parameter
//         const appointmentId = req.params.id;
        
//         console.log("Appointment ID extracted:", appointmentId);
        
//         if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId)) {
//             return res.status(400).json({
//                 message: "L'ID de rendez-vous fourni n'est pas valide",
//                 receivedValue: appointmentId
//             });
//         }
        
//         const documents = await Document.find({ appointmentId });
//         console.log("Documents found:", documents.length);
        
//         return res.json(documents);
//     } catch (error) {
//         console.error("Server error:", error);
//         return res.status(500).json({ message: "Erreur serveur", error });
//     }
// }