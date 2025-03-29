import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import Patient from '../models/patient.model.js';
import { sendEmail } from '../utils/email.js';

// Generate JWT tokens
const generateTokens = (id) => {
  const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });
  
  const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d'
  });
  
  return { accessToken, refreshToken };
};

// Set cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000 // 1 day
};

// Register new patient
export const registerUser = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      password, 
      dateOfBirth, 
      gender 
    } = req.body;
    
    // Check if patient exists
    const patientExists = await Patient.findOne({ email });
    
    if (patientExists) {
      return res.status(400).json({
        success: false,
        message: 'Patient with this email already exists'
      });
    }
    
    // Create new patient
    const patient = await Patient.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      dateOfBirth,
      gender
    });
    
    // Generate verification token
    // const verificationToken = patient.generateEmailVerificationToken();
    // await patient.save();
    
    // Send verification email
    // const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    
    // await sendEmail({
    //   email: patient.email,
    //   subject: 'Email Verification - MediMantra',
    //   message: `Please verify your email by clicking the link: ${verificationUrl}`
    // });
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(patient._id);
    
    // Save refresh token to database
    patient.refreshToken = refreshToken;
    await patient.save();
    
    // Send response with cookie
    res.cookie('accessToken', accessToken, cookieOptions);
    res.status(201).json({
      success: true,
      message: 'Patient registered successfully. Please verify your email.',
      patient: {
        _id: patient._id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phone: patient.phone,
        isEmailVerified: patient.isEmailVerified
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Login patient
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    // Find patient
    const patient = await Patient.findOne({ email }).select('+password');
    
    if (!patient) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if password matches
    const isMatch = await patient.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if patient is active
    if (!patient.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }
    
    // Update last login
    patient.lastLogin = Date.now();
    await patient.save();
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(patient._id);
    
    // Save refresh token to database
    patient.refreshToken = refreshToken;
    await patient.save();
    
    // Send response with cookie
    res.cookie('accessToken', accessToken, cookieOptions);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      patient: {
        _id: patient._id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phone: patient.phone,
        isEmailVerified: patient.isEmailVerified
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Logout patient
export const logoutUser = async (req, res) => {
  try {
    // Get patient from middleware
    const patient = req.user;
    
    // Remove refresh token from database
    patient.refreshToken = undefined;
    await patient.save();
    
    // Clear cookie
    res.clearCookie('accessToken');
    
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
};

// Refresh access token
export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Find patient
    const patient = await Patient.findById(decoded.id);
    
    if (!patient || patient.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
    
    // Generate new access token
    const accessToken = jwt.sign({ id: patient._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });
    
    // Send response with cookie
    res.cookie('accessToken', accessToken, cookieOptions);
    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      accessToken
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Token refresh failed',
      error: error.message
    });
  }
};

// Verify email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }
    
    // Hash the token
    const emailVerificationToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find patient with this token and token not expired
    const patient = await Patient.findOne({
      emailVerificationToken,
      emailVerificationExpires: { $gt: Date.now() }
    });
    
    if (!patient) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }
    
    // Verify email
    patient.isEmailVerified = true;
    patient.emailVerificationToken = undefined;
    patient.emailVerificationExpires = undefined;
    await patient.save();
    
    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email verification failed',
      error: error.message
    });
  }
};

// Resend verification email
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // Find patient
    const patient = await Patient.findOne({ email });
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    if (patient.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }
    
    // Generate verification token
    const verificationToken = patient.generateEmailVerificationToken();
    await patient.save();
    
    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    
    await sendEmail({
      email: patient.email,
      subject: 'Email Verification - MediMantra',
      message: `Please verify your email by clicking the link: ${verificationUrl}`
    });
    
    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send verification email',
      error: error.message
    });
  }
};

// Verify phone
export const verifyPhone = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    
    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required'
      });
    }
    
    // Find patient
    const patient = await Patient.findOne({ phone });
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    // Verify OTP (you would add actual SMS OTP verification here)
    if (patient.phoneVerificationToken !== otp || 
        patient.phoneVerificationExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }
    
    // Verify phone
    patient.isPhoneVerified = true;
    patient.phoneVerificationToken = undefined;
    patient.phoneVerificationExpires = undefined;
    await patient.save();
    
    res.status(200).json({
      success: true,
      message: 'Phone verified successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Phone verification failed',
      error: error.message
    });
  }
};

// Forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // Find patient
    const patient = await Patient.findOne({ email });
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    // Generate reset token
    const resetToken = patient.generatePasswordResetToken();
    await patient.save();
    
    // Send reset email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    
    await sendEmail({
      email: patient.email,
      subject: 'Password Reset - MediMantra',
      message: `You requested a password reset. Please use the following link to reset your password: ${resetUrl}\nIf you didn't request this, please ignore this email.`
    });
    
    res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send password reset email',
      error: error.message
    });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }
    
    // Hash the token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find patient with this token and token not expired
    const patient = await Patient.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!patient) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }
    
    // Set new password
    patient.password = password;
    patient.resetPasswordToken = undefined;
    patient.resetPasswordExpires = undefined;
    await patient.save();
    
    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Password reset failed',
      error: error.message
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    
    // Get patient from middleware with password
    const patient = await Patient.findById(req.user._id).select('+password');
    
    // Check if current password is correct
    const isMatch = await patient.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Set new password
    patient.password = newPassword;
    await patient.save();
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    // Get patient from middleware
    const patient = req.user;
    
    res.status(200).json({
      success: true,
      patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get current user',
      error: error.message
    });
  }
};

// Google OAuth
export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify Google token and get user info
    // This would typically use the Google API client library
    // For now, we'll just simulate it
    
    const { email, firstName, lastName, profilePicture } = req.body; // In a real implementation, these would come from Google
    
    // Check if patient exists
    let patient = await Patient.findOne({ email });
    
    if (!patient) {
      // Create new patient
      patient = await Patient.create({
        firstName,
        lastName,
        email,
        isEmailVerified: true, // Email is verified by Google
        profilePicture
      });
    }
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(patient._id);
    
    // Save refresh token to database
    patient.refreshToken = refreshToken;
    await patient.save();
    
    // Send response with cookie
    res.cookie('accessToken', accessToken, cookieOptions);
    res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      patient: {
        _id: patient._id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        isEmailVerified: patient.isEmailVerified,
        profilePicture: patient.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Google authentication failed',
      error: error.message
    });
  }
};

// Facebook OAuth
export const facebookAuth = async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify Facebook token and get user info
    // This would typically use the Facebook SDK
    // For now, we'll just simulate it
    
    const { email, firstName, lastName, profilePicture } = req.body; // In a real implementation, these would come from Facebook
    
    // Check if patient exists
    let patient = await Patient.findOne({ email });
    
    if (!patient) {
      // Create new patient
      patient = await Patient.create({
        firstName,
        lastName,
        email,
        isEmailVerified: true, // Email is verified by Facebook
        profilePicture
      });
    }
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(patient._id);
    
    // Save refresh token to database
    patient.refreshToken = refreshToken;
    await patient.save();
    
    // Send response with cookie
    res.cookie('accessToken', accessToken, cookieOptions);
    res.status(200).json({
      success: true,
      message: 'Facebook authentication successful',
      patient: {
        _id: patient._id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        isEmailVerified: patient.isEmailVerified,
        profilePicture: patient.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Facebook authentication failed',
      error: error.message
    });
  }
};