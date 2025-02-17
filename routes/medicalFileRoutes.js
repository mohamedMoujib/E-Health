const express = require('express');
const router = express.Router();
const medicalFileController = require('../controllers/medicalFileController');
const dietRoutes = require('./dietRoutes');
const notesRoutes = require('./noteRoutes');
const prescriptionRoutes = require('./prescriptionRoutes');
const documentRoutes = require('./documentRoutes');

router.get('/patients', medicalFileController.searchPatients);
router.post('/', medicalFileController.createMedicalFile);
router.get('/:medicalFileId', medicalFileController.getMedicalFileWithItems);
router.use('/diet',dietRoutes );
router.use('/note',notesRoutes);
router.use('/prescription',prescriptionRoutes);
router.use('/document',documentRoutes);
module.exports = router;
