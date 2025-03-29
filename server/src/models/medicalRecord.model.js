import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recordType: {
    type: String,
    enum: ['consultation', 'diagnosis', 'lab_result', 'surgery', 'vaccination', 'allergy', 'chronic_condition', 'hospitalization', 'other'],
    required: true
  },
  recordDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  provider: {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    hospital: String,
    department: String,
    contactInfo: String
  },
  title: {
    type: String,
    required: [true, "Record title is required"]
  },
  description: {
    type: String,
    required: [true, "Record description is required"]
  },
  diagnosis: {
    condition: String,
    icdCode: String, // International Classification of Diseases code
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe', 'critical', 'unknown'],
      default: 'unknown'
    },
    status: {
      type: String,
      enum: ['acute', 'chronic', 'resolved', 'in_remission', 'unknown'],
      default: 'unknown'
    }
  },
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date,
    ongoing: Boolean
  }],
  symptoms: [{
    name: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      default: 'moderate'
    },
    duration: String
  }],
  vitalSigns: {
    temperature: Number, // in Celsius
    bloodPressure: String, // e.g., "120/80"
    heartRate: Number, // beats per minute
    respiratoryRate: Number, // breaths per minute
    oxygenSaturation: Number // percentage
  },
  labResults: [{
    testName: String,
    result: String,
    normalRange: String,
    interpretation: {
      type: String,
      enum: ['normal', 'abnormal', 'critical', 'inconclusive'],
      default: 'normal'
    },
    notes: String,
    performedBy: String,
    performedAt: String
  }],
  images: [{
    type: {
      type: String,
      enum: ['x-ray', 'mri', 'ct_scan', 'ultrasound', 'photo', 'other'],
      default: 'other'
    },
    url: String,
    date: Date,
    description: String
  }],
  documents: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['report', 'prescription', 'discharge_summary', 'referral', 'other'],
      default: 'other'
    },
    date: Date
  }],
  allergies: [{
    allergen: String,
    reaction: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe', 'unknown'],
      default: 'unknown'
    },
    diagnosed: Date
  }],
  procedures: [{
    name: String,
    date: Date,
    surgeon: String,
    hospital: String,
    notes: String,
    outcomeNotes: String
  }],
  followUpNeeded: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  followUpWith: String,
  notes: String,
  isConfidential: {
    type: Boolean,
    default: false
  },
  accessAllowedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

// Indexes for efficient querying
medicalRecordSchema.index({ patient: 1, recordDate: -1 });
medicalRecordSchema.index({ patient: 1, recordType: 1 });
medicalRecordSchema.index({ 'provider.doctor': 1 });

// Virtual for record age
medicalRecordSchema.virtual('recordAge').get(function() {
  const now = new Date();
  const recordDate = new Date(this.recordDate);
  const diffTime = Math.abs(now - recordDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
});

// Method to check if record is accessible to a specific user
medicalRecordSchema.methods.isAccessibleTo = function(userId) {
  // Record is always accessible to the patient
  if (this.patient.toString() === userId.toString()) {
    return true;
  }
  
  // Record is accessible to the provider/doctor
  if (this.provider.doctor && this.provider.doctor.toString() === userId.toString()) {
    return true;
  }
  
  // Record is accessible to users in the accessAllowedTo list
  return this.accessAllowedTo.some(id => id.toString() === userId.toString());
};

// Method to grant access to a user
medicalRecordSchema.methods.grantAccessTo = async function(userId) {
  if (!this.accessAllowedTo.includes(userId)) {
    this.accessAllowedTo.push(userId);
    await this.save();
  }
  return this;
};

// Method to revoke access from a user
medicalRecordSchema.methods.revokeAccessFrom = async function(userId) {
  this.accessAllowedTo = this.accessAllowedTo.filter(id => id.toString() !== userId.toString());
  await this.save();
  return this;
};

// Method to add a lab result
medicalRecordSchema.methods.addLabResult = async function(labResult) {
  this.labResults.push(labResult);
  await this.save();
  return this;
};

// Static method to find all records for a patient
medicalRecordSchema.statics.findAllForPatient = function(patientId) {
  return this.find({ patient: patientId })
    .sort({ recordDate: -1 })
    .populate('provider.doctor', 'firstName lastName specializations');
};

// Static method to find all records created by a doctor
medicalRecordSchema.statics.findAllByDoctor = function(doctorId) {
  return this.find({ 'provider.doctor': doctorId })
    .sort({ recordDate: -1 })
    .populate('patient', 'firstName lastName dateOfBirth gender');
};

export default mongoose.model('MedicalRecord', medicalRecordSchema);
