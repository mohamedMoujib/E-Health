const express = require('express');
const { getMessages, sendMessage,getMessage } = require('../controllers/messageController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { upload } = require("../lib/cloudinaryConfig");
const router = express.Router();


router.post('/send',authMiddleware, sendMessage);
router.post("/send-image", upload.single("image"),authMiddleware, sendMessage);


router.get('/:chatId/messages', getMessages);
router.get('/message/:id/', getMessage);
module.exports = router;
