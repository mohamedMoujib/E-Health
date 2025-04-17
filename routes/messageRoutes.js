const express = require('express');
const { getMessages, sendMessage,getMessage } = require('../controllers/messageController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { uploadMessage } = require("../lib/cloudinaryConfig");
const router = express.Router();


router.post('/send',authMiddleware, sendMessage);
router.post("/send-image", uploadMessage.single("image"),authMiddleware, sendMessage);


router.get('/:chatId/messages', getMessages);
router.get('/message/:id/', getMessage);
module.exports = router;
