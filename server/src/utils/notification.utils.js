import admin from 'firebase-admin';
import { User } from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import { sendEmail } from './email.utils.js';
import { sendSms } from './sms.utils.js';
import dotenv from 'dotenv';
import { logger } from './logger.js';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK for push notifications
// This should be initialized in your main app.js file and not here
// But for completeness, here's the initialization code
if (!admin.apps.length && process.env.FIREBASE_CREDENTIALS) {
  try {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_CREDENTIALS.replace(/\\n/g, '\n')
    );
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    logger.info('Firebase Admin SDK initialized successfully');
  } catch (error) {
    logger.error(`Error initializing Firebase Admin SDK: ${error.message}`);
  }
}

/**
 * Send push notification to a single device
 * @param {string} token - Firebase device token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Additional data to send
 * @returns {Promise<Object>} - Result of sending notification
 */
export const sendPushNotification = async (token, title, body, data = {}) => {
  try {
    if (!admin.apps.length) {
      throw new Error('Firebase Admin SDK not initialized');
    }

    const message = {
      notification: {
        title,
        body
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK' // For Flutter apps
      },
      token
    };

    const response = await admin.messaging().send(message);
    logger.info(`Push notification sent: ${response}`);
    return response;
  } catch (error) {
    logger.error(`Error sending push notification: ${error.message}`);
    // Don't throw error to prevent breaking notification flow
    return { error: error.message };
  }
};

/**
 * Send push notification to multiple devices
 * @param {Array<string>} tokens - Array of Firebase device tokens
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Additional data to send
 * @returns {Promise<Object>} - Result of sending notifications
 */
export const sendMultiplePushNotifications = async (tokens, title, body, data = {}) => {
  try {
    if (!admin.apps.length) {
      throw new Error('Firebase Admin SDK not initialized');
    }

    if (!tokens || tokens.length === 0) {
      return { success: false, message: 'No device tokens provided' };
    }

    // Split tokens into chunks of 500 (FCM limit)
    const tokenChunks = [];
    const chunkSize = 500;
    
    for (let i = 0; i < tokens.length; i += chunkSize) {
      tokenChunks.push(tokens.slice(i, i + chunkSize));
    }

    const results = [];

    for (const tokenChunk of tokenChunks) {
      const message = {
        notification: {
          title,
          body
        },
        data: {
          ...data,
          click_action: 'FLUTTER_NOTIFICATION_CLICK' // For Flutter apps
        },
        tokens: tokenChunk
      };

      const response = await admin.messaging().sendMulticast(message);
      results.push(response);
      
      logger.info(`Sent ${response.successCount} messages successfully out of ${tokenChunk.length}`);
      
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push({
              token: tokenChunk[idx],
              error: resp.error.message
            });
          }
        });
        
        logger.warn(`Failed tokens: ${JSON.stringify(failedTokens)}`);
        
        // Optionally, clean up invalid tokens
        for (const { token, error } of failedTokens) {
          if (error.includes('unregistered') || error.includes('invalid-registration-token')) {
            // Remove invalid token from user record
            await User.updateMany(
              { 'deviceTokens.token': token },
              { $pull: { deviceTokens: { token } } }
            );
          }
        }
      }
    }

    return {
      success: true,
      results
    };
  } catch (error) {
    logger.error(`Error sending multiple push notifications: ${error.message}`);
    return { error: error.message };
  }
};

/**
 * Create notification for user and send via preferred channels
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Object>} - Created notification
 */
export const createNotification = async (notificationData) => {
  try {
    const {
      recipient,
      sender,
      type,
      title,
      message,
      link,
      relatedDocument,
      sendEmail: shouldSendEmail = false,
      sendSMS: shouldSendSMS = false,
      sendPush: shouldSendPush = true
    } = notificationData;

    // Validate required fields
    if (!recipient || !title || !message) {
      throw new Error('Recipient, title, and message are required for notifications');
    }

    // Create in-app notification
    const notification = await Notification.create({
      recipient,
      sender: sender || null,
      type: type || 'general',
      title,
      message,
      link,
      relatedDocument
    });

    // Get recipient user for preferences
    const user = await User.findById(recipient);
    
    if (!user) {
      logger.warn(`User not found for notification: ${recipient}`);
      return notification;
    }

    // Send through enabled channels based on user preferences
    const promises = [];

    // Push notification
    if (shouldSendPush && user.preferences?.notifications?.push && user.deviceTokens?.length > 0) {
      const tokens = user.deviceTokens.map(device => device.token);
      promises.push(sendMultiplePushNotifications(tokens, title, message, {
        type,
        notificationId: notification._id.toString(),
        link
      }));
    }

    // Email notification
    if (shouldSendEmail && user.preferences?.notifications?.email) {
      promises.push(sendNotificationEmail(user.email, title, message, user.firstName));
    }

    // SMS notification
    if (shouldSendSMS && user.preferences?.notifications?.sms && user.phone) {
      promises.push(sendNotificationSMS(user.phone, title, message));
    }

    // Wait for all notifications to be sent
    if (promises.length > 0) {
      await Promise.allSettled(promises);
    }

    return notification;
  } catch (error) {
    logger.error(`Error creating notification: ${error.message}`);
    throw error;
  }
};

/**
 * Send notification via email
 * @param {string} email - Recipient email
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} name - Recipient name
 * @returns {Promise} - Email sending result
 */
const sendNotificationEmail = async (email, title, message, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e6e6e6; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${process.env.LOGO_URL || 'https://medimantra.com/logo.png'}" alt="MediMantra Logo" style="max-width: 150px;">
      </div>
      <h2 style="color: #3b82f6;">${title}</h2>
      <p>Hello ${name},</p>
      <p>${message}</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #e6e6e6;">
      <p style="font-size: 12px; color: #666;">
        You received this email because you enabled email notifications in your MediMantra account.
        <br>
        To manage your notification preferences, <a href="${process.env.FRONTEND_URL}/settings/notifications">click here</a>.
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: title,
    html
  });
};

/**
 * Send notification via SMS
 * @param {string} phone - Recipient phone number
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @returns {Promise} - SMS sending result
 */
const sendNotificationSMS = async (phone, title, message) => {
  // Keep SMS short
  const smsBody = `${title}: ${message.substring(0, 120)}${message.length > 120 ? '...' : ''}`;
  
  return sendSms({
    to: phone,
    body: smsBody
  });
};

/**
 * Create batch notifications for multiple users
 * @param {Array<string>} recipientIds - Array of user IDs
 * @param {Object} notificationData - Notification data without recipient
 * @returns {Promise<Array<Object>>} - Created notifications
 */
export const createBatchNotifications = async (recipientIds, notificationData) => {
  try {
    if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
      throw new Error('Valid recipient IDs array is required');
    }

    const { title, message, type, sender, link, relatedDocument } = notificationData;

    // Create notifications in bulk
    const notificationsToCreate = recipientIds.map(recipient => ({
      recipient,
      sender: sender || null,
      type: type || 'general',
      title,
      message,
      link,
      relatedDocument
    }));

    const notifications = await Notification.insertMany(notificationsToCreate);

    // Get all users with push enabled to send push notifications
    const users = await User.find({
      _id: { $in: recipientIds },
      'preferences.notifications.push': true,
      deviceTokens: { $exists: true, $ne: [] }
    });

    if (users.length > 0) {
      const allTokens = [];
      users.forEach(user => {
        if (user.deviceTokens && user.deviceTokens.length) {
          user.deviceTokens.forEach(device => {
            allTokens.push(device.token);
          });
        }
      });

      if (allTokens.length > 0) {
        await sendMultiplePushNotifications(allTokens, title, message, {
          type,
          link
        });
      }
    }

    return notifications;
  } catch (error) {
    logger.error(`Error creating batch notifications: ${error.message}`);
    throw error;
  }
};

/**
 * Register device token for push notifications
 * @param {string} userId - User ID
 * @param {string} token - Device token
 * @param {string} deviceInfo - Device information
 * @returns {Promise<Object>} - Updated user
 */
export const registerDeviceToken = async (userId, token, deviceInfo) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Initialize deviceTokens array if it doesn't exist
    if (!user.deviceTokens) {
      user.deviceTokens = [];
    }

    // Check if token already exists for this user
    const existingTokenIndex = user.deviceTokens.findIndex(
      device => device.token === token
    );

    if (existingTokenIndex >= 0) {
      // Update the existing token entry with new device info
      user.deviceTokens[existingTokenIndex].deviceInfo = deviceInfo;
      user.deviceTokens[existingTokenIndex].lastUsed = new Date();
    } else {
      // Add new token
      user.deviceTokens.push({
        token,
        deviceInfo,
        registeredAt: new Date(),
        lastUsed: new Date()
      });
    }

    await user.save();
    return { success: true };
  } catch (error) {
    logger.error(`Error registering device token: ${error.message}`);
    throw error;
  }
};

/**
 * Unregister device token
 * @param {string} userId - User ID
 * @param {string} token - Device token
 * @returns {Promise<Object>} - Result
 */
export const unregisterDeviceToken = async (userId, token) => {
  try {
    const result = await User.updateOne(
      { _id: userId },
      { $pull: { deviceTokens: { token } } }
    );
    
    return { 
      success: true,
      removed: result.modifiedCount > 0 
    };
  } catch (error) {
    logger.error(`Error unregistering device token: ${error.message}`);
    throw error;
  }
};