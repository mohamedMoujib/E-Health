
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const { sendChatNotification } = require('../utils/notificationsHelper');
const userSocketMap = new Map();
const socketManager = require('../socketManager');
const User = require('../models/User'); // Add this if it's not already there


exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId }).sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getMessage =  async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the message in the database by its ID
    const message = await Message.findById(id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    return res.status(200).json(message); // Return the found message
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};


exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { chatId, type } = req.body;
    let content;

    // Validate message content
    if (type === "image") {
      if (!req.file?.path) {
        return res.status(400).json({ message: "Image non envoyée ou invalide" });
      }
      content = req.file.path;
    } else {
      content = req.body.content;
      if (!content) {
        return res.status(400).json({ message: "Contenu du message requis" });
      }
    }

    // Create and save message
    const message = new Message({
      content,
      sender: senderId,
      chat: chatId,
      type,
    });

    const savedMessage = await message.save();

    // Fetch sender information
    const sender = await User.findById(senderId).select('firstName lastName');
    
    // Update chat with last message
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      { lastMessage: savedMessage._id },
      { new: true }
    ).populate('doctor patient', '_id');

    if (!chat) {
      return res.status(404).json({ message: "Chat non trouvé" });
    }

    // Determine receiver (the one who isn't the sender)
    const receiverId = chat.doctor?._id.toString() === senderId.toString() 
      ? chat.patient?._id 
      : chat.doctor?._id;

    if (!receiverId) {
      return res.status(400).json({ message: "No receiver found in chat" });
    }

    // Get Socket.IO instance
    const io = req.app.get('socketio');

    // 1. Emit to the chat room
    io.to(chatId).emit('newMessage', savedMessage);

    // 2. Emit directly to receiver's socket if connected
    const receiverSocketId = socketManager.getSocketId(receiverId);
    console.log(`Receiver socket status: ${receiverId} -> ${receiverSocketId || 'not connected'}`);

    // Use sender info for notification
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newNotification', {
        notificationId: savedMessage._id.toString(),
        title: sender ? `New message from ${sender.firstName} ${sender.lastName}` : 'New message',
        content: type === 'image' ? '📷 Image' : content,
        type: 'message',
        chatId: chatId.toString(),
        createdAt: savedMessage.createdAt
      });
      console.log(`Notification sent to socket ${receiverSocketId}`);
    }

    // 5. Send push notification if receiver is offline
    let notificationResult = null;
    if (!receiverSocketId) {
      notificationResult = await sendChatNotification({
        receiverId,
        senderId,
        message: type === 'image' ? '📷 Image' : content,
        chatId,
        messageId: savedMessage._id
      }).catch(err => {
        console.error('Notification error:', err);
        return { error: err.message };
      });
    }

    res.status(200).json({
      message: savedMessage,
      notification: notificationResult || { status: 'delivered_via_websocket' }
    });

  } catch (err) {
    console.error("Erreur d'envoi de message:", err);
    res.status(500).json({ 
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};