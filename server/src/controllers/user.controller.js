import { User } from "../models/user.model.js";
import { ApiError } from "../config/ApiError.js";
import { validationResult } from "express-validator";
import { uploadCloudinary } from "../config/cloudinary.js";
import Patient from '../models/patient.model.js';
import Doctor from '../models/doctor.model.js';
import fs from 'fs';
import path from 'path';

export const register = async (req, res) => {
    try {
      const { firstName, lastName, email, password, phone } = req.body;
  
      // Validate input
      if (!firstName || !lastName || !email || !password || !username) {
        return res.status(400).json({
          success: false,
          message: "Please provide all required fields",
        });
      }
  
      // Check if user already exists
      const userExists = await User.findOne(
        { email: email.toLowerCase() }
      );
      
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }
      const avatarLocalPath = req.files?.avatar?.[0]?.path;
        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar file is required");
        }

        // Upload avatar to Cloudinary
        const avatar = await uploadCloudinary(avatarLocalPath);
        console.log(avatar);
      // Create user with hashed password
      const user = await User.create({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password,
        avatar: avatar.url,
        phoneNumber: phone,
      });
  
      // Generate token
      const token = generateRefreshToken();
  
      // Set cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });
  
      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;
  
      res.status(201).json({
        success: true,
        token,
        user: userResponse,
      });
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json({
        success: false,
        message: "Error creating user",
        error: error.message, // Include error message for debugging
      });
    }
  };

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get role-specific data
    let roleData = null;
    
    if (user.role === 'doctor') {
      roleData = await Doctor.findOne({ user: userId })
        .populate('qualifications')
        .populate('specializations');
    } else if (user.role === 'patient') {
      roleData = await Patient.findOne({ user: userId });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        lastLogin: user.lastLogin,
        preferences: user.preferences,
        roleData
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile'
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { firstName, lastName, phone, username } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if username is being changed and is unique
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }
      user.username = username;
    }

    // Update basic info
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;

    // Save updated user
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        username: user.username,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

// Update avatar
export const updateAvatar = async (req, res) => {
  try {
    const userId = req.user._id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
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

    // Delete old avatar if exists and is not a URL
    if (user.avatar && user.avatar.startsWith('/uploads/')) {
      const oldAvatarPath = path.join(__dirname, '../..', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Set new avatar path
    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    user.avatar = avatarPath;
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      avatar: avatarPath
    });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating avatar'
    });
  }
};

// Delete account
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Instead of actually deleting, deactivate the account
    await User.findByIdAndUpdate(userId, {
      isActive: false,
      accountStatus: 'deactivated',
      lastSeen: new Date()
    });

    // Clear any authentication cookies
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating account'
    });
  }
};

// Update user preferences
export const updatePreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const { language, theme, notifications, accessibility } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update preferences
    if (language) user.preferences.language = language;
    if (theme) user.preferences.theme = theme;
    
    if (notifications) {
      if (notifications.email !== undefined) {
        user.preferences.notifications.email = notifications.email;
      }
      if (notifications.push !== undefined) {
        user.preferences.notifications.push = notifications.push;
      }
      if (notifications.sms !== undefined) {
        user.preferences.notifications.sms = notifications.sms;
      }
    }
    
    if (accessibility) {
      if (accessibility.fontSize) {
        user.preferences.accessibility.fontSize = accessibility.fontSize;
      }
      if (accessibility.reduceMotion !== undefined) {
        user.preferences.accessibility.reduceMotion = accessibility.reduceMotion;
      }
      if (accessibility.highContrast !== undefined) {
        user.preferences.accessibility.highContrast = accessibility.highContrast;
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating preferences'
    });
  }
};

// Get notification settings
export const getNotificationSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      notifications: user.preferences.notifications
    });
  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notification settings'
    });
  }
};

// Update notification settings
export const updateNotificationSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { email, push, sms } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update notification settings
    if (email !== undefined) user.preferences.notifications.email = email;
    if (push !== undefined) user.preferences.notifications.push = push;
    if (sms !== undefined) user.preferences.notifications.sms = sms;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Notification settings updated successfully',
      notifications: user.preferences.notifications
    });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification settings'
    });
  }
};

// Add device token for push notifications
export const addDeviceToken = async (req, res) => {
  try {
    const userId = req.user._id;
    const { token, device } = req.body;

    if (!token || !device) {
      return res.status(400).json({
        success: false,
        message: 'Token and device information are required'
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

    // Add token
    await user.addDeviceToken(token, device);

    res.status(200).json({
      success: true,
      message: 'Device token added successfully'
    });
  } catch (error) {
    console.error('Add device token error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding device token'
    });
  }
};

// Remove device token
export const removeDeviceToken = async (req, res) => {
  try {
    const userId = req.user._id;
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
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

    // Remove token
    await user.removeDeviceToken(token);

    res.status(200).json({
      success: true,
      message: 'Device token removed successfully'
    });
  } catch (error) {
    console.error('Remove device token error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing device token'
    });
  }
};

// Search users (admin only)
export const searchUsers = async (req, res) => {
  try {
    const { query, role, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Build search criteria
    const searchCriteria = {
      $text: { $search: query },
      isActive: true
    };
    
    if (role) {
      searchCriteria.role = role;
    }

    // Find users
    const users = await User.find(searchCriteria)
      .select('firstName lastName email username role avatar')
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching users'
    });
  }
};

// export { register };