import mongoose from 'mongoose';
import Prescription from '../models/prescription.model.js';
import Doctor from '../models/doctor.model.js';
import Patient from '../models/patient.model.js';
import Appointment from '../models/appointment.model.js';
import { generatePrescriptionPDF } from '../utils/pdfGenerator.js';
import { sendEmail } from '../utils/email.js';

/**
 * @desc    Create a new prescription
 * @route   POST /api/prescriptions
 * @access  Private (Doctor only)
 */
export const createPrescription = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      patientId,
      appointmentId,
      medications,
      diagnosis,
      notes,
      startDate,
      endDate
    } = req.body;
    
    // Validate required fields
    if (!patientId || !medications || medications.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID and at least one medication are required'
      });
    }
    
    // Get doctor
    const doctor = await Doctor.findOne({ user: userId }).populate('user');
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }
    
    // Get patient
    const patient = await Patient.findById(patientId).populate('user');
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    // Create prescription
    const prescription = new Prescription({
      doctor: doctor._id,
      patient: patientId,
      appointment: appointmentId || null,
      medications,
      diagnosis,
      notes,
      startDate: startDate || new Date(),
      endDate: endDate || null, // Will be set to default in pre-save hook if null
      status: 'active'
    });
    
    // Save prescription
    await prescription.save();
    
    // Generate PDF
    const pdfFile = await generatePrescriptionPDF(prescription, doctor, patient);
    
    // Update prescription with file URL
    prescription.fileUrl = pdfFile.url;
    prescription.fileId = pdfFile.public_id;
    await prescription.save();
    
    // If prescription is linked to an appointment, update the appointment
    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, {
        prescription: prescription._id
      });
    }
    
    // Send email notification to patient
    if (patient.user.email) {
      try {
        await sendEmail({
          email: patient.user.email,
          subject: 'New Prescription Available',
          message: `Dr. ${doctor.user.firstName} ${doctor.user.lastName} has prescribed you new medication. Please log in to your account to view and download your prescription.`,
          html: `
            <h1>New Prescription Available</h1>
            <p>Dear ${patient.user.firstName},</p>
            <p>Dr. ${doctor.user.firstName} ${doctor.user.lastName} has prescribed you new medication.</p>
            <p>Please log in to your account to view and download your prescription.</p>
            <p>Prescription details:</p>
            <ul>
              <li>Date: ${new Date(prescription.createdAt).toLocaleDateString()}</li>
              <li>Medications: ${prescription.medications.map(med => med.name).join(', ')}</li>
              <li>Valid until: ${new Date(prescription.endDate).toLocaleDateString()}</li>
            </ul>
            <p>Thank you for choosing MediMantra Healthcare.</p>
          `
        });
      } catch (emailError) {
        console.error('Error sending prescription email:', emailError);
        // Continue even if email fails
      }
    }
    
    res.status(201).json({
      success: true,
      data: prescription,
      message: 'Prescription created successfully'
    });
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get all prescriptions for a doctor
 * @route   GET /api/prescriptions/doctor
 * @access  Private (Doctor only)
 */
export const getDoctorPrescriptions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, search, limit = 10, page = 1 } = req.query;
    
    // Get doctor
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }
    
    // Build query
    const query = { doctor: doctor._id };
    
    // Filter by status if provided
    if (status && ['active', 'completed', 'cancelled'].includes(status)) {
      query.status = status;
    }
    
    // Search functionality
    if (search) {
      // Get patients matching the search term
      const patients = await Patient.find({
        $or: [
          { 'user.firstName': { $regex: search, $options: 'i' } },
          { 'user.lastName': { $regex: search, $options: 'i' } }
        ]
      }).populate('user');
      
      const patientIds = patients.map(patient => patient._id);
      
      // Add patient IDs to query
      if (patientIds.length > 0) {
        query.patient = { $in: patientIds };
      } else {
        // If no patients match, search in medications or diagnosis
        query.$or = [
          { 'medications.name': { $regex: search, $options: 'i' } },
          { diagnosis: { $regex: search, $options: 'i' } }
        ];
      }
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get prescriptions
    const prescriptions = await Prescription.find(query)
      .populate({
        path: 'patient',
        select: 'user',
        populate: {
          path: 'user',
          select: 'firstName lastName profileImage'
        }
      })
      .populate('appointment')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await Prescription.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        prescriptions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error getting doctor prescriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get a single prescription
 * @route   GET /api/prescriptions/:id
 * @access  Private (Doctor or Patient)
 */
export const getPrescription = async (req, res) => {
  try {
    const userId = req.user.id;
    const prescriptionId = req.params.id;
    
    // Get user role
    const user = await mongoose.model('User').findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get prescription
    const prescription = await Prescription.findById(prescriptionId)
      .populate({
        path: 'doctor',
        select: 'user specialties registrationNumber registrationCouncil clinicDetails',
        populate: {
          path: 'user',
          select: 'firstName lastName profileImage'
        }
      })
      .populate({
        path: 'patient',
        select: 'user',
        populate: {
          path: 'user',
          select: 'firstName lastName profileImage'
        }
      })
      .populate('appointment');
    
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }
    
    // Check authorization
    if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: userId });
      if (!doctor || prescription.doctor._id.toString() !== doctor._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this prescription'
        });
      }
    } else if (user.role === 'patient') {
      const patient = await Patient.findOne({ user: userId });
      if (!patient || prescription.patient._id.toString() !== patient._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this prescription'
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    res.status(200).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    console.error('Error getting prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Update prescription status
 * @route   PUT /api/prescriptions/:id/status
 * @access  Private (Doctor only)
 */
export const updatePrescriptionStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const prescriptionId = req.params.id;
    const { status } = req.body;
    
    // Validate status
    if (!status || !['active', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active, completed, or cancelled'
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
    
    // Get prescription
    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }
    
    // Check if doctor is authorized
    if (prescription.doctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this prescription'
      });
    }
    
    // Update status
    prescription.status = status;
    await prescription.save();
    
    res.status(200).json({
      success: true,
      data: prescription,
      message: 'Prescription status updated successfully'
    });
  } catch (error) {
    console.error('Error updating prescription status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Download prescription PDF
 * @route   GET /api/prescriptions/:id/download
 * @access  Private (Doctor or Patient)
 */
export const downloadPrescriptionPDF = async (req, res) => {
  try {
    const userId = req.user.id;
    const prescriptionId = req.params.id;
    
    // Get user role
    const user = await mongoose.model('User').findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get prescription
    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }
    
    // Check authorization
    if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: userId });
      if (!doctor || prescription.doctor.toString() !== doctor._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this prescription'
        });
      }
    } else if (user.role === 'patient') {
      const patient = await Patient.findOne({ user: userId });
      if (!patient || prescription.patient.toString() !== patient._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this prescription'
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    // Check if PDF exists
    if (!prescription.fileUrl) {
      return res.status(404).json({
        success: false,
        message: 'Prescription PDF not found'
      });
    }
    
    // Return the file URL
    res.status(200).json({
      success: true,
      data: {
        fileUrl: prescription.fileUrl
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
