const Diet = require('../models/Diet');

exports.addDiet = async (req, res) => {
    try {
        const {appointmentId, dietType, description } = req.body;

        const diet = new Diet({  dietType, description ,appointmentId});
        await diet.save();

        res.status(201).json({ message: "Régime alimentaire ajouté avec succès", diet });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
};

exports.getDietDetails = async (req, res) => {
    try {
        const { medicalFileId, itemId } = req.params;
        const diet = await Diet.findOne({ _id: itemId, medicalFile: medicalFileId });
        if (!diet) {
            return res.status(404).json({ message: "Régime alimentaire introuvable" });
        }
        res.json(diet);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
};
const mongoose = require("mongoose");

exports.getDietsbyPatient = async (req, res) => {
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
        
        const diets = await Diet.find({ medicalFile: medicalFileId });
        console.log("diets found:", diets.length);
        
        return res.json(diets);
    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({ message: "Erreur serveur", error });
    }
};