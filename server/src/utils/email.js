import nodemailer from 'nodemailer';

export const emailConfig = {
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD // Use App Password, not regular password
  },
  tls: {
    rejectUnauthorized: false
  }
};

export const transporter = nodemailer.createTransport(emailConfig);

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log('Email configuration error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});