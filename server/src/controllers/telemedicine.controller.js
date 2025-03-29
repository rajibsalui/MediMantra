import TelemedicineSession from '../models/telemedicine.model.js';
import Appointment from '../models/appointment.model.js';
import Notification from '../models/notification.model.js';
import { User } from '../models/user.model.js';
import crypto from 'crypto';

// Create a telemedicine session
export const createSession = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const userId = req.user._id;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID is required'
      });
    }

    // Find appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if appointment is telemedicine type
    if (appointment.appointmentType !== 'telemedicine') {
      return res.status(400).json({
        success: false,
        message: 'Only telemedicine appointments can have virtual sessions'
      });
    }

    // Check if session already exists
    const existingSession = await TelemedicineSession.findOne({ appointment: appointmentId });
    if (existingSession) {
      return res.status(400).json({
        success: false,
        message: 'Session already exists for this appointment',
        sessionId: existingSession._id
      });
    }

    // Check if user is the doctor for this appointment
    if (appointment.doctor.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the doctor or admin can create a telemedicine session'
      });
    }

    // Generate unique room ID and access tokens
    const roomId = crypto.randomBytes(8).toString('hex');
    const doctorToken = crypto.randomBytes(16).toString('hex');
    const patientToken = crypto.randomBytes(16).toString('hex');

    // Create session
    const session = await TelemedicineSession.create({
      appointment: appointmentId,
      doctor: appointment.doctor,
      patient: appointment.patient,
      roomId,
      doctorToken,
      patientToken,
      scheduledStartTime: appointment.appointmentDate,
      status: 'scheduled'
    });

    // Notify patient
    await Notification.createNotification({
      recipient: appointment.patient,
      sender: userId,
      type: 'telemedicine_session_created',
      title: 'Telemedicine Session Ready',
      message: 'Your telemedicine session has been created and is ready to join at your appointment time',
      relatedDocument: {
        model: 'TelemedicineSession',
        id: session._id
      }
    });

    res.status(201).json({
      success: true,
      message: 'Telemedicine session created successfully',
      session
    });
  } catch (error) {
    console.error('Create telemedicine session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating telemedicine session',
      error: error.message
    });
  }
};

// Get session by ID
export const getSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find session
    const session = await TelemedicineSession.findById(id)
      .populate('doctor', 'firstName lastName avatar')
      .populate('patient', 'firstName lastName avatar')
      .populate('appointment');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Telemedicine session not found'
      });
    }

    // Check authorization (only doctor, patient or admin can view)
    if (
      session.doctor._id.toString() !== userId.toString() &&
      session.patient._id.toString() !== userId.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this session'
      });
    }

    // Return token based on user role
    let accessToken = null;
    if (session.doctor._id.toString() === userId.toString()) {
      accessToken = session.doctorToken;
    } else if (session.patient._id.toString() === userId.toString()) {
      accessToken = session.patientToken;
    }

    res.status(200).json({
      success: true,
      session: {
        ...session.toObject(),
        accessToken
      }
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching session',
      error: error.message
    });
  }
};

// Start session
export const startSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find session
    const session = await TelemedicineSession.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Telemedicine session not found'
      });
    }

    // Check if user is the doctor
    if (session.doctor.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the doctor can start the session'
      });
    }

    // Check if session can be started
    if (session.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: `Cannot start session with status "${session.status}"`
      });
    }

    // Update session
    session.status = 'in_progress';
    session.actualStartTime = new Date();
    await session.save();

    // Notify patient
    await Notification.createNotification({
      recipient: session.patient,
      sender: userId,
      type: 'telemedicine_session_started',
      title: 'Telemedicine Session Started',
      message: 'Your doctor has started the telemedicine session. Please join now.',
      relatedDocument: {
        model: 'TelemedicineSession',
        id: session._id
      }
    });

    res.status(200).json({
      success: true,
      message: 'Session started successfully',
      session
    });
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting session',
      error: error.message
    });
  }
};

// End session
export const endSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { sessionNotes } = req.body;
    const userId = req.user._id;

    // Find session
    const session = await TelemedicineSession.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Telemedicine session not found'
      });
    }

    // Check if user is the doctor or admin
    if (session.doctor.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to end this session'
      });
    }

    // Check if session can be ended
    if (session.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: `Cannot end session with status "${session.status}"`
      });
    }

    // Update session
    session.status = 'completed';
    session.endTime = new Date();
    session.duration = Math.round((session.endTime - session.actualStartTime) / 1000); // in seconds
    if (sessionNotes) {
      session.sessionNotes = sessionNotes;
    }
    await session.save();

    // Update appointment status
    await Appointment.findByIdAndUpdate(session.appointment, {
      status: 'completed',
      completionDetails: {
        completedBy: userId,
        completedAt: new Date()
      }
    });

    // Notify patient
    await Notification.createNotification({
      recipient: session.patient,
      sender: userId,
      type: 'telemedicine_session_ended',
      title: 'Telemedicine Session Ended',
      message: 'Your telemedicine session has ended.',
      relatedDocument: {
        model: 'TelemedicineSession',
        id: session._id
      }
    });

    res.status(200).json({
      success: true,
      message: 'Session ended successfully',
      session
    });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error ending session',
      error: error.message
    });
  }
};

// Join session
export const joinSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.body;
    const userId = req.user._id;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Find session
    const session = await TelemedicineSession.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Telemedicine session not found'
      });
    }

    // Validate token based on user role
    let isValid = false;
    if (session.doctor.toString() === userId.toString() && session.doctorToken === token) {
      isValid = true;
    } else if (session.patient.toString() === userId.toString() && session.patientToken === token) {
      isValid = true;
    }

    if (!isValid) {
      return res.status(403).json({
        success: false,
        message: 'Invalid access token'
      });
    }

    // Check if session can be joined
    if (session.status !== 'scheduled' && session.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: `Cannot join session with status "${session.status}"`
      });
    }

    // Update participant status
    if (session.doctor.toString() === userId.toString()) {
      session.doctorJoined = true;
    } else {
      session.patientJoined = true;
    }

    await session.save();

    res.status(200).json({
      success: true,
      message: 'Joined session successfully',
      roomId: session.roomId
    });
  } catch (error) {
    console.error('Join session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error joining session',
      error: error.message
    });
  }
};

// Get upcoming sessions
export const getUpcomingSessions = async (req, res) => {
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
        message: 'Unauthorized to access sessions'
      });
    }

    // Get today's date and set time to 00:00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get upcoming or in-progress sessions
    query.scheduledStartTime = { $gte: today };
    query.status = { $in: ['scheduled', 'in_progress'] };

    // Get sessions
    const sessions = await TelemedicineSession.find(query)
      .populate('doctor', 'firstName lastName avatar')
      .populate('patient', 'firstName lastName avatar')
      .populate('appointment', 'appointmentDate status')
      .sort({ scheduledStartTime: 1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await TelemedicineSession.countDocuments(query);

    res.status(200).json({
      success: true,
      count: sessions.length,
      total,
      sessions
    });
  } catch (error) {
    console.error('Get upcoming sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming sessions',
      error: error.message
    });
  }
};

// Get past sessions
export const getPastSessions = async (req, res) => {
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
        message: 'Unauthorized to access sessions'
      });
    }

    // Get past sessions
    query.status = { $in: ['completed', 'cancelled', 'missed'] };

    // Get sessions
    const sessions = await TelemedicineSession.find(query)
      .populate('doctor', 'firstName lastName avatar')
      .populate('patient', 'firstName lastName avatar')
      .populate('appointment', 'appointmentDate status')
      .sort({ scheduledStartTime: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await TelemedicineSession.countDocuments(query);

    res.status(200).json({
      success: true,
      count: sessions.length,
      total,
      sessions
    });
  } catch (error) {
    console.error('Get past sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching past sessions',
      error: error.message
    });
  }
};

// Cancel session
export const cancelSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    // Find session
    const session = await TelemedicineSession.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Telemedicine session not found'
      });
    }

    // Check authorization (only doctor, patient, or admin can cancel)
    if (
      session.doctor.toString() !== userId.toString() &&
      session.patient.toString() !== userId.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this session'
      });
    }

    // Check if session can be cancelled
    if (session.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel session with status "${session.status}"`
      });
    }

    // Update session
    session.status = 'cancelled';
    session.cancellationDetails = {
      cancelledBy: userId,
      reason: reason || 'No reason provided',
      cancelledAt: new Date()
    };
    await session.save();

    // Determine the other party (recipient of notification)
    const isCancelledByDoctor = session.doctor.toString() === userId.toString();
    const recipientId = isCancelledByDoctor ? session.patient : session.doctor;

    // Notify the other party
    await Notification.createNotification({
      recipient: recipientId,
      sender: userId,
      type: 'telemedicine_session_cancelled',
      title: 'Telemedicine Session Cancelled',
      message: `Your telemedicine session scheduled for ${new Date(session.scheduledStartTime).toLocaleString()} has been cancelled.`,
      relatedDocument: {
        model: 'TelemedicineSession',
        id: session._id
      }
    });

    res.status(200).json({
      success: true,
      message: 'Session cancelled successfully',
      session
    });
  } catch (error) {
    console.error('Cancel session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling session',
      error: error.message
    });
  }
};
