const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const doctorRoutes = require('./doctorRoutes');
const patientRoutes = require('./patientRoutes'); 
const appointmentRoutes = require('./appointmentRoutes');
const privateEngagementRoutes = require('./privateEngagementRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/doctors', doctorRoutes); 
router.use('/patients', patientRoutes); 
router.use('/appointments', appointmentRoutes); 
router.use('/private-engagements', privateEngagementRoutes);



module.exports = router;
