import Notification from '../models/notification.model.js';
import { User } from '../models/user.model.js';
import { sendPushNotification } from '../utils/notification.utils.js';

// Get user notifications
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 20, skip = 0, type } = req.query;
    
    // Build query
    const query = { recipient: userId };
    
    if (type) {
      query.type = type;
    }
    
    // Get notifications
    const notifications = await Notification.find(query)
      .populate('sender', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Notification.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      total,
      notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Count unread notifications
    const count = await Notification.countDocuments({
      recipient: userId,
      isRead: false
    });
    
    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread notification count',
      error: error.message
    });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Find notification
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Check if notification belongs to user
    if (notification.recipient.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this notification'
      });
    }
    
    // Mark as read
    notification.isRead = true;
    notification.readAt = new Date();
    
    await notification.save();
    
    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification',
      error: error.message
    });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Update all unread notifications
    const result = await Notification.updateMany(
      { recipient: userId, isRead: false },
      { 
        isRead: true,
        readAt: new Date()
      }
    );
    
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      count: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notifications',
      error: error.message
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Find notification
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Check if notification belongs to user
    if (notification.recipient.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this notification'
      });
    }
    
    // Delete notification
    await notification.remove();
    
    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
};

// Create notification (admin only)
export const createNotification = async (req, res) => {
  try {
    const {
      recipients, // Array of user IDs or 'all'
      title,
      message,
      type,
      link,
      relatedDocument
    } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }
    
    let userIds = [];
    
    // Handle different recipient scenarios
    if (recipients === 'all') {
      // Get all active users
      const users = await User.find({ isActive: true }).select('_id');
      userIds = users.map(user => user._id);
    } else if (Array.isArray(recipients) && recipients.length > 0) {
      userIds = recipients;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Valid recipients must be provided'
      });
    }
    
    // Create notifications for each recipient
    const notificationPromises = userIds.map(userId => 
      Notification.create({
        recipient: userId,
        sender: req.user._id,
        title,
        message,
        type: type || 'general',
        link,
        relatedDocument
      })
    );
    
    await Promise.all(notificationPromises);
    
    // If push notifications are enabled, send them
    const users = await User.find({ _id: { $in: userIds }, 'preferences.notifications.push': true });
    
    for (const user of users) {
      if (user.deviceTokens && user.deviceTokens.length > 0) {
        for (const device of user.deviceTokens) {
          await sendPushNotification(device.token, title, message);
        }
      }
    }
    
    res.status(201).json({
      success: true,
      message: `Notifications sent to ${userIds.length} recipients`
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating notifications',
      error: error.message
    });
  }
};

// Get notification preferences
export const getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user preferences
    const user = await User.findById(userId).select('preferences.notifications');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      preferences: user.preferences.notifications
    });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notification preferences',
      error: error.message
    });
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const { email, push, sms, appointmentReminders, medicationReminders, promotions } = req.body;
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update notification preferences
    const notificationPreferences = user.preferences.notifications;
    
    if (email !== undefined) notificationPreferences.email = email;
    if (push !== undefined) notificationPreferences.push = push;
    if (sms !== undefined) notificationPreferences.sms = sms;
    
    // Update specific notification types if provided
    if (appointmentReminders !== undefined) {
      notificationPreferences.appointmentReminders = appointmentReminders;
    }
    
    if (medicationReminders !== undefined) {
      notificationPreferences.medicationReminders = medicationReminders;
    }
    
    if (promotions !== undefined) {
      notificationPreferences.promotions = promotions;
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      preferences: user.preferences.notifications
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification preferences',
      error: error.message
    });
  }
};

// Send test notification (admin only)
export const sendTestNotification = async (req, res) => {
  try {
    const { title, message, type } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }
    
    // Create notification
    const notification = await Notification.create({
      recipient: req.user._id,
      sender: req.user._id,
      title,
      message,
      type: type || 'test'
    });
    
    // Send push notification if user has push enabled
    const user = await User.findById(req.user._id);
    
    if (user.preferences.notifications.push && user.deviceTokens && user.deviceTokens.length > 0) {
      for (const device of user.deviceTokens) {
        await sendPushNotification(device.token, title, message);
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'Test notification sent successfully',
      notification
    });
  } catch (error) {
    console.error('Send test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending test notification',
      error: error.message
    });
  }
};
