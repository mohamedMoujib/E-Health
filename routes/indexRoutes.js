const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const doctorRoutes = require('./doctorRoutes');
const patientRoutes = require('./patientRoutes'); 
const appointmentRoutes = require('./appointmentRoutes');
const privateEngagementRoutes = require('./privateEngagementRoutes');

const medicalFileRoutes = require('./medicalFileRoutes');
const chatRoutes = require('./chatRoutes');
const messageRoutes = require('./messageRoutes');
const articleRoutes = require('./articleRoutes');
const adminRoutes = require('./adminRoutes');
const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/doctors', doctorRoutes); 
router.use('/patients', patientRoutes); 
router.use('/appointments', appointmentRoutes); 
router.use('/private-engagements', privateEngagementRoutes);


router.use('/medicalFiles', medicalFileRoutes);
router.use('/chat', chatRoutes);
router.use('/messages', messageRoutes);
router.use('/articles', articleRoutes);
router.use('/admin',adminRoutes);


module.exports = router;
