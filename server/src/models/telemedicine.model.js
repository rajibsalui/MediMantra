import mongoose from 'mongoose';

const telemedicineSessionSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scheduledStartTime: {
    type: Date,
    required: true
  },
  scheduledEndTime: {
    type: Date,
    required: true
  },
  actualStartTime: Date,
  actualEndTime: Date,
  duration: Number, // in minutes
  sessionId: {
    type: String,
    unique: true
  },
  sessionType: {
    type: String,
    enum: ['video', 'audio', 'chat'],
    default: 'video'
  },
  status: {
    type: String,
    enum: ['scheduled', 'waiting_room', 'in_progress', 'completed', 'cancelled', 'missed', 'rescheduled', 'technical_issue'],
    default: 'scheduled'
  },
  patientJoinedAt: Date,
  doctorJoinedAt: Date,
  meetingUrl: String,
  accessCode: String,
  providerPlatform: {
    type: String,
    enum: ['internal', 'zoom', 'google_meet', 'ms_teams', 'webex', 'other'],
    default: 'internal'
  },
  platformMetadata: {
    providerId: String,
    hostUrl: String,
    participantUrl: String,
    additionalInfo: Object
  },
  connectionQuality: {
    patient: {
      quality: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor', 'unknown'],
        default: 'unknown'
      },
      issues: [{
        type: String,
        enum: ['audio', 'video', 'network', 'other']
      }]
    },
    doctor: {
      quality: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor', 'unknown'],
        default: 'unknown'
      },
      issues: [{
        type: String,
        enum: ['audio', 'video', 'network', 'other']
      }]
    }
  },
  notes: {
    preSession: String,
    postSession: String,
    technicalIssues: String
  },
  recordings: [{
    url: String,
    startTime: Date,
    endTime: Date,
    size: Number, // in bytes
    format: String,
    accessPermissions: {
      type: String,
      enum: ['doctor_only', 'patient_only', 'both', 'admin_only'],
      default: 'both'
    },
    expiryDate: Date
  }],
  screenShares: [{
    startTime: Date,
    endTime: Date,
    sharedBy: {
      type: String,
      enum: ['doctor', 'patient']
    }
  }],
  chatMessages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    senderRole: {
      type: String,
      enum: ['doctor', 'patient']
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    attachments: [{
      url: String,
      type: String,
      name: String
    }],
    isDeleted: {
      type: Boolean,
      default: false
    }
  }],
  sharedDocuments: [{
    name: String,
    url: String,
    type: String,
    sharedBy: {
      type: String,
      enum: ['doctor', 'patient']
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  prescriptionGenerated: {
    type: Boolean,
    default: false
  },
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  },
  feedback: {
    patientFeedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comments: String,
      audioQuality: {
        type: Number,
        min: 1,
        max: 5
      },
      videoQuality: {
        type: Number,
        min: 1,
        max: 5
      },
      issues: [String]
    },
    doctorFeedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comments: String,
      audioQuality: {
        type: Number,
        min: 1,
        max: 5
      },
      videoQuality: {
        type: Number,
        min: 1,
        max: 5
      },
      issues: [String]
    }
  },
  followUpRecommended: {
    type: Boolean,
    default: false
  },
  followUpDetails: {
    timeframe: String,
    reason: String,
    type: {
      type: String,
      enum: ['in_person', 'telemedicine', 'either'],
      default: 'either'
    }
  },
  cancelledBy: {
    type: String,
    enum: ['patient', 'doctor', 'system', 'admin']
  },
  cancellationReason: String,
  cancellationDate: Date,
  technicalSupportRequested: {
    type: Boolean,
    default: false
  },
  technicalSupportDetails: {
    requestedBy: {
      type: String,
      enum: ['patient', 'doctor']
    },
    issue: String,
    resolvedAt: Date,
    resolvedBy: String
  },
  patientDeviceInfo: {
    deviceType: String,
    browser: String,
    operatingSystem: String,
    ipAddress: String
  },
  doctorDeviceInfo: {
    deviceType: String,
    browser: String,
    operatingSystem: String,
    ipAddress: String
  },
  sessionMetrics: {
    totalBytes: Number,
    averageBitrate: Number,
    packetLoss: Number,
    latency: Number
  }
}, { timestamps: true });

// Indexes for efficient querying
telemedicineSessionSchema.index({ patient: 1, scheduledStartTime: -1 });
telemedicineSessionSchema.index({ doctor: 1, scheduledStartTime: -1 });
telemedicineSessionSchema.index({ appointment: 1 });
telemedicineSessionSchema.index({ status: 1 });
telemedicineSessionSchema.index({ sessionId: 1 }, { unique: true });

// Method to start session
telemedicineSessionSchema.methods.startSession = async function(role) {
  if (this.status !== 'scheduled' && this.status !== 'waiting_room') {
    throw new Error(`Cannot start session in ${this.status} status`);
  }
  
  const now = new Date();
  
  if (role === 'doctor') {
    this.doctorJoinedAt = now;
    this.status = this.patientJoinedAt ? 'in_progress' : 'waiting_room';
  } else if (role === 'patient') {
    this.patientJoinedAt = now;
    this.status = this.doctorJoinedAt ? 'in_progress' : 'waiting_room';
  }
  
  if (this.status === 'in_progress') {
    this.actualStartTime = now;
  }
  
  await this.save();
  return this;
};

// Method to end session
telemedicineSessionSchema.methods.endSession = async function() {
  if (this.status !== 'in_progress') {
    throw new Error(`Cannot end session in ${this.status} status`);
  }
  
  const now = new Date();
  this.status = 'completed';
  this.actualEndTime = now;
  
  // Calculate duration in minutes
  if (this.actualStartTime) {
    const durationMs = now.getTime() - this.actualStartTime.getTime();
    this.duration = Math.round(durationMs / 60000); // Convert to minutes
  }
  
  await this.save();
  return this;
};

// Method to cancel session
telemedicineSessionSchema.methods.cancelSession = async function(cancelledBy, reason) {
  if (this.status === 'completed' || this.status === 'cancelled') {
    throw new Error(`Cannot cancel session in ${this.status} status`);
  }
  
  this.status = 'cancelled';
  this.cancelledBy = cancelledBy;
  this.cancellationReason = reason;
  this.cancellationDate = new Date();
  
  await this.save();
  return this;
};

// Method to add chat message
telemedicineSessionSchema.methods.addChatMessage = async function(senderId, senderRole, message, attachments = []) {
  this.chatMessages.push({
    sender: senderId,
    senderRole,
    message,
    attachments,
    timestamp: new Date()
  });
  
  await this.save();
  return this;
};

// Method to add patient feedback
telemedicineSessionSchema.methods.addPatientFeedback = async function(feedback) {
  this.feedback.patientFeedback = feedback;
  await this.save();
  return this;
};

// Method to add doctor feedback
telemedicineSessionSchema.methods.addDoctorFeedback = async function(feedback) {
  this.feedback.doctorFeedback = feedback;
  await this.save();
  return this;
};

// Method to report technical issue
telemedicineSessionSchema.methods.reportTechnicalIssue = async function(role, issue) {
  this.technicalSupportRequested = true;
  this.technicalSupportDetails = {
    requestedBy: role,
    issue,
  };
  
  if (this.status === 'in_progress') {
    this.status = 'technical_issue';
  }
  
  await this.save();
  return this;
};

// Static method to find upcoming sessions for a doctor
telemedicineSessionSchema.statics.findUpcomingForDoctor = function(doctorId) {
  const now = new Date();
  return this.find({
    doctor: doctorId,
    scheduledStartTime: { $gt: now },
    status: { $in: ['scheduled', 'waiting_room'] }
  })
  .sort({ scheduledStartTime: 1 })
  .populate('patient', 'firstName lastName email phone')
  .populate('appointment');
};

// Static method to find upcoming sessions for a patient
telemedicineSessionSchema.statics.findUpcomingForPatient = function(patientId) {
  const now = new Date();
  return this.find({
    patient: patientId,
    scheduledStartTime: { $gt: now },
    status: { $in: ['scheduled', 'waiting_room'] }
  })
  .sort({ scheduledStartTime: 1 })
  .populate('doctor', 'firstName lastName email specializations')
  .populate('appointment');
};

// Static method to generate session report
telemedicineSessionSchema.statics.generateSessionReport = async function(sessionId) {
  const session = await this.findById(sessionId)
    .populate('patient', 'firstName lastName email phone')
    .populate('doctor', 'firstName lastName email specializations')
    .populate('appointment')
    .populate('prescriptionId');
  
  if (!session) {
    throw new Error('Session not found');
  }
  
  // This would generate a proper report in a real implementation
  // For demonstration, we'll just return session data
  return {
    sessionId: session.sessionId,
    patient: `${session.patient.firstName} ${session.patient.lastName}`,
    doctor: `Dr. ${session.doctor.firstName} ${session.doctor.lastName}`,
    date: session.scheduledStartTime,
    duration: session.duration || 0,
    status: session.status,
    sessionType: session.sessionType,
    prescription: session.prescriptionId,
    notes: session.notes.postSession,
    followUp: session.followUpRecommended ? session.followUpDetails : null
  };
};

export default mongoose.model('TelemedicineSession', telemedicineSessionSchema);
