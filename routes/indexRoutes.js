const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const doctorRoutes = require('./doctorRoutes');
const patientRoutes = require('./patientRoutes'); 
const medicalFileRoutes = require('./medicalFileRoutes');
const chatRoutes = require('./chatRoutes');
const messageRoutes = require('./messageRoutes');
const articleRoutes = require('./articleRoutes');
const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/doctors', doctorRoutes); 
router.use('/patients', patientRoutes); 
router.use('/medicalFiles', medicalFileRoutes);
router.use('/chat', chatRoutes);
router.use('/messages', messageRoutes);
router.use('/articles', articleRoutes);

module.exports = router;
