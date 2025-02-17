const express = require('express');
const { getChats, getUsersChats } = require('../controllers/chatController');
const router = express.Router();

router.get('/chats/:id', getChats);
router.get('/chatsUsers/:id', getUsersChats);
module.exports = router;
