const express = require('express');
const { viewUserDetails, deleteUserProfile, saveFcmToken, getUnreadNotifications,markNotificationsAsRead } = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/:id', viewUserDetails);
router.post('/save-fcm-token', saveFcmToken);
router.post('/notifications/mark-as-read', markNotificationsAsRead);
router.get('/notifications', getUnreadNotifications);



module.exports = router;