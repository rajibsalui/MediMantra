import {LabTest} from '../models/labTest.model.js';
import Appointment from '../models/appointment.model.js';
import MedicalRecord from '../models/medicalRecord.model.js';
import Notification from '../models/notification.model.js';
import { User } from '../models/user.model.js';
import crypto from 'crypto';

// Create a new lab test
export const createLabTest = async (req, res) => {
  try {
    const {
      patientId,
      testType,
      instructions,
      notes,
      appointmentId,
      medicalRecordId
    } = req.body;
    
    const requestedBy = req.user._id;
    
    // Validate required fields
    if (!patientId || !testType) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID and test type are required'
      });
    }
    
    // Check if user is authorized to request lab tests
    if (!['doctor', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only doctors and admins can request lab tests'
      });
    }
    
    // Generate unique test ID
    const testId = crypto.randomBytes(4).toString('hex').toUpperCase();
    
    // Create lab test
    const labTest = await LabTest.create({
      testId,
      patient: patientId,
      requestedBy,
      testType,
      instructions,
      notes,
      appointment: appointmentId,
      medicalRecord: medicalRecordId,
      status: 'pending'
    });
    
    // If appointment is provided, link lab test to it
    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, {
        $push: { labTests: labTest._id }
      });
    }
    
    // If medical record is provided, link lab test to it
    if (medicalRecordId) {
      await MedicalRecord.findByIdAndUpdate(medicalRecordId, {
        $push: { labTests: labTest._id }
      });
    }
    
    // Notify patient
    await Notification.createNotification({
      recipient: patientId,
      sender: requestedBy,
      type: 'lab_test_requested',
      title: 'Lab Test Requested',
      message: `A new ${testType} lab test has been requested for you`,
      relatedDocument: {
        model: 'LabTest',
        id: labTest._id
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Lab test requested successfully',
      labTest
    });
  } catch (error) {
    console.error('Create lab test error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating lab test',
      error: error.message
    });
  }
};

// Get lab test by ID
export const getLabTestById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Find lab test
    const labTest = await LabTest.findById(id)
      .populate('patient', 'firstName lastName')
      .populate('requestedBy', 'firstName lastName role')
      .populate('performedBy', 'firstName lastName role')
      .populate('verifiedBy', 'firstName lastName role');
    
    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }
    
    // Check authorization
    const isAuthorized = 
      labTest.patient.toString() === userId.toString() ||
      labTest.requestedBy._id.toString() === userId.toString() ||
      ['admin', 'lab'].includes(req.user.role);
    
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this lab test'
      });
    }
    
    res.status(200).json({
      success: true,
      labTest
    });
  } catch (error) {
    console.error('Get lab test error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lab test',
      error: error.message
    });
  }
};

// Get lab tests for patient
export const getLabTestsForPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status, limit = 10, skip = 0 } = req.query;
    const userId = req.user._id;
    
    // Check authorization
    if (
      userId.toString() !== patientId &&
      !['admin', 'doctor', 'lab'].includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view these lab tests'
      });
    }
    
    // If doctor, check if they requested the tests
    if (req.user.role === 'doctor') {
      const hasRequestedTests = await LabTest.exists({
        patient: patientId,
        requestedBy: userId
      });
      
      if (!hasRequestedTests) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to view lab tests for this patient'
        });
      }
    }
    
    // Build query
    const query = { patient: patientId };
    if (status) {
      query.status = status;
    }
    
    // Get lab tests
    const labTests = await LabTest.find(query)
      .populate('requestedBy', 'firstName lastName role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await LabTest.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: labTests.length,
      total,
      labTests
    });
  } catch (error) {
    console.error('Get patient lab tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lab tests',
      error: error.message
    });
  }
};

// Get pending lab tests for lab
export const getPendingLabTests = async (req, res) => {
  try {
    const { limit = 10, skip = 0 } = req.query;
    
    // Check if user is lab technician or admin
    if (!['lab', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only lab technicians and admins can access pending lab tests'
      });
    }
    
    // Get pending lab tests
    const labTests = await LabTest.find({ status: 'pending' })
      .populate('patient', 'firstName lastName')
      .populate('requestedBy', 'firstName lastName role')
      .sort({ createdAt: 1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await LabTest.countDocuments({ status: 'pending' });
    
    res.status(200).json({
      success: true,
      count: labTests.length,
      total,
      labTests
    });
  } catch (error) {
    console.error('Get pending lab tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending lab tests',
      error: error.message
    });
  }
};

// Update lab test status and add results
export const updateLabTestResults = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, results, remarks } = req.body;
    const userId = req.user._id;
    
    // Validate inputs
    if (!status || !['in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required'
      });
    }
    
    if (status === 'completed' && !results) {
      return res.status(400).json({
        success: false,
        message: 'Results are required when status is completed'
      });
    }
    
    // Find lab test
    const labTest = await LabTest.findById(id);
    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }
    
    // Check authorization (only lab technician or admin can update)
    if (!['lab', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only lab technicians and admins can update lab test results'
      });
    }
    
    // Update lab test
    labTest.status = status;
    
    if (status === 'in_progress' && !labTest.startedAt) {
      labTest.startedAt = new Date();
      labTest.performedBy = userId;
    }
    
    if (status === 'completed') {
      labTest.completedAt = new Date();
      labTest.results = results;
      labTest.performedBy = userId;
      labTest.remarks = remarks;
    }
    
    if (status === 'cancelled') {
      labTest.cancellationReason = remarks;
    }
    
    await labTest.save();
    
    // Notify patient and requesting doctor
    if (status === 'completed') {
      // Notify patient
      await Notification.createNotification({
        recipient: labTest.patient,
        sender: userId,
        type: 'lab_test_completed',
        title: 'Lab Test Results Available',
        message: `Your ${labTest.testType} test results are now available`,
        relatedDocument: {
          model: 'LabTest',
          id: labTest._id
        }
      });
      
      // Notify requesting doctor
      if (labTest.requestedBy) {
        await Notification.createNotification({
          recipient: labTest.requestedBy,
          sender: userId,
          type: 'lab_test_completed',
          title: 'Lab Test Results Available',
          message: `Lab test results for patient are now available`,
          relatedDocument: {
            model: 'LabTest',
            id: labTest._id
          }
        });
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Lab test ${status === 'completed' ? 'completed with results' : status}`,
      labTest
    });
  } catch (error) {
    console.error('Update lab test results error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating lab test',
      error: error.message
    });
  }
};

// Verify lab test results
export const verifyLabTestResults = async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationNotes } = req.body;
    const userId = req.user._id;
    
    // Find lab test
    const labTest = await LabTest.findById(id);
    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }
    
    // Check if test is completed
    if (labTest.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Only completed lab tests can be verified'
      });
    }
    
    // Check authorization (only doctor or admin can verify)
    if (!['doctor', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only doctors and admins can verify lab test results'
      });
    }
    
    // Update lab test
    labTest.isVerified = true;
    labTest.verifiedBy = userId;
    labTest.verifiedAt = new Date();
    labTest.verificationNotes = verificationNotes;
    
    await labTest.save();
    
    res.status(200).json({
      success: true,
      message: 'Lab test results verified',
      labTest
    });
  } catch (error) {
    console.error('Verify lab test error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying lab test',
      error: error.message
    });
  }
};

// Get lab test statistics
export const getLabTestStatistics = async (req, res) => {
  try {
    // Check authorization (only admin or lab manager can access)
    if (!['admin', 'lab'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access lab test statistics'
      });
    }
    
    // Get test counts by status
    const statusCounts = await LabTest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Get test counts by type
    const typeCounts = await LabTest.aggregate([
      { $group: { _id: '$testType', count: { $sum: 1 } } }
    ]);
    
    // Get monthly test counts
    const monthlyStats = await LabTest.aggregate([
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Calculate average completion time
    const completedTests = await LabTest.find({
      status: 'completed',
      startedAt: { $exists: true },
      completedAt: { $exists: true }
    });
    
    let averageCompletionTime = 0;
    if (completedTests.length > 0) {
      const totalCompletionTime = completedTests.reduce((sum, test) => {
        return sum + (test.completedAt - test.startedAt) / (1000 * 60); // in minutes
      }, 0);
      averageCompletionTime = totalCompletionTime / completedTests.length;
    }
    
    res.status(200).json({
      success: true,
      statistics: {
        statusCounts: statusCounts.reduce((obj, item) => {
          obj[item._id] = item.count;
          return obj;
        }, {}),
        typeCounts,
        monthlyStats,
        averageCompletionTime
      }
    });
  } catch (error) {
    console.error('Get lab test statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lab test statistics',
      error: error.message
    });
  }
};
