const express = require('express');
const { viewDoctorDetails, searchDoctors,listAllDoctors, getDoctorPatients, getDoctorAppointments } = require('../controllers/doctorController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/search',authMiddleware, searchDoctors);
router.get('/:id',authMiddleware, viewDoctorDetails);
router.get('/', listAllDoctors); 
router.get('/:id/patients',authMiddleware, getDoctorPatients); 
router.get('/:id/appointments', getDoctorAppointments);


module.exports = router;