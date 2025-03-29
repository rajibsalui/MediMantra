import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say', '']
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown', ''],
    default: 'unknown'
  },
  height: {
    value: Number,
    unit: {
      type: String,
      enum: ['cm', 'ft', ''],
      default: 'cm'
    }
  },
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['kg', 'lb', ''],
      default: 'kg'
    }
  },
  address: {
    street: {
      type: String,
      required: function() {
        // Only required if any other address field is provided
        return this.address && (
          this.address.city || 
          this.address.state || 
          this.address.zipCode
        );
      }
    },
    city: {
      type: String,
      required: function() {
        return this.address && (
          this.address.street || 
          this.address.state || 
          this.address.zipCode
        );
      }
    },
    state: {
      type: String,
      required: function() {
        return this.address && (
          this.address.street || 
          this.address.city || 
          this.address.zipCode
        );
      }
    },
    zipCode: {
      type: String,
      required: function() {
        return this.address && (
          this.address.street || 
          this.address.city || 
          this.address.state
        );
      }
    },
    country: {
      type: String,
      default: 'United States'
    }
  },
  contactPreference: {
    type: String,
    enum: ['email', 'phone', 'both'],
    default: 'email'
  },
  emergencyContact: {
    name: {
      type: String,
      required: function() {
        // Only required if any other emergency contact field is provided
        return this.emergencyContact && (
          this.emergencyContact.phone || 
          this.emergencyContact.relationship
        );
      }
    },
    phone: {
      type: String,
      required: function() {
        return this.emergencyContact && (
          this.emergencyContact.name || 
          this.emergencyContact.relationship
        );
      }
    },
    relationship: {
      type: String,
      required: function() {
        return this.emergencyContact && (
          this.emergencyContact.name || 
          this.emergencyContact.phone
        );
      }
    }
  },
  allergies: [String],
  chronicConditions: [String],
  currentMedications: [String],
  familyMedicalHistory: [String],
  surgicalHistory: [String],
  immunizationHistory: [String],
  preferredPharmacy: {
    name: String,
    address: String,
    phone: String
  },
  insuranceInfo: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    primaryInsured: String,
    relationship: String,
    coverageStartDate: Date,
    coverageEndDate: Date
  },
  primaryCarePhysician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  lastCheckup: Date,
  medicalRecords: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRecord'
  }]
}, { timestamps: true });

// Add indexes for efficient queries
patientSchema.index({ user: 1 }, { unique: true });
patientSchema.index({ dateOfBirth: 1 });
patientSchema.index({ primaryCarePhysician: 1 });
patientSchema.index({ 'allergies': 1 });

// Virtual for age calculation
patientSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Method to check if patient profile is complete
patientSchema.methods.isProfileComplete = function() {
  const requiredFields = [
    'dateOfBirth', 
    'gender', 
    'address.street',
    'address.city', 
    'address.state', 
    'address.zipCode',
    'emergencyContact.name',
    'emergencyContact.phone'
  ];
  
  for (const field of requiredFields) {
    const value = field.split('.').reduce((obj, path) => obj && obj[path], this);
    if (!value) return false;
  }
  
  return true;
};

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;
