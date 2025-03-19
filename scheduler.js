// const cron = require('node-cron');
// const Appointment = require('./models/appointment');
// const User = require('./models/User');
// const admin = require('./firebase'); // Import Firebase Admin SDK
// const Notification = require('./models/Notification'); // Import Notification model


// // Function to send notifications
// const sendNotification = async (appointment) => {
//   try {
//     const doctor = await User.findById(appointment.doctor);
//     const patient = await User.findById(appointment.patient);

//     const message = {
//       notification: {
//         title: 'Upcoming Appointment',
//         body: `You have an appointment scheduled for ${appointment.date} at ${appointment.time}`
//       },
//       tokens: [doctor.fcmToken, patient.fcmToken] // Assuming you store FCM tokens in the User model
//     };

//     // Store notifications in the database
//     const notifications = [
//         { user: doctor._id, title: message.notification.title, body: message.notification.body },
//         { user: patient._id, title: message.notification.title, body: message.notification.body }
//       ];
  
//       await Notification.insertMany(notifications);

//     admin.messaging().sendMulticast(message)
//       .then((response) => {
//         console.log('Successfully sent message:', response);
//       })
//       .catch((error) => {
//         console.log('Error sending message:', error);
//       });
//   } catch (error) {
//     console.log('Error sending notification:', error);
//   }
// };

// // Schedule task to run every hour
// cron.schedule('0 * * * *', async () => {
//   try {
//     const now = new Date();
//     const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

//     const appointments = await Appointment.find({
//       date: {
//         $gte: now,
//         $lte: next24Hours
//       }
//     });

//     appointments.forEach(sendNotification);
//   } catch (error) {
//     console.log('Error fetching appointments:', error);
//   }
// });