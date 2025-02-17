const express = require('express');
const { getAvailableSlots , bookAppointment , DeleteAppointment, UpdateAppointmentStatus, RescheduleAppointment} = require('../controllers/appointmentController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/:doctorId/slots',  getAvailableSlots);
router.post('/:doctorId/book',  bookAppointment);
router.delete('/:appointmentId/delete', DeleteAppointment);
router.put('/:appointmentId/update', UpdateAppointmentStatus);
router.put('/:appointmentId/reschedule', RescheduleAppointment);

module.exports = router;