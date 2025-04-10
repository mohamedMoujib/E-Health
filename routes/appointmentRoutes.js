const express = require('express');
const { getAvailableSlots , bookAppointment , DeleteAppointment, UpdateAppointmentStatus, RescheduleAppointment, getAppointmentsWithDetailsByPatient, getAppointmentDetails, getAvailableSlotsForPatient} = require('../controllers/appointmentController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();
router.get('/:doctorId/slotsDoctor',authMiddleware,getAvailableSlotsForPatient);
router.get('/:date/slots',authMiddleware,  getAvailableSlots);
router.post('/book',authMiddleware,  bookAppointment);
router.delete('/:appointmentId/delete', DeleteAppointment);
router.put('/:appointmentId/update', UpdateAppointmentStatus);
router.put('/:appointmentId/reschedule', RescheduleAppointment);
router.get('/appointmentsDetails/:patientId',authMiddleware, getAppointmentsWithDetailsByPatient)
router.get('/appointmentDetails/:appointmentId',getAppointmentDetails) 
module.exports = router;