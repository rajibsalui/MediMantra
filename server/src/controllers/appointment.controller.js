import Appointment from '../models/appointment.model.js';
import Doctor from '../models/doctor.model.js';
import { User } from '../models/user.model.js';
import Patient from '../models/patient.model.js';
import Notification from '../models/notification.model.js';
import { sendNotificationEmail } from '../utils/email.utils.js';

// Create a new appointment
export const createAppointment = async (req, res) => {
  try {
    const {
      doctorId,
      appointmentDate,
      timeSlot,
      appointmentType,
      reasonForVisit,
      symptoms = []
    } = req.body;

    const patientId = req.user._id;

    // Validate required fields
    if (!doctorId || !appointmentDate || !timeSlot || !reasonForVisit) {
      return res.status(400).json({
        success: false,
        message: 'Missing required appointment details'
      });
    }

    // Check if doctor exists
    const doctor = await Doctor.findOne({ user: doctorId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check if doctor is accepting new patients
    if (!doctor.acceptingNewPatients) {
      return res.status(400).json({
        success: false,
        message: 'This doctor is not accepting new appointments at this time'
      });
    }

    // Validate appointment date is in the future
    const appointmentDateTime = new Date(appointmentDate);
    if (appointmentDateTime < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date must be in the future'
      });
    }

    // Check if time slot is available
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: {
        $gte: new Date(new Date(appointmentDate).setHours(0, 0, 0, 0)),
        $lt: new Date(new Date(appointmentDate).setHours(23, 59, 59, 999))
      },
      'timeSlot.startTime': timeSlot.startTime,
      'timeSlot.endTime': timeSlot.endTime,
      status: { $in: ['scheduled', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Calculate payment amount based on doctor's consultation fee
    const paymentAmount = doctor.consultationFee || 0;

    // Create appointment
    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      appointmentDate,
      timeSlot,
      appointmentType,
      reasonForVisit,
      symptoms,
      status: 'scheduled',
      paymentDetails: {
        amount: paymentAmount,
        paymentMethod: 'pending'
      }
    });

    // Create notification for doctor
    await Notification.createNotification({
      recipient: doctorId,
      sender: patientId,
      type: 'appointment_created',
      title: 'New Appointment',
      message: `You have a new appointment scheduled for ${new Date(appointmentDate).toLocaleDateString()} at ${timeSlot.startTime}`,
      relatedDocument: {
        model: 'Appointment',
        id: appointment._id
      }
    });

    // Get doctor and patient data for email
    const doctorUser = await User.findById(doctorId);
    const patientUser = await User.findById(patientId);
    const patientProfile = await Patient.findOne({ user: patientId });

    // Send email notification to doctor
    if (doctorUser && doctorUser.email) {
      await sendNotificationEmail(doctorUser.email, 'New Appointment Scheduled', {
        recipientName: doctorUser.firstName,
        message: `A new appointment has been scheduled by ${patientUser.firstName} ${patientUser.lastName} for ${new Date(appointmentDate).toLocaleDateString()} at ${timeSlot.startTime}.`,
        appointmentDetails: {
          date: new Date(appointmentDate).toLocaleString(),
          patient: `${patientUser.firstName} ${patientUser.lastName}`,
          reason: reasonForVisit,
          type: appointmentType
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      appointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating appointment',
      error: error.message
    });
  }
};

// Get appointment by ID
export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find appointment with relevant details
    const appointment = await Appointment.findById(id)
      .populate('doctor', 'firstName lastName specializations')
      .populate('patient', 'firstName lastName email phone');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization (only patient, doctor, or admin can view)
    if (
      appointment.patient._id.toString() !== userId.toString() &&
      appointment.doctor._id.toString() !== userId.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this appointment'
      });
    }

    res.status(200).json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment',
      error: error.message
    });
  }
};

// Cancel appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    // Find appointment
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    if (
      appointment.patient.toString() !== userId.toString() &&
      appointment.doctor.toString() !== userId.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this appointment'
      });
    }

    // Check if appointment can be cancelled
    if (['completed', 'cancelled', 'no-show'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel appointment with status "${appointment.status}"`
      });
    }

    // Update appointment
    appointment.status = 'cancelled';
    appointment.cancellationDetails = {
      cancelledBy: userId,
      reason: reason || 'No reason provided',
      cancelledAt: new Date()
    };
    
    await appointment.save();

    // Determine recipient of notification (the other party)
    const recipientId = appointment.patient.toString() === userId.toString() 
      ? appointment.doctor 
      : appointment.patient;

    // Create notification for recipient
    await Notification.createNotification({
      recipient: recipientId,
      sender: userId,
      type: 'appointment_cancelled',
      title: 'Appointment Cancelled',
      message: `Your appointment scheduled for ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.timeSlot.startTime} has been cancelled.`,
      relatedDocument: {
        model: 'Appointment',
        id: appointment._id
      }
    });

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling appointment',
      error: error.message
    });
  }
};

// Reschedule appointment
export const rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { appointmentDate, timeSlot } = req.body;
    const userId = req.user._id;

    if (!appointmentDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'New appointment date and time slot are required'
      });
    }

    // Find appointment
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    if (
      appointment.patient.toString() !== userId.toString() &&
      appointment.doctor.toString() !== userId.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to reschedule this appointment'
      });
    }

    // Check if appointment can be rescheduled
    if (['completed', 'cancelled', 'no-show'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot reschedule appointment with status "${appointment.status}"`
      });
    }

    // Validate new appointment date is in the future
    const newAppointmentDate = new Date(appointmentDate);
    if (newAppointmentDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'New appointment date must be in the future'
      });
    }

    // Check if new time slot is available
    const existingAppointment = await Appointment.findOne({
      _id: { $ne: id }, // Exclude current appointment
      doctor: appointment.doctor,
      appointmentDate: {
        $gte: new Date(new Date(appointmentDate).setHours(0, 0, 0, 0)),
        $lt: new Date(new Date(appointmentDate).setHours(23, 59, 59, 999))
      },
      'timeSlot.startTime': timeSlot.startTime,
      'timeSlot.endTime': timeSlot.endTime,
      status: { $in: ['scheduled', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Save old date/time for notification
    const oldDate = new Date(appointment.appointmentDate).toLocaleDateString();
    const oldTime = appointment.timeSlot.startTime;

    // Update appointment
    appointment.appointmentDate = appointmentDate;
    appointment.timeSlot = timeSlot;
    appointment.reschedulingHistory.push({
      rescheduledBy: userId,
      previousDate: appointment.appointmentDate,
      previousTimeSlot: appointment.timeSlot,
      rescheduledAt: new Date()
    });
    
    await appointment.save();

    // Determine recipient of notification (the other party)
    const recipientId = appointment.patient.toString() === userId.toString() 
      ? appointment.doctor 
      : appointment.patient;

    // Create notification for recipient
    await Notification.createNotification({
      recipient: recipientId,
      sender: userId,
      type: 'appointment_rescheduled',
      title: 'Appointment Rescheduled',
      message: `Your appointment originally scheduled for ${oldDate} at ${oldTime} has been rescheduled to ${new Date(appointmentDate).toLocaleDateString()} at ${timeSlot.startTime}.`,
      relatedDocument: {
        model: 'Appointment',
        id: appointment._id
      }
    });

    res.status(200).json({
      success: true,
      message: 'Appointment rescheduled successfully',
      appointment
    });
  } catch (error) {
    console.error('Reschedule appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rescheduling appointment',
      error: error.message
    });
  }
};

// Confirm appointment
export const confirmAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find appointment
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization (only doctor or admin can confirm)
    if (
      appointment.doctor.toString() !== userId.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to confirm this appointment'
      });
    }

    // Check if appointment can be confirmed
    if (appointment.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Only scheduled appointments can be confirmed'
      });
    }

    // Update appointment
    appointment.status = 'confirmed';
    appointment.confirmationDetails = {
      confirmedBy: userId,
      confirmedAt: new Date()
    };
    
    await appointment.save();

    // Create notification for patient
    await Notification.createNotification({
      recipient: appointment.patient,
      sender: userId,
      type: 'appointment_confirmed',
      title: 'Appointment Confirmed',
      message: `Your appointment scheduled for ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.timeSlot.startTime} has been confirmed.`,
      relatedDocument: {
        model: 'Appointment',
        id: appointment._id
      }
    });

    res.status(200).json({
      success: true,
      message: 'Appointment confirmed successfully',
      appointment
    });
  } catch (error) {
    console.error('Confirm appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming appointment',
      error: error.message
    });
  }
};

// Complete appointment
export const completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find appointment
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization (only doctor or admin can complete)
    if (
      appointment.doctor.toString() !== userId.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to complete this appointment'
      });
    }

    // Check if appointment can be completed
    if (appointment.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Only confirmed appointments can be completed'
      });
    }

    // Update appointment
    appointment.status = 'completed';
    appointment.completionDetails = {
      completedBy: userId,
      completedAt: new Date()
    };
    
    await appointment.save();

    // Create notification for patient
    await Notification.createNotification({
      recipient: appointment.patient,
      sender: userId,
      type: 'appointment_completed',
      title: 'Appointment Completed',
      message: 'Your appointment has been marked as completed.',
      relatedDocument: {
        model: 'Appointment',
        id: appointment._id
      }
    });

    res.status(200).json({
      success: true,
      message: 'Appointment completed successfully',
      appointment
    });
  } catch (error) {
    console.error('Complete appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing appointment',
      error: error.message
    });
  }
};

// Add appointment notes
export const addAppointmentNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctorNotes, patientNotes } = req.body;
    const userId = req.user._id;

    // Find appointment
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    const isDoctor = appointment.doctor.toString() === userId.toString();
    const isPatient = appointment.patient.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isDoctor && !isPatient && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to add notes to this appointment'
      });
    }

    // Update notes
    if (doctorNotes && (isDoctor || isAdmin)) {
      appointment.notes.doctorNotes = doctorNotes;
    }

    if (patientNotes && (isPatient || isAdmin)) {
      appointment.notes.patientNotes = patientNotes;
    }

    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment notes added successfully',
      notes: appointment.notes
    });
  } catch (error) {
    console.error('Add appointment notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding appointment notes',
      error: error.message
    });
  }
};

// Get appointments for doctor
export const getAppointmentsForDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status, date, limit = 10, skip = 0 } = req.query;
    
    // Check permission (only the doctor themselves or admin can access)
    if (
      req.user._id.toString() !== doctorId.toString() && 
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access these appointments'
      });
    }
    
    // Build query
    const query = { doctor: doctorId };
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      query.appointmentDate = { $gte: startDate, $lt: endDate };
    }

    // Get appointments
    const appointments = await Appointment.find(query)
      .sort({ appointmentDate: 1 })
      .populate('patient', 'firstName lastName email phone avatar')
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Appointment.countDocuments(query);

    res.status(200).json({
      success: true,
      count: appointments.length,
      total,
      appointments
    });
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message
    });
  }
};

// Get appointments for patient
export const getAppointmentsForPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status, limit = 10, skip = 0 } = req.query;
    
    // Check permission (only the patient themselves or admin can access)
    if (
      req.user._id.toString() !== patientId.toString() && 
      req.user.role !== 'admin' &&
      req.user.role !== 'doctor'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access these appointments'
      });
    }
    
    // For doctors, check if they have permission to view patient data
    if (
      req.user.role === 'doctor' &&
      req.user._id.toString() !== patientId.toString()
    ) {
      // Check if doctor has treated this patient
      const hasAppointment = await Appointment.findOne({
        doctor: req.user._id,
        patient: patientId,
        status: { $in: ['completed', 'confirmed'] }
      });
      
      if (!hasAppointment) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to access this patient\'s appointments'
        });
      }
    }
    
    // Build query
    const query = { patient: patientId };
    
    if (status) {
      query.status = status;
    }

    // Get appointments
    const appointments = await Appointment.find(query)
      .sort({ appointmentDate: -1 })
      .populate('doctor', 'firstName lastName specializations')
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Appointment.countDocuments(query);

    res.status(200).json({
      success: true,
      count: appointments.length,
      total,
      appointments
    });
  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message
    });
  }
};

// Get doctor availability
export const getDoctorAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;
    
    // Validate date is provided
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }
    
    // Find doctor
    const doctor = await Doctor.findOne({ user: doctorId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    // Get day of week
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay(); // 0 for Sunday, 1 for Monday, etc.
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Find doctor's schedule for that day
    const daySchedule = doctor.availabilitySchedule.find(
      schedule => schedule.day === daysOfWeek[dayOfWeek]
    );
    
    // Check if doctor works on that day
    if (!daySchedule || !daySchedule.isAvailable) {
      return res.status(200).json({
        success: true,
        message: 'Doctor is not available on this day',
        available: false,
        timeSlots: []
      });
    }
    
    // Get all booked appointments for that day
    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: {
        $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
        $lt: new Date(new Date(date).setHours(23, 59, 59, 999))
      },
      status: { $in: ['scheduled', 'confirmed'] }
    }).select('timeSlot');
    
    // Generate available time slots based on schedule
    const availableTimeSlots = [];
    const bookedSlots = bookedAppointments.map(a => a.timeSlot);
    
    for (let slot of daySchedule.timeSlots) {
      // Check if slot is already booked
      const isBooked = bookedSlots.some(
        bookedSlot => 
          bookedSlot.startTime === slot.startTime && 
          bookedSlot.endTime === slot.endTime
      );
      
      availableTimeSlots.push({
        ...slot,
        isAvailable: !isBooked
      });
    }
    
    res.status(200).json({
      success: true,
      available: true,
      timeSlots: availableTimeSlots,
      consultationFee: doctor.consultationFee
    });
  } catch (error) {
    console.error('Get doctor availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking doctor availability',
      error: error.message
    });
  }
};

// Get upcoming appointments
export const getUpcomingAppointments = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10, skip = 0 } = req.query;
    
    // Build query based on user role
    let query = {};
    
    if (req.user.role === 'doctor') {
      query.doctor = userId;
    } else if (req.user.role === 'patient') {
      query.patient = userId;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to access appointments'
      });
    }
    
    // Only get upcoming and active appointments
    query.appointmentDate = { $gte: new Date() };
    query.status = { $in: ['scheduled', 'confirmed'] };
    
    // Get appointments
    const appointments = await Appointment.find(query)
      .sort({ appointmentDate: 1 })
      .populate('doctor', 'firstName lastName specializations')
      .populate('patient', 'firstName lastName')
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Appointment.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      total,
      appointments
    });
  } catch (error) {
    console.error('Get upcoming appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming appointments',
      error: error.message
    });
  }
};

// Get past appointments
export const getPastAppointments = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10, skip = 0 } = req.query;
    
    // Build query based on user role
    let query = {};
    
    if (req.user.role === 'doctor') {
      query.doctor = userId;
    } else if (req.user.role === 'patient') {
      query.patient = userId;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to access appointments'
      });
    }
    
    // Only get past or completed appointments
    query.$or = [
      { appointmentDate: { $lt: new Date() } },
      { status: { $in: ['completed', 'cancelled', 'no-show'] } }
    ];
    
    // Get appointments
    const appointments = await Appointment.find(query)
      .sort({ appointmentDate: -1 })
      .populate('doctor', 'firstName lastName specializations')
      .populate('patient', 'firstName lastName')
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Appointment.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      total,
      appointments
    });
  } catch (error) {
    console.error('Get past appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching past appointments',
      error: error.message
    });
  }
};

// Mark appointment as no-show
export const markNoShow = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Find appointment
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check authorization (only doctor or admin can mark no-show)
    if (
      appointment.doctor.toString() !== userId.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to mark this appointment as no-show'
      });
    }
    
    // Check if appointment can be marked as no-show
    if (appointment.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Only confirmed appointments can be marked as no-show'
      });
    }
    
    // Check if appointment date has passed
    if (new Date(appointment.appointmentDate) > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot mark future appointments as no-show'
      });
    }
    
    // Update appointment
    appointment.status = 'no-show';
    appointment.noShowDetails = {
      markedBy: userId,
      markedAt: new Date()
    };
    
    await appointment.save();
    
    // Notify patient
    await Notification.createNotification({
      recipient: appointment.patient,
      sender: userId,
      type: 'appointment_no_show',
      title: 'Missed Appointment',
      message: `You missed your appointment scheduled for ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.timeSlot.startTime}.`,
      relatedDocument: {
        model: 'Appointment',
        id: appointment._id
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Appointment marked as no-show',
      appointment
    });
  } catch (error) {
    console.error('Mark no-show error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking appointment as no-show',
      error: error.message
    });
  }
};

// Get appointment details
export const getAppointmentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Find appointment with all details
    const appointment = await Appointment.findById(id)
      .populate('doctor', 'firstName lastName specializations consultationFee')
      .populate('patient', 'firstName lastName email phone')
      .populate({
        path: 'prescriptions',
        select: 'medications prescriptionDate status'
      })
      .populate({
        path: 'medicalRecords',
        select: 'diagnosis treatment recordDate'
      });
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check authorization
    if (
      appointment.patient._id.toString() !== userId.toString() &&
      appointment.doctor._id.toString() !== userId.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this appointment'
      });
    }
    
    // Get doctor details
    const doctor = await Doctor.findOne({ user: appointment.doctor._id })
      .populate('specializations');
    
    // Get patient details
    const patient = await Patient.findOne({ user: appointment.patient._id });
    
    res.status(200).json({
      success: true,
      appointment,
      doctorDetails: doctor,
      patientDetails: patient
    });
  } catch (error) {
    console.error('Get appointment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment details',
      error: error.message
    });
  }
};

// Create follow-up appointment
export const createFollowUpAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { appointmentDate, timeSlot, reasonForVisit } = req.body;
    const userId = req.user._id;
    
    // Validate required fields
    if (!appointmentDate || !timeSlot || !reasonForVisit) {
      return res.status(400).json({
        success: false,
        message: 'Date, time slot, and reason are required'
      });
    }
    
    // Find original appointment
    const originalAppointment = await Appointment.findById(id);
    if (!originalAppointment) {
      return res.status(404).json({
        success: false,
        message: 'Original appointment not found'
      });
    }
    
    // Check authorization (only doctor can create follow-up)
    if (originalAppointment.doctor.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to create a follow-up for this appointment'
      });
    }
    
    // Check if time slot is available
    const existingAppointment = await Appointment.findOne({
      doctor: userId,
      appointmentDate: {
        $gte: new Date(new Date(appointmentDate).setHours(0, 0, 0, 0)),
        $lt: new Date(new Date(appointmentDate).setHours(23, 59, 59, 999))
      },
      'timeSlot.startTime': timeSlot.startTime,
      'timeSlot.endTime': timeSlot.endTime,
      status: { $in: ['scheduled', 'confirmed'] }
    });
    
    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }
    
    // Create follow-up appointment
    const followUpAppointment = await Appointment.create({
      patient: originalAppointment.patient,
      doctor: userId,
      appointmentDate,
      timeSlot,
      appointmentType: 'follow-up',
      reasonForVisit,
      status: 'scheduled',
      relatedAppointment: originalAppointment._id,
      paymentDetails: {
        amount: originalAppointment.paymentDetails.amount,
        paymentMethod: 'pending'
      }
    });
    
    // Create notification for patient
    await Notification.createNotification({
      recipient: originalAppointment.patient,
      sender: userId,
      type: 'appointment_created',
      title: 'Follow-up Appointment',
      message: `A follow-up appointment has been scheduled for ${new Date(appointmentDate).toLocaleDateString()} at ${timeSlot.startTime}.`,
      relatedDocument: {
        model: 'Appointment',
        id: followUpAppointment._id
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Follow-up appointment created successfully',
      appointment: followUpAppointment
    });
  } catch (error) {
    console.error('Create follow-up appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating follow-up appointment',
      error: error.message
    });
  }
};

// Record patient vitals
export const recordVitals = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      temperature,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      heartRate,
      respiratoryRate,
      oxygenSaturation,
      weight,
      height,
      notes
    } = req.body;
    const userId = req.user._id;
    
    // Find appointment
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check authorization (only doctor or admin can record vitals)
    if (
      appointment.doctor.toString() !== userId.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to record vitals for this appointment'
      });
    }
    
    // Update vitals
    appointment.vitals = {
      temperature,
      bloodPressure: {
        systolic: bloodPressureSystolic,
        diastolic: bloodPressureDiastolic
      },
      heartRate,
      respiratoryRate,
      oxygenSaturation,
      weight,
      height,
      notes,
      recordedBy: userId,
      recordedAt: new Date()
    };
    
    await appointment.save();
    
    // Update patient profile with new height/weight if provided
    if (weight || height) {
      const patient = await Patient.findOne({ user: appointment.patient });
      if (patient) {
        if (weight) patient.weight = weight;
        if (height) patient.height = height;
        await patient.save();
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Vitals recorded successfully',
      vitals: appointment.vitals
    });
  } catch (error) {
    console.error('Record vitals error:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording vitals',
      error: error.message
    });
  }
};
