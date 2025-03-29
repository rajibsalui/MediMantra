import Consent from '../models/consent.model.js';
import Notification from '../models/notification.model.js';
import { User } from '../models/user.model.js';

// Create or update consent
export const createOrUpdateConsent = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      consentType,
      expiryDate,
      note
    } = req.body;
    
    const userId = req.user._id;
    
    // Validate required fields
    if (!patientId || !consentType) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID and consent type are required'
      });
    }
    
    // Check if user is authorized (must be the patient, doctor, or admin)
    if (
      userId.toString() !== patientId &&
      (doctorId && userId.toString() !== doctorId) &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to manage this consent'
      });
    }
    
    // Set consent defaults
    const defaultExpiryDate = new Date();
    defaultExpiryDate.setFullYear(defaultExpiryDate.getFullYear() + 1); // 1 year from now
    
    // Check if consent already exists
    let consent = await Consent.findOne({
      patient: patientId,
      doctor: doctorId,
      consentType
    });
    
    if (consent) {
      // Update existing consent
      consent.status = 'granted';
      consent.expiryDate = expiryDate || defaultExpiryDate;
      consent.grantedAt = new Date();
      consent.grantedBy = userId;
      consent.note = note;
    } else {
      // Create new consent
      consent = new Consent({
        patient: patientId,
        doctor: doctorId,
        consentType,
        status: 'granted',
        expiryDate: expiryDate || defaultExpiryDate,
        grantedAt: new Date(),
        grantedBy: userId,
        note
      });
    }
    
    await consent.save();
    
    // Notify the other party
    const isPatientGranting = userId.toString() === patientId;
    if (isPatientGranting && doctorId) {
      await Notification.createNotification({
        recipient: doctorId,
        sender: userId,
        type: 'consent_granted',
        title: 'Consent Granted',
        message: `A patient has granted you consent for ${consentType}`,
        relatedDocument: {
          model: 'Consent',
          id: consent._id
        }
      });
    } else if (!isPatientGranting) {
      await Notification.createNotification({
        recipient: patientId,
        sender: userId,
        type: 'consent_granted',
        title: 'Consent Granted',
        message: `A consent for ${consentType} has been recorded on your behalf`,
        relatedDocument: {
          model: 'Consent',
          id: consent._id
        }
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Consent granted successfully',
      consent
    });
  } catch (error) {
    console.error('Create/update consent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error managing consent',
      error: error.message
    });
  }
};

// Revoke consent
export const revokeConsent = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;
    
    // Find consent
    const consent = await Consent.findById(id);
    if (!consent) {
      return res.status(404).json({
        success: false,
        message: 'Consent not found'
      });
    }
    
    // Check if user is authorized (must be the patient, doctor, or admin)
    if (
      consent.patient.toString() !== userId.toString() &&
      consent.doctor?.toString() !== userId.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to revoke this consent'
      });
    }
    
    // Revoke consent
    consent.status = 'revoked';
    consent.revokedAt = new Date();
    consent.revokedBy = userId;
    consent.revocationReason = reason;
    
    await consent.save();
    
    // Notify the other party
    const isPatientRevoking = consent.patient.toString() === userId.toString();
    if (isPatientRevoking && consent.doctor) {
      await Notification.createNotification({
        recipient: consent.doctor,
        sender: userId,
        type: 'consent_revoked',
        title: 'Consent Revoked',
        message: `A patient has revoked consent for ${consent.consentType}`,
        relatedDocument: {
          model: 'Consent',
          id: consent._id
        }
      });
    } else if (!isPatientRevoking) {
      await Notification.createNotification({
        recipient: consent.patient,
        sender: userId,
        type: 'consent_revoked',
        title: 'Consent Revoked',
        message: `Your consent for ${consent.consentType} has been revoked`,
        relatedDocument: {
          model: 'Consent',
          id: consent._id
        }
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Consent revoked successfully',
      consent
    });
  } catch (error) {
    console.error('Revoke consent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error revoking consent',
      error: error.message
    });
  }
};

// Get consent by ID
export const getConsentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Find consent
    const consent = await Consent.findById(id)
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName')
      .populate('grantedBy', 'firstName lastName role')
      .populate('revokedBy', 'firstName lastName role');
    
    if (!consent) {
      return res.status(404).json({
        success: false,
        message: 'Consent not found'
      });
    }
    
    // Check if user is authorized (must be the patient, doctor, or admin)
    if (
      consent.patient._id.toString() !== userId.toString() &&
      (consent.doctor && consent.doctor._id.toString() !== userId.toString()) &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this consent'
      });
    }
    
    res.status(200).json({
      success: true,
      consent
    });
  } catch (error) {
    console.error('Get consent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching consent',
      error: error.message
    });
  }
};

// Get consents for patient
export const getConsentsForPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status, consentType, limit = 10, skip = 0 } = req.query;
    const userId = req.user._id;
    
    // Check if user is authorized (must be the patient or admin)
    if (
      userId.toString() !== patientId &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view these consents'
      });
    }
    
    // Build query
    const query = { patient: patientId };
    
    if (status) {
      query.status = status;
    }
    
    if (consentType) {
      query.consentType = consentType;
    }
    
    // Get consents
    const consents = await Consent.find(query)
      .populate('doctor', 'firstName lastName specializations')
      .sort({ grantedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Consent.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: consents.length,
      total,
      consents
    });
  } catch (error) {
    console.error('Get patient consents error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching consents',
      error: error.message
    });
  }
};

// Get consents for doctor
export const getConsentsForDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status, consentType, limit = 10, skip = 0 } = req.query;
    const userId = req.user._id;
    
    // Check if user is authorized (must be the doctor or admin)
    if (
      userId.toString() !== doctorId &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view these consents'
      });
    }
    
    // Build query
    const query = { doctor: doctorId };
    
    if (status) {
      query.status = status;
    }
    
    if (consentType) {
      query.consentType = consentType;
    }
    
    // Get consents
    const consents = await Consent.find(query)
      .populate('patient', 'firstName lastName')
      .sort({ grantedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Consent.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: consents.length,
      total,
      consents
    });
  } catch (error) {
    console.error('Get doctor consents error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching consents',
      error: error.message
    });
  }
};

// Check if consent exists
export const checkConsent = async (req, res) => {
  try {
    const { patientId, doctorId, consentType } = req.query;
    
    // Validate required fields
    if (!patientId || !doctorId || !consentType) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID, doctor ID, and consent type are required'
      });
    }
    
    // Check authorization (must be the patient, doctor, or admin)
    if (
      req.user._id.toString() !== patientId &&
      req.user._id.toString() !== doctorId &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to check this consent'
      });
    }
    
    // Check for valid consent
    const consent = await Consent.findOne({
      patient: patientId,
      doctor: doctorId,
      consentType,
      status: 'granted',
      expiryDate: { $gt: new Date() }
    });
    
    res.status(200).json({
      success: true,
      hasConsent: !!consent,
      consent
    });
  } catch (error) {
    console.error('Check consent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking consent',
      error: error.message
    });
  }
};

// Request consent from patient
export const requestConsent = async (req, res) => {
  try {
    const { patientId, consentType, note } = req.body;
    const doctorId = req.user._id;
    
    // Validate required fields
    if (!patientId || !consentType) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID and consent type are required'
      });
    }
    
    // Check if user is a doctor
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can request consent'
      });
    }
    
    // Check if consent already exists
    const existingConsent = await Consent.findOne({
      patient: patientId,
      doctor: doctorId,
      consentType,
      status: 'granted',
      expiryDate: { $gt: new Date() }
    });
    
    if (existingConsent) {
      return res.status(400).json({
        success: false,
        message: 'Consent already exists',
        consent: existingConsent
      });
    }
    
    // Create consent request
    const consent = await Consent.create({
      patient: patientId,
      doctor: doctorId,
      consentType,
      status: 'requested',
      requestedAt: new Date(),
      requestedBy: doctorId,
      note
    });
    
    // Notify patient
    await Notification.createNotification({
      recipient: patientId,
      sender: doctorId,
      type: 'consent_requested',
      title: 'Consent Requested',
      message: `A doctor has requested your consent for ${consentType}`,
      relatedDocument: {
        model: 'Consent',
        id: consent._id
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Consent request sent to patient',
      consent
    });
  } catch (error) {
    console.error('Request consent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error requesting consent',
      error: error.message
    });
  }
};

// Get consent requests for patient
export const getConsentRequestsForPatient = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10, skip = 0 } = req.query;
    
    // Check if user is a patient
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can access their consent requests'
      });
    }
    
    // Get consent requests
    const consentRequests = await Consent.find({
      patient: userId,
      status: 'requested'
    })
      .populate('doctor', 'firstName lastName specializations avatar')
      .sort({ requestedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Consent.countDocuments({
      patient: userId,
      status: 'requested'
    });
    
    res.status(200).json({
      success: true,
      count: consentRequests.length,
      total,
      consentRequests
    });
  } catch (error) {
    console.error('Get consent requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching consent requests',
      error: error.message
    });
  }
};

// Respond to consent request
export const respondToConsentRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { response, note } = req.body; // response should be 'grant' or 'deny'
    const userId = req.user._id;
    
    // Validate response
    if (!response || !['grant', 'deny'].includes(response)) {
      return res.status(400).json({
        success: false,
        message: 'Valid response (grant or deny) is required'
      });
    }
    
    // Find consent request
    const consent = await Consent.findById(id);
    if (!consent) {
      return res.status(404).json({
        success: false,
        message: 'Consent request not found'
      });
    }
    
    // Check if user is the patient
    if (consent.patient.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the patient can respond to this consent request'
      });
    }
    
    // Check if consent is in requested status
    if (consent.status !== 'requested') {
      return res.status(400).json({
        success: false,
        message: `Cannot respond to consent with status "${consent.status}"`
      });
    }
    
    // Update consent based on response
    if (response === 'grant') {
      // Set expiry date to 1 year from now
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      
      consent.status = 'granted';
      consent.grantedAt = new Date();
      consent.grantedBy = userId;
      consent.expiryDate = expiryDate;
      consent.note = note;
    } else {
      consent.status = 'denied';
      consent.deniedAt = new Date();
      consent.deniedBy = userId;
      consent.denialReason = note;
    }
    
    await consent.save();
    
    // Notify doctor
    await Notification.createNotification({
      recipient: consent.doctor,
      sender: userId,
      type: response === 'grant' ? 'consent_granted' : 'consent_denied',
      title: response === 'grant' ? 'Consent Granted' : 'Consent Denied',
      message: response === 'grant' 
        ? `Patient has granted consent for ${consent.consentType}` 
        : `Patient has denied consent for ${consent.consentType}`,
      relatedDocument: {
        model: 'Consent',
        id: consent._id
      }
    });
    
    res.status(200).json({
      success: true,
      message: response === 'grant' ? 'Consent granted successfully' : 'Consent denied successfully',
      consent
    });
  } catch (error) {
    console.error('Respond to consent request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error responding to consent request',
      error: error.message
    });
  }
};

// Get consent types (admin only)
export const getConsentTypes = async (req, res) => {
  try {
    // In a real application, these would be fetched from a database
    // For this example, we'll return predefined types
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can access consent type management'
      });
    }
    
    const consentTypes = [
      {
        id: 'medical_records',
        name: 'Medical Records Access',
        description: 'Allows healthcare providers to access your medical records',
        isRequired: true
      },
      {
        id: 'telemedicine',
        name: 'Telemedicine Services',
        description: 'Consent for receiving healthcare services via telemedicine',
        isRequired: true
      },
      {
        id: 'research',
        name: 'Research Participation',
        description: 'Allows your anonymized data to be used for research purposes',
        isRequired: false
      },
      {
        id: 'communications',
        name: 'Electronic Communications',
        description: 'Consent to receive communications via email, SMS, or other electronic means',
        isRequired: true
      },
      {
        id: 'hipaa',
        name: 'HIPAA Authorization',
        description: 'Authorization for use and disclosure of protected health information',
        isRequired: true
      },
      {
        id: 'treatment',
        name: 'Treatment Consent',
        description: 'General consent for medical treatment',
        isRequired: true
      }
    ];
    
    res.status(200).json({
      success: true,
      consentTypes
    });
  } catch (error) {
    console.error('Get consent types error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching consent types',
      error: error.message
    });
  }
};
