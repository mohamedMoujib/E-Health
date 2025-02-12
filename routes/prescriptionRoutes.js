const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');

router.post('/medical-file/:medicalFileId', prescriptionController.addPrescription);
router.get('/medical-file/:medicalFileId/:itemId', prescriptionController.getPrescriptionDetails);

module.exports = router;
