import twilio from 'twilio';
import dotenv from 'dotenv';
import { logger } from './logger.js';

/**
 * Utility for sending SMS notifications
 * In a production environment, this would integrate with a real SMS service
 * like Twilio, AWS SNS, or another provider
 */

/**
 * Send an SMS message to a phone number
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} message - SMS message content
 * @returns {Promise<object>} - Response from SMS service
 */
export const sendSms = async (phoneNumber, message) => {
  try {
    // For development purposes, just log the message
    console.log(`[SMS NOTIFICATION] To: ${phoneNumber}, Message: ${message}`);
    
    // In production, this would connect to an actual SMS service:
    // return await twilioClient.messages.create({
    //   body: message,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phoneNumber
    // });
    
    // Return a mock success response
    return {
      success: true,
      sid: 'SM' + Math.random().toString(36).substring(2, 15),
      message: 'SMS notification simulated successfully'
    };
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
};

/**
 * Send a verification code via SMS
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} code - Verification code to send
 * @returns {Promise<object>} - Response from SMS service
 */
export const sendVerificationSMS = async (phoneNumber, code) => {
  const message = `Your MediMantra verification code is: ${code}. This code will expire in 10 minutes.`;
  return await sendSms(phoneNumber, message);
};

/**
 * Verify if a phone number is valid
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validatePhoneNumber = (phoneNumber) => {
  // Basic phone validation - this should be enhanced for production
  const phoneRegex = /^\+?[1-9]\d{9,14}$/;
  return phoneRegex.test(phoneNumber);
};

export default {
  sendSms,
  sendVerificationSMS,
  validatePhoneNumber
};