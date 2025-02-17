const express = require('express');
const { getPatientById, searchPatients,getPatientDoctors, getPatientAppointments } = require('../controllers/patientController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/search', searchPatients);
router.get('/:id', getPatientById);
router.get('/:id/doctors', getPatientDoctors);
router.get('/:patientId/appointments', getPatientAppointments);


module.exports = router;
