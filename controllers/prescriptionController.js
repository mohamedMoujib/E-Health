const Prescription = require('../models/Prescription');

exports.addPrescription = async (req, res) => {
    try {
        const { description ,appointmentId} = req.body;

        const prescription = new Prescription({  description,appointmentId });
        await prescription.save();

        res.status(201).json({ message: "Prescription ajoutée avec succès", prescription });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
};

exports.getPrescriptionDetails = async (req, res) => {
    try {
        const { medicalFileId, itemId } = req.params;

        const prescription = await Prescription.findOne({ _id: itemId, medicalFile: medicalFileId });

        if (!prescription) {
            return res.status(404).json({ message: "Prescription introuvable" });
        }

        res.json(prescription);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
};

const mongoose = require("mongoose");

exports.getPrescriptionsbyPatient = async (req, res) => {
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
        
        const prescriptions = await Prescription.find({ medicalFile: medicalFileId });
        console.log("prescription found:", prescriptions.length);
        
        return res.json(prescriptions);
    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({ message: "Erreur serveur", error });
    }
};