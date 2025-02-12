const Prescription = require('../models/Prescription');

exports.addPrescription = async (req, res) => {
    try {
        const { medicalFileId } = req.params;
        const { description } = req.body;

        const prescription = new Prescription({ medicalFile: medicalFileId, description });
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
