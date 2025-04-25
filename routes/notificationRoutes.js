const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Get current user's notifications
router.get('/',authMiddleware, notificationController.getNotifications);

// Mark notification as read
router.put('/:notificationId/read',authMiddleware, notificationController.markAsRead);

// Mark all notifications as read
router.put('/mark-all-read',authMiddleware, notificationController.markAllAsRead);

// Delete notification
router.delete('/:notificationId',authMiddleware, notificationController.deleteNotification);

// Existing notification routes
router.post('/send-chat-notification',authMiddleware, notificationController.sendChatNotification);
router.post('/save-fcm-token',authMiddleware, notificationController.saveFcmToken);
router.post('/test-notification',authMiddleware, notificationController.testNotification);
router.delete('/delete-fcm-token',authMiddleware, notificationController.deleteFcmToken);

module.exports = router;