import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
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
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  prescriptionDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  diagnosis: {
    type: String,
    required: [true, "Diagnosis is required"]
  },
  medications: [{
    name: {
      type: String,
      required: true
    },
    dosage: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      required: true
    },
    duration: {
      value: Number,
      unit: {
        type: String,
        enum: ['days', 'weeks', 'months', 'ongoing'],
        default: 'days'
      }
    },
    instructions: String,
    timing: {
      type: String,
      enum: ['before meals', 'after meals', 'with meals', 'empty stomach', 'at bedtime', 'as needed', 'other'],
      default: 'after meals'
    },
    sideEffects: String
  }],
  labTests: [{
    testName: String,
    reason: String,
    urgency: {
      type: String,
      enum: ['routine', 'urgent', 'ASAP'],
      default: 'routine'
    }
  }],
  lifestyle: {
    diet: String,
    exercise: String,
    restrictions: String,
    other: String
  },
  notes: String,
  followUp: {
    required: {
      type: Boolean,
      default: false
    },
    timeframe: {
      value: Number,
      unit: {
        type: String,
        enum: ['days', 'weeks', 'months'],
        default: 'weeks'
      }
    },
    reason: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['issued', 'dispensed', 'completed', 'cancelled'],
    default: 'issued'
  },
  dispensedDate: Date,
  dispenser: {
    name: String,
    pharmacy: String,
    license: String
  },
  digitalSignature: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Indexes for efficient querying
prescriptionSchema.index({ patient: 1, prescriptionDate: -1 });
prescriptionSchema.index({ doctor: 1, prescriptionDate: -1 });

// Virtual for calculating prescription end date (for the longest medication)
prescriptionSchema.virtual('endDate').get(function() {
  if (!this.medications || this.medications.length === 0) return null;
  
  let maxEndDate = null;
  const prescriptionDate = new Date(this.prescriptionDate);
  
  this.medications.forEach(med => {
    if (med.duration.unit === 'ongoing') return;
    
    const endDate = new Date(prescriptionDate);
    if (med.duration.unit === 'days') {
      endDate.setDate(endDate.getDate() + med.duration.value);
    } else if (med.duration.unit === 'weeks') {
      endDate.setDate(endDate.getDate() + (med.duration.value * 7));
    } else if (med.duration.unit === 'months') {
      endDate.setMonth(endDate.getMonth() + med.duration.value);
    }
    
    if (!maxEndDate || endDate > maxEndDate) {
      maxEndDate = endDate;
    }
  });
  
  return maxEndDate;
});

// Method to check if prescription is active
prescriptionSchema.methods.checkActive = function() {
  if (!this.isActive) return false;
  
  const endDate = this.endDate;
  if (!endDate) return true; // Ongoing prescriptions
  
  return new Date() <= endDate;
};

// Method to mark prescription as dispensed
prescriptionSchema.methods.markDispensed = async function(dispenserInfo) {
  this.status = 'dispensed';
  this.dispensedDate = new Date();
  this.dispenser = dispenserInfo;
  
  await this.save();
  return this;
};

// Method to generate a simplified version for patient
prescriptionSchema.methods.generatePatientCopy = function() {
  return {
    doctor: this.doctor,
    prescriptionDate: this.prescriptionDate,
    medications: this.medications.map(med => ({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      duration: med.duration,
      instructions: med.instructions,
      timing: med.timing
    })),
    diagnosis: this.diagnosis,
    lifestyle: this.lifestyle,
    followUp: this.followUp
  };
};

// Static method to find active prescriptions for a patient
prescriptionSchema.statics.findActiveForPatient = function(patientId) {
  return this.find({
    patient: patientId,
    isActive: true,
    status: { $in: ['issued', 'dispensed'] }
  })
  .sort({ prescriptionDate: -1 })
  .populate('doctor', 'firstName lastName specializations');
};

// Static method to check for drug interactions within a prescription
prescriptionSchema.statics.checkInteractions = function(medications) {
  // This would ideally connect to a drug interaction API
  // For demonstration purposes, returning a basic implementation
  const knownInteractions = [
    { drugs: ['warfarin', 'aspirin'], severity: 'high', description: 'Increased risk of bleeding' },
    { drugs: ['simvastatin', 'erythromycin'], severity: 'high', description: 'Increased risk of myopathy' }
    // Add more known interactions here
  ];
  
  const medicationNames = medications.map(m => m.name.toLowerCase());
  const interactions = [];
  
  knownInteractions.forEach(interaction => {
    // Check if the prescription contains both drugs in this interaction
    const matchingDrugs = interaction.drugs.filter(drug => 
      medicationNames.some(med => med.includes(drug))
    );
    
    if (matchingDrugs.length > 1) {
      interactions.push({
        medications: matchingDrugs,
        severity: interaction.severity,
        description: interaction.description
      });
    }
  });
  
  return interactions;
};

export default mongoose.model('Prescription', prescriptionSchema);
