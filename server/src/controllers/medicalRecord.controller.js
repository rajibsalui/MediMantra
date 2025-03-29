import MedicalRecord from '../models/medicalRecord.model.js';
import Patient from '../models/patient.model.js';
import { User } from '../models/user.model.js';
import Appointment from '../models/appointment.model.js';
import Consent from '../models/consent.model.js';
import Notification from '../models/notification.model.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a new medical record
export const createMedicalRecord = async (req, res) => {
  try {
    const {
      patientId,
      diagnosis,
      treatment,
      notes,
      referrals,
      followUpInstructions,
      appointmentId
    } = req.body;
    
    const doctorId = req.user._id;
    
    // Validate required fields
    if (!patientId || !diagnosis) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID and diagnosis are required'
      });
    }
    
    // Check if doctor has seen this patient (authorization)
    if (req.user.role === 'doctor') {
      const appointment = await Appointment.findOne({
        doctor: doctorId,
        patient: patientId,
        status: 'completed'
      });
      
      if (!appointment && !appointmentId) {
        return res.status(403).json({
          success: false,
          message: 'You can only create medical records for patients you have treated'
        });
      }
    }
    
    // Create medical record
    const medicalRecord = await MedicalRecord.create({
      patient: patientId,
      doctor: doctorId,
      diagnosis,
      treatment,
      notes,
      referrals,
      followUpInstructions,
      appointment: appointmentId,
      recordDate: new Date(),
      accessControl: {
        isPrivate: true,
        authorizedUsers: [patientId, doctorId]
      }
    });
    
    // If appointment is provided, link medical record to it
    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, {
        $push: { medicalRecords: medicalRecord._id }
      });
    }
    
    // Create notification for patient
    await Notification.createNotification({
      recipient: patientId,
      sender: doctorId,
      type: 'new_medical_record',
      title: 'New Medical Record',
      message: 'A new medical record has been created for you',
      relatedDocument: {
        model: 'MedicalRecord',
        id: medicalRecord._id
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Medical record created successfully',
      medicalRecord
    });
  } catch (error) {
    console.error('Create medical record error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating medical record',
      error: error.message
    });
  }
};

// Get medical record by ID
export const getMedicalRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Find medical record
    const medicalRecord = await MedicalRecord.findById(id)
      .populate('doctor', 'firstName lastName specializations')
      .populate('patient', 'firstName lastName')
      .populate('appointment');
    
    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }
    
    // Check authorization
    const isAuthorized = checkAccess(medicalRecord, userId, req.user.role);
    
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this medical record'
      });
    }
    
    // Log access for auditing
    medicalRecord.accessLog.push({
      user: userId,
      accessedAt: new Date(),
      action: 'view'
    });
    
    await medicalRecord.save();
    
    res.status(200).json({
      success: true,
      medicalRecord
    });
  } catch (error) {
    console.error('Get medical record error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching medical record',
      error: error.message
    });
  }
};

// Update medical record
export const updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user._id;
    
    // Find medical record
    const medicalRecord = await MedicalRecord.findById(id);
    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }
    
    // Check authorization (only doctor who created it or admin can update)
    if (
      medicalRecord.doctor.toString() !== userId.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this medical record'
      });
    }
    
    // Update fields
    const allowedUpdates = ['diagnosis', 'treatment', 'notes', 'referrals', 'followUpInstructions'];
    Object.keys(updates).forEach(update => {
      if (allowedUpdates.includes(update)) {
        medicalRecord[update] = updates[update];
      }
    });
    
    // Add to update history
    medicalRecord.updateHistory.push({
      updatedBy: userId,
      updatedAt: new Date(),
      changes: allowedUpdates.filter(field => updates[field] !== undefined)
    });
    
    await medicalRecord.save();
    
    res.status(200).json({
      success: true,
      message: 'Medical record updated successfully',
      medicalRecord
    });
  } catch (error) {
    console.error('Update medical record error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating medical record',
      error: error.message
    });
  }
};

// Get medical records for patient
export const getMedicalRecordsForPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { limit = 10, skip = 0 } = req.query;
    const userId = req.user._id;
    
    // Check authorization
    if (userId.toString() !== patientId && req.user.role !== 'admin') {
      // If not patient or admin, check if doctor has consent
      if (req.user.role === 'doctor') {
        const hasConsent = await Consent.findOne({
          patient: patientId,
          doctor: userId,
          status: 'granted',
          expiryDate: { $gt: new Date() }
        });
        
        const hasAppointment = await Appointment.findOne({
          doctor: userId,
          patient: patientId,
          status: 'completed'
        });
        
        if (!hasConsent && !hasAppointment) {
          return res.status(403).json({
            success: false,
            message: 'You are not authorized to view medical records for this patient'
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to view these medical records'
        });
      }
    }
    
    // Get medical records
    const medicalRecords = await MedicalRecord.find({ patient: patientId })
      .populate('doctor', 'firstName lastName specializations')
      .sort({ recordDate: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await MedicalRecord.countDocuments({ patient: patientId });
    
    // Filter records based on access control
    const accessibleRecords = medicalRecords.filter(record => 
      checkAccess(record, userId, req.user.role)
    );
    
    res.status(200).json({
      success: true,
      count: accessibleRecords.length,
      total,
      medicalRecords: accessibleRecords
    });
  } catch (error) {
    console.error('Get patient medical records error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching medical records',
      error: error.message
    });
  }
};

// Get medical records for doctor
export const getMedicalRecordsForDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { limit = 10, skip = 0 } = req.query;
    const userId = req.user._id;
    
    // Check authorization (only the doctor themselves or admin can access)
    if (userId.toString() !== doctorId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view these medical records'
      });
    }
    
    // Get medical records
    const medicalRecords = await MedicalRecord.find({ doctor: doctorId })
      .populate('patient', 'firstName lastName')
      .sort({ recordDate: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await MedicalRecord.countDocuments({ doctor: doctorId });
    
    res.status(200).json({
      success: true,
      count: medicalRecords.length,
      total,
      medicalRecords
    });
  } catch (error) {
    console.error('Get doctor medical records error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching medical records',
      error: error.message
    });
  }
};

// Add lab result
export const addLabResult = async (req, res) => {
  try {
    const { id } = req.params;
    const labResult = req.body;
    const userId = req.user._id;
    
    // Validate lab result data
    if (!labResult.testName || !labResult.result) {
      return res.status(400).json({
        success: false,
        message: 'Test name and result are required'
      });
    }
    
    // Find medical record
    const medicalRecord = await MedicalRecord.findById(id);
    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }
    
    // Check authorization (only doctor who created it, lab technician, or admin can add lab result)
    if (
      medicalRecord.doctor.toString() !== userId.toString() &&
      req.user.role !== 'lab' &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to add lab results to this medical record'
      });
    }
    
    // Add lab result
    medicalRecord.labResults.push({
      ...labResult,
      addedBy: userId,
      addedAt: new Date()
    });
    
    await medicalRecord.save();
    
    // Notify patient and doctor
    if (req.user.role === 'lab') {
      await Notification.createNotification({
        recipient: medicalRecord.patient,
        sender: userId,
        type: 'lab_result_added',
        title: 'New Lab Result',
        message: `A new lab result for ${labResult.testName} has been added to your medical record`,
        relatedDocument: {
          model: 'MedicalRecord',
          id: medicalRecord._id
        }
      });
      
      await Notification.createNotification({
        recipient: medicalRecord.doctor,
        sender: userId,
        type: 'lab_result_added',
        title: 'New Lab Result',
        message: `A new lab result for ${labResult.testName} has been added to patient's medical record`,
        relatedDocument: {
          model: 'MedicalRecord',
          id: medicalRecord._id
        }
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Lab result added successfully',
      labResults: medicalRecord.labResults
    });
  } catch (error) {
    console.error('Add lab result error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding lab result',
      error: error.message
    });
  }
};

// Add document to medical record
export const addDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { documentType, description } = req.body;
    const userId = req.user._id;
    
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
    
    // Find medical record
    const medicalRecord = await MedicalRecord.findById(id);
    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }
    
    // Check authorization
    if (
      medicalRecord.doctor.toString() !== userId.toString() &&
      medicalRecord.patient.toString() !== userId.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to add documents to this medical record'
      });
    }
    
    // Add document
    const document = {
      documentType,
      documentUrl: `/uploads/medical-documents/${req.file.filename}`,
      description,
      uploadedBy: userId,
      uploadedAt: new Date(),
      fileSize: req.file.size,
      fileType: req.file.mimetype
    };
    
    medicalRecord.documents.push(document);
    await medicalRecord.save();
    
    res.status(200).json({
      success: true,
      message: 'Document added successfully',
      document
    });
  } catch (error) {
    console.error('Add document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding document',
      error: error.message
    });
  }
};

// Delete document
export const deleteDocument = async (req, res) => {
  try {
    const { id, documentId } = req.params;
    const userId = req.user._id;
    
    // Find medical record
    const medicalRecord = await MedicalRecord.findById(id);
    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }
    
    // Check authorization (only uploader, doctor who created record, or admin can delete)
    const document = medicalRecord.documents.find(doc => doc._id.toString() === documentId);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found in medical record'
      });
    }
    
    if (
      document.uploadedBy.toString() !== userId.toString() &&
      medicalRecord.doctor.toString() !== userId.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this document'
      });
    }
    
    // Remove document file if it exists
    if (document.documentUrl && document.documentUrl.startsWith('/uploads/')) {
      const documentPath = path.join(__dirname, '../..', document.documentUrl);
      if (fs.existsSync(documentPath)) {
        fs.unlinkSync(documentPath);
      }
    }
    
    // Remove document from medical record
    medicalRecord.documents = medicalRecord.documents.filter(doc => doc._id.toString() !== documentId);
    await medicalRecord.save();
    
    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting document',
      error: error.message
    });
  }
};

// Update access control
export const updateAccessControl = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPrivate, authorizedUsers } = req.body;
    const userId = req.user._id;
    
    // Find medical record
    const medicalRecord = await MedicalRecord.findById(id);
    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }
    
    // Check authorization (only doctor who created it, patient, or admin can update access)
    if (
      medicalRecord.doctor.toString() !== userId.toString() &&
      medicalRecord.patient.toString() !== userId.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update access controls for this record'
      });
    }
    
    // Update access control
    if (isPrivate !== undefined) {
      medicalRecord.accessControl.isPrivate = isPrivate;
    }
    
    if (authorizedUsers) {
      // Always include patient and doctor in authorized users
      const essentialUsers = [
        medicalRecord.patient.toString(),
        medicalRecord.doctor.toString()
      ];
      
      // Combine with provided authorized users and remove duplicates
      medicalRecord.accessControl.authorizedUsers = [
        ...new Set([...essentialUsers, ...authorizedUsers])
      ];
    }
    
    await medicalRecord.save();
    
    res.status(200).json({
      success: true,
      message: 'Access control updated successfully',
      accessControl: medicalRecord.accessControl
    });
  } catch (error) {
    console.error('Update access control error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating access control',
      error: error.message
    });
  }
};

// Share medical record with another doctor
export const shareMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctorId, expiryDays = 30 } = req.body;
    const userId = req.user._id;
    
    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID is required'
      });
    }
    
    // Find medical record
    const medicalRecord = await MedicalRecord.findById(id);
    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }
    
    // Check authorization (only patient or admin can share)
    if (
      medicalRecord.patient.toString() !== userId.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Only the patient or admin can share this medical record'
      });
    }
    
    // Verify doctor exists
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);
    
    // Add to shared records
    const alreadyShared = medicalRecord.sharedWith.find(share => 
      share.user.toString() === doctorId
    );
    
    if (alreadyShared) {
      // Update existing share
      alreadyShared.expiryDate = expiryDate;
      alreadyShared.sharedAt = new Date();
    } else {
      // Add new share
      medicalRecord.sharedWith.push({
        user: doctorId,
        sharedBy: userId,
        sharedAt: new Date(),
        expiryDate
      });
      
      // Add to authorized users if record is private
      if (medicalRecord.accessControl.isPrivate) {
        medicalRecord.accessControl.authorizedUsers.push(doctorId);
      }
    }
    
    await medicalRecord.save();
    
    // Notify doctor
    await Notification.createNotification({
      recipient: doctorId,
      sender: userId,
      type: 'medical_record_shared',
      title: 'Medical Record Shared',
      message: `A patient has shared their medical record with you`,
      relatedDocument: {
        model: 'MedicalRecord',
        id: medicalRecord._id
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Medical record shared successfully',
      sharedWith: medicalRecord.sharedWith
    });
  } catch (error) {
    console.error('Share medical record error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sharing medical record',
      error: error.message
    });
  }
};

// Revoke shared access
export const revokeAccess = async (req, res) => {
  try {
    const { id, userId: targetUserId } = req.params;
    const userId = req.user._id;
    
    // Find medical record
    const medicalRecord = await MedicalRecord.findById(id);
    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }
    
    // Check authorization (only patient, sharer or admin can revoke)
    if (
      medicalRecord.patient.toString() !== userId.toString() &&
      req.user.role !== 'admin'
    ) {
      const sharedByUser = medicalRecord.sharedWith.some(share => 
        share.sharedBy.toString() === userId.toString() && 
        share.user.toString() === targetUserId
      );
      
      if (!sharedByUser) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to revoke access to this record'
        });
      }
    }
    
    // Remove from shared records
    medicalRecord.sharedWith = medicalRecord.sharedWith.filter(share => 
      share.user.toString() !== targetUserId
    );
    
    // Remove from authorized users if not the doctor or patient
    if (
      targetUserId !== medicalRecord.doctor.toString() &&
      targetUserId !== medicalRecord.patient.toString()
    ) {
      medicalRecord.accessControl.authorizedUsers = medicalRecord.accessControl.authorizedUsers.filter(
        user => user.toString() !== targetUserId
      );
    }
    
    await medicalRecord.save();
    
    res.status(200).json({
      success: true,
      message: 'Access revoked successfully',
      sharedWith: medicalRecord.sharedWith
    });
  } catch (error) {
    console.error('Revoke access error:', error);
    res.status(500).json({
      success: false,
      message: 'Error revoking access',
      error: error.message
    });
  }
};

// Get access log
export const getAccessLog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Find medical record
    const medicalRecord = await MedicalRecord.findById(id);
    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }
    
    // Check authorization (only doctor who created it, patient, or admin can view log)
    if (
      medicalRecord.doctor.toString() !== userId.toString() &&
      medicalRecord.patient.toString() !== userId.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view access logs for this record'
      });
    }
    
    // Get access logs with user details
    const accessLog = await Promise.all(
      medicalRecord.accessLog.map(async (log) => {
        const user = await User.findById(log.user).select('firstName lastName role');
        return {
          ...log.toObject(),
          user: user ? {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          } : { _id: log.user }
        };
      })
    );
    
    res.status(200).json({
      success: true,
      accessLog
    });
  } catch (error) {
    console.error('Get access log error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching access log',
      error: error.message
    });
  }
};

// Helper function to check if user has access to medical record
const checkAccess = (medicalRecord, userId, userRole) => {
  // Admin always has access
  if (userRole === 'admin') return true;
  
  // Doctor who created the record or patient always has access
  if (
    medicalRecord.doctor.toString() === userId.toString() ||
    medicalRecord.patient.toString() === userId.toString()
  ) {
    return true;
  }
  
  // If record is not private, all healthcare providers have access
  if (!medicalRecord.accessControl.isPrivate && ['doctor', 'nurse', 'lab'].includes(userRole)) {
    return true;
  }
  
  // Check if user is in authorized users list
  if (medicalRecord.accessControl.authorizedUsers.some(id => id.toString() === userId.toString())) {
    return true;
  }
  
  // Check if record is shared with user and not expired
  const shared = medicalRecord.sharedWith.find(share => 
    share.user.toString() === userId.toString() &&
    new Date(share.expiryDate) > new Date()
  );
  
  if (shared) return true;
  
  return false;
};
