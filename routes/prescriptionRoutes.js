const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');

router.post('/:medicalFileId', prescriptionController.addPrescription);
router.get('/:medicalFileId/:itemId', prescriptionController.getPrescriptionDetails);

module.exports = router;
