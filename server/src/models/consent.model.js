import mongoose from 'mongoose';

const consentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  consentType: {
    type: String,
    enum: [
      'medical_procedure',
      'data_sharing',
      'research_participation',
      'telehealth',
      'emergency',
      'medication',
      'data_privacy',
      'other'
    ],
    required: true
  },
  consentFor: {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital'
    },
    procedure: String,
    researchStudy: String,
    thirdParty: String,
    description: {
      type: String,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['granted', 'denied', 'revoked', 'expired', 'pending'],
    required: true,
    default: 'pending'
  },
  dateGranted: Date,
  dateExpires: Date,
  dateRevoked: Date,
  termsAccepted: {
    type: Boolean,
    default: false
  },
  termsVersion: String,
  fullDocument: {
    type: String, // URL to the full consent document
  },
  signatureData: {
    signatureImage: String,
    signedBy: String,
    signedByRelationship: {
      type: String,
      enum: ['self', 'parent', 'guardian', 'spouse', 'caregiver', 'other'],
      default: 'self'
    },
    identityVerified: {
      type: Boolean,
      default: false
    },
    verificationMethod: {
      type: String,
      enum: ['id_document', 'biometric', 'email', 'phone', 'in_person', 'other', 'none'],
      default: 'none'
    }
  },
  witnesses: [{
    name: String,
    relationship: String,
    contactInfo: String,
    signature: String,
    date: Date
  }],
  additionalInfo: {
    type: String
  },
  revocationReason: String,
  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isDigitallySigned: {
    type: Boolean,
    default: true
  },
  ipAddress: String,
  deviceInfo: String,
  consentRecordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastReaffirmed: Date,
  documentAccessLog: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    accessDate: {
      type: Date,
      default: Date.now
    },
    reason: String,
    ipAddress: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Indexes for efficient querying
consentSchema.index({ patient: 1, consentType: 1 });
consentSchema.index({ patient: 1, status: 1 });
consentSchema.index({ 'consentFor.doctor': 1 });
consentSchema.index({ 'consentFor.hospital': 1 });
consentSchema.index({ dateGranted: 1 });
consentSchema.index({ dateExpires: 1 });

// Virtual for checking if consent is currently valid
consentSchema.virtual('isValid').get(function() {
  if (this.status !== 'granted') return false;
  
  const now = new Date();
  
  // Check if consent has expired
  if (this.dateExpires && now > this.dateExpires) {
    return false;
  }
  
  // Check if consent has been revoked
  if (this.dateRevoked && now > this.dateRevoked) {
    return false;
  }
  
  return true;
});

// Virtual for time remaining until expiration
consentSchema.virtual('timeRemaining').get(function() {
  if (!this.dateExpires) return null;
  
  const now = new Date();
  if (now > this.dateExpires) return 'Expired';
  
  const diffMs = this.dateExpires - now;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays > 30) {
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths} month${diffMonths === 1 ? '' : 's'}`;
  }
  
  return `${diffDays} day${diffDays === 1 ? '' : 's'}`;
});

// Method to grant consent
consentSchema.methods.grant = async function(signatureData) {
  this.status = 'granted';
  this.dateGranted = new Date();
  this.termsAccepted = true;
  
  if (signatureData) {
    this.signatureData = {
      ...this.signatureData,
      ...signatureData
    };
  }
  
  await this.save();
  return this;
};

// Method to revoke consent
consentSchema.methods.revoke = async function(revokedBy, reason) {
  this.status = 'revoked';
  this.dateRevoked = new Date();
  this.revocationReason = reason;
  this.revokedBy = revokedBy;
  this.isActive = false;
  
  await this.save();
  return this;
};

// Method to extend consent expiration
consentSchema.methods.extend = async function(newExpiryDate) {
  if (this.status !== 'granted') {
    throw new Error('Cannot extend consent that is not granted');
  }
  
  this.dateExpires = newExpiryDate;
  this.lastReaffirmed = new Date();
  
  await this.save();
  return this;
};

// Method to log document access
consentSchema.methods.logAccess = async function(userId, reason, ipAddress) {
  this.documentAccessLog.push({
    user: userId,
    reason,
    ipAddress
  });
  
  await this.save();
  return this;
};

// Static method to find all active consents for a patient
consentSchema.statics.findActiveForPatient = function(patientId) {
  return this.find({
    patient: patientId,
    status: 'granted',
    isActive: true,
    $or: [
      { dateExpires: { $exists: false } },
      { dateExpires: { $gt: new Date() } }
    ]
  })
  .sort({ dateGranted: -1 });
};

// Static method to find consents that need renewal soon
consentSchema.statics.findNearingExpiration = function(daysThreshold = 7) {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
  
  return this.find({
    status: 'granted',
    isActive: true,
    dateExpires: { 
      $exists: true, 
      $ne: null,
      $lte: thresholdDate,
      $gt: new Date()
    }
  })
  .sort({ dateExpires: 1 })
  .populate('patient', 'firstName lastName email phone');
};

export default mongoose.model('Consent', consentSchema);
