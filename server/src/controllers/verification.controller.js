import twilioClient, { formatPhoneNumber } from "../config/twilio.config.js";
import transporter from "../config/email.config.js";
import Verification from "../models/verification.model.js";
import User from "../models/user.model.js";
import {
  formatIndianPhoneNumber,
  isValidIndianPhoneNumber,
} from "../utils/phoneUtils.js";


export const sendPhoneVerificationCode = async (req, res) => {
  try {
     const { email, phone } = req.body;
     const userId = req.user.id;
     if (!userId) {
       return res.status(400).json({
         success: false,
         message: "User ID is required",
       });
     }
 
     
 
     // Validate Indian phone number
     if (!isValidIndianPhoneNumber(phone)) {
       return res.status(400).json({
         success: false,
         message:
           "Invalid Indian phone number. Please enter a 10-digit mobile number",
       });
     }
 
     const formattedPhone = formatIndianPhoneNumber(phone);
 
     // Generate codes
     const emailCode = Math.floor(100000 + Math.random() * 900000).toString();
     const phoneCode = Math.floor(100000 + Math.random() * 900000).toString();
 
     // Send phone verification
     // Add DLT registered template ID for Indian SMS
     const message = await twilioClient.messages.create({
       body: `Your Connectly verification code is: ${phoneCode} Valid for 10 mins. Do not share this OTP with anyone. - Connectly`,
       to: formattedPhone,
       from: process.env.TWILIO_PHONE_NUMBER,
       messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID, // Required for India
     });

 
     // Save verification data
     await Verification.create({
       userId,
       email,
       phone: formattedPhone,
       emailCode,
       phoneCode,
       emailVerified: false,
       phoneVerified: false,
       expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
     });
 
     res.status(200).json({
       success: true,
       message: "Verification codes sent successfully",
     });
   } catch (error) {
     console.error("Verification error:", error);
     res.status(500).json({
       success: false,
       message: "Internal server error",
     });
   }
};


export const sendVerificationCodes = async (req, res) => {
  try {
    const { email, phone } = req.body;
    const userId = req.user.id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!email) {
      return res.status(400).json({ error: "Recipient email is missing!" });
    }

    // Validate Indian phone number
    if (!isValidIndianPhoneNumber(phone)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Indian phone number. Please enter a 10-digit mobile number",
      });
    }

    const formattedPhone = formatIndianPhoneNumber(phone);

    // Generate codes
    const emailCode = Math.floor(100000 + Math.random() * 900000).toString();
    const phoneCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Send phone verification
    // Add DLT registered template ID for Indian SMS
    const message = await twilioClient.messages.create({
      body: `Your Connectly verification code is: ${phoneCode} Valid for 10 mins. Do not share this OTP with anyone. - Connectly`,
      to: formattedPhone,
      from: process.env.TWILIO_PHONE_NUMBER,
      messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID, // Required for India
    });

    // Send email verification
    try {
      await transporter.sendMail({
        from: `"Connectly" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verify Your Email",
        html: `
          <h2>Your Verification Code</h2>
          <h1 style="color:#4F46E5;font-size:32px">${emailCode}</h1>
          <p>Code expires in 10 minutes</p>
        `,
      });
    } catch (emailError) {
      console.error("Email error:", emailError);
      return res.status(400).json({
        success: false,
        message: "Failed to send email. Please check your email address.",
      });
    }

    // Save verification data
    await Verification.create({
      userId,
      email,
      phone: formattedPhone,
      emailCode,
      phoneCode,
      emailVerified: false,
      phoneVerified: false,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    res.status(200).json({
      success: true,
      message: "Verification codes sent successfully",
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const verifyCode = async (req, res) => {
  try {
    const { type, code } = req.body;
    const userId = req.user.id; // Changed from _id to id to match auth context

    // Validate input
    if (!type || !code) {
      return res.status(400).json({
        success: false,
        message: "Type and code are required",
      });
    }

    // Validate type
    if (!["email", "phone"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification type",
      });
    }

    // Find the verification record
    const verification = await Verification.findOne({
      userId,
      [`${type}Code`]: code,
      [`${type}Verified`]: false, // Only check unverified codes
      expiresAt: { $gt: new Date() },
    });

    if (!verification) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    // Update verification status
    verification[`${type}Verified`] = true;
    await verification.save();

    // Update user verification status
    const updateResult = await User.findByIdAndUpdate(
      userId,
      { [`${type}Verified`]: true },
      { new: true }
    );

    if (!updateResult) {
      throw new Error("Failed to update user verification status");
    }

    // Check if both email and phone are verified
    const isFullyVerified =
      verification.emailVerified && verification.phoneVerified;

    res.status(200).json({
      success: true,
      message: `${type} verified successfully`,
      isFullyVerified,
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({
      success: false,
      message: "Verification failed",
      error: error.message,
    });
  }
};
