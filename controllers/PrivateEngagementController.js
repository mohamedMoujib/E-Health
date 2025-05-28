const PrivateEngagement = require('../models/PrivateEngagement');
const Appointment = require('../models/Appointment');




// add privateEngagement
exports.addPrivateEngagement = async (req, res) => {
    try {
        const {  description, startDate, endDate } = req.body;
        const doctor = req.user?.id; 
        // Convertir en objets Date
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Trouver les rendez-vous confirmés le même jour
        const appointments = await Appointment.find({
            doctor,
            status: "confirmed",
            date: { 
                $gte: new Date(start.toISOString().split("T")[0]), // Début de la journée
                $lte: new Date(end.toISOString().split("T")[0] + "T23:59:59.999Z") // Fin de la journée
            }
        });

        // Vérifier les conflits d'horaires
        const hasConflict = appointments.some(appointment => {
            const [hours, minutes] = appointment.time.split(":").map(Number);
            const appointmentTime = new Date(start);
            appointmentTime.setHours(hours, minutes, 0, 0); // Ajouter l'heure du rendez-vous

            return appointmentTime >= start && appointmentTime <= end;
        });

        if (hasConflict) {
            return res.status(400).json({ 
                message: "Cannot add private engagement. There are confirmed appointments in this period." 
            });
        }

        // Ajouter l'engagement privé si aucun conflit
        const newEngagement = new PrivateEngagement({
            doctor,
            description,
            startDate: start,
            endDate: end
        });

        await newEngagement.save();

        // Émettre un événement WebSocket
        const io = req.app.get("socketio");
        io.emit("privateEngagementAdded", newEngagement);

        res.status(201).json({ 
            message: "Private engagement created successfully", 
            engagement: newEngagement 
        });

    } catch (error) {
        console.error("Error creating private engagement:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

exports.updateEngagement = async (req, res) => {
    try {
        const { id } = req.params;
        const { description, startDate, endDate } = req.body;

        // Vérifier si l'engagement existe
        const existingEngagement = await PrivateEngagement.findById(id);
        if (!existingEngagement) {
            return res.status(404).json({ message: "Private engagement not found" });
        }

        // Convertir en objets Date
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Trouver les rendez-vous confirmés le même jour
        const appointments = await Appointment.find({
            doctor: existingEngagement.doctor,
            status: "confirmed",
            date: { 
                $gte: new Date(start.toISOString().split("T")[0]), // Début de la journée
                $lte: new Date(end.toISOString().split("T")[0] + "T23:59:59.999Z") // Fin de la journée
            }
        });

        // Vérifier les conflits d'horaires
        const hasConflict = appointments.some(appointment => {
            const [hours, minutes] = appointment.time.split(":").map(Number);
            const appointmentTime = new Date(start);
            appointmentTime.setHours(hours, minutes, 0, 0); // Ajouter l'heure du rendez-vous

            return appointmentTime >= start && appointmentTime <= end;
        });

        if (hasConflict) {
            return res.status(400).json({ 
                message: "Cannot update private engagement. There are confirmed appointments in this period." 
            });
        }

        // Mettre à jour l'engagement privé
        existingEngagement.description = description;
        existingEngagement.startDate = start;
        existingEngagement.endDate = end;
        await existingEngagement.save();

        // Émettre un événement WebSocket
        const io = req.app.get("socketio");
        io.emit("privateEngagementUpdated", existingEngagement);

        res.status(200).json({ 
            message: "Private engagement updated successfully", 
            engagement: existingEngagement 
        });

    } catch (error) {
        console.error("Error updating private engagement:", error);
        res.status(500).json({ message: "Server error", error });
    }
};


// Delete a private engagement
exports.deleteEngagement =  async (req, res) => {
    try {
        const { id } = req.params;

        const deletedEngagement = await PrivateEngagement.findByIdAndDelete(id);

        if (!deletedEngagement) {
            return res.status(404).json({ message: 'Private engagement not found' });
        }
         // Emit event
         const io = req.app.get('socketio');
         io.emit('privateEngagementDeleted', id);

        res.status(200).json({ message: 'Private engagement deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

// Get private engagements for a doctor
exports.getEngagement = async (req, res) => {
    try {
        const doctorId  = req.user?.id ;  

        const engagements = await PrivateEngagement.find({ doctor: doctorId });

        res.status(200).json({ engagements });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

