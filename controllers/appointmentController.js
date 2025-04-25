const Appointment = require('../models/appointment');
const Doctor = require('../models/Doctor');
const PrivateEngagement = require('../models/privateEngagement');
const mongoose = require('mongoose');
const User = require('../models/User');
const admin = require('../firebase'); // Import Firebase Admin SDK
const { Notification } = require("../models/Notification");
const Note = require("../models/Note");
const Prescription = require("../models/Prescription");
const Diet = require("../models/Diet");
const Document = require("../models/Document");
const MedicalFile = require("../models/MedicalFile");

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
            status: "pending"
        });

        await appointment.save({ session });

        // Émettre un événement WebSocket
        const io = req.app.get("socketio");
        io.to(finalDoctorId).emit("appointmentBooked", appointment);
        io.to(finalPatientId).emit("appointmentBooked", appointment);

        // ✅ COMMIT après toutes les actions
        await session.commitTransaction();

        res.status(201).json({ 
            message: "Appointment booked successfully", 
            appointment,
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
    try {
        const { appointmentId}= req.params;
        const { status} = req.body;

        const allowedStatus = ["pending", "confirmed", "canceled","completed"];
        if(!allowedStatus.includes(status)) {
            return res.status(400).json({message: "Invalid status value"});
        }
        const appointment = await Appointment.findByIdAndUpdate(appointmentId, { status }, { new: true });
            if(!appointment) return res.status(404).json({ message: "Appointment not found"});

        //      Emit event
        // const io = req.app.get('socketio');
        // io.emit('appointmentStatusUpdated', appointment);
         // Fetch doctor and patient tokens
        //  const doctor = await User.findById(appointment.doctor);
        //  const patient = await User.findById(appointment.patient);
 
         // Send notifications
        //  const message = {
        //      notification: {
        //          title: 'Appointment Status Updated',
        //          body: `Your appointment status has been updated to ${status}`
        //      },
        //      tokens: [doctor.fcmToken, patient.fcmToken] // Assuming you store FCM tokens in the User model
        //  };
 
        //  admin.messaging().sendMulticast(message)
            //  .then((response) => {
            //      console.log('Successfully sent message:', response);
            //  })
            //  .catch((error) => {
            //      console.log('Error sending message:', error);
            //  });
 

        res.json({ message: "Appointment status updated successfully", appointment });

        }catch (error) {
            res.status(500).json({ message: "Server error", error });
    }
}

//reschedule appointment
exports.RescheduleAppointment = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    let isTransactionCommitted = false;

    try {
        const { appointmentId } = req.params;
        const { newDate, newTime } = req.body;

        // Vérifier que la nouvelle date n'est pas dans le passé
        const rescheduleDate = new Date(newDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // On ignore l'heure pour comparer uniquement la date

        if (rescheduleDate < today) {
            throw new Error("Cannot reschedule an appointment to a past date");
        }

        // Vérifier si le rendez-vous existe
        const appointment = await Appointment.findById(appointmentId).session(session);
        if (!appointment) {
            throw new Error("Appointment not found");
        }

        // Vérifier la disponibilité du médecin
        const availableSlots = await findAvailableSlots(appointment.doctor, newDate);
        if (!availableSlots) {
            throw new Error("Doctor not available on this date");
        }

        // Vérifier si l'horaire est disponible
        if (!availableSlots.includes(newTime)) {
            throw new Error("Slot not available");
        }

        // Mettre à jour le rendez-vous
        appointment.date = newDate;
        appointment.time = newTime;
        await appointment.save({ session });

        // Commit the transaction if everything goes well
        await session.commitTransaction();
        isTransactionCommitted = true;

        // Emit event via WebSocket
        // const io = req.app.get("socketio");
        // io.emit("appointmentRescheduled", appointment);

        // Fetch doctor and patient tokens
        const doctor = await User.findById(appointment.doctor);
        const patient = await User.findById(appointment.patient);

        // Send notifications
        // const message = {
        //     notification: {
        //         title: 'Appointment Rescheduled',
        //         body: `Your appointment has been rescheduled to ${newDate} at ${newTime}`
        //     },
        //     tokens: [doctor.fcmToken, patient.fcmToken] // Assuming you store FCM tokens in the User model
        // };

        // admin.messaging().sendMulticast(message)
        //     .then((response) => {
        //         console.log('Successfully sent message:', response);
        //     })
        //     .catch((error) => {
        //         console.log('Error sending message:', error);
        //     });

        res.json({ message: "Appointment rescheduled successfully", appointment });
    } catch (error) {
        if (!isTransactionCommitted) {
            await session.abortTransaction();
        }
        session.endSession();
        res.status(500).json({ message: error.message || "Server error", error });
    } finally {
        if (!isTransactionCommitted) {
            session.endSession();
        }
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

