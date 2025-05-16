// routes/chatbotRoutes.js
const express = require('express');
const router = express.Router();
const { handleChatbotRequest } = require('../controllers/chatbotController');

router.post('/chat', handleChatbotRequest);

module.exports = router;
