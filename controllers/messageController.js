
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

exports.sendMessage = async (req, res) => {
  try {
    const {id}= req.params;
    const { content, chatId, type } = req.body;
    

    const message = new Message({
      content,
      sender: /*req.user.id*/ id,
      chat: chatId,
      type
    });

    const savedMessage = await message.save(); // Sauvegarde du message

    // Trouver le chat et mettre à jour seulement lastMessage
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat non trouvé" });
    }
    chat.lastMessage = savedMessage._id;
    await chat.save();

    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
