import mongoose from 'mongoose';
import Patient from '../models/patient.model.js';
import User from '../models/user.model.js';
import Appointment from '../models/appointment.model.js';
import { uploadFile, deleteFile } from '../utils/fileUpload.js';

/**
 * @desc    Get patient profile
 * @route   GET /api/patients/profile
 * @access  Private (Patient only)
 */
export const getPatientProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const patient = await Patient.findOne({ user: userId })
      .populate('user', 'firstName lastName email phone profileImage dateOfBirth gender')
      .populate('primaryCarePhysician', 'user')
      .populate({
        path: 'primaryCarePhysician',
        populate: {
          path: 'user',
          select: 'firstName lastName profileImage'
        }
      });
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Error getting patient profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Create or update patient profile
 * @route   PUT /api/patients/profile
 * @access  Private (Patient only)
 */
export const updatePatientProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      bloodGroup,
      height,
      weight,
      address,
      emergencyContact,
      allergies,
      chronicConditions,
      currentMedications,
      familyMedicalHistory,
      surgicalHistory,
      immunizationHistory,
      preferredPharmacy,
      insuranceInfo,
      primaryCarePhysician
    } = req.body;
    
    // Find patient or create if not exists
    let patient = await Patient.findOne({ user: userId });
    
    if (!patient) {
      patient = new Patient({
        user: userId
      });
    }
    
    // Update fields if provided
    if (bloodGroup) patient.bloodGroup = bloodGroup;
    if (height) patient.height = height;
    if (weight) patient.weight = weight;
    if (address) patient.address = address;
    if (emergencyContact) patient.emergencyContact = emergencyContact;
    if (allergies) patient.allergies = allergies;
    if (chronicConditions) patient.chronicConditions = chronicConditions;
    if (currentMedications) patient.currentMedications = currentMedications;
    if (familyMedicalHistory) patient.familyMedicalHistory = familyMedicalHistory;
    if (surgicalHistory) patient.surgicalHistory = surgicalHistory;
    if (immunizationHistory) patient.immunizationHistory = immunizationHistory;
    if (preferredPharmacy) patient.preferredPharmacy = preferredPharmacy;
    if (insuranceInfo) patient.insuranceInfo = insuranceInfo;
    if (primaryCarePhysician) patient.primaryCarePhysician = primaryCarePhysician;
    
    // Check if profile is completed
    patient.profileCompleted = Boolean(
      patient.bloodGroup &&
      patient.height?.value &&
      patient.weight?.value &&
      (patient.address?.city || patient.address?.state) &&
      patient.emergencyContact?.phone
    );
    
    await patient.save();
    
    res.status(200).json({
      success: true,
      data: patient,
      message: 'Patient profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating patient profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get patient appointments
 * @route   GET /api/patients/appointments
 * @access  Private (Patient only)
 */
export const getPatientAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }
    
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter = { patient: patient._id };
    
    if (status) {
      filter.status = status;
    }
    
    // Get appointments with pagination
    const appointments = await Appointment.find(filter)
      .populate({
        path: 'doctor',
        select: 'user specialties consultationFee',
        populate: {
          path: 'user',
          select: 'firstName lastName profileImage'
        }
      })
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Count total for pagination
    const total = await Appointment.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: appointments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting patient appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Book an appointment
 * @route   POST /api/patients/appointments
 * @access  Private (Patient only)
 */
export const bookAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      doctorId,
      appointmentDate,
      appointmentTime,
      appointmentType,
      reason
    } = req.body;
    
    // Validate input
    if (!doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID, appointment date, and time are required'
      });
    }
    
    // Get patient
    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }
    
    // Check if doctor exists and is verified
    const doctor = await mongoose.model('Doctor').findOne({
      _id: doctorId,
      isVerified: true,
      acceptingNewPatients: true
    });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or not accepting appointments'
      });
    }
    
    // Validate appointment date and time
    const appointmentDateTime = new Date(appointmentDate);
    if (appointmentDateTime < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book appointment in the past'
      });
    }
    
    // Check if time slot is available
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][appointmentDateTime.getDay()];
    const daySchedule = doctor.availability.find(a => a.day === dayOfWeek && a.isAvailable);
    
    if (!daySchedule) {
      return res.status(400).json({
        success: false,
        message: `Doctor is not available on ${dayOfWeek}`
      });
    }
    
    const timeSlot = daySchedule.slots.find(
      slot => slot.startTime === appointmentTime && !slot.isBooked
    );
    
    if (!timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is not available'
      });
    }
    
    // Check if there's already an appointment at this time
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: {
        $gte: new Date(appointmentDateTime.setHours(0, 0, 0, 0)),
        $lt: new Date(appointmentDateTime.setHours(23, 59, 59, 999))
      },
      appointmentTime,
      status: { $nin: ['cancelled', 'no-show'] }
    });
    
    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }
    
    // Create appointment
    const newAppointment = new Appointment({
      doctor: doctorId,
      patient: patient._id,
      appointmentDate,
      appointmentTime,
      status: 'scheduled',
      appointmentType: appointmentType || 'in-person',
      reason,
      payment: {
        amount: doctor.consultationFee[appointmentType || 'inPerson'] || doctor.consultationFee.inPerson,
        status: 'pending'
      }
    });
    
    // If it's a video appointment, add video call details
    if (appointmentType === 'video' && doctor.videoConsultation.available) {
      newAppointment.videoCallDetails = {
        platform: doctor.videoConsultation.platform,
        // Generate link later when appointment is confirmed
      };
    }
    
    await newAppointment.save();
    
    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: newAppointment
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Cancel appointment
 * @route   PUT /api/patients/appointments/:id/cancel
 * @access  Private (Patient only)
 */
export const cancelAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { reason } = req.body;
    
    // Get patient
    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }
    
    // Find appointment
    const appointment = await Appointment.findOne({
      _id: id,
      patient: patient._id,
      status: 'scheduled'
    });
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or cannot be cancelled'
      });
    }
    
    // Check cancellation time (e.g., 24 hours before appointment)
    const appointmentTime = new Date(appointment.appointmentDate);
    const now = new Date();
    const hoursDifference = (appointmentTime - now) / (1000 * 60 * 60);
    
    if (hoursDifference < 24) {
      return res.status(400).json({
        success: false,
        message: 'Appointments can only be cancelled at least 24 hours in advance'
      });
    }
    
    // Update appointment
    appointment.status = 'cancelled';
    appointment.cancellationReason = reason || 'Cancelled by patient';
    appointment.cancelledBy = 'patient';
    
    await appointment.save();
    
    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Update patient profile image
 * @route   PUT /api/patients/profile-image
 * @access  Private (Patient only)
 */
export const updateProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }
    
    // Delete previous image if exists
    if (user.profileImage) {
      await deleteFile(user.profileImage);
    }
    
    // Upload new image
    const uploadedFile = await uploadFile(req.file, 'users/profile');
    
    // Update user's profile image
    user.profileImage = uploadedFile.url;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Profile image updated successfully',
      data: {
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Error updating profile image:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
