import nodemailer from 'nodemailer';
import { logger } from './logger.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure email transporter
const createTransporter = () => {
  // For production
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  } 
  // For development (using Ethereal or Mailtrap)
  else {
    return nodemailer.createTransport({
      host: process.env.DEV_EMAIL_HOST || 'smtp.ethereal.email',
      port: process.env.DEV_EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.DEV_EMAIL_USER,
        pass: process.env.DEV_EMAIL_PASSWORD
      }
    });
  }
};

/**
 * Send email using configured transporter
 * @param {Object} options - Email options
 * @returns {Promise} - Result of sending email
 */
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'MediMantra'}" <${process.env.EMAIL_FROM || 'no-reply@medimantra.com'}>`,
      to: options.to,
      subject: options.subject,
      html: options.html
    };

    // Add attachments if provided
    if (options.attachments) {
      mailOptions.attachments = options.attachments;
    }

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Error sending email: ${error.message}`);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send verification email to user
 * @param {string} email - User's email address
 * @param {string} token - Verification token
 * @param {string} name - User's first name
 * @returns {Promise} - Result of sending email
 */
export const sendVerificationEmail = async (email, token, name) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e6e6e6; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${process.env.LOGO_URL || 'https://medimantra.com/logo.png'}" alt="MediMantra Logo" style="max-width: 150px;">
      </div>
      <h2 style="color: #3b82f6;">Verify Your Email Address</h2>
      <p>Hello ${name},</p>
      <p>Thank you for registering with MediMantra. To complete your registration, please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #3b82f6; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
      </div>
      <p>If the button doesn't work, you can also click on the link below or copy and paste it into your browser:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, you can safely ignore this email.</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #e6e6e6;">
      <p style="font-size: 12px; color: #666;">MediMantra - Healthcare at your fingertips</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Verify Your Email Address - MediMantra",
    html
  });
};

/**
 * Send password reset email to user
 * @param {string} email - User's email address
 * @param {string} token - Password reset token
 * @param {string} name - User's first name
 * @returns {Promise} - Result of sending email
 */
export const sendPasswordResetEmail = async (email, token, name) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e6e6e6; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${process.env.LOGO_URL || 'https://medimantra.com/logo.png'}" alt="MediMantra Logo" style="max-width: 150px;">
      </div>
      <h2 style="color: #3b82f6;">Reset Your Password</h2>
      <p>Hello ${name},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
      </div>
      <p>If the button doesn't work, you can also click on the link below or copy and paste it into your browser:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link will expire in 15 minutes.</p>
      <p>If you didn't request a password reset, you can safely ignore this email. Your account is secure.</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #e6e6e6;">
      <p style="font-size: 12px; color: #666;">MediMantra - Healthcare at your fingertips</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Reset Your Password - MediMantra",
    html
  });
};

/**
 * Send appointment confirmation email
 * @param {string} email - User's email address
 * @param {Object} appointment - Appointment details
 * @param {string} name - User's first name
 * @returns {Promise} - Result of sending email
 */
export const sendAppointmentConfirmationEmail = async (email, appointment, name) => {
  const appointmentDate = new Date(appointment.scheduledStartTime).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const appointmentTime = new Date(appointment.scheduledStartTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e6e6e6; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${process.env.LOGO_URL || 'https://medimantra.com/logo.png'}" alt="MediMantra Logo" style="max-width: 150px;">
      </div>
      <h2 style="color: #3b82f6;">Appointment Confirmation</h2>
      <p>Hello ${name},</p>
      <p>Your appointment has been confirmed with the following details:</p>
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Doctor:</strong> Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}</p>
        <p><strong>Date:</strong> ${appointmentDate}</p>
        <p><strong>Time:</strong> ${appointmentTime}</p>
        <p><strong>Type:</strong> ${appointment.sessionType}</p>
        ${appointment.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${appointment.meetingLink}">${appointment.meetingLink}</a></p>` : ''}
      </div>
      <p>You can view or manage your appointment through your MediMantra dashboard:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/appointments" style="background-color: #3b82f6; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Appointment</a>
      </div>
      <p>If you need to reschedule or cancel, please do so at least 24 hours before your appointment time.</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #e6e6e6;">
      <p style="font-size: 12px; color: #666;">MediMantra - Healthcare at your fingertips</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Your Appointment Confirmation - MediMantra",
    html
  });
};

/**
 * Send prescription notification email
 * @param {string} email - User's email address
 * @param {Object} prescription - Prescription details
 * @param {string} name - User's first name
 * @returns {Promise} - Result of sending email
 */
export const sendPrescriptionEmail = async (email, prescription, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e6e6e6; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${process.env.LOGO_URL || 'https://medimantra.com/logo.png'}" alt="MediMantra Logo" style="max-width: 150px;">
      </div>
      <h2 style="color: #3b82f6;">New Prescription Available</h2>
      <p>Hello ${name},</p>
      <p>A new prescription has been added to your MediMantra account by Dr. ${prescription.doctor.firstName} ${prescription.doctor.lastName}.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/prescriptions/${prescription._id}" style="background-color: #3b82f6; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Prescription</a>
      </div>
      <p>For your convenience, you can view all your prescriptions in your MediMantra dashboard.</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #e6e6e6;">
      <p style="font-size: 12px; color: #666;">MediMantra - Healthcare at your fingertips</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "New Prescription Available - MediMantra",
    html
  });
};

/**
 * Send appointment reminder email
 * @param {string} email - User's email address
 * @param {Object} appointment - Appointment details
 * @param {string} name - User's first name
 * @returns {Promise} - Result of sending email
 */
export const sendAppointmentReminderEmail = async (email, appointment, name) => {
  const appointmentDate = new Date(appointment.scheduledStartTime).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const appointmentTime = new Date(appointment.scheduledStartTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e6e6e6; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${process.env.LOGO_URL || 'https://medimantra.com/logo.png'}" alt="MediMantra Logo" style="max-width: 150px;">
      </div>
      <h2 style="color: #3b82f6;">Appointment Reminder</h2>
      <p>Hello ${name},</p>
      <p>This is a friendly reminder about your upcoming appointment:</p>
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Doctor:</strong> Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}</p>
        <p><strong>Date:</strong> ${appointmentDate}</p>
        <p><strong>Time:</strong> ${appointmentTime}</p>
        <p><strong>Type:</strong> ${appointment.sessionType}</p>
        ${appointment.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${appointment.meetingLink}">${appointment.meetingLink}</a></p>` : ''}
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/appointments/${appointment._id}" style="background-color: #3b82f6; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Join Appointment</a>
      </div>
      <p>Please ensure you have a stable internet connection and your device's camera and microphone are working properly before the appointment.</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #e6e6e6;">
      <p style="font-size: 12px; color: #666;">MediMantra - Healthcare at your fingertips</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Reminder: Your Upcoming Appointment - MediMantra",
    html
  });
};

/**
 * Send doctor account verification notification
 * @param {string} email - Doctor's email address
 * @param {string} name - Doctor's first name
 * @returns {Promise} - Result of sending email
 */
export const sendDoctorVerificationEmail = async (email, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e6e6e6; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${process.env.LOGO_URL || 'https://medimantra.com/logo.png'}" alt="MediMantra Logo" style="max-width: 150px;">
      </div>
      <h2 style="color: #3b82f6;">Account Verification Complete</h2>
      <p>Hello Dr. ${name},</p>
      <p>Congratulations! Your MediMantra doctor account has been verified by our admin team.</p>
      <p>You can now log in to access the doctor dashboard, manage your schedule, and start accepting patient appointments.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/login" style="background-color: #3b82f6; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Dashboard</a>
      </div>
      <p>Thank you for joining the MediMantra healthcare platform. If you have any questions, please contact our support team.</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #e6e6e6;">
      <p style="font-size: 12px; color: #666;">MediMantra - Healthcare at your fingertips</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Your Doctor Account is Now Verified - MediMantra",
    html
  });
};

/**
 * Send notification via email
 * @param {string} email - Recipient email
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} name - Recipient name
 * @returns {Promise} - Email sending result
 */
export const sendNotificationEmail = async (email, title, message, name) => {
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

export { sendEmail };