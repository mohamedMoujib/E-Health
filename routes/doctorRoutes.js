const express = require('express');
const { viewDoctorDetails, searchDoctors,listAllDoctors, getDoctorPatients, getDoctorAppointments, getDoctorSpecificAppointments, getDoctorsBySpeciality, createPatientByDoctor } = require('../controllers/doctorController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/search',authMiddleware, searchDoctors);
router.get('/appointments',authMiddleware, getDoctorAppointments);

router.get('/:id', viewDoctorDetails);
router.get('/', listAllDoctors); 
router.get('/:id/patients',authMiddleware, getDoctorPatients); 
router.get('/patientAppointments/:patient',authMiddleware, getDoctorSpecificAppointments);
router.get("/speciality/:specialityName", getDoctorsBySpeciality);
router.post('/createPatient', authMiddleware, createPatientByDoctor);
module.exports = router;