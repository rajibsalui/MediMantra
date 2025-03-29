import mongoose from 'mongoose';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

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
    enum: ['patient', 'doctor', 'admin', 'pharmacy', 'laboratory', 'staff'],
    required: [true, "User role is required"],
    default: 'patient'
  },
  authProvider: {
    type: String,
    enum: ['email', 'google', 'facebook', 'apple'],
    default: 'email'
  },
  providerId: {
    type: String,
    sparse: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: null
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  deviceTokens: [{
    token: String,
    device: String,
    lastUsed: Date
  }],
  preferences: {
    language: {
      type: String,
      enum: ['en', 'hi', 'bn', 'te', 'mr', 'ta', 'ur', 'gu', 'kn', 'ml'],
      default: 'en'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: true
      }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    accessibility: {
      fontSize: {
        type: String,
        enum: ['small', 'medium', 'large'],
        default: 'medium'
      },
      reduceMotion: {
        type: Boolean,
        default: false
      },
      highContrast: {
        type: Boolean,
        default: false
      }
    }
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  accountStatus: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'verification_pending', 'deactivated'],
    default: 'active'
  },
  verificationData: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Verification'
  },
  loginAttempts: {
    count: {
      type: Number,
      default: 0
    },
    lastAttempt: Date,
    lockUntil: Date
  },
  resetPassword: {
    token: String,
    expiresAt: Date
  },
  metadata: {
    registrationIP: String,
    registrationSource: String,
    registrationDevice: String
  }
}, { timestamps: true });

// Create a text index for search
userSchema.index({ firstName: 'text', lastName: 'text', email: 'text', username: 'text' });

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

// Generate referral code on new user creation
userSchema.pre("save", function(next) {
  if (this.isNew && !this.referralCode) {
    // Generate a unique 8-character alphanumeric code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.referralCode = code;
  }
  next();
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
      username: this.username,
      role: this.role,
      fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  );
};

// Method to generate JWT refresh token
userSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    {
      _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  );
};

// Method to add device token for push notifications
userSchema.methods.addDeviceToken = async function(token, device) {
  const existingToken = this.deviceTokens.find(dt => dt.token === token);
  
  if (existingToken) {
    existingToken.lastUsed = new Date();
    existingToken.device = device;
  } else {
    this.deviceTokens.push({
      token,
      device,
      lastUsed: new Date()
    });
  }
  
  await this.save();
  return this;
};

// Method to remove device token
userSchema.methods.removeDeviceToken = async function(token) {
  this.deviceTokens = this.deviceTokens.filter(dt => dt.token !== token);
  await this.save();
  return this;
};

// Method to update last seen
userSchema.methods.updateLastSeen = async function() {
  this.lastSeen = new Date();
  await this.save();
  return this;
};

// Method to handle failed login attempt
userSchema.methods.handleFailedLogin = async function() {
  const now = new Date();
  this.loginAttempts.count += 1;
  this.loginAttempts.lastAttempt = now;
  
  // Lock account after 5 consecutive failed attempts
  if (this.loginAttempts.count >= 5) {
    const lockUntil = new Date(now.getTime() + 30 * 60000); // 30 minutes
    this.loginAttempts.lockUntil = lockUntil;
  }
  
  await this.save();
  return this;
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = async function() {
  this.loginAttempts = {
    count: 0,
    lastAttempt: null,
    lockUntil: null
  };
  
  await this.save();
  return this;
};

// Method to check if account is locked
userSchema.methods.isAccountLocked = function() {
  if (!this.loginAttempts.lockUntil) return false;
  
  const now = new Date();
  const isLocked = now < new Date(this.loginAttempts.lockUntil);
  
  // If lock has expired, return false
  if (!isLocked) {
    this.loginAttempts.lockUntil = null;
  }
  
  return isLocked;
};

// Method to generate a password reset token
userSchema.methods.generatePasswordResetToken = async function() {
  // Generate a random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Set token expiry to 1 hour from now
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  
  // Store hashed version of token
  this.resetPassword = {
    token: crypto.createHash('sha256').update(resetToken).digest('hex'),
    expiresAt
  };
  
  await this.save();
  
  // Return non-hashed token for email
  return resetToken;
};

// Static method to find user by email and include password field
userSchema.statics.findByEmailWithPassword = function(email) {
  return this.findOne({ email }).select('+password');
};

// Static method to find verified doctors
userSchema.statics.findVerifiedDoctors = function(limit = 20) {
  return this.find({ 
    role: 'doctor', 
    isEmailVerified: true,
    accountStatus: 'active'
  }).limit(limit);
};

// Static method to find admins
userSchema.statics.findAdmins = function() {
  return this.find({ role: 'admin' });
};

// Static method to search users
userSchema.statics.searchUsers = function(query, limit = 10) {
  return this.find({
    $text: { $search: query },
    isActive: true
  })
  .limit(limit);
};

export const User = mongoose.model('User', userSchema);
