import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  },
  debug: true // Remove in production
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('Email config error:', error);
  } else {
    console.log('Email server ready');
  }
});

export default transporter;