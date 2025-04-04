import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Doctor from '../models/doctor.model.js';
import { sendEmail } from '../utils/email.js';
import { cloudinary } from '../config/cloudinary.config.js';
import { uploadFile } from '../utils/fileUpload.js';
import dotenv from 'dotenv';

dotenv.config();

// Generate JWT tokens
const generateTokens = (id) => {
    // Check if JWT secrets are properly set
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
    }
    
    const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });
    
    const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '30d'
    });
    
    return { accessToken, refreshToken };
  };

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000 // 1 day
};

// Helper function to upload base64 image
const uploadBase64Image = async (base64String, folder = 'medimantra/doctors/profiles') => {
  try {
    if (!base64String || !base64String.startsWith('data:image/')) {
      return null;
    }

    // Extract base64 data and content type
    const match = base64String.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!match || match.length !== 3) {
      return null;
    }

    const result = await cloudinary.uploader.upload(base64String, {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 500, height: 500, crop: 'limit' },
        { quality: 'auto' }
      ]
    });

    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.error('Base64 image upload failed:', error);
    return null;
  }
};

// Register doctor
export const registerDoctor = async (req, res) => {
    try {
      const { 
        // Basic user details
        firstName, 
        lastName, 
        email, 
        phone, 
        password,
        dateOfBirth,
        gender,
        address,
        city,
        state,
        zipCode,
        
        // Doctor specific details
        registrationNumber,
        registrationCouncil,
        qualifications,
        specialties,
        experience,
        hospitalAffiliations,
        languages,
        consultationFee,
        bio,
        profileImage,
        
        // New fields being added
        clinicDetails,
        availability,
        videoConsultation,
        acceptingNewPatients,
        customFields
      } = req.body;
      
      // Handle profile image upload - different approaches
      let profileImageData = null;
      
      // Case 1: If multer file is available
      if (req.file) {
        try {
          profileImageData = await uploadFile(req.file, 'medimantra/doctors/profiles');
          console.log('Profile image uploaded via multer:', profileImageData);
        } catch (uploadError) {
          console.error('Multer file upload failed:', uploadError);
        }
      }
      // Case 2: If base64 encoded image string is provided
      else if (profileImage && typeof profileImage === 'string' && profileImage.startsWith('data:image')) {
        try {
          profileImageData = await uploadBase64Image(profileImage);
          console.log('Profile image uploaded via base64:', profileImageData);
        } catch (uploadError) {
          console.error('Base64 image upload failed:', uploadError);
        }
      }
      
      // Start database transaction
      const session = await mongoose.startSession();
      session.startTransaction();
      
      try {
        // Check if user exists
        const userExists = await User.findOne({ email });
        
        if (userExists) {
          return res.status(400).json({
            success: false,
            message: 'Email already registered'
          });
        }
        
        // Create new user with doctor role
        const user = await User.create([{
          firstName,
          lastName,
          email,
          phone,
          password,
          dateOfBirth,
          gender,
          address: {
            street: address,
            city,
            state,
            postalCode: zipCode,
            country: 'India' // Default country
          },
          role: 'doctor',
          profilePicture: profileImageData?.url || null,
          cloudinaryId: profileImageData?.public_id || null
        }], { session });
        
        // Process qualifications
        let qualificationsArray = [];
        if (typeof qualifications === 'string') {
          qualificationsArray = qualifications.split(',').map(qual => ({
            degree: qual.trim(),
            institution: 'To be updated',
            year: new Date().getFullYear()
          }));
        } else if (Array.isArray(qualifications)) {
          qualificationsArray = qualifications.map(qual => {
            if (typeof qual === 'string') {
              return {
                degree: qual.trim(),
                institution: 'To be updated',
                year: new Date().getFullYear()
              };
            }
            return qual;
          });
        } else if (qualifications && typeof qualifications === 'object') {
          qualificationsArray = [qualifications];
        }
        
        // Process specialties
        let specialtiesArray = [];
        if (typeof specialties === 'string') {
          specialtiesArray = specialties.split(',').map(spec => spec.trim());
        } else if (Array.isArray(specialties)) {
          specialtiesArray = specialties;
        } else if (specialties) {
          specialtiesArray = [specialties.toString()];
        }
        
        // Process languages
        let languagesArray = [];
        if (typeof languages === 'string') {
          languagesArray = languages.split(',').map(lang => lang.trim());
        } else if (Array.isArray(languages)) {
          languagesArray = languages;
        } else if (languages) {
          languagesArray = [languages.toString()];
        }
        
        // Process hospital affiliations
        let hospitalAffiliationsArray = [];
        if (typeof hospitalAffiliations === 'string') {
          hospitalAffiliationsArray = hospitalAffiliations.split(',').map(hospital => ({
            name: hospital.trim(),
            address: 'To be updated',
            current: true
          }));
        } else if (Array.isArray(hospitalAffiliations)) {
          hospitalAffiliationsArray = hospitalAffiliations.map(hospital => {
            if (typeof hospital === 'string') {
              return {
                name: hospital.trim(),
                address: 'To be updated',
                current: true
              };
            }
            return hospital;
          });
        } else if (hospitalAffiliations && typeof hospitalAffiliations === 'object') {
          hospitalAffiliationsArray = [hospitalAffiliations];
        }
        
        // Process experience
        let experienceValue = 0;
        if (typeof experience === 'string') {
          const match = experience.match(/\d+/);
          if (match) {
            experienceValue = parseInt(match[0], 10);
          }
        } else if (typeof experience === 'number') {
          experienceValue = experience;
        }
        
        // Process consultation fee
        let consultationFeeObject = {};
        if (typeof consultationFee === 'string' || typeof consultationFee === 'number') {
          const feeValue = parseInt(consultationFee, 10) || 0;
          consultationFeeObject = {
            inPerson: feeValue,
            video: feeValue,
            phone: feeValue
          };
        } else if (consultationFee && typeof consultationFee === 'object') {
          consultationFeeObject = {
            inPerson: consultationFee.inPerson || 0,
            video: consultationFee.video || consultationFee.inPerson || 0,
            phone: consultationFee.phone || consultationFee.inPerson || 0
          };
        } else {
          consultationFeeObject = {
            inPerson: 0,
            video: 0,
            phone: 0
          };
        }
        
        // Process clinic details
        let clinicDetailsObject = {};
        if (clinicDetails && typeof clinicDetails === 'object') {
          clinicDetailsObject = clinicDetails;
        } else {
          clinicDetailsObject = {
            name: '',
            address: {
              street: '',
              city: '',
              state: '',
              zipCode: '',
              country: 'India'
            },
            contactNumber: ''
          };
        }

        // Process availability slots
        let availabilityArray = [];
        if (availability && Array.isArray(availability)) {
          availabilityArray = availability;
        } else if (availability && typeof availability === 'object') {
          // Handle if a single day's availability is provided as an object
          availabilityArray = [availability];
        }
        
        // Process video consultation settings
        let videoConsultationObject = {};
        if (videoConsultation && typeof videoConsultation === 'object') {
          videoConsultationObject = videoConsultation;
        } else if (videoConsultation === true || videoConsultation === 'true') {
          videoConsultationObject = {
            available: true,
            platform: 'zoom'
          };
        } else {
          videoConsultationObject = {
            available: false,
            platform: 'zoom'
          };
        }
        
        // Create doctor profile with all the processed data
        const doctorProfile = await Doctor.create([{
          user: user[0]._id,
          gender: gender || '',
          specialties: specialtiesArray,
          qualifications: qualificationsArray,
          registrationNumber,
          registrationCouncil: registrationCouncil || "Medical Council of India",
          experience: experienceValue,
          hospitalAffiliations: hospitalAffiliationsArray,
          languages: languagesArray,
          consultationFee: consultationFeeObject,
          bio: bio || '',
          isVerified: false,
          
          // New fields
          clinicDetails: clinicDetailsObject,
          availability: availabilityArray,
          videoConsultation: videoConsultationObject,
          acceptingNewPatients: acceptingNewPatients !== false,
          customFields: customFields || {}
        }], { session });
        
        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        user[0].emailVerificationToken = crypto
          .createHash('sha256')
          .update(verificationToken)
          .digest('hex');
          
        user[0].emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        
        await user[0].save({ session });
        
        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user[0]._id);
        
        // Save refresh token to database
        user[0].refreshToken = refreshToken;
        await user[0].save({ session });
        
        // Commit transaction
        await session.commitTransaction();
        
        // Send verification email
        const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
        
        try {
          await sendEmail({
            email: user[0].email,
            subject: 'Doctor Verification - MediMantra',
            message: `Please verify your email by clicking the link: ${verificationUrl}\n\nYour account will be fully activated after admin verification of your medical credentials.`
          });
        } catch (error) {
          console.error('Email sending failed:', error);
        }
        
        // Send response with cookie
        res.cookie('accessToken', accessToken, cookieOptions);
        res.status(201).json({
          success: true,
          message: 'Doctor registered successfully. Please verify your email and wait for admin approval.',
          user: {
            _id: user[0]._id,
            firstName: user[0].firstName,
            lastName: user[0].lastName,
            email: user[0].email,
            role: user[0].role,
            profilePicture: user[0].profilePicture,
            isEmailVerified: user[0].isEmailVerified
          },
          doctorProfile: {
            _id: doctorProfile[0]._id,
            specialties: doctorProfile[0].specialties,
            isVerified: doctorProfile[0].isVerified
          },
          accessToken
        });
      } catch (error) {
        // Abort transaction on error
        await session.abortTransaction();
        
        console.error('Doctor profile creation error:', error);
        
        throw error;
      } finally {
        // End session
        session.endSession();
      }
    } catch (error) {
      console.error('Registration failed:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    }
  };

// Login doctor
export const loginDoctor = async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Validate email and password
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide email and password'
        });
      }
      
      // Find user and check role
      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
  
      console.log('User found:', user);
      
      // Verify this is a doctor account
      if (user.role !== 'doctor') {
        return res.status(401).json({
          success: false,
          message: 'This account is not registered as a doctor'
        });
      }
  
      console.log('User role verified:', user.role);
      
      // Check if password matches - Use only one password checking method
      let isMatch;
      try {
        // Method 1: If user.matchPassword exists, try to use it first
        if (typeof user.matchPassword === 'function') {
          isMatch = await user.matchPassword(password);
        } else {
          // Method 2: Fallback to bcrypt.compare
          isMatch = await bcrypt.compare(password, user.password);
        }
        
        console.log('Password match:', isMatch);
        
        if (!isMatch) {
          return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
          });
        }
      } catch (passwordError) {
        console.error('Password checking error:', passwordError);
        return res.status(500).json({
          success: false,
          message: 'Error verifying credentials',
          error: passwordError.message
        });
      }
      
      // Check if user is active
      if (user.isActive === false) {
        return res.status(401).json({
          success: false,
          message: 'Your account has been deactivated. Please contact support.'
        });
      }
      
      // Find doctor profile
      const doctorProfile = await Doctor.findOne({ user: user._id });
      
      if (!doctorProfile) {
        return res.status(404).json({
          success: false,
          message: 'Doctor profile not found. Please contact support.'
        });
      }
      
      // Update last login
      user.lastLogin = Date.now();
      await user.save();
      
      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user._id);
      
      // Save refresh token to database
      user.refreshToken = refreshToken;
      await user.save();
      
      // Send response with cookie
      res.cookie('accessToken', accessToken, cookieOptions);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        },
        doctorProfile: {
          _id: doctorProfile._id,
          specialties: doctorProfile.specialties,
          isVerified: doctorProfile.isVerified
        },
        accessToken
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  };

// Update doctor profile including profile image
export const completeDoctorProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find doctor profile and user
    const doctorProfile = await Doctor.findOne({ user: userId });
    const user = await User.findById(userId);
    
    if (!doctorProfile || !user) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }
    
    const {
      qualifications,
      specialties,
      experience,
      clinicDetails,
      hospitalAffiliations,
      consultationFee,
      languages,
      bio,
      availability,
      profileImage // Check for profile image as base64
    } = req.body;
    
    // Handle profile image upload if provided
    if (req.file || profileImage) {
      // Delete old image from Cloudinary if it exists
      if (user.cloudinaryId) {
        try {
          await cloudinary.uploader.destroy(user.cloudinaryId);
        } catch (error) {
          console.error('Error deleting old profile image:', error);
        }
      }
      
      // Upload new image
      let profileImageData = null;
      
      if (req.file) {
        // Multer file
        profileImageData = await uploadFile(req.file, 'medimantra/doctors/profiles');
      } else if (profileImage && typeof profileImage === 'string' && profileImage.startsWith('data:image')) {
        // Base64 image
        profileImageData = await uploadBase64Image(profileImage);
      }
      
      if (profileImageData) {
        user.profilePicture = profileImageData.url;
        user.cloudinaryId = profileImageData.public_id;
        await user.save();
      }
    }
    
    // Update doctor profile
    if (qualifications) doctorProfile.qualifications = qualifications;
    if (specialties) doctorProfile.specialties = specialties;
    if (experience) doctorProfile.experience = experience;
    if (clinicDetails) doctorProfile.clinicDetails = clinicDetails;
    if (hospitalAffiliations) doctorProfile.hospitalAffiliations = hospitalAffiliations;
    if (consultationFee) doctorProfile.consultationFee = consultationFee;
    if (languages) doctorProfile.languages = languages;
    if (bio) doctorProfile.bio = bio;
    if (availability) doctorProfile.availability = availability;
    
    // Reset verification status if profile was updated
    doctorProfile.isVerified = false;
    
    await doctorProfile.save();
    
    res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully. Awaiting admin verification.',
      data: {
        ...doctorProfile._doc,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture
        }
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update doctor profile',
      error: error.message
    });
  }
};

// Upload verification documents with Cloudinary
export const uploadVerificationDocs = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find doctor profile
    const doctorProfile = await Doctor.findOne({ user: userId });
    
    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }
    
    // Check if files exist in request
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }
    
    // Upload each file to Cloudinary
    const uploadPromises = req.files.map(async (file) => {
      try {
        const result = await uploadFile(file, 'medimantra/doctors/documents');
        
        return {
          name: file.originalname || 'Document',
          url: result.url,
          public_id: result.public_id,
          fileType: file.mimetype,
          verified: false,
          uploadedAt: new Date()
        };
      } catch (error) {
        console.error(`Failed to upload document:`, error);
        return null;
      }
    });
    
    // Wait for all uploads to complete
    const uploadedDocs = await Promise.all(uploadPromises);
    
    // Filter out failed uploads
    const successfulUploads = uploadedDocs.filter(doc => doc !== null);
    
    if (successfulUploads.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Document uploads failed'
      });
    }
    
    // Add to verification documents
    doctorProfile.verificationDocuments = [
      ...doctorProfile.verificationDocuments || [],
      ...successfulUploads
    ];
    
    // Reset verification status
    doctorProfile.isVerified = false;
    
    await doctorProfile.save();
    
    res.status(200).json({
      success: true,
      message: 'Verification documents uploaded successfully. Awaiting admin verification.',
      data: {
        documents: successfulUploads,
        totalDocuments: doctorProfile.verificationDocuments.length
      }
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload verification documents',
      error: error.message
    });
  }
};