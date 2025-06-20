const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const PrivateEngagement = require('../models/PrivateEngagement');
const mongoose = require('mongoose');
const User = require('../models/User');
const admin = require('../firebase'); // Import Firebase Admin SDK
const  Notification  = require("../models/Notification");
const Note = require("../models/Note");
const Prescription = require("../models/Prescription");
const Diet = require("../models/Diet");
const Document = require("../models/Document");
const MedicalFile = require("../models/MedicalFile");
const { sendAppointmentNotification , sendAppointmentStatusNotification,sendAppointmentRescheduleNotification } = require('../utils/notificationsHelper');
const socketManager = require('../socketManager');
// Generate time slots
exports.generateTimeSlots = (periods, interval = 20) => {
    let slots = [];

    periods.forEach(({ startTime, endTime }) => {
        let [startHour, startMinute] = startTime.split(':').map(Number);
        let [endHour, endMinute] = endTime.split(':').map(Number);

        let start = new Date();
        start.setHours(startHour, startMinute, 0, 0);

        let end = new Date();
        end.setHours(endHour, endMinute, 0, 0);

        while (start < end) {
            let hour = start.getHours().toString().padStart(2, '0');
            let minute = start.getMinutes().toString().padStart(2, '0');
            slots.push(`${hour}:${minute}`);
            start.setMinutes(start.getMinutes() + interval);
        }
    });

    return slots;
}
// Find available slots
const findAvailableSlots = async (doctorId, date) => {
    // Find doctor
    console.log("Doctor ID:", doctorId);
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) throw new Error("Doctor not found");

        // Get the schedule for the selected day
        const daySchedule = doctor.schedule.find((s) => s.day === new Date(date).toLocaleString("en-US", { weekday: "long" }));
        if (!daySchedule) return []; // Doctor doesn't work that day
    
        // Generate available slots based on the schedule
        let availableSlots = exports.generateTimeSlots(daySchedule.periods);
    
        // Get booked appointments
        const bookedAppointments = await Appointment.find({ doctor: doctorId, date }).select("time");
        const bookedSlots = bookedAppointments.map((appt) => appt.time);
    
        // Get private engagements for the day
        const privateEngagements = await PrivateEngagement.find({
            doctor: doctorId,
            startDate: { $lte: new Date(date).setHours(23, 59, 59, 999) },
            endDate: { $gte: new Date(date).setHours(0, 0, 0, 0) }
        });
    
        const blockedSlots = privateEngagements.flatMap((engagement) => {
            const startTime = engagement.startDate.toISOString().split('T')[1].slice(0, 5);
            const endTime = engagement.endDate.toISOString().split('T')[1].slice(0, 5);
            return exports.generateTimeSlots([{ startTime, endTime }]);
        });
    
        // Remove booked and blocked slots
        availableSlots = availableSlots.filter((slot) => !bookedSlots.includes(slot) && !blockedSlots.includes(slot));
    
        return availableSlots;
    }

// get available slots for intrface Patient
exports.getAvailableSlotsForPatient = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { date } = req.query;

        const availableSlots = await findAvailableSlots(doctorId, date);
        res.json({ availableSlots });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// get available slots
exports.getAvailableSlots = async (req, res) => {
    try {
        const  doctorId  = req.user?.id;
        const { date } = req.params;
        const availableSlots = await findAvailableSlots(doctorId, date);
        res.json({ availableSlots });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};


exports.bookAppointment = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { date, time, type, doctorId, patientId } = req.body;
        const userId = req.user?.id;
        const userRole = req.user?.role;

        let finalDoctorId;
        let finalPatientId;

        if (userRole === "patient") {
            // Si c'est un patient, il doit fournir un doctorId
            if (!doctorId) {
                throw new Error("Doctor ID is required for patients");
            }
            finalDoctorId = doctorId;
            finalPatientId = userId; // Le patient est celui qui réserve
        } else if (userRole === "doctor") {
            // Si c'est un docteur, il doit fournir un patientId
            if (!patientId) {
                throw new Error("Patient ID is required for doctors");
            }
            finalDoctorId = userId; // Le docteur est celui qui réserve
            finalPatientId = patientId;
        } else {
            throw new Error("Unauthorized role");
        }

        // Vérifier que la date du rendez-vous n'est pas dans le passé
        const appointmentDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (appointmentDate < today) {
            throw new Error("Cannot book an appointment in the past");
        }

        // Vérifier la disponibilité du créneau horaire
        const availableSlots = await findAvailableSlots(finalDoctorId, date);
        if (!availableSlots.includes(time)) {
            throw new Error("Slot not available");
        }

        // Vérifier si un dossier médical existe déjà entre ce médecin et ce patient
        let medicalFileExists = await MedicalFile.findOne({
            patient: finalPatientId,
            doctor: finalDoctorId
        }).session(session);

        // Créer un dossier médical s'il n'existe pas encore
        if (!medicalFileExists) {
            const newMedicalFile = new MedicalFile({
                patient: finalPatientId,
                doctor: finalDoctorId
            });
            await newMedicalFile.save({ session });
            //console.log(New medical file created for patient ${finalPatientId} with doctor ${finalDoctorId});
        }

        // Créer le rendez-vous
        const appointment = new Appointment({
    doctor: finalDoctorId,
    patient: finalPatientId,
    date,
    time,
    type,
    status: userRole === "doctor" ? "confirmed" : "pending"
});

        await appointment.save({ session });

        // Émettre un événement WebSocket
        const io = req.app.get("socketio");
        io.to(finalDoctorId).emit("appointmentBooked", appointment);
        io.to(finalPatientId).emit("appointmentBooked", appointment);


        
        // Determine who receives the notification (whoever didn't make the booking)
        const receiverId = userRole === "patient" ? finalDoctorId : finalPatientId;
        const receiverSocketId = socketManager.getSocketId(receiverId);
        
        // Create notification content
        const [doctor, patient] = await Promise.all([
            User.findById(finalDoctorId).select('firstName lastName').lean(),
            User.findById(finalPatientId).select('firstName lastName').lean()
        ]);
        
        const formattedDate = new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
        
        const notificationTitle = userRole === "patient" 
            ? `Nouvelle demande de rendez-vous` 
            : `Rendez-vous programmé`;
            
        const notificationContent = userRole === "patient"
            ? `${patient.firstName} ${patient.lastName} a demandé rendez-vous le ${formattedDate} à ${time}`
            : `Le Dr. ${doctor.firstName} ${doctor.lastName} a programmé un rendez-vous le ${formattedDate} à ${time}`;
        
        // Create notification entry
        const notification = new Notification({
            recipient: receiverId,
            title: notificationTitle,
            content: notificationContent,
            type: 'appointment',
            relatedEntity: appointment._id,
            entityModel: 'Appointment',
            sender: userId
        });
        
        await notification.save({ session });
        
        // Send real-time notification if receiver is connected
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newNotification', {
                notificationId: notification._id.toString(),
                title: notificationTitle,
                content: notificationContent,
                type: 'appointment',
                appointmentId: appointment._id.toString(),
                createdAt: notification.createdAt
            });
        }
        
        // Send push notification if receiver is not connected
        let notificationResult = null;
        if (!receiverSocketId) {
            notificationResult = await sendAppointmentNotification({
                doctorId: finalDoctorId,
                patientId: finalPatientId,
                appointment,
                initiatorId: userId
            }).catch(err => {
                console.error('Notification error:', err);
                return { error: err.message };
            });
        }
        
        // ✅ COMMIT après toutes les actions
        await session.commitTransaction();

        res.status(201).json({ 
            message: "Appointment booked successfully", 
            appointment,
            notification: notificationResult || { status: 'delivered_via_websocket' },
            medicalFileCreated: !medicalFileExists // Indiquer si un nouveau dossier médical a été créé
        });
    } catch (error) {
        console.error("Error booking appointment:", error);

        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        res.status(500).json({ message: error.message || "Server error" });
    } finally {
        session.endSession();
    }
};

// DeleteAppointment
exports.DeleteAppointment = async (req, res) => {
    try {
        const { appointmentId} = req.params ;
        const appointment = await Appointment.findById(appointmentId);
        if(!appointment) return res.status(404).json({ message: "Appointment not found"});

        await Appointment.findByIdAndDelete(appointmentId);

         // Emit event
         const io = req.app.get('socketio');
         io.emit('appointmentDeleted', appointmentId);

        res.json({ message: "Appointment Deleted successfully"});

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

// Update Appointment
exports.UpdateAppointmentStatus = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        console.log('Request params:', req.params);
        console.log('Request body:', req.body);
        console.log('User from token:', req.user);

        const { appointmentId } = req.params;
        const { status } = req.body;
        const userId = req.user?.id;

        // Validate required fields
        if (!appointmentId) {
            return res.status(400).json({message: "Appointment ID is required"});
        }

        if (!status) {
            return res.status(400).json({message: "Status is required"});
        }

        if (!userId) {
            return res.status(401).json({message: "User not authenticated"});
        }

        const allowedStatus = ["pending", "confirmed", "canceled", "completed"];
        if(!allowedStatus.includes(status)) {
            return res.status(400).json({message: "Invalid status value"});
        }

        // Validate appointmentId format
        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({message: "Invalid appointment ID format"});
        }
        
        console.log('Searching for appointment with ID:', appointmentId);
        
        const appointment = await Appointment.findByIdAndUpdate(
            appointmentId, 
            { status }, 
            { new: true, session }
        ).populate('doctor patient', 'firstName lastName');
        
        if(!appointment) {
            console.log('Appointment not found for ID:', appointmentId);
            return res.status(404).json({ message: "Appointment not found" });
        }

        console.log('Appointment found:', appointment);

        // Get user roles to determine who made the update
        const user = await User.findById(userId).select('role').lean();
        if (!user) {
            console.log('User not found for ID:', userId);
            return res.status(404).json({ message: "User not found" });
        }

        console.log('User making update:', user);

        // Determine notification recipient based on who made the update
        let recipientId, notificationTitle, notificationContent;
        
        // Check if appointment has valid date
        if (!appointment.date) {
            console.error('Appointment has no date:', appointment);
            return res.status(400).json({ message: "Appointment date is missing" });
        }

        const formattedDate = new Date(appointment.date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
        
        console.log('Formatted date:', formattedDate);
        
        if (user.role === 'doctor' && userId.toString() === appointment.doctor._id.toString()) {
            // Doctor made the update, notify patient
            recipientId = appointment.patient._id;
            notificationTitle = `Statut du rendez-vous mis à jour`;
            notificationContent = `Votre rendez-vous avec Dr ${appointment.doctor.lastName} le ${formattedDate} à ${appointment.time} a été ${getStatusTranslation(status)}`;
        } else {
            // Patient or admin made the update, notify doctor
            recipientId = appointment.doctor._id;
            notificationTitle = `Statut du rendez-vous mis à jour`;
            notificationContent = `Le rendez-vous avec ${appointment.patient.lastName} ${appointment.patient.firstName} le ${formattedDate} à ${appointment.time} a été ${getStatusTranslation(status)}`;
        }
        
        console.log('Notification recipient:', recipientId);
        console.log('Notification content:', notificationContent);
        
        // Check if getStatusTranslation function exists and works
        let translatedStatus;
        try {
            translatedStatus = getStatusTranslation(status);
            console.log('Status translation:', translatedStatus);
        } catch (translationError) {
            console.error('Status translation error:', translationError);
            // Fallback to original status if translation fails
            translatedStatus = status;
        }

        // Update notification content with safe translation
        if (user.role === 'doctor' && userId.toString() === appointment.doctor._id.toString()) {
            notificationContent = `Votre rendez-vous avec Dr ${appointment.doctor.lastName} le ${formattedDate} à ${appointment.time} a été ${translatedStatus}`;
        } else {
            notificationContent = `Le rendez-vous avec ${appointment.patient.lastName} ${appointment.patient.firstName} le ${formattedDate} à ${appointment.time} a été ${translatedStatus}`;
        }
        
        // Create notification entry
        const notification = new Notification({
            recipient: recipientId,
            title: notificationTitle,
            content: notificationContent,
            type: 'appointment',
            isRead: false,
            sender: userId,
            relatedEntity: appointmentId,
            entityModel: 'Appointment'
        });
        
        console.log('Saving notification:', notification);
        await notification.save({ session });
        console.log('Notification saved successfully');
        
        // Get socketio instance
        const io = req.app.get("socketio");
        console.log('Socket.io instance:', !!io);
        
        // Send real-time notification if receiver is connected
        let recipientSocketId = null;
        try {
            if (typeof socketManager !== 'undefined' && socketManager.getSocketId) {
                recipientSocketId = socketManager.getSocketId(recipientId);
                console.log('Recipient socket ID:', recipientSocketId);
            } else {
                console.log('socketManager not available or getSocketId method missing');
            }
        } catch (socketError) {
            console.error('Socket manager error:', socketError);
        }
        
        if (recipientSocketId && io) {
            try {
                io.to(recipientSocketId).emit('newNotification', {
                    notificationId: notification._id.toString(),
                    title: notificationTitle,
                    content: notificationContent,
                    type: 'appointment',
                    appointmentId: appointmentId,
                    createdAt: notification.createdAt
                });
                console.log('Real-time notification sent');
            } catch (socketEmitError) {
                console.error('Socket emit error:', socketEmitError);
            }
        }
        
        // Send push notification if receiver is not connected via websocket
        let notificationResult = null;
        
        if (!recipientSocketId) {
            try {
                const isDoctor = recipientId.toString() === appointment.doctor._id.toString();
                
                // Check if sendAppointmentStatusNotification function exists
                if (typeof sendAppointmentStatusNotification === 'function') {
                    notificationResult = await sendAppointmentStatusNotification({
                        appointment,
                        status,
                        recipientId,
                        initiatorId: userId,
                        isDoctor
                    }).catch(err => {
                        console.error('Push notification error:', err);
                        return { error: err.message, recipient: isDoctor ? 'doctor' : 'patient' };
                    });
                    console.log('Push notification result:', notificationResult);
                } else {
                    console.log('sendAppointmentStatusNotification function not available');
                    notificationResult = { status: 'push_notification_unavailable' };
                }
            } catch (pushNotificationError) {
                console.error('Push notification setup error:', pushNotificationError);
                notificationResult = { error: pushNotificationError.message };
            }
        }

        await session.commitTransaction();
        console.log('Transaction committed successfully');
        
        res.json({ 
            message: "Appointment status updated successfully", 
            appointment,
            notification: notificationResult || { status: 'delivered_via_websocket' }
        });

    } catch (error) {
        console.error('Full error details:', error);
        console.error('Error stack:', error.stack);
        
        await session.abortTransaction();
        
        // Send more specific error information
        res.status(500).json({ 
            message: "Server error", 
            error: error.message,
            errorType: error.constructor.name,
            // Only include stack in development
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
    } finally {
        session.endSession();
    }
}

// Helper function - make sure this exists in your code
function getStatusTranslation(status) {
    const translations = {
        'pending': 'en attente',
        'confirmed': 'confirmé',
        'canceled': 'annulé',
        'completed': 'terminé'
    };
    
    return translations[status] || status;
}
//reschedule appointment
exports.RescheduleAppointment = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { appointmentId } = req.params;
        const { newDate, newTime } = req.body;
        const userId = req.user?.id;

        // Validate new date isn't in the past
        const rescheduleDate = new Date(newDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (rescheduleDate < today) {
            throw new Error("Cannot reschedule an appointment to a past date");
        }

        // Check if appointment exists
        const appointment = await Appointment.findById(appointmentId).session(session)
            .populate('doctor patient', 'firstName lastName');
            
        if (!appointment) {
            throw new Error("Appointment not found");
        }

        // Check doctor availability
        const availableSlots = await findAvailableSlots(appointment.doctor._id, newDate);
        if (!availableSlots) {
            throw new Error("Doctor not available on this date");
        }

        // Check slot availability
        if (!availableSlots.includes(newTime)) {
            throw new Error("Slot not available");
        }

        // Store old values
        const oldDate = appointment.date;
        const oldTime = appointment.time;

        // Update appointment
        appointment.date = newDate;
        appointment.time = newTime;
        await appointment.save({ session });

        // Get user role
        const user = await User.findById(userId).select('role').lean();
        if (!user) {
            throw new Error("User not found");
        }

        // Prepare notification
        const formattedOldDate = new Date(oldDate).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
        
        const formattedNewDate = new Date(newDate).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
        
        let recipientId, notificationTitle, notificationContent;
        
        if (user.role === 'doctor' && userId.toString() === appointment.doctor._id.toString()) {
            recipientId = appointment.patient._id;
            notificationTitle = `Rendez-vous reprogrammé`;
            notificationContent = `Votre rendez-vous avec le Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}  a été reprogrammé du ${formattedOldDate} le ${oldTime} à ${formattedNewDate} le ${newTime}`;
        } else {
            recipientId = appointment.doctor._id;
            notificationTitle = `Rendez-vous reprogrammé`;
            notificationContent = `Votre rendez-vous avec  ${appointment.patient.firstName} ${appointment.patient.lastName}  a été reprogrammé du ${formattedOldDate} le ${oldTime} à ${formattedNewDate} le ${newTime}`;
        }
        
        // Create notification
        const notification = new Notification({
            recipient: recipientId,
            title: notificationTitle,
            content: notificationContent,
            type: 'appointment',
            isRead: false,
            sender: userId,
            relatedEntity: appointmentId,
            entityModel: 'Appointment'
        });
        
        await notification.save({ session });
        
        // Socket.io notification
        const io = req.app.get("socketio");
        const recipientSocketId = socketManager.getSocketId(recipientId);
        
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('newNotification', {
                notificationId: notification._id.toString(),
                title: notificationTitle,
                content: notificationContent,
                type: 'appointment',
                appointmentId: appointmentId,
                createdAt: notification.createdAt
            });
        }
        
        // Commit transaction before sending external notifications
        await session.commitTransaction();
        session.endSession();

        // Send push notification (outside transaction)
        let notificationResult = null;
        if (!recipientSocketId) {
            const isDoctor = recipientId.toString() === appointment.doctor._id.toString();
            
            notificationResult = await sendAppointmentRescheduleNotification({
                appointment,
                oldDate: formattedOldDate,
                oldTime,
                newDate: formattedNewDate,
                newTime,
                recipientId,
                initiatorId: userId,
                isDoctor
            }).catch(err => {
                console.error('Notification error:', err);
                return { error: err.message, recipient: isDoctor ? 'doctor' : 'patient' };
            });
        }

        res.json({ 
            message: "Appointment rescheduled successfully", 
            appointment,
            notification: notificationResult || { status: 'delivered_via_websocket' }
        });

    } catch (error) {
        // Only abort if transaction hasn't been committed
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        session.endSession();
        res.status(500).json({ message: error.message || "Server error", error });
    }
};

// Get all appointments with notes , documets , perscriptions , diets
exports.getAppointmentsWithDetailsByPatient = async (req, res) => {
    try {
        const { patientId } = req.params;

        // Vérifier si patientId est un ObjectId valide
        if (!mongoose.Types.ObjectId.isValid(patientId)) {
            return res.status(400).json({ message: "ID patient invalide" });
        }

        // 1️⃣ Récupérer les rendez-vous du patient, triés du plus récent au plus ancien
        const appointments = await Appointment.find({ patient: patientId }).sort({ date: -1 });

        if (appointments.length === 0) {
            return res.status(404).json({ message: "Aucun rendez-vous trouvé pour ce patient" });
        }

        // 2️⃣ Construire les données complètes pour chaque rendez-vous
        const detailedAppointments = await Promise.all(
            appointments.map(async (appointment) => {
                const appointmentId = appointment._id;

                // Récupérer les notes, prescriptions, régimes et documents liés à ce rendez-vous
                const [notes, prescriptions, diets, documents] = await Promise.all([
                    Note.find({ appointmentId }),
                    Prescription.find({ appointmentId }),
                    Diet.find({ appointmentId }),
                    Document.find({ appointmentId }),
                ]);

                return {
                    ...appointment.toObject(), // Convertir le document Mongoose en objet JS
                    notes,
                    prescriptions,
                    diets,
                    documents,
                };
            })
        );

        res.json(detailedAppointments);
    } catch (error) {
        console.error("Erreur lors de la récupération des rendez-vous :", error);
        res.status(500).json({ message: "Erreur serveur", error });
    }
};
//get appointment details
exports.getAppointmentDetails = async (req, res) => {
    try {
        const { appointmentId } = req.params;

        // Validate appointmentId
        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({ message: "Invalid appointment ID" });
        }

        // Find the appointment and populate patient details
        const appointment = await Appointment.findById(appointmentId).populate('patient');

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Fetch associated medical records concurrently
        const [notes, prescriptions, dietPlans, documents] = await Promise.all([
            Note.find({ appointmentId }),
            Prescription.find({ appointmentId }),
            Diet.find({ appointmentId }),
            Document.find({ appointmentId })
        ]);

        // Construct detailed appointment object
        const detailedAppointment = {
            ...appointment.toObject(), // Convert Mongoose document to plain object
            notes,
            prescriptions,
            dietPlans,
            documents
        };

        res.json(detailedAppointment);
    } catch (error) {
        console.error("Error retrieving appointment details:", error);
        res.status(500).json({ 
            message: "Server error", 
            error: error.message 
        });
    }
};

