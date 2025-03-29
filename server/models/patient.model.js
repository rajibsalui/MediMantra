import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const patientSchema = new mongoose.Schema(
  {
    // Basic Personal Information
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        'Please provide a valid email address',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false, // Don't return password in query results
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
      default: 'Unknown',
    },

    // Address Information
    address: {
      street: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      postalCode: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        default: 'India',
        trim: true,
      },
    },

    // Medical Information
    height: {
      value: { type: Number },
      unit: { type: String, enum: ['cm', 'ft'], default: 'cm' },
    },
    weight: {
      value: { type: Number },
      unit: { type: String, enum: ['kg', 'lb'], default: 'kg' },
    },
    allergies: [String],
    chronicConditions: [String],
    medications: [
      {
        name: String,
        dosage: String,
        frequency: String,
        startDate: Date,
        endDate: Date,
      },
    ],
    
    // Emergency Contact
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
    
    // Insurance Information
    insurance: {
      provider: String,
      policyNumber: String,
      expiryDate: Date,
    },
    
    // Account Status and Verification
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    phoneVerificationToken: String,
    phoneVerificationExpires: Date,
    
    // Password Reset
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    
    // Account Activity
    lastLogin: Date,
    profilePicture: String,
    
    // Medical Records (References)
    appointments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    }],
    prescriptions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription',
    }],
    medicalRecords: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalRecord',
    }],
    
    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      default: 'patient',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
patientSchema.index({ email: 1 });
patientSchema.index({ phone: 1 });
patientSchema.index({ 'address.city': 1, 'address.state': 1 });

// Pre-save middleware to hash password
patientSchema.pre('save', async function (next) {
  // Only hash the password if it's modified or new
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
patientSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate email verification token
patientSchema.methods.generateEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
    
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return verificationToken;
};

// Method to generate password reset token
patientSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Virtual for full name
patientSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Calculate age based on date of birth
patientSchema.virtual('age').get(function () {
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

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;