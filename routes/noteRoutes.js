const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');

router.post('/medical-file/:medicalFileId', noteController.addNote);
router.get('/medical-file/:medicalFileId/:itemId', noteController.getNoteDetails);

module.exports = router;
