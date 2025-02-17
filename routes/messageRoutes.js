const express = require('express');
const { getMessages, sendMessage } = require('../controllers/messageController');
const router = express.Router();

router.get('/:chatId/messages', getMessages);
router.post('/send/:id', sendMessage);

module.exports = router;
