import nodemailer from 'nodemailer';

/**
 * Send email using nodemailer
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email body content (text)
 * @param {string} options.html - Email body content (HTML, optional)
 * @returns {Promise<Object>} - Nodemailer response
 */
export const sendEmail = async (options) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });

  // Define email options
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"MediMantra" <noreply@medimantra.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  // Send email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    
    // During development, we don't want to block the flow if email fails
    if (process.env.NODE_ENV === 'development') {
      console.log('Email would have been sent with:', mailOptions);
      return { 
        messageId: 'dev-mode-no-email-sent',
        preview: 'Email not sent in development mode'
      };
    }
    
    throw error;
  }
};

/**
 * Send verification email to user
 * @param {Object} user - User object
 * @param {string} verificationToken - Email verification token
 * @returns {Promise<Object>} - Nodemailer response
 */
export const sendVerificationEmail = async (user, verificationToken) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
  
  const message = `
    Hi ${user.firstName},
    
    Thank you for registering with MediMantra. Please verify your email by clicking the link below:
    
    ${verificationUrl}
    
    If you did not create this account, please ignore this email.
    
    Best regards,
    MediMantra Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3b82f6;">Verify Your Email Address</h2>
      <p>Hi ${user.firstName},</p>
      <p>Thank you for registering with MediMantra. Please verify your email by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
      </div>
      <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #4b5563;">${verificationUrl}</p>
      <p>If you did not create this account, please ignore this email.</p>
      <p>Best regards,<br>MediMantra Team</p>
    </div>
  `;
  
  return sendEmail({
    email: user.email,
    subject: 'Email Verification - MediMantra',
    message,
    html
  });
};

/**
 * Send password reset email to user
 * @param {Object} user - User object
 * @param {string} resetToken - Password reset token
 * @returns {Promise<Object>} - Nodemailer response
 */
export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  
  const message = `
    Hi ${user.firstName},
    
    You requested a password reset for your MediMantra account. Please use the link below to reset your password:
    
    ${resetUrl}
    
    This link is valid for 10 minutes only.
    
    If you didn't request this, please ignore this email and your password will remain unchanged.
    
    Best regards,
    MediMantra Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3b82f6;">Reset Your Password</h2>
      <p>Hi ${user.firstName},</p>
      <p>You requested a password reset for your MediMantra account. Please click the button below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
      </div>
      <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #4b5563;">${resetUrl}</p>
      <p>This link is valid for 10 minutes only.</p>
      <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
      <p>Best regards,<br>MediMantra Team</p>
    </div>
  `;
  
  return sendEmail({
    email: user.email,
    subject: 'Password Reset - MediMantra',
    message,
    html
  });
};

export default {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail
};