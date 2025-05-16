const User = require('../models/User');
const Notification = require('../models/Notification');
const admin = require('../firebase');

async function sendChatNotification({
  receiverId,
  senderId,
  message,
  chatId,
  messageId
}) {
  try {
    const [sender, receiver] = await Promise.all([
      User.findById(senderId).select('firstName lastName image').lean(),
      User.findById(receiverId).select('fcmToken notificationSettings').lean()
    ]);

    if (!receiver) throw new Error('Receiver not found');
    if (!sender) throw new Error('Sender not found');

    // Check if user has notifications enabled
    if (receiver.notificationSettings?.messages === false) {
      return { status: 'disabled_by_user' };
    }

    const senderName = `${sender.firstName} ${sender.lastName}`.trim();
    const notificationTitle = `New message from ${senderName || 'User'}`;
    const notificationBody = message.length > 100 
      ? `${message.substring(0, 100)}...` 
      : message;

      const notification = new Notification({
        recipient: receiverId,
        title: notificationTitle,
        content: notificationBody,
        type: 'message',
        relatedEntity: chatId,
        entityModel: 'Chat',
        messageRef: messageId,
        sender: senderId
      });
  
      await notification.save();

    // Skip if no FCM token
    if (!receiver.fcmToken) {
      return { status: 'saved_locally', notification };
    }

    // Prepare payload
    const payload = {
      notification: {
        title: notificationTitle,
        body: notificationBody,
        icon: sender?.image || '/default-avatar.png',
        image: message.type === 'image' ? message.content : undefined
      },
      data: {
        type: 'message',
        chatId: chatId.toString(),
        senderId: senderId.toString(),
        messageId: messageId.toString(),
        notificationId: notification._id.toString(),
        click_action: `${process.env.FRONTEND_URL}/chats/${chatId}`,
        senderName: senderName,
        senderImage: sender?.image || ''
      },
      token: receiver.fcmToken,
      android: { 
        priority: 'high',
        notification: {
          channel_id: 'messages',
          sound: 'default'
        }
      },
      apns: { 
        payload: { 
          aps: { 
            'mutable-content': 1,
            sound: 'default',
            badge: 1
          } 
        } 
      }
    };

    const response = await admin.messaging().send(payload);
    return { status: 'delivered', notification, messageId: response };

  } catch (error) {
    console.error('Notification error:', error);
    throw error;
  }
}
async function sendAppointmentNotification({
  doctorId,
  patientId,
  appointment,
  initiatorId
}) {
  try {
    // Determine who should receive the notification (whoever didn't initiate the booking)
    const receiverId = initiatorId.toString() === doctorId.toString() ? patientId : doctorId;
    
    // Get receiver and initiator data
    const [receiver, initiator] = await Promise.all([
      User.findById(receiverId).select('fcmToken notificationSettings firstName lastName').lean(),
      User.findById(initiatorId).select('firstName lastName image role').lean()
    ]);
    
    if (!receiver) throw new Error('Receiver not found');
    if (!initiator) throw new Error('Initiator not found');
    
    // Check if user has notifications enabled
    if (receiver.notificationSettings?.appointments === false) {
      return { status: 'disabled_by_user' };
    }
    
    // Format date and time for better readability
    const appointmentDate = new Date(appointment.date);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Create notification title and content based on user roles
    const initiatorName = `${initiator.firstName} ${initiator.lastName}`.trim();
    const notificationTitle = initiator.role === 'doctor' 
      ? `Appointment scheduled with Dr. ${initiatorName}`
      : `New appointment with ${initiatorName}`;
    
    const notificationBody = `${formattedDate} at ${appointment.time} - ${appointment.type} appointment`;
    
    // Create notification record in database
    const notification = new Notification({
      recipient: receiverId,
      title: notificationTitle,
      content: notificationBody,
      type: 'appointment',
      relatedEntity: appointment._id,
      entityModel: 'Appointment',
      sender: initiatorId
    });
    
    await notification.save();
    
    // Skip if no FCM token
    if (!receiver.fcmToken) {
      return { status: 'saved_locally', notification };
    }
    
    // Prepare payload for push notification
    const payload = {
      notification: {
        title: notificationTitle,
        body: notificationBody,
        icon: initiator?.image || '/default-avatar.png'
      },
      data: {
        type: 'appointment',
        appointmentId: appointment._id.toString(),
        notificationId: notification._id.toString(),
        initiatorId: initiatorId.toString(),
        click_action: `${process.env.FRONTEND_URL}/appointments/${appointment._id}`,
        initiatorName: initiatorName,
        initiatorRole: initiator.role,
        appointmentDate: appointment.date,
        appointmentTime: appointment.time,
        appointmentType: appointment.type
      },
      token: receiver.fcmToken,
      android: {
        priority: 'high',
        notification: {
          channel_id: 'appointments',
          sound: 'default'
        }
      },
      apns: {
        payload: {
          aps: {
            'mutable-content': 1,
            sound: 'default',
            badge: 1
          }
        }
      }
    };
    
    const response = await admin.messaging().send(payload);
    return { status: 'delivered', notification, messageId: response };
  } catch (error) {
    console.error('Appointment notification error:', error);
    throw error;
  }
}
async function sendAppointmentStatusNotification({
  appointment,
  status,
  recipientId,
  initiatorId,
  isDoctor
}) {
  try {
    // Get receiver and initiator data
    const [receiver, initiator] = await Promise.all([
      User.findById(recipientId).select('fcmToken notificationSettings firstName lastName').lean(),
      User.findById(initiatorId).select('firstName lastName image role').lean()
    ]);
    
    if (!receiver) throw new Error('Receiver not found');
    if (!initiator) throw new Error('Initiator not found');
    
    // Check if user has notifications enabled
    if (receiver.notificationSettings?.appointments === false) {
      return { status: 'disabled_by_user', recipientId };
    }
    
    // Format date for better readability
    const appointmentDate = new Date(appointment.date);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Create notification title and content based on recipient type
    let notificationTitle = `Appointment ${status}`;
    let notificationBody;
    
    if (isDoctor) {
      // Notification for doctor
      notificationBody = `Your appointment with ${appointment.patient.firstName} ${appointment.patient.lastName} on ${formattedDate} at ${appointment.time} has been ${status}`;
    } else {
      // Notification for patient
      const doctorName = `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`.trim();
      notificationBody = `Your appointment with ${doctorName} on ${formattedDate} at ${appointment.time} has been ${status}`;
    }
    
    // Skip if no FCM token
    if (!receiver.fcmToken) {
      return { status: 'no_fcm_token', recipientId };
    }
    
    // Prepare payload for push notification
    const payload = {
      notification: {
        title: notificationTitle,
        body: notificationBody,
        icon: initiator?.image || '/default-avatar.png'
      },
      data: {
        type: 'appointment',
        appointmentId: appointment._id.toString(),
        status: status,
        initiatorId: initiatorId.toString(),
        click_action: `${process.env.FRONTEND_URL}/appointments/${appointment._id}`,
        initiatorName: `${initiator.firstName} ${initiator.lastName}`.trim(),
        initiatorRole: initiator.role,
        appointmentDate: appointment.date,
        appointmentTime: appointment.time,
        appointmentType: appointment.type,
        recipientRole: isDoctor ? 'doctor' : 'patient'
      },
      token: receiver.fcmToken,
      android: {
        priority: 'high',
        notification: {
          channel_id: 'appointments',
          sound: 'default'
        }
      },
      apns: {
        payload: {
          aps: {
            'mutable-content': 1,
            sound: 'default',
            badge: 1
          }
        }
      }
    };
    
    const response = await admin.messaging().send(payload);
    return { 
      status: 'delivered', 
      messageId: response, 
      recipientId,
      recipientRole: isDoctor ? 'doctor' : 'patient'
    };
  } catch (error) {
    console.error('Appointment status notification error:', error);
    throw error;
  }
}


async function sendAppointmentRescheduleNotification({
  appointment,
  oldDate,
  oldTime,
  newDate, 
  newTime,
  recipientId,
  initiatorId,
  isDoctor
}) {
  try {
    // Get receiver and initiator data
    const [receiver, initiator] = await Promise.all([
      User.findById(recipientId).select('fcmToken notificationSettings firstName lastName').lean(),
      User.findById(initiatorId).select('firstName lastName image role').lean()
    ]);
    
    if (!receiver) throw new Error('Receiver not found');
    if (!initiator) throw new Error('Initiator not found');
    
    // Check if user has notifications enabled
    if (receiver.notificationSettings?.appointments === false) {
      return { status: 'disabled_by_user', recipientId };
    }
    
    // Create notification title and content based on recipient type
    const notificationTitle = `Appointment rescheduled`;
    let notificationBody;
    
    if (isDoctor) {
      // Notification for doctor
      notificationBody = `Your appointment with ${appointment.patient.firstName} ${appointment.patient.lastName} has been rescheduled from ${oldDate} at ${oldTime} to ${newDate} at ${newTime}`;
    } else {
      // Notification for patient
      const doctorName = `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`.trim();
      notificationBody = `Your appointment with ${doctorName} has been rescheduled from ${oldDate} at ${oldTime} to ${newDate} at ${newTime}`;
    }
    
    // Skip if no FCM token
    if (!receiver.fcmToken) {
      return { status: 'no_fcm_token', recipientId };
    }
    
    // Prepare payload for push notification
    const payload = {
      notification: {
        title: notificationTitle,
        body: notificationBody,
        icon: initiator?.image || '/default-avatar.png'
      },
      data: {
        type: 'appointment',
        appointmentId: appointment._id.toString(),
        initiatorId: initiatorId.toString(),
        click_action: `${process.env.FRONTEND_URL}/appointments/${appointment._id}`,
        initiatorName: `${initiator.firstName} ${initiator.lastName}`.trim(),
        initiatorRole: initiator.role,
        oldDate: oldDate,
        oldTime: oldTime,
        newDate: newDate,
        newTime: newTime,
        appointmentType: appointment.type,
        recipientRole: isDoctor ? 'doctor' : 'patient'
      },
      token: receiver.fcmToken,
      android: {
        priority: 'high',
        notification: {
          channel_id: 'appointments',
          sound: 'default'
        }
      },
      apns: {
        payload: {
          aps: {
            'mutable-content': 1,
            sound: 'default',
            badge: 1
          }
        }
      }
    };
    
    const response = await admin.messaging().send(payload);
    return { 
      status: 'delivered', 
      messageId: response,
      recipientId,
      recipientRole: isDoctor ? 'doctor' : 'patient'
    };
  } catch (error) {
    console.error('Appointment reschedule notification error:', error);
    throw error;
  }
}
module.exports = { sendChatNotification , sendAppointmentNotification, sendAppointmentRescheduleNotification,sendAppointmentStatusNotification};  // Must export like this
