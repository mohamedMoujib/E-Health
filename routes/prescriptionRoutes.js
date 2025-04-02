const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');

router.post('/', prescriptionController.addPrescription);
router.get('/:medicalFileId/:itemId', prescriptionController.getPrescriptionDetails);
router.get('/:id', prescriptionController.getPrescriptionsbyPatient);


module.exports = router;
