const express = require('express');
const { viewDoctorDetails, searchDoctors,listAllDoctors, getDoctorPatients } = require('../controllers/doctorController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/search', searchDoctors);
router.get('/:id',authMiddleware, viewDoctorDetails);
router.get('/', listAllDoctors); 
router.get('/:id/patients',authMiddleware, getDoctorPatients); 



module.exports = router;