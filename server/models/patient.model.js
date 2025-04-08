import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown', ''],
      default: 'unknown',
    },
    height: {
      value: Number,
      unit: {
        type: String,
        enum: ['cm', 'ft', ''],
        default: 'cm',
      },
    },
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['kg', 'lb', ''],
        default: 'kg',
      },
    },
    medicalInformation: {
      allergies: {
        type: String,
        trim: true,
        default: ''
      },
      chronicConditions: {
        type: String,
        trim: true,
        default: ''
      },
      currentMedications: {
        type: String,
        trim: true,
        default: ''
      },
      familyMedicalHistory: {
        type: String,
        trim: true,
        default: ''
      },
      surgicalHistory: {
        type: String,
        trim: true,
        default: ''
      },
      immunizationHistory: {
        type: String,
        trim: true,
        default: ''
      },
    },
    emergencyContact: {
      name: {
        type: String,
        trim: true,
        required: [true, 'Emergency contact name is required']
      },
      phone: {
        type: String,
        trim: true,
        required: [true, 'Emergency contact phone is required'],
        validate: {
          validator: function(v) {
            // Validate phone number format (10 digits)
            return !v || /^\d{10}$/.test(v.replace(/[^\d]/g, ''));
          },
          message: props => `${props.value} is not a valid phone number! Please enter a 10-digit number.`
        }
      },
      relationship: {
        type: String,
        trim: true,
        required: [true, 'Relationship to emergency contact is required']
      },
    },
    preferredPharmacy: {
      name: String,
      address: String,
      phone: String,
    },
    insuranceInfo: {
      provider: String,
      policyNumber: String,
      groupNumber: String,
      primaryInsured: String,
      relationship: String,
      coverageStartDate: Date,
      coverageEndDate: Date,
    },
    primaryCarePhysician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    lastCheckup: Date,
    medicalRecords: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicalRecord',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexing
patientSchema.index({ user: 1 }, { unique: true });

// Virtual for age calculation
patientSchema.virtual('age').get(function () {
  const userRef = this.populated('user');
  if (!userRef || !userRef.dateOfBirth) return null;

  const today = new Date();
  const birthDate = new Date(userRef.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
});

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;