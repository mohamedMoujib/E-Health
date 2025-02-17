const User = require('../models/User');
const Notification = require('../models/Notification'); 


// View User Details
exports.viewUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Save FCM token
exports.saveFcmToken = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id; // Assuming you have user authentication and can get the user ID

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.fcmToken = token;
    await user.save();

    res.status(200).json({ message: 'FCM token saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Fetch unread notifications
exports.getUnreadNotifications = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you have user authentication and can get the user ID

    const notifications = await Notification.find({ user: userId, read: false });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Mark notifications as read
exports.markNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you have user authentication and can get the user ID

    await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });

    res.status(200).json({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });}}


    exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};