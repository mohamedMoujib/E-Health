const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');

router.post('/', noteController.addNote);
router.get('/:medicalFileId/:itemId', noteController.getNoteDetails);
router.get('/:id', noteController.getNotesbyPatient);


module.exports = router;
