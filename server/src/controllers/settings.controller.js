import { User } from '../models/user.model.js';
import Doctor from '../models/doctor.model.js';
import Patient from '../models/patient.model.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get user settings
export const getUserSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find user
    const user = await User.findById(userId).select('-password -resetPassword -verification');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get profile-specific settings based on role
    let profileSettings = null;
    
    if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: userId }).select(
        'availability acceptingNewPatients consultationFee locationPreferences'
      );
      profileSettings = doctor;
    } else if (user.role === 'patient') {
      const patient = await Patient.findOne({ user: userId }).select(
        'emergencyContact healthPreferences'
      );
      profileSettings = patient;
    }
    
    res.status(200).json({
      success: true,
      settings: {
        account: {
          email: user.email,
          phone: user.phone,
          language: user.preferences?.language || 'en',
          darkMode: user.preferences?.darkMode || false,
          timeZone: user.preferences?.timeZone || 'UTC'
        },
        notifications: user.preferences?.notifications || {
          email: true,
          push: true,
          sms: true,
          appointmentReminders: true,
          medicationReminders: true
        },
        privacy: user.preferences?.privacy || {
          profileVisibility: 'public',
          shareHealthData: false
        },
        profile: profileSettings
      }
    });
  } catch (error) {
    console.error('Get user settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user settings',
      error: error.message
    });
  }
};

// Update user settings
export const updateUserSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { account, notifications, privacy, profile } = req.body;
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update account settings
    if (account) {
      if (account.phone) user.phone = account.phone;
      if (account.language) user.preferences.language = account.language;
      if (account.darkMode !== undefined) user.preferences.darkMode = account.darkMode;
      if (account.timeZone) user.preferences.timeZone = account.timeZone;
      
      // Email updates should go through verification process
      if (account.email && account.email !== user.email) {
        // This would require verification in production
        // For now, just update directly
        user.email = account.email;
      }
    }
    
    // Update notification settings
    if (notifications) {
      user.preferences.notifications = {
        ...user.preferences.notifications,
        ...notifications
      };
    }
    
    // Update privacy settings
    if (privacy) {
      user.preferences.privacy = {
        ...user.preferences.privacy,
        ...privacy
      };
    }
    
    await user.save();
    
    // Update profile-specific settings based on role
    if (profile) {
      if (user.role === 'doctor') {
        const doctor = await Doctor.findOne({ user: userId });
        
        if (doctor) {
          if (profile.availability) doctor.availability = profile.availability;
          if (profile.acceptingNewPatients !== undefined) doctor.acceptingNewPatients = profile.acceptingNewPatients;
          if (profile.consultationFee) doctor.consultationFee = profile.consultationFee;
          if (profile.locationPreferences) doctor.locationPreferences = profile.locationPreferences;
          
          await doctor.save();
        }
      } else if (user.role === 'patient') {
        const patient = await Patient.findOne({ user: userId });
        
        if (patient) {
          if (profile.emergencyContact) patient.emergencyContact = profile.emergencyContact;
          if (profile.healthPreferences) patient.healthPreferences = profile.healthPreferences;
          
          await patient.save();
        }
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Update user settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user settings',
      error: error.message
    });
  }
};

// Update user avatar
export const updateAvatar = async (req, res) => {
  try {
    const userId = req.user._id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No avatar file provided'
      });
    }
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Delete previous avatar if it exists and is not the default
    if (user.avatar && user.avatar !== '/defaults/default-avatar.png' && user.avatar.startsWith('/uploads/')) {
      const oldAvatarPath = path.join(__dirname, '../..', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }
    
    // Update user with new avatar
    user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating avatar',
      error: error.message
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify current password
    const isPasswordMatch = await user.comparePassword(currentPassword);
    
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};

// Delete account
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account'
      });
    }
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify password
    const isPasswordMatch = await user.comparePassword(password);
    
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Password is incorrect'
      });
    }
    
    // In a real application, this should handle all associated data
    // For this example, just anonymize the user rather than true deletion
    user.firstName = 'Deleted';
    user.lastName = 'User';
    user.email = `deleted_${user._id}@example.com`;
    user.phone = '';
    user.isActive = false;
    user.accountStatus = 'deleted';
    user.isAnonymized = true;
    user.deletedAt = new Date();
    
    await user.save();
    
    // Clear user session/token
    // This depends on your authentication implementation
    
    res.status(200).json({
      success: true,
      message: 'Account has been deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting account',
      error: error.message
    });
  }
};

// Get system settings (admin only)
export const getSystemSettings = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can access system settings'
      });
    }
    
    // In a real application, these would be fetched from database
    // For now, return mock system settings
    res.status(200).json({
      success: true,
      settings: {
        general: {
          siteName: 'MediMantra',
          contactEmail: 'admin@medimantra.com',
          supportPhone: '+1234567890',
          timeZone: 'UTC',
          maintenanceMode: false
        },
        appointment: {
          defaultDuration: 30, // minutes
          bufferTime: 10, // minutes
          maxAdvanceBookingDays: 60,
          reminderTimes: [24, 12, 1] // hours before appointment
        },
        payment: {
          currency: 'USD',
          paymentGateways: ['stripe', 'paypal'],
          taxRate: 0.05
        },
        notification: {
          emailEnabled: true,
          smsEnabled: true,
          pushEnabled: true,
          defaultEmailTemplate: 'default',
          senderEmail: 'noreply@medimantra.com'
        },
        security: {
          passwordExpiryDays: 90,
          sessionTimeoutMinutes: 60,
          maxLoginAttempts: 5,
          twoFactorAuthEnabled: true,
          loginThrottling: true
        }
      }
    });
  } catch (error) {
    console.error('Get system settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching system settings',
      error: error.message
    });
  }
};

// Update system settings (admin only)
export const updateSystemSettings = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update system settings'
      });
    }
    
    const { settings } = req.body;
    
    if (!settings) {
      return res.status(400).json({
        success: false,
        message: 'Settings object is required'
      });
    }
    
    // In a real application, these would be saved to database
    // For now, just return success
    
    res.status(200).json({
      success: true,
      message: 'System settings updated successfully'
    });
  } catch (error) {
    console.error('Update system settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating system settings',
      error: error.message
    });
  }
};
