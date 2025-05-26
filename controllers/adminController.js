const Admin = require('../models/Admin');
const Doctor = require('../models/Doctor');
const nodemailer = require('nodemailer');
exports.getDoctorsPending = async (req, res) => {
    try {
        const Doctors = await Doctor.find( );
        res.status(200).json(Doctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.confirmDoctor = async (req, res) => {
    try {
        const { idDoctor } = req.body;

        // 1. Find and update the doctor
        const doctor = await Doctor.findByIdAndUpdate(
            idDoctor,
            { status: "valide" }, // Changed to match your schema enum
            { new: true }
        );

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // 2. Get email - since Doctor inherits from User, email is directly on doctor
        if (!doctor.email) {
            console.warn('Doctor confirmed but no email found:', doctor._id);
            return res.status(200).json({ 
                message: 'Doctor confirmed but no email available for notification' 
            });
        }

        // 3. Send confirmation email
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: "healora.ehealth@gmail.com",
            to: doctor.email, // Directly use doctor's email
            subject: "Votre compte médecin a été approuvé",
            html: `
                <p>Cher Dr ${doctor.lastName},</p>
                <p>Votre inscription en tant que médecin a été approuvée !</p>
                <p>Statut du compte : <strong>Actif</strong></p>
                <p>Vous pouvez maintenant vous connecter au système.</p>
                <p>Cordialement,<br>L'équipe médicale</p>
            `,
        });

        res.status(200).json({ message: 'Doctor confirmed successfully' });

    } catch (error) {
        console.error('Error in confirmDoctor:', {
            error: error.message,
            stack: error.stack,
            body: req.body
        });
        res.status(500).json({ 
            message: 'Error confirming doctor',
            error: error.message 
        });
    }
};
exports.deleteDoctor = async (req, res) => {
    const { idDoctor } = req.body;
    try {
        const doctor = await Doctor.findByIdAndDelete(idDoctor,{new:true});
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor non trouvé' });
        }
        res.status(200).json({ message: 'Doctor supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};