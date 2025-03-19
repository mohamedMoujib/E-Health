const express = require('express');
const { viewDoctorDetails, searchDoctors,listAllDoctors, getDoctorPatients, getDoctorAppointments, getDoctorSpecificAppointments } = require('../controllers/doctorController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/search',authMiddleware, searchDoctors);
router.get('/:id',authMiddleware, viewDoctorDetails);
router.get('/', listAllDoctors); 
router.get('/:id/patients',authMiddleware, getDoctorPatients); 
router.get('/:id/appointments', getDoctorAppointments);
router.get('/patientAppointments/:patient',authMiddleware, getDoctorSpecificAppointments);

module.exports = router;