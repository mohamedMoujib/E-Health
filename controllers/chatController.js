const Chat = require('../models/Chat');

exports.getChats = async (req, res) => {
  try {
    const { id } = req.params;
    const chats = await Chat.find({  $or: [
      { doctor: id },
      { patient: id }
  ]}).populate('doctor').populate('patient');
    res.status(200).json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUsersChats = async (req, res) => {
  try {
    const { id } = req.params;
    const chats = await Chat.find({  
      $or: [{ doctor: id }, { patient: id }]
    }).populate('doctor','-password').populate('patient','-password');

    // Récupérer l'autre participant
    const otherParticipants = chats.map(chat => 
      chat.doctor._id.toString() === id ? chat.patient : chat.doctor
    );

    res.status(200).json(otherParticipants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

