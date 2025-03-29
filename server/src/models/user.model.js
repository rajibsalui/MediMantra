import mongoose from 'mongoose';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    select: false,
    minlength: [8, "Password must be at least 8 characters long"]
  },
  phone: {
    type: String,
    sparse: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  avatar: {
    type: String,
    default: ""
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    required: [true, "User role is required"],
    default: 'patient'
  },
  isEmailVerified: {
    type: Boolean,
    default: true  // Simplified: Emails auto-verified
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  resetPassword: {
    token: String,
    expiresAt: Date
  }
}, { timestamps: true });

// Pre-save hooks
userSchema.pre("save", async function(next) {
  // Only hash the password if it has been modified or is new
  if(!this.isModified("password")) return next();
  
  try {
    // Hash password with 10 rounds of salt
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.firstName || this.username || this.email.split('@')[0];
});

// Method to validate password
userSchema.methods.isPasswordCorrect = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT access token
userSchema.methods.generateAccessToken = function() {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      role: this.role,
      fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET || 'secret-access-key',
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d'
    }
  );
};

// Method to generate JWT refresh token
userSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    {
      _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET || 'secret-refresh-key',
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d'
    }
  );
};

export const User = mongoose.model('User', userSchema);
