
const Message = require('../models/Message');
const Chat = require('../models/Chat');

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
    const id = req.user.id;
    const { chatId, type } = req.body;
    let content;
    if (type === "image") {
      if (!req.file || !req.file.path) {
        return res.status(400).json({ message: "Image non envoyée ou invalide" });
      }
      content = req.file.path; // URL Cloudinary
    } else {
      content = req.body.content;
      if (!content) {
        return res.status(400).json({ message: "Contenu du message requis" });
      }
    }
    const message = new Message({
      content,
      sender: id,
      chat: chatId,
      type,
    });
    const savedMessage = await message.save();
    console.log('Message saved to DB:', savedMessage);
    
    // Update chat with last message
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat non trouvé" });
    }
    chat.lastMessage = savedMessage._id;
    await chat.save();
    
    // Emit socket event with the new message
    const io = req.app.get('socketio');
    console.log(`Emitting 'newMessage' to room ${chatId}:`, savedMessage);
    io.to(chatId).emit('newMessage', savedMessage);
    
    res.status(200).json(savedMessage);
  } catch (err) {
    console.error("Erreur d'envoi de message:", err);
    res.status(500).json({ message: err.message });
  }
};

