const express = require('express');
const router = express.Router();
const medicalFileController = require('../controllers/medicalFileController');

router.get('/patients', medicalFileController.searchPatients);
router.post('/medical-files', medicalFileController.createMedicalFile);
router.get('/medical-files/:medicalFileId', medicalFileController.getMedicalFileWithItems);

module.exports = router;
