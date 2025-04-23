const express = require('express');
const { getChats, getUsersChats,createChat } = require('../controllers/chatController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/chats/',authMiddleware, getChats);
router.post('/createChat', createChat);
module.exports = router;
