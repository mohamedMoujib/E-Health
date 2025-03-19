const Diet = require('../models/Diet');

exports.addDiet = async (req, res) => {
    try {
        const { medicalFileId } = req.params;
        const {appointmentId, dietType, description } = req.body;

        const diet = new Diet({ medicalFile: medicalFileId, dietType, description ,appointmentId});
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
