const admin = require('../firebase');
const User = require('../models/User');
const  Notification  = require('../models/Notification');

// Enhanced sendChatNotification with better error handling
exports.sendChatNotification = async (req, res) => {
  try {
    const { receiverId, senderId, message, chatId } = req.body;
    
    // Validate input
    if (!receiverId || !senderId || !message || !chatId) {
      return res.status(400).json({ 
        error: 'Missing required fields: receiverId, senderId, message, chatId' 
      });
    }

    // Get receiver and sender
    const [receiver, sender] = await Promise.all([
      User.findById(receiverId),
      User.findById(senderId)
    ]);

    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    if (!receiver.fcmToken) {
      // Create notification in database even if we can't send push
      const notification = new Notification({
        recipient: receiverId,
        title: `New message from ${sender?.firstName || 'User'}`,
        content: message.length > 100 ? `${message.substring(0, 100)}...` : message,
        type: 'message',
        relatedEntity: chatId,
        entityModel: 'Chat'
      });
      
      await notification.save();
      const io = req.app.get('io');
      io.to(receiverId).emit('newNotification', {
        notificationId: notification._id,
        title: notification.title,
        content: notification.content,
        createdAt: notification.createdAt,
        type: notification.type,
        chatId: chatId
      });
      return res.status(200).json({ 
        success: true,
        notification,
        warning: 'Receiver has no FCM token, notification saved to database only'
      });
    }

    // Create notification in database
    const notification = new Notification({
      recipient: receiverId,
      title: `New message from ${sender?.firstName || 'User'}`,
      content: message.length > 100 ? `${message.substring(0, 100)}...` : message,
      type: 'message',
      relatedEntity: chatId,
      entityModel: 'Chat'
    });
    
    await notification.save();

    // Prepare payload
    const payload = {
      notification: {
        title: `New message from ${sender?.firstName || 'User'}`,
        body: message.length > 100 ? `${message.substring(0, 100)}...` : message,
        icon: sender?.image || '/default-avatar.png'
      },
      data: {
        type: 'message',
        chatId: chatId.toString(),
        senderId: senderId.toString(),
        senderName: sender?.firstName || 'User',
        message: message,
        notificationId: notification._id.toString(),
        click_action: `${process.env.FRONTEND_URL}/chats/${chatId}`
      },
      token: receiver.fcmToken
    };

    // Send notification
    const response = await admin.messaging().send(payload);
    
    res.status(200).json({ 
      success: true,
      messageId: response,
      notification: notification
    });
    
  } catch (error) {
    console.error('Error sending chat notification:', error);
    
    // Handle specific errors
    if (error.code === 'messaging/registration-token-not-registered') {
      await User.findByIdAndUpdate(req.body.receiverId, { $unset: { fcmToken: 1 } });
      return res.status(410).json({ error: 'Token expired, please refresh' });
    }
    
    res.status(500).json({ 
      error: 'Failed to send notification',
      details: error.message 
    });
  }
};

// Test endpoint
exports.testNotification = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.fcmToken) {
      return res.status(400).json({ error: 'No FCM token found for this user' });
    }

    // Create test notification in database
    const notification = new Notification({
      recipient: req.user.id,
      title: "Test Notification",
      content: "This is a test notification from the server",
      type: 'message'
    });
    
    await notification.save();

    const payload = {
      notification: {
        title: "Test Notification",
        body: "This is a test notification from the server",
        icon: '/icon.png'
      },
      data: {
        notificationId: notification._id.toString(),
        type: 'test'
      },
      token: user.fcmToken
    };

    const response = await admin.messaging().send(payload);
    res.json({ 
      success: true,
      messageId: response,
      notification: notification
    });
  } catch (error) {
    console.error('Test notification failed:', error);
    res.status(500).json({ error: error.message });
  }
};

// Controller for saving FCM tokens
exports.saveFcmToken = async (req, res) => {
  try {
    const { token, userId } = req.body;
    
    // Validate input
    if (!token) {
      return res.status(400).json({ error: 'Missing token parameter' });
    }
    
    // Determine which user ID to use
    const targetUserId = userId || req.user?.id;
    
    if (!targetUserId) {
      return res.status(401).json({ error: 'User ID is required' });
    }
    
    // Save token to database
    await User.findByIdAndUpdate(targetUserId, { fcmToken: token });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    res.status(500).json({ error: 'Failed to save FCM token' });
  }
};

// Delete FCM token
exports.deleteFcmToken = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    await User.findByIdAndUpdate(userId, { $unset: { fcmToken: 1 } });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting FCM token:', error);
    res.status(500).json({ error: 'Failed to delete FCM token' });
  }
};

// Get notifications for the current user
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Fetch notifications for this user, sort by most recent first
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.status(200).json({ 
      success: true,
      notifications 
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};



// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Update the notification, ensuring it belongs to this user
    const result = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.status(200).json({ 
      success: true,
      notification: result 
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Update all unread notifications for this user
    const result = await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );
    
    res.status(200).json({ 
      success: true,
      updatedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Find and delete notification, ensuring it belongs to this user
    const result = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId
    });
    
    if (!result) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};