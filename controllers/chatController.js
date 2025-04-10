const Chat = require('../models/Chat');


// POST /api/chats
exports.createChat = async (req, res) => {
  const { doctorId, patientId } = req.body;

  try {
    // 1. Check if chat already exists
    let chat = await Chat.findOne({ doctor: doctorId, patient: patientId });

    if (chat) {
      return res.status(200).json(chat);
    }

    // 2. Create new chat
    chat = new Chat({
      doctor: doctorId,
      patient: patientId,
      messages: [], // optional if you initialize with empty messages
    });

    await chat.save();

    res.status(201).json(chat);
  } catch (err) {
    console.error('Error creating chat:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// In your backend chat controller
exports.getChats = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you have auth middleware
    
    const chats = await Chat.find({
      $or: [{ doctor: userId }, { patient: userId }]
    })
    .populate('patient', 'firstName lastName image')
    .populate('doctor', 'firstName lastName image')
    .populate({
      path: 'lastMessage',
      select: 'content timestamp type sender'
    })
    .sort({ updatedAt: -1 });
    
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

