import Doctor from '../models/doctor.model.js';
import { User } from '../models/user.model.js';
import Appointment from '../models/appointment.model.js';
import Prescription from '../models/prescription.model.js';
import Review from '../models/review.model.js';
import Patient from '../models/patient.model.js';

// Get doctor profile
export const getDoctorProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find doctor profile
    const doctor = await Doctor.findOne({ user: userId })
      .populate('specializations')
      .populate('qualifications');
      
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      doctor: {
        ...doctor.toObject(),
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    console.error('Get doctor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor profile'
    });
  }
};

// Update doctor profile
export const updateDoctorProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      bio,
      specializations,
      languages,
      experience,
      acceptingNewPatients
    } = req.body;

    // Find doctor
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Update doctor profile
    if (bio !== undefined) doctor.bio = bio;
    if (specializations) doctor.specializations = specializations;
    if (languages) doctor.languages = languages;
    if (experience !== undefined) doctor.experience = parseInt(experience, 10);
    if (acceptingNewPatients !== undefined) doctor.acceptingNewPatients = acceptingNewPatients;

    await doctor.save();

    // Update user's profile completion status if this is first update
    const user = await User.findById(userId);
    if (user && !user.isProfileComplete) {
      user.isProfileComplete = true;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully',
      doctor
    });
  } catch (error) {
    console.error('Update doctor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating doctor profile'
    });
  }
};

// Get list of doctors
export const getDoctorsList = async (req, res) => {
  try {
    const { limit = 10, page = 1, specialization, city, name } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    const query = {};
    
    if (specialization) {
      query.specializations = specialization;
    }
    
    if (city) {
      query['practiceLocations.address.city'] = { $regex: city, $options: 'i' };
    }
    
    if (name) {
      // We need to find user IDs first with the matching name
      const nameRegex = new RegExp(name, 'i');
      const users = await User.find({
        $or: [
          { firstName: { $regex: nameRegex } },
          { lastName: { $regex: nameRegex } }
        ],
        role: 'doctor'
      }).select('_id');
      
      const userIds = users.map(user => user._id);
      query.user = { $in: userIds };
    }

    // Find doctors
    const doctors = await Doctor.find(query)
      .populate('user', 'firstName lastName email avatar isEmailVerified')
      .populate('specializations', 'name')
      .sort({ 'ratings.average': -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Doctor.countDocuments(query);

    // Filter out doctors whose user is not verified or active
    const filteredDoctors = doctors.filter(doctor => 
      doctor.user && doctor.user.isEmailVerified
    );

    res.status(200).json({
      success: true,
      count: filteredDoctors.length,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      doctors: filteredDoctors
    });
  } catch (error) {
    console.error('Get doctors list error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctors'
    });
  }
};

// Get doctor by ID
export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find doctor with related info
    const doctor = await Doctor.findOne({ user: id })
      .populate('user', 'firstName lastName email avatar isEmailVerified')
      .populate('specializations', 'name description');
    
    if (!doctor || !doctor.user || !doctor.user.isEmailVerified) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or not verified'
      });
    }

    // Get doctor reviews
    const reviews = await Review.find({ doctor: id, status: 'approved' })
      .populate('patient', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      doctor: {
        ...doctor.toObject(),
        reviews
      }
    });
  } catch (error) {
    console.error('Get doctor by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor'
    });
  }
};

// Update availability
export const updateAvailability = async (req, res) => {
  try {
    const userId = req.user._id;
    const { availabilitySchedule } = req.body;

    if (!availabilitySchedule || !Array.isArray(availabilitySchedule)) {
      return res.status(400).json({
        success: false,
        message: 'Valid availability schedule is required'
      });
    }

    // Find doctor
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Update availability
    doctor.availabilitySchedule = availabilitySchedule;
    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      availabilitySchedule: doctor.availabilitySchedule
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating availability'
    });
  }
};

// Update consultation fee
export const updateConsultationFee = async (req, res) => {
  try {
    const userId = req.user._id;
    const { consultationFee } = req.body;

    if (consultationFee === undefined || isNaN(consultationFee) || consultationFee < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid consultation fee is required'
      });
    }

    // Find doctor
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Update fee
    doctor.consultationFee = consultationFee;
    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Consultation fee updated successfully',
      consultationFee: doctor.consultationFee
    });
  } catch (error) {
    console.error('Update consultation fee error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating consultation fee'
    });
  }
};

// Get doctor's appointments
export const getAppointments = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, date, limit = 10, skip = 0 } = req.query;
    
    // Build query
    const query = { doctor: userId };
    
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
      .populate('patient', 'firstName lastName email phone')
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
      message: 'Error fetching appointments'
    });
  }
};

// Add qualification
export const addQualification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { degree, institution, year, specialization } = req.body;

    if (!degree || !institution) {
      return res.status(400).json({
        success: false,
        message: 'Degree and institution are required'
      });
    }

    // Find doctor
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Add qualification
    doctor.qualifications.push({
      degree,
      institution,
      year,
      specialization
    });

    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Qualification added successfully',
      qualifications: doctor.qualifications
    });
  } catch (error) {
    console.error('Add qualification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding qualification'
    });
  }
};

// Remove qualification
export const removeQualification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    // Find doctor
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Remove qualification
    doctor.qualifications = doctor.qualifications.filter(qual => qual._id.toString() !== id);
    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Qualification removed successfully',
      qualifications: doctor.qualifications
    });
  } catch (error) {
    console.error('Remove qualification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing qualification'
    });
  }
};

// Add verification document
export const addVerificationDocument = async (req, res) => {
  try {
    const userId = req.user._id;
    const { documentType, description } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Document file is required'
      });
    }

    if (!documentType) {
      return res.status(400).json({
        success: false,
        message: 'Document type is required'
      });
    }

    // Find doctor
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Add verification document
    doctor.verificationDocuments.push({
      documentType,
      documentUrl: `/uploads/documents/${req.file.filename}`,
      description,
      uploadDate: new Date()
    });

    // Update verification status
    if (doctor.verificationStatus === 'not_submitted') {
      doctor.verificationStatus = 'pending';
    }

    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Verification document added successfully',
      verificationDocuments: doctor.verificationDocuments
    });
  } catch (error) {
    console.error('Add verification document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding verification document'
    });
  }
};

// Get verification status
export const getVerificationStatus = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find doctor
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    res.status(200).json({
      success: true,
      verificationStatus: doctor.verificationStatus,
      verificationDocuments: doctor.verificationDocuments,
      verificationNotes: doctor.verificationNotes
    });
  } catch (error) {
    console.error('Get verification status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting verification status'
    });
  }
};

// Update practice locations
export const updatePracticeLocations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { practiceLocations } = req.body;

    if (!practiceLocations || !Array.isArray(practiceLocations)) {
      return res.status(400).json({
        success: false,
        message: 'Practice locations must be an array'
      });
    }

    // Find doctor
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Update practice locations
    doctor.practiceLocations = practiceLocations;
    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Practice locations updated successfully',
      practiceLocations: doctor.practiceLocations
    });
  } catch (error) {
    console.error('Update practice locations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating practice locations'
    });
  }
};

// Get top rated doctors
export const getTopRatedDoctors = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const doctors = await Doctor.find({
      'ratings.count': { $gt: 0 },
      verificationStatus: 'verified'
    })
    .populate('user', 'firstName lastName avatar')
    .populate('specializations', 'name')
    .sort({ 'ratings.average': -1 })
    .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    console.error('Get top rated doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching top rated doctors'
    });
  }
};

// Get doctors by specialization
export const getDoctorsBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.params;
    const { limit = 10, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const doctors = await Doctor.find({ 
      specializations: specialization,
      verificationStatus: 'verified'
    })
    .populate('user', 'firstName lastName avatar')
    .populate('specializations', 'name')
    .sort({ 'ratings.average': -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Doctor.countDocuments({ 
      specializations: specialization,
      verificationStatus: 'verified'
    });

    res.status(200).json({
      success: true,
      count: doctors.length,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      doctors
    });
  } catch (error) {
    console.error('Get doctors by specialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctors by specialization'
    });
  }
};

// Search doctors
export const searchDoctors = async (req, res) => {
  try {
    const { query, specialization, limit = 10, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    if (!query && !specialization) {
      return res.status(400).json({
        success: false,
        message: 'Search query or specialization is required'
      });
    }

    // Search for matching users first
    const nameRegex = new RegExp(query, 'i');
    const matchingUsers = await User.find({
      $or: [
        { firstName: { $regex: nameRegex } },
        { lastName: { $regex: nameRegex } }
      ],
      role: 'doctor'
    }).select('_id');

    const doctorUserIds = matchingUsers.map(user => user._id);
    
    // Build doctor query
    const doctorQuery = { verificationStatus: 'verified' };
    
    if (query) {
      doctorQuery.$or = [
        { user: { $in: doctorUserIds } },
        { bio: { $regex: nameRegex } }
      ];
    }
    
    if (specialization) {
      doctorQuery.specializations = specialization;
    }

    // Find doctors
    const doctors = await Doctor.find(doctorQuery)
      .populate('user', 'firstName lastName avatar')
      .populate('specializations', 'name')
      .sort({ 'ratings.average': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Doctor.countDocuments(doctorQuery);

    res.status(200).json({
      success: true,
      count: doctors.length,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      doctors
    });
  } catch (error) {
    console.error('Search doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching doctors'
    });
  }
};

// Get patients treated by doctor
export const getPatients = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10, skip = 0, search } = req.query;
    
    // First find unique patients who had appointments with this doctor
    const appointments = await Appointment.find({ 
      doctor: userId,
      status: { $in: ['completed', 'confirmed'] }
    }).select('patient');
    
    const patientIds = [...new Set(appointments.map(apt => apt.patient.toString()))];
    
    // Build query for patients
    let userQuery = { _id: { $in: patientIds } };
    
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      userQuery.$or = [
        { firstName: { $regex: searchRegex } },
        { lastName: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { phone: { $regex: searchRegex } }
      ];
    }
    
    // Find matching users
    const users = await User.find(userQuery)
      .select('_id firstName lastName email phone avatar')
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    // Get patient profiles
    const patients = await Patient.find({
      user: { $in: users.map(u => u._id) }
    });
    
    // Combine user and patient data
    const patientProfiles = users.map(user => {
      const patientProfile = patients.find(p => p.user.toString() === user._id.toString());
      return {
        user,
        patientProfile
      };
    });

    const total = await User.countDocuments(userQuery);

    res.status(200).json({
      success: true,
      count: patientProfiles.length,
      total,
      patients: patientProfiles
    });
  } catch (error) {
    console.error('Get doctor patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patients'
    });
  }
};

// Get doctor reviews
export const getDoctorReviews = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10, skip = 0, status } = req.query;
    
    // Build query
    const query = { doctor: userId };
    if (status) {
      query.status = status;
    }
    
    // Get reviews
    const reviews = await Review.find(query)
      .populate('patient', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Review.countDocuments(query);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      reviews
    });
  } catch (error) {
    console.error('Get doctor reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews'
    });
  }
};

// Respond to review
export const respondToReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { reviewId } = req.params;
    const { responseText, isPublic = true } = req.body;

    if (!responseText) {
      return res.status(400).json({
        success: false,
        message: 'Response text is required'
      });
    }

    // Find review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if review belongs to doctor
    if (review.doctor.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to respond to this review'
      });
    }

    // Add response
    review.response = {
      text: responseText,
      respondedAt: new Date(),
      isPublic
    };

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Response added successfully',
      review
    });
  } catch (error) {
    console.error('Respond to review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error responding to review'
    });
  }
};

// Get prescriptions
export const getPrescriptions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10, skip = 0, status } = req.query;
    
    // Build query
    const query = { doctor: userId };
    if (status) {
      query.status = status;
    }
    
    // Get prescriptions
    const prescriptions = await Prescription.find(query)
      .populate('patient', 'firstName lastName email')
      .sort({ prescriptionDate: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Prescription.countDocuments(query);

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      total,
      prescriptions
    });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching prescriptions'
    });
  }
};
