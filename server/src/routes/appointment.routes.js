import express from 'express';
import {
  createAppointment,
  getAppointmentById,
  cancelAppointment,
  rescheduleAppointment,
  confirmAppointment,
  completeAppointment,
  addAppointmentNotes,
  getAppointmentsForDoctor,
  getAppointmentsForPatient,
  getDoctorAvailability,
  getUpcomingAppointments,
  getPastAppointments,
  markNoShow,
  getAppointmentDetails,
  createFollowUpAppointment,
  recordVitals
} from '../controllers/appointment.controller.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create appointment
router.post('/', authMiddleware, createAppointment);

// Get appointment details
router.get('/:id', authMiddleware, getAppointmentById);
router.get('/:id/details', authMiddleware, getAppointmentDetails);

// Appointment actions
router.put('/:id/cancel', authMiddleware, cancelAppointment);
router.put('/:id/reschedule', authMiddleware, rescheduleAppointment);
router.put('/:id/confirm', authMiddleware, roleMiddleware(['doctor', 'admin']), confirmAppointment);
router.put('/:id/complete', authMiddleware, roleMiddleware(['doctor', 'admin']), completeAppointment);
router.put('/:id/no-show', authMiddleware, roleMiddleware(['doctor', 'admin']), markNoShow);
router.post('/:id/follow-up', authMiddleware, roleMiddleware(['doctor']), createFollowUpAppointment);

// Appointment notes and vitals
router.put('/:id/notes', authMiddleware, addAppointmentNotes);
router.put('/:id/vitals', authMiddleware, roleMiddleware(['doctor', 'admin']), recordVitals);

// Get appointments for users
router.get('/doctor/:doctorId', authMiddleware, getAppointmentsForDoctor);
router.get('/patient/:patientId', authMiddleware, getAppointmentsForPatient);
router.get('/doctor/:doctorId/availability', getDoctorAvailability);
router.get('/upcoming', authMiddleware, getUpcomingAppointments);
router.get('/past', authMiddleware, getPastAppointments);

export default router;
