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
module.exports = { sendChatNotification };  // Must export like this
