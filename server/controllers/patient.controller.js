import mongoose from 'mongoose';
import Patient from '../models/patient.model.js';
import User from '../models/user.model.js';
import Doctor from '../models/doctor.model.js';
import Appointment from '../models/appointment.model.js';
import Message from '../models/message.model.js';
import Conversation from '../models/conversation.model.js';
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

    const { status, page = 1, limit = 10, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { patient: patient._id };

    // Handle special "upcoming" filter
    if (status === 'upcoming') {
      filter.status = 'scheduled'; // Only scheduled appointments
      filter.appointmentDate = { $gte: new Date() }; // Only future dates
    }
    // Handle other status filters
    else if (status) {
      filter.status = status;
    }

    // Add date range filter if provided
    if (startDate && endDate) {
      filter.appointmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      filter.appointmentDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      filter.appointmentDate = { $lte: new Date(endDate) };
    }

    // Get appointments with pagination
    const appointments = await Appointment.find(filter)
      .populate({
        path: 'doctor',
        select: 'user specialties consultationFee videoConsultation',
        populate: {
          path: 'user',
          select: 'firstName lastName email phone profileImage'
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
      // isVerified: true,
      // acceptingNewPatients: true
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
      slot => slot.startTime <= appointmentTime && slot.endTime >= appointmentTime && !slot.isBooked
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

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    // Find user
    const User = mongoose.model('User');
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If user already has a profile image, delete it from Cloudinary
    if (user.profileImageId) {
      await deleteFile(user.profileImageId);
    }

    // Upload file to Cloudinary
    const uploadedImage = await uploadFile(req.file, 'patients/profile-images');

    // Update user profile with new image URL and public_id
    user.profileImage = uploadedImage.url;
    user.profileImageId = uploadedImage.public_id;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        profileImage: user.profileImage
      },
      message: 'Profile image updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile image:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile image',
      error: error.message
    });
  } finally {
    // Clean up temporary file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error deleting temporary file:', err);
      }
    }
  }
};

/**
 * @desc    Get patient medical records
 * @route   GET /api/patients/medical-records
 * @access  Private (Patient only)
 */
export const getPatientMedicalRecords = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find patient
    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    // Initialize medical records object with default empty values
    const medicalRecords = {
      visits: [],
      prescriptions: [],
      testResults: [],
      allergies: patient.allergies || [],
      chronicConditions: patient.chronicConditions || [],
      surgicalHistory: patient.surgicalHistory || [],
      immunizationHistory: patient.immunizationHistory || [],
      documents: []
    };

    // Safely fetch completed appointments/visits
    try {
      medicalRecords.visits = await Appointment.find({
        patient: patient._id,
        status: 'completed'
      })
      .populate({
        path: 'doctor',
        select: 'user specialties',
        populate: {
          path: 'user',
          select: 'firstName lastName profileImage'
        }
      })
      .sort({ appointmentDate: -1 })
      .lean();
    } catch (err) {
      console.error('Error fetching patient visits:', err.message);
      // Continue with empty visits array
    }

    // Safely fetch prescriptions
    try {
      medicalRecords.prescriptions = await mongoose.model('Prescription').find({
        patient: patient._id
      })
      .populate('doctor', 'user')
      .populate({
        path: 'doctor',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      })
      .sort({ createdAt: -1 })
      .lean();
    } catch (err) {
      console.error('Error fetching prescriptions:', err.message);
      // Continue with empty prescriptions array
    }

    // Safely fetch test results
    try {
      medicalRecords.testResults = await mongoose.model('TestResult').find({
        patient: patient._id
      })
      .sort({ testDate: -1 })
      .lean();
    } catch (err) {
      console.error('Error fetching test results:', err.message);
      // Continue with empty test results array
    }

    // Safely fetch medical documents
    try {
      medicalRecords.documents = await mongoose.model('MedicalDocument').find({
        patient: patient._id
      })
      .sort({ uploadDate: -1 })
      .lean();
    } catch (err) {
      console.error('Error fetching medical documents:', err.message);
      // Continue with empty documents array
    }

    res.status(200).json({
      success: true,
      data: medicalRecords
    });
  } catch (error) {
    console.error('Error getting medical records:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Upload medical document
 * @route   POST /api/patients/medical-records/upload
 * @access  Private (Patient only)
 */
export const uploadMedicalDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const { documentType, documentDate, description } = req.body;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a document'
      });
    }

    // Get patient
    const Patient = mongoose.model('Patient');
    const patient = await Patient.findOne({ user: userId });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    // Upload document to Cloudinary
    const uploadedFile = await uploadFile(req.file, 'patients/medical-documents');

    // Create medical record
    const MedicalRecord = mongoose.model('MedicalRecord');
    const medicalRecord = new MedicalRecord({
      patient: patient._id,
      documentType,
      documentDate: new Date(documentDate) || new Date(),
      description,
      fileUrl: uploadedFile.url,
      fileId: uploadedFile.public_id,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      uploadDate: new Date()
    });

    // Save medical record
    await medicalRecord.save();

    // Add to patient's medical records array
    patient.medicalRecords.push(medicalRecord._id);
    await patient.save();

    res.status(201).json({
      success: true,
      data: medicalRecord,
      message: 'Medical document uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading medical document:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading document',
      error: error.message
    });
  } finally {
    // Clean up temporary file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error deleting temporary file:', err);
      }
    }
  }
};

/**
 * @desc    Get patient vital statistics
 * @route   GET /api/patients/vital-stats
 * @access  Private (Patient only)
 */
export const getPatientVitalStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find patient
    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    // Get vital stats from visits - can be expanded with a dedicated model later
    let vitalStats = [];

    try {
      // Check if VitalStat model exists
      vitalStats = await mongoose.model('VitalStat').find({
        patient: patient._id
      })
      .sort({ recordedAt: -1 })
      .limit(20)
      .lean();
    } catch (err) {
      // If model doesn't exist, generate sample data
      console.log('No VitalStat model found or error:', err.message);

      // Generate mock data if no real data exists
      // This will help in testing and initial setup
      const today = new Date();

      // Generate data for the last 6 months
      for (let i = 0; i < 6; i++) {
        const date = new Date(today);
        date.setMonth(date.getMonth() - i);

        vitalStats.push({
          recordedAt: date,
          bloodPressure: {
            systolic: 110 + Math.floor(Math.random() * 20),
            diastolic: 70 + Math.floor(Math.random() * 15)
          },
          heartRate: 70 + Math.floor(Math.random() * 15),
          temperature: 36.5 + (Math.random() * 1.0),
          respiratoryRate: 16 + Math.floor(Math.random() * 4),
          oxygenSaturation: 95 + Math.floor(Math.random() * 4),
          weight: patient.weight?.value || 70 + Math.floor(Math.random() * 10),
          height: patient.height?.value || 170
        });
      }
    }

    // Format vital stats for easier frontend charting
    const formattedVitalStats = {
      labels: vitalStats.map(stat => new Date(stat.recordedAt).toLocaleDateString()),
      datasets: {
        bloodPressure: {
          systolic: vitalStats.map(stat => stat.bloodPressure?.systolic || 0),
          diastolic: vitalStats.map(stat => stat.bloodPressure?.diastolic || 0)
        },
        heartRate: vitalStats.map(stat => stat.heartRate || 0),
        temperature: vitalStats.map(stat => stat.temperature || 0),
        respiratoryRate: vitalStats.map(stat => stat.respiratoryRate || 0),
        oxygenSaturation: vitalStats.map(stat => stat.oxygenSaturation || 0),
        weight: vitalStats.map(stat => stat.weight || 0)
      },
      data: vitalStats // Include raw data
    };

    res.status(200).json({
      success: true,
      data: formattedVitalStats
    });
  } catch (error) {
    console.error('Error getting vital stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Rate doctor after appointment
 * @route   POST /api/patients/doctors/:doctorId/rate
 * @access  Private (Patient only)
 */
export const rateDoctorAfterAppointment = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { rating, comment, appointmentId } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
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

    // Verify the appointment exists and is completed
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctor: doctorId,
      patient: patient._id,
      status: 'completed'
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'No completed appointment found with this doctor'
      });
    }

    // Get doctor profile
    const doctor = await mongoose.model('Doctor').findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
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

    // Update appointment feedback
    appointment.feedback = {
      submitted: true,
      rating,
      comments: comment
    };

    await appointment.save();

    // Update doctor's average rating
    await doctor.updateAverageRating();

    res.status(200).json({
      success: true,
      message: 'Rating submitted successfully',
      data: {
        rating,
        comment
      }
    });
  } catch (error) {
    console.error('Error rating doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Download prescription
 * @route   GET /api/patients/prescriptions/:id/download
 * @access  Private (Patient only)
 */
export const downloadPrescription = async (req, res) => {
  try {
    const userId = req.user.id;
    const prescriptionId = req.params.id;

    // Get patient
    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    // Find prescription and verify it belongs to the patient
    const prescription = await mongoose.model('Prescription').findOne({
      _id: prescriptionId,
      patient: patient._id
    }).populate({
      path: 'doctor',
      select: 'user',
      populate: {
        path: 'user',
        select: 'firstName lastName'
      }
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found or access denied'
      });
    }

    // Return prescription details with download URL
    res.status(200).json({
      success: true,
      data: {
        ...prescription.toJSON(),
        downloadUrl: prescription.fileUrl || null
      }
    });
  } catch (error) {
    console.error('Error downloading prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Search for doctors by name, specialization, or email
 * @route   GET /api/patients/doctors/search
 * @access  Private (Patient only)
 */
export const searchDoctors = async (req, res) => {
  try {
    const { query } = req.query;
    const patientId = req.user._id;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    // Find doctors by name, specialization, or email
    const doctorUsers = await User.find({
      role: 'doctor',
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('_id firstName lastName email profileImage');

    // Get doctor profiles to include specialization
    const doctorIds = doctorUsers.map(user => user._id);
    const doctorProfiles = await Doctor.find({
      user: { $in: doctorIds },
      registrationStatus: 'approved' // Only return approved doctors
    }).select('user specialization');

    // Merge user data with doctor profile data
    const doctors = doctorUsers.map(user => {
      const doctorProfile = doctorProfiles.find(
        profile => profile.user.toString() === user._id.toString()
      );

      return {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImage: user.profileImage,
        specialization: doctorProfile?.specialization || ''
      };
    });

    res.status(200).json({
      success: true,
      data: doctors
    });
  } catch (error) {
    console.error('Error searching doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search doctors',
      error: error.message
    });
  }
};
