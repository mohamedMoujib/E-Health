const Appointment = require('../models/appointment');
const Doctor = require('../models/Doctor');
const PrivateEngagement = require('../models/privateEngagement');
const mongoose = require('mongoose');
const User = require('../models/User');
const admin = require('../firebase'); // Import Firebase Admin SDK
const { Notification } = require("../models/Notification");



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
// get available slots
exports.getAvailableSlots = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { date } = req.query;

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
        const { doctorId } = req.params;
        const { date, time, type, patientId } = req.body;

        // Vérifier que la date du rendez-vous n'est pas dans le passé
        const appointmentDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Remet à 00:00:00 pour comparer uniquement la date

        if (appointmentDate < today) {
            throw new Error("Cannot book an appointment in the past");
        }

        // Vérifier la disponibilité du créneau horaire
        const availableSlots = await findAvailableSlots(doctorId, date);
        if (!availableSlots.includes(time)) {
            throw new Error("Slot not available");
        }

        // Créer le rendez-vous
        const appointment = new Appointment({
            doctor: doctorId,
            patient: patientId,
            date,
            time,
            type,
            status: "confirmed"
        });

        await appointment.save({ session });

        // Émettre un événement WebSocket AVANT le commit
        const io = req.app.get("socketio");
        io.emit("appointmentBooked", appointment);

        // Fetch doctor and patient tokens
        const doctor = await User.findById(doctorId);
        const patient = await User.findById(patientId);

        // // Send notifications
        // const message = {
        //     notification: {
        //         title: 'New Appointment',
        //         body: `New appointment booked for ${date} at ${time}`
        //     },
        //     tokens: [doctor.fcmToken, patient.fcmToken] // Assuming you store FCM tokens in the User model
        // };

        // // Store notifications in the database
        // const notifications = [
        //     { user: doctor._id, title: message.notification.title, body: message.notification.body },
        //     { user: patient._id, title: message.notification.title, body: message.notification.body }
        // ];
        // await Notification.insertMany(notifications);

        // // Envoyer la notification Firebase (ne pas bloquer la transaction)
        // admin.messaging().sendMulticast(message)
        //     .then((response) => {
        //         console.log('Successfully sent message:', response);
        //     })
        //     .catch((error) => {
        //         console.log('Error sending message:', error);
        //     });

        // ✅ COMMIT après avoir fait toutes les actions nécessaires
        await session.commitTransaction();

        res.status(201).json({ message: "Appointment booked successfully", appointment });
    } catch (error) {
        console.error("Error booking appointment:", error);

        // ✅ Annuler la transaction uniquement si elle est encore active
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        res.status(500).json({ message: error.message || "Server error" });
    } finally {
        // ✅ Toujours fermer la session
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

        const allowedStatus = ["pending", "confirmed", "canceled"];
        if(!allowedStatus.includes(status)) {
            return res.status(400).json({message: "Invalid status value"});
        }
        const appointment = await Appointment.findByIdAndUpdate(appointmentId, { status }, { new: true });
            if(!appointment) return res.status(404).json({ message: "Appointment not found"});

            // Emit event
        const io = req.app.get('socketio');
        io.emit('appointmentStatusUpdated', appointment);
         // Fetch doctor and patient tokens
         const doctor = await User.findById(appointment.doctor);
         const patient = await User.findById(appointment.patient);
 
         // Send notifications
         const message = {
             notification: {
                 title: 'Appointment Status Updated',
                 body: `Your appointment status has been updated to ${status}`
             },
             tokens: [doctor.fcmToken, patient.fcmToken] // Assuming you store FCM tokens in the User model
         };
 
         admin.messaging().sendMulticast(message)
             .then((response) => {
                 console.log('Successfully sent message:', response);
             })
             .catch((error) => {
                 console.log('Error sending message:', error);
             });
 

        res.json({ message: "Appointment status updated successfully", appointment });

        }catch (error) {
            res.status(500).json({ message: "Server error", error });
    }
}

//reschedule appointment
exports.RescheduleAppointment = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { appointmentId } = req.params;
        const { newDate, newTime } = req.body;

        // Vérifier que la nouvelle date n'est pas dans le passé
        const rescheduleDate = new Date(newDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // On ignore l'heure pour comparer uniquement la date

        if (rescheduleDate < today) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Cannot reschedule an appointment to a past date" });
        }

        // Vérifier si le rendez-vous existe
        const appointment = await Appointment.findById(appointmentId).session(session);
        if (!appointment) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Vérifier la disponibilité du médecin
        const availableSlots = await findAvailableSlots(appointment.doctor, newDate);
        if (!availableSlots) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Doctor not available on this date" });
        }

        // Vérifier si l'horaire est disponible
        if (!availableSlots.includes(newTime)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Slot not available" });
        }

        // Mettre à jour le rendez-vous
        appointment.date = newDate;
        appointment.time = newTime;
        await appointment.save({ session });

        await session.commitTransaction();
        session.endSession();

        // Emit event via WebSocket
        const io = req.app.get("socketio");
        io.emit("appointmentRescheduled", appointment);

         // Fetch doctor and patient tokens
         const doctor = await User.findById(appointment.doctor);
         const patient = await User.findById(appointment.patient);
 
         // Send notifications
         const message = {
             notification: {
                 title: 'Appointment Rescheduled',
                 body: `Your appointment has been rescheduled to ${newDate} at ${newTime}`
             },
             tokens: [doctor.fcmToken, patient.fcmToken] // Assuming you store FCM tokens in the User model
         };
 
         admin.messaging().sendMulticast(message)
             .then((response) => {
                 console.log('Successfully sent message:', response);
             })
             .catch((error) => {
                 console.log('Error sending message:', error);
             });

        res.json({ message: "Appointment rescheduled successfully", appointment });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: "Server error", error });
    }
};
