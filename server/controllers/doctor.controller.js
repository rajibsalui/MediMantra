import mongoose from 'mongoose';
import Doctor from '../models/doctor.model.js';
import User from '../models/user.model.js';
import Patient from '../models/patient.model.js';
import Appointment from '../models/appointment.model.js';
import Prescription from '../models/prescription.model.js';
import Message from '../models/message.model.js';
import Conversation from '../models/conversation.model.js';
import { uploadFile, deleteFile } from '../utils/fileUpload.js';

/**
 * @desc    Get all doctors with pagination
 * @route   GET /api/doctors
 * @access  Public
 */
export const getDoctors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter options - FIX: Changed isVerified to true to show only verified doctors
    const filter = { isVerified: false };

    // Add specialty filter if provided
    if (req.query.specialty) {
      filter.specialties = { $regex: req.query.specialty, $options: 'i' };
    }

    // Add name search if provided
    if (req.query.name) {
      // We need to join with User model to search by name
      const users = await User.find({
        $or: [
          { firstName: { $regex: req.query.name, $options: 'i' } },
          { lastName: { $regex: req.query.name, $options: 'i' } }
        ],
        role: 'doctor'
      }).select('_id');

      filter.user = { $in: users.map(user => user._id) };
    }

    // Filter by acceptingNewPatients if specified
    if (req.query.acceptingNewPatients !== undefined) {
      filter.acceptingNewPatients = req.query.acceptingNewPatients === 'true';
    }

    // Filter by languages if provided
    if (req.query.language) {
      filter.languages = { $regex: req.query.language, $options: 'i' };
    }

    // Get verified doctors with pagination
    const doctors = await Doctor.find(filter)
      .populate('user', 'firstName lastName email phone profileImage')
      .skip(skip)
      .limit(limit)
      .sort({ averageRating: -1 });

    // Count total documents for pagination info
    const total = await Doctor.countDocuments(filter);

    // Get availability for each doctor
    const doctorsWithAvailability = await Promise.all(doctors.map(async (doctor) => {
      // Convert Mongoose document to plain object for modification
      const doctorObj = doctor.toObject();

      // Get next available appointment slot
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if doctor has availability data
      const hasAvailability = doctorObj.availability && doctorObj.availability.length > 0;

      // Get the nearest available day
      let nextAvailableDay = null;
      if (hasAvailability) {
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayIndex = today.getDay();

        // Look for the next available day in the doctor's schedule
        for (let i = 0; i < 7; i++) {
          const checkDayIndex = (todayIndex + i) % 7;
          const checkDay = daysOfWeek[checkDayIndex];

          const daySchedule = doctorObj.availability.find(a =>
            a.day === checkDay && a.isAvailable && a.slots && a.slots.length > 0
          );

          if (daySchedule) {
            const availableSlots = daySchedule.slots.filter(slot => !slot.isBooked);
            if (availableSlots.length > 0) {
              nextAvailableDay = {
                day: checkDay,
                date: new Date(today.getTime() + (i * 24 * 60 * 60 * 1000)),
                firstAvailableSlot: availableSlots[0].startTime
              };
              break;
            }
          }
        }
      }

      // Add availability info to doctor object
      return {
        ...doctorObj,
        nextAvailable: nextAvailableDay,
        availabilityStatus: doctorObj.acceptingNewPatients ? 'accepting' : 'not accepting'
      };
    }));

    res.status(200).json({
      success: true,
      data: doctorsWithAvailability,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get doctor by ID
 * @route   GET /api/doctors/:id
 * @access  Public
 */
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('user', 'firstName lastName email phone profileImage')
      .populate({
        path: 'reviews.patient',
        select: 'user',
        populate: {
          path: 'user',
          select: 'firstName lastName profileImage'
        }
      });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Don't return unverified doctors to public
    if (!doctor.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'This doctor profile is not available'
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    console.error('Error getting doctor by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Create a new doctor profile
 * @route   POST /api/doctors
 * @access  Private (Admin or user with doctor role)
 */
export const createDoctor = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      qualifications,
      specialties,
      experience,
      registrationNumber,
      registrationCouncil,
      clinicDetails,
      hospitalAffiliations,
      consultationFee,
      languages,
      bio
    } = req.body;

    // Check if doctor already exists with this registration number
    const existingDoctor = await Doctor.findOne({ registrationNumber });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'Doctor with this registration number already exists'
      });
    }

    // Get user ID from auth middleware
    const userId = req.user.id;

    // Check if user exists and has doctor role
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'doctor' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'User is not authorized to create a doctor profile'
      });
    }

    // Handle file uploads if any
    let verificationDocuments = [];
    if (req.files && req.files.length > 0) {
      // Upload each document
      for (const file of req.files) {
        const uploadedFile = await uploadFile(file, 'doctors/verification');
        verificationDocuments.push({
          name: file.originalname,
          url: uploadedFile.url,
          verified: false
        });
      }
    }

    // Create doctor profile
    const newDoctor = new Doctor({
      user: userId,
      qualifications: qualifications || [],
      specialties: specialties || [],
      experience,
      registrationNumber,
      registrationCouncil,
      clinicDetails,
      hospitalAffiliations: hospitalAffiliations || [],
      consultationFee,
      languages: languages || [],
      bio,
      verificationDocuments,
      isVerified: false // Requires admin approval
    });

    await newDoctor.save({ session });

    // Update user's role to doctor if it's not already
    if (user.role !== 'doctor') {
      user.role = 'doctor';
      await user.save({ session });
    }

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      data: newDoctor,
      message: 'Doctor profile created successfully and pending verification'
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error creating doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Update doctor profile
 * @route   PUT /api/doctors/:id
 * @access  Private (Owner doctor or Admin)
 */
export const updateDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;

    // Find doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check if user is the owner or admin
    if (doctor.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    // Fields that can be updated
    const {
      qualifications,
      specialties,
      experience,
      clinicDetails,
      hospitalAffiliations,
      consultationFee,
      languages,
      bio,
      availability,
      videoConsultation,
      acceptingNewPatients
    } = req.body;

    // Update fields if provided
    if (qualifications) doctor.qualifications = qualifications;
    if (specialties) doctor.specialties = specialties;
    if (experience) doctor.experience = experience;
    if (clinicDetails) doctor.clinicDetails = clinicDetails;
    if (hospitalAffiliations) doctor.hospitalAffiliations = hospitalAffiliations;
    if (consultationFee) doctor.consultationFee = consultationFee;
    if (languages) doctor.languages = languages;
    if (bio) doctor.bio = bio;
    if (availability) doctor.availability = availability;
    if (videoConsultation !== undefined) doctor.videoConsultation = videoConsultation;
    if (acceptingNewPatients !== undefined) doctor.acceptingNewPatients = acceptingNewPatients;

    // Handle file uploads if any
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadedFile = await uploadFile(file, 'doctors/verification');
        doctor.verificationDocuments.push({
          name: file.originalname,
          url: uploadedFile.url,
          verified: false
        });
      }

      // If new documents are added, set verification status back to pending
      if (doctor.isVerified) {
        doctor.isVerified = false;
      }
    }

    // Save updated profile
    await doctor.save();

    res.status(200).json({
      success: true,
      data: doctor,
      message: 'Doctor profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Verify doctor profile (Admin only)
 * @route   PUT /api/doctors/:id/verify
 * @access  Private (Admin)
 */
export const verifyDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;

    // Verify user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to verify doctors'
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Update verification status
    doctor.isVerified = true;

    // Mark all documents as verified
    doctor.verificationDocuments.forEach(doc => {
      doc.verified = true;
    });

    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Doctor verified successfully',
      data: doctor
    });

  } catch (error) {
    console.error('Error verifying doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Reject doctor verification (Admin only)
 * @route   PUT /api/doctors/:id/reject
 * @access  Private (Admin)
 */
export const rejectDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const { reason } = req.body;

    // Verify user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject doctors'
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Update verification status
    doctor.isVerified = false;
    doctor.rejectionReason = reason || 'Did not meet verification criteria';

    await doctor.save();

    // TODO: Send email notification to doctor about rejection

    res.status(200).json({
      success: true,
      message: 'Doctor verification rejected',
      data: doctor
    });

  } catch (error) {
    console.error('Error rejecting doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Delete doctor profile
 * @route   DELETE /api/doctors/:id
 * @access  Private (Admin only)
 */
export const deleteDoctorByAdmin = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const doctorId = req.params.id;

    // Verify user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete doctor profiles'
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Delete uploaded files
    for (const doc of doctor.verificationDocuments) {
      await deleteFile(doc.url);
    }

    // Delete the doctor
    await Doctor.findByIdAndDelete(doctorId, { session });

    // Update user role if needed
    const user = await User.findById(doctor.user);
    if (user) {
      user.role = 'user';
      await user.save({ session });
    }

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: 'Doctor profile deleted successfully'
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error deleting doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Delete doctor's account
 * @route   DELETE /api/doctors
 * @access  Private (Doctor only)
 */
export const deleteDoctor = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id;

    // Find doctor profile
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Check if doctor has any active appointments
    const activeAppointments = await Appointment.countDocuments({
      doctor: doctor._id,
      status: 'scheduled',
      appointmentDate: { $gte: new Date() }
    });

    if (activeAppointments > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete account with active appointments. Please reschedule or cancel them first.'
      });
    }

    // Delete uploaded files
    for (const doc of doctor.verificationDocuments) {
      if (doc.url) {
        try {
          await deleteFile(doc.url);
        } catch (err) {
          console.error(`Error deleting file ${doc.url}:`, err);
        }
      }
    }

    // Delete all doctor's appointments (or mark them as cancelled)
    await Appointment.updateMany(
      { doctor: doctor._id, status: { $ne: 'completed' } },
      { status: 'cancelled', cancellationReason: 'Doctor no longer available' },
      { session }
    );

    // Delete the doctor profile
    await Doctor.findByIdAndDelete(doctor._id, { session });

    // Update user role to standard user
    const user = await User.findById(userId);
    if (user) {
      user.role = 'user';
      await user.save({ session });
    }

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: 'Doctor account deleted successfully'
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error deleting doctor account:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Add review for a doctor
 * @route   POST /api/doctors/:id/reviews
 * @access  Private (Patients who had appointments)
 */
export const addDoctorReview = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Get doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
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

    // Check if patient had an appointment with this doctor
    const hadAppointment = await Appointment.findOne({
      doctor: doctorId,
      patient: patient._id,
      status: 'completed'
    });

    if (!hadAppointment) {
      return res.status(403).json({
        success: false,
        message: 'You can only review doctors after completing an appointment'
      });
    }

    // Check if review already exists
    const existingReviewIndex = doctor.reviews.findIndex(
      r => r.patient.toString() === patient._id.toString()
    );

    if (existingReviewIndex > -1) {
      // Update existing review
      doctor.reviews[existingReviewIndex].rating = rating;
      doctor.reviews[existingReviewIndex].comment = comment;
      doctor.reviews[existingReviewIndex].date = Date.now();
    } else {
      // Add new review
      doctor.reviews.push({
        patient: patient._id,
        rating,
        comment,
        date: Date.now()
      });
    }

    // Update average rating
    await doctor.updateAverageRating();

    res.status(200).json({
      success: true,
      message: 'Review added successfully',
      data: doctor.reviews
    });

  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get doctor availability
 * @route   GET /api/doctors/:id/availability
 * @access  Public
 */
export const getDoctorAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    // Get doctor
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Get day of week from date
    const dateObj = new Date(date);
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dateObj.getDay()];

    // Find availability for that day
    const daySchedule = doctor.availability.find(a => a.day === dayOfWeek);

    if (!daySchedule || !daySchedule.isAvailable) {
      return res.status(200).json({
        success: true,
        message: `Doctor is not available on ${dayOfWeek}`,
        data: []
      });
    }

    // Find already booked appointments for that day
    const startOfDay = new Date(dateObj);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(dateObj);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
      doctor: id,
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $nin: ['cancelled', 'no-show'] }
    });

    // Mark booked slots
    const availableSlots = daySchedule.slots.map(slot => {
      const isBooked = bookedAppointments.some(
        app => app.appointmentTime === slot.startTime
      );

      return {
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: !isBooked && !slot.isBooked
      };
    });

    res.status(200).json({
      success: true,
      data: availableSlots
    });
  } catch (error) {
    console.error('Error getting doctor availability:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Update doctor availability
 * @route   PUT /api/doctors/:id/availability
 * @access  Private (Owner doctor)
 */
export const updateDoctorAvailability = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const { availability } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check if user is the doctor
    if (doctor.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update availability'
      });
    }

    // Validate availability format
    if (!Array.isArray(availability)) {
      return res.status(400).json({
        success: false,
        message: 'Availability must be an array'
      });
    }

    // Update availability
    doctor.availability = availability;
    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      data: doctor.availability
    });

  } catch (error) {
    console.error('Error updating doctor availability:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get doctor dashboard stats
 * @route   GET /api/doctors/dashboard-stats
 * @access  Private (Doctor)
 */
export const getDoctorDashboardStats = async (req, res) => {
  try {
    console.log(req.user._id)
    const userId = req.user._id;

    // Find doctor profile
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const doctorId = doctor._id;

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's appointments
    const todayAppointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: {
        $gte: today,
        $lt: tomorrow
      }
    }).populate({
      path: 'patient',
      select: 'user',
      populate: {
        path: 'user',
        select: 'firstName lastName profileImage'
      }
    });

    // Get upcoming appointments (next 7 days)
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingAppointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: {
        $gt: tomorrow,
        $lte: nextWeek
      },
      status: 'scheduled'
    }).countDocuments();

    // Get total appointments
    const totalAppointments = await Appointment.find({
      doctor: doctorId
    }).countDocuments();

    // Get total patients (unique)
    const uniquePatients = await Appointment.distinct('patient', {
      doctor: doctorId
    });

    // Get monthly appointment counts
    const monthlyStats = await getMonthlyAppointmentStats(doctorId);

    // Get recent reviews
    const recentReviews = doctor.reviews.sort((a, b) => b.date - a.date).slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        todayAppointments,
        upcomingAppointments,
        totalAppointments,
        totalPatients: uniquePatients.length,
        averageRating: doctor.averageRating,
        totalReviews: doctor.totalReviews,
        monthlyStats,
        recentReviews
      }
    });

  } catch (error) {
    console.error('Error getting doctor dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Helper function to get monthly appointment stats
const getMonthlyAppointmentStats = async (doctorId) => {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const appointments = await Appointment.aggregate([
    {
      $match: {
        doctor: new mongoose.Types.ObjectId(doctorId),
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1
      }
    }
  ]);

  // Format results
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const results = [];

  // Fill in all months in the last 6 months
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.getMonth();
    const year = d.getFullYear();

    const found = appointments.find(a => a._id.month === month + 1 && a._id.year === year);

    results.unshift({
      month: months[month],
      year,
      count: found ? found.count : 0
    });
  }

  return results;
};

/**
 * @desc    Update doctor profile
 * @route   PUT /api/doctors/profile
 * @access  Private (Doctor only)
 */
export const updateDoctorProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find doctor profile
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Fields that can be updated
    const {
      qualifications,
      specialties,
      experience,
      clinicDetails,
      hospitalAffiliations,
      consultationFee,
      languages,
      bio,
      videoConsultation,
      acceptingNewPatients
    } = req.body;

    // Update fields if provided
    if (qualifications) doctor.qualifications = qualifications;
    if (specialties) doctor.specialties = specialties;
    if (experience) doctor.experience = experience;
    if (clinicDetails) doctor.clinicDetails = clinicDetails;
    if (hospitalAffiliations) doctor.hospitalAffiliations = hospitalAffiliations;
    if (consultationFee) doctor.consultationFee = consultationFee;
    if (languages) doctor.languages = languages;
    if (bio) doctor.bio = bio;
    if (videoConsultation !== undefined) doctor.videoConsultation = videoConsultation;
    if (acceptingNewPatients !== undefined) doctor.acceptingNewPatients = acceptingNewPatients;

    // Save updated profile
    await doctor.save();

    res.status(200).json({
      success: true,
      data: doctor,
      message: 'Doctor profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating doctor profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Update doctor availability
 * @route   PUT /api/doctors/availability
 * @access  Private (Doctor only)
 */
export const updateAvailability = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find doctor profile
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const { availability } = req.body;

    // Validate availability format
    if (!Array.isArray(availability)) {
      return res.status(400).json({
        success: false,
        message: 'Availability must be an array'
      });
    }

    // Update availability
    doctor.availability = availability;
    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      data: doctor.availability
    });

  } catch (error) {
    console.error('Error updating doctor availability:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Upload verification documents
 * @route   POST /api/doctors/verification-documents
 * @access  Private (Doctor only)
 */
export const uploadVerificationDocuments = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find doctor profile
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files were uploaded'
      });
    }

    // Upload each document
    const uploadedDocs = [];
    for (const file of req.files) {
      const uploadedFile = await uploadFile(file, 'doctors/verification');

      const doc = {
        name: file.originalname,
        url: uploadedFile.url,
        verified: false
      };

      doctor.verificationDocuments.push(doc);
      uploadedDocs.push(doc);
    }

    // If doctor was verified before, set back to pending
    if (doctor.isVerified) {
      doctor.isVerified = false;
      doctor.verificationStatus = 'pending';
    }

    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Documents uploaded successfully',
      data: uploadedDocs
    });

  } catch (error) {
    console.error('Error uploading verification documents:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get doctor's appointments
 * @route   GET /api/doctors/appointments
 * @access  Private (Doctor only)
 */
export const getDoctorAppointments = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find doctor profile
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filters
    const filter = { doctor: doctor._id };

    // Filter by status if provided
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Filter by date range if provided
    if (req.query.startDate && req.query.endDate) {
      filter.appointmentDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    // Get appointments
    const appointments = await Appointment.find(filter)
      .populate({
        path: 'patient',
        select: 'user',
        populate: {
          path: 'user',
          select: 'firstName lastName email phone profileImage'
        }
      })
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .skip(skip)
      .limit(limit);

    // Count total documents for pagination
    const total = await Appointment.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: appointments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error getting doctor appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get doctor's patients
 * @route   GET /api/doctors/patients
 * @access  Private (Doctor only)
 */
export const getDoctorPatients = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find doctor profile
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get unique patients who had appointments with this doctor
    const patientIds = await Appointment.distinct('patient', { doctor: doctor._id });

    // Search by name if provided
    let filteredPatientIds = patientIds;
    if (req.query.search) {
      const search = req.query.search.toLowerCase();

      // Get all patients with their user details
      const patients = await Patient.find({ _id: { $in: patientIds } })
        .populate('user', 'firstName lastName');

      // Filter by name
      const filteredPatients = patients.filter(patient => {
        const fullName = `${patient.user.firstName} ${patient.user.lastName}`.toLowerCase();
        return fullName.includes(search);
      });

      filteredPatientIds = filteredPatients.map(p => p._id);
    }

    // Get total count for pagination
    const total = filteredPatientIds.length;

    // Get patients with pagination
    const patients = await Patient.find({ _id: { $in: filteredPatientIds } })
      .populate('user', 'firstName lastName email phone profileImage dateOfBirth gender')
      .skip(skip)
      .limit(limit);

    // Get appointment count for each patient
    const patientsWithStats = await Promise.all(patients.map(async (patient) => {
      const appointmentCount = await Appointment.countDocuments({
        doctor: doctor._id,
        patient: patient._id
      });

      const lastAppointment = await Appointment.findOne({
        doctor: doctor._id,
        patient: patient._id
      }).sort({ appointmentDate: -1, appointmentTime: -1 });

      return {
        patient,
        stats: {
          appointmentCount,
          lastAppointment
        }
      };
    }));

    res.status(200).json({
      success: true,
      data: patientsWithStats,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error getting doctor patients:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get a specific patient by ID for a doctor
 * @route   GET /api/doctors/patients/:id
 * @access  Private (Doctor only)
 */
export const getPatientById = async (req, res) => {
  try {
    const userId = req.user.id;
    const patientId = req.params.id;

    // Find doctor profile
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Check if this doctor has had appointments with this patient
    const hasAppointment = await Appointment.findOne({
      doctor: doctor._id,
      patient: patientId
    });

    if (!hasAppointment) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this patient\'s information'
      });
    }

    // Get patient with detailed information
    const patient = await Patient.findById(patientId)
      .populate('user', 'firstName lastName email phone profileImage dateOfBirth gender address')
      .populate('primaryCarePhysician', 'user')
      .populate({
        path: 'primaryCarePhysician',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });

  } catch (error) {
    console.error('Error getting patient details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get patient appointments for a doctor
 * @route   GET /api/doctors/patients/:id/appointments
 * @access  Private (Doctor only)
 */
export const getPatientAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const patientId = req.params.id;

    // Find doctor profile
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Check if this doctor has had appointments with this patient
    const hasAppointment = await Appointment.findOne({
      doctor: doctor._id,
      patient: patientId
    });

    if (!hasAppointment) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this patient\'s information'
      });
    }

    // Get all appointments for this patient with this doctor
    const appointments = await Appointment.find({
      doctor: doctor._id,
      patient: patientId
    }).sort({ appointmentDate: -1, appointmentTime: -1 });

    res.status(200).json({
      success: true,
      data: appointments
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
 * @desc    Get patient prescriptions for a doctor
 * @route   GET /api/doctors/patients/:id/prescriptions
 * @access  Private (Doctor only)
 */
export const getPatientPrescriptions = async (req, res) => {
  try {
    const userId = req.user.id;
    const patientId = req.params.id;

    // Find doctor profile
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Check if this doctor has had appointments with this patient
    const hasAppointment = await Appointment.findOne({
      doctor: doctor._id,
      patient: patientId
    });

    if (!hasAppointment) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this patient\'s information'
      });
    }

    // Get all prescriptions for this patient by this doctor
    const prescriptions = await Prescription.find({
      doctor: doctor._id,
      patient: patientId
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: prescriptions
    });

  } catch (error) {
    console.error('Error getting patient prescriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get patient medical records for a doctor
 * @route   GET /api/doctors/patients/:id/medical-records
 * @access  Private (Doctor only)
 */
export const getPatientMedicalRecords = async (req, res) => {
  try {
    const userId = req.user.id;
    const patientId = req.params.id;

    // Find doctor profile
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Check if this doctor has had appointments with this patient
    const hasAppointment = await Appointment.findOne({
      doctor: doctor._id,
      patient: patientId
    });

    if (!hasAppointment) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this patient\'s information'
      });
    }

    // Get patient to access their medical records
    const patient = await Patient.findById(patientId).populate('medicalRecords');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      data: patient.medicalRecords || []
    });

  } catch (error) {
    console.error('Error getting patient medical records:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get doctor's reviews
 * @route   GET /api/doctors/reviews
 * @access  Private (Doctor only)
 */
export const getDoctorReviews = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find doctor profile
    const doctor = await Doctor.findOne({ user: userId })
      .populate({
        path: 'reviews.patient',
        select: 'user',
        populate: {
          path: 'user',
          select: 'firstName lastName profileImage'
        }
      });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Sort reviews by date (newest first)
    const reviews = doctor.reviews.sort((a, b) => b.date - a.date);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        averageRating: doctor.averageRating,
        totalReviews: doctor.totalReviews
      }
    });

  } catch (error) {
    console.error('Error getting doctor reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Add education to doctor's profile
 * @route   POST /api/doctors/education
 * @access  Private (Doctor only)
 */
export const addEducation = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find doctor profile
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const {
      degree,
      institution,
      year,
      description
    } = req.body;

    // Validate required fields
    if (!degree || !institution || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide degree, institution and year'
      });
    }

    // Add education
    doctor.qualifications.push({
      degree,
      institution,
      year,
      description
    });

    await doctor.save();

    res.status(201).json({
      success: true,
      message: 'Education added successfully',
      data: doctor.qualifications
    });

  } catch (error) {
    console.error('Error adding education:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Remove education from doctor's profile
 * @route   DELETE /api/doctors/education/:eduId
 * @access  Private (Doctor only)
 */
export const removeEducation = async (req, res) => {
  try {
    const userId = req.user.id;
    const eduId = req.params.eduId;

    // Find doctor profile
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Find education by ID
    const eduIndex = doctor.qualifications.findIndex(
      q => q._id.toString() === eduId
    );

    if (eduIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Education not found'
      });
    }

    // Remove education
    doctor.qualifications.splice(eduIndex, 1);
    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Education removed successfully',
      data: doctor.qualifications
    });

  } catch (error) {
    console.error('Error removing education:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Update doctor's profile image
 * @route   PUT /api/doctors/profile-image
 * @access  Private (Doctor only)
 */
export const updateProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file was uploaded'
      });
    }

    // Delete old profile image if exists
    if (user.profileImage) {
      try {
        await deleteFile(user.profileImage);
      } catch (err) {
        console.error('Error deleting old profile image:', err);
      }
    }

    // Upload new profile image
    const uploadedFile = await uploadFile(req.file, 'users/profiles');

    // Update user profile image
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

/**
 * @desc    Get doctor profile
 * @route   GET /api/doctors/profile
 * @access  Private (Doctor only)
 */
export const getDoctorProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find doctor with user details
    const doctor = await Doctor.findOne({ user: userId })
      .populate('user', 'firstName lastName email phone profileImage dateOfBirth gender')
      .populate({
        path: 'reviews.patient',
        select: 'user',
        populate: {
          path: 'user',
          select: 'firstName lastName profileImage'
        }
      });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Get upcoming appointments count
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingAppointments = await Appointment.countDocuments({
      doctor: doctor._id,
      appointmentDate: { $gte: today },
      status: 'scheduled'
    });

    // Get today's appointments
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointmentsCount = await Appointment.countDocuments({
      doctor: doctor._id,
      appointmentDate: {
        $gte: today,
        $lt: tomorrow
      },
      status: 'scheduled'
    });

    // Get total patients count
    const uniquePatientsCount = await Appointment.distinct('patient', {
      doctor: doctor._id
    }).length;

    res.status(200).json({
      success: true,
      data: {
        doctor,
        stats: {
          upcomingAppointments,
          todayAppointments: todayAppointmentsCount,
          totalPatients: uniquePatientsCount
        }
      }
    });

  } catch (error) {
    console.error('Error getting doctor profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Search doctors by name or specialty
 * @route   GET /api/doctors/search
 * @access  Public
 */
export const searchDoctors = async (req, res) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Search users by name
    const users = await User.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } }
      ],
      role: 'doctor'
    }).select('_id');

    const userIds = users.map(user => user._id);

    // Search doctors by specialties or user IDs
    const doctors = await Doctor.find({
      $or: [
        { user: { $in: userIds } },
        { specialties: { $regex: query, $options: 'i' } }
      ],
      isVerified: true
    })
      .populate('user', 'firstName lastName email phone profileImage')
      .skip(skip)
      .limit(limit)
      .sort({ averageRating: -1 });

    // Count total documents
    const total = await Doctor.countDocuments({
      $or: [
        { user: { $in: userIds } },
        { specialties: { $regex: query, $options: 'i' } }
      ],
      isVerified: true
    });

    res.status(200).json({
      success: true,
      data: doctors,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error searching doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Filter doctors by specialty
 * @route   GET /api/doctors/specialty/:specialty
 * @access  Public
 */
export const filterDoctorsBySpecialty = async (req, res) => {
  try {
    const { specialty } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!specialty) {
      return res.status(400).json({
        success: false,
        message: 'Specialty is required'
      });
    }

    // Find doctors by specialty
    const doctors = await Doctor.find({
      specialties: { $regex: specialty, $options: 'i' },
      isVerified: true
    })
      .populate('user', 'firstName lastName email phone profileImage')
      .skip(skip)
      .limit(limit)
      .sort({ averageRating: -1 });

    // Count total documents
    const total = await Doctor.countDocuments({
      specialties: { $regex: specialty, $options: 'i' },
      isVerified: true
    });

    res.status(200).json({
      success: true,
      data: doctors,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error filtering doctors by specialty:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Toggle doctor's availability status
 * @route   PUT /api/doctors/toggle-availability
 * @access  Private (Doctor only)
 */
export const toggleDoctorAvailability = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find doctor profile
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Toggle availability
    doctor.isAvailable = !doctor.isAvailable;
    await doctor.save();

    res.status(200).json({
      success: true,
      message: `You are now ${doctor.isAvailable ? 'available' : 'unavailable'} for new appointments`,
      data: {
        isAvailable: doctor.isAvailable
      }
    });

  } catch (error) {
    console.error('Error toggling doctor availability:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get a single appointment by ID
 * @route   GET /api/doctors/appointments/:id
 * @access  Private (Doctor only)
 */
export const getAppointmentById = async (req, res) => {
  try {
    const userId = req.user.id;
    const appointmentId = req.params.id;

    // Get doctor
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Get appointment
    const appointment = await Appointment.findById(appointmentId)
      .populate({
        path: 'patient',
        select: 'user medicalHistory allergies bloodGroup emergencyContact',
        populate: {
          path: 'user',
          select: 'firstName lastName email phone profileImage dateOfBirth gender address'
        }
      })
      .populate({
        path: 'prescription',
        select: 'medications diagnosis notes startDate endDate status'
      })
      .populate({
        path: 'medicalRecords',
        select: 'title description fileUrl uploadDate'
      });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if the appointment belongs to the doctor
    if (appointment.doctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this appointment'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error getting appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Update appointment status
 * @route   PUT /api/doctors/appointments/:id/status
 * @access  Private (Doctor only)
 */
export const updateAppointmentStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const appointmentId = req.params.id;
    const { status } = req.body;

    // Validate status
    if (!status || !['scheduled', 'completed', 'cancelled', 'no-show'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be scheduled, completed, cancelled, or no-show'
      });
    }

    // Get doctor
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Get appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if the appointment belongs to the doctor
    if (appointment.doctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    // Update status
    appointment.status = status;

    // If cancelled, add cancellation details
    if (status === 'cancelled') {
      appointment.cancelledBy = 'doctor';
      appointment.cancellationReason = req.body.cancellationReason || 'Cancelled by doctor';
    }

    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment,
      message: `Appointment ${status} successfully`
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Update appointment details
 * @route   PUT /api/doctors/appointments/:id
 * @access  Private (Doctor only)
 */
export const updateAppointmentDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const appointmentId = req.params.id;
    const { notes, followUp } = req.body;

    // Get doctor
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Get appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if the appointment belongs to the doctor
    if (appointment.doctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    // Update fields if provided
    if (notes !== undefined) {
      appointment.notes = notes;
    }

    if (followUp !== undefined) {
      appointment.followUp = followUp;
    }

    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment,
      message: 'Appointment details updated successfully'
    });
  } catch (error) {
    console.error('Error updating appointment details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Search for patients by name or email
 * @route   GET /api/doctors/patients/search
 * @access  Private (Doctor only)
 */
export const searchPatients = async (req, res) => {
  try {
    const { query } = req.query;
    const doctorId = req.user._id;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    // Find patients by name or email
    const patients = await User.find({
      role: 'patient',
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    })
    .select('_id firstName lastName email profileImage')
    .limit(10);

    res.status(200).json({
      success: true,
      data: patients
    });
  } catch (error) {
    console.error('Error searching patients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search patients',
      error: error.message
    });
  }
};