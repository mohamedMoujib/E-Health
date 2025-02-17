const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const MedicalFile = require("../models/MedicalFile");
const Note = require("../models/Note");
const Prescription = require("../models/Prescription");
const Document = require("../models/Document");
const Diet = require("../models/Diet");
const Chat = require("../models/Chat");
exports.searchPatients = async (req, res) => {
    try {
        const query = req.query.query;
        const patients = await Patient.find({
            $or: [
                { firstName: { $regex: query, $options: 'i' } },   
                { lastName: { $regex: query, $options: 'i' } }, 
                { cin: query } 
            ]
        }).select('-password');

        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
};

exports.createMedicalFile = async (req, res) => {
    try {
        const { doctorId , patientId } = req.body;

        const existingFile = await MedicalFile.findOne({ doctor: doctorId, patient: patientId });
        if (existingFile) {
            return res.status(400).json({ message: "Dossier medical deja existant" });
        }
        
        const chat = new Chat({ doctor: doctorId, patient: patientId });
        await chat.save();
        const medicalFile = new MedicalFile({ doctor: doctorId, patient: patientId });
        await medicalFile.save();
        

        res.status(201).json({ message: "Dossier medical cree avec succes" });
    } catch (error) {
            res.status(500).json({ message: "Erreur serveur", error });
    }
};

exports.getMedicalFileWithItems = async (req, res) => {
    try {
        const { medicalFileId } = req.params;

        // Récupérer le dossier médical
        const medicalFile = await MedicalFile.findById(medicalFileId)
            .populate('patient doctor');

        if (!medicalFile) {
            return res.status(404).json({ message: "Dossier médical introuvable" });
        }

        // Récupérer les éléments associés
        const notes = await Note.find({ medicalFile: medicalFileId });
        const prescriptions = await Prescription.find({ medicalFile: medicalFileId });
        const documents = await Document.find({ medicalFile: medicalFileId });
        const diets = await Diet.find({ medicalFile: medicalFileId });

        // Vérifier si des éléments ont été trouvés pour chaque type d'élément
        if (notes.length === 0 && prescriptions.length === 0 && documents.length === 0 && diets.length === 0) {
            return res.status(404).json({ message: "Aucun élément associé trouvé pour ce dossier médical." });
        }

        // Organiser les éléments sous un même tableau
        const formattedItems = [
            ...notes.map(note => ({
                type: 'Note',
                titre: note.titre,
                createdAt: note.createdAt
            })),
            ...documents.map(doc => ({
                type: 'Document',
                titre: doc.title,
                createdAt: doc.createdAt
            })),
            ...prescriptions.map(prescription => ({
                type: 'Prescription',
                description: prescription.description
            })),
            ...diets.map(diet => ({
                type: 'Diet',
                dietType: diet.dietType
            }))
        ];

        // Trier les éléments par date (optionnel)
        formattedItems.sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp));

        // Renvoi du dossier médical avec les éléments associés
        res.json({
            medicalFile: {
                patient: medicalFile.patient,
                createdAt: medicalFile.createdAt,
                updatedAt: medicalFile.updatedAt
            },
            items: formattedItems
        });
    } catch (error) {
        console.error(error); 
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

