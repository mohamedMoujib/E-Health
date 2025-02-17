const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');

router.post('/:medicalFileId', noteController.addNote);
router.get('/:medicalFileId/:itemId', noteController.getNoteDetails);

module.exports = router;
