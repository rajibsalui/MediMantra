import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: [true, "Date of birth is required"]
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    required: [true, "Gender is required"]
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'],
    default: 'unknown'
  },
  height: {
    type: Number, // in cm
    default: null
  },
  weight: {
    type: Number, // in kg
    default: null
  },
  allergies: [{
    type: String,
    trim: true
  }],
  chronicConditions: [{
    type: String,
    trim: true
  }],
  currentMedications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date
  }],
  emergencyContact: {
    name: {
      type: String,
      required: [true, "Emergency contact name is required"]
    },
    relationship: {
      type: String,
      required: [true, "Relationship is required"]
    },
    phone: {
      type: String,
      required: [true, "Emergency contact phone is required"]
    }
  },
  address: {
    street: {
      type: String,
      required: [true, "Street address is required"]
    },
    city: {
      type: String,
      required: [true, "City is required"]
    },
    state: {
      type: String,
      required: [true, "State is required"]
    },
    zipCode: {
      type: String,
      required: [true, "ZIP code is required"]
    },
    country: {
      type: String,
      default: 'India'
    }
  },
  insuranceInfo: {
    provider: String,
    policyNumber: String,
    expiryDate: Date,
    coverageDetails: String
  },
  familyHistory: [{
    condition: String,
    relationship: String
  }],
  lifestyle: {
    smokingStatus: {
      type: String,
      enum: ['never', 'former', 'current', 'unknown'],
      default: 'unknown'
    },
    alcoholConsumption: {
      type: String,
      enum: ['none', 'occasional', 'moderate', 'heavy', 'unknown'],
      default: 'unknown'
    },
    exerciseFrequency: {
      type: String,
      enum: ['none', 'light', 'moderate', 'heavy', 'unknown'],
      default: 'unknown'
    },
    dietType: String
  }
}, { timestamps: true });

// Method to calculate age based on date of birth
patientSchema.methods.getAge = function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Method to calculate BMI if height and weight are available
patientSchema.methods.calculateBMI = function() {
  if (!this.height || !this.weight) return null;
  // BMI = weight(kg) / (height(m))^2
  const heightInMeters = this.height / 100;
  return (this.weight / (heightInMeters * heightInMeters)).toFixed(2);
};

// Static method to find patients with specific chronic conditions
patientSchema.statics.findByChronicCondition = function(condition) {
  return this.find({ chronicConditions: { $regex: new RegExp(condition, 'i') } });
};

export default mongoose.model('Patient', patientSchema);
