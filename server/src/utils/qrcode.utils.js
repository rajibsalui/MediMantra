import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { logger } from './logger.js';

/**
 * Generate QR code as data URL
 * @param {string} data - Data to encode in QR code
 * @param {Object} options - QR code options
 * @returns {Promise<string>} - QR code as data URL
 */
export const generateQRCodeDataURL = async (data, options = {}) => {
  try {
    const defaultOptions = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 1,
      color: {
        dark: '#3b82f6',  // MediMantra blue
        light: '#ffffff'  // White background
      },
      width: 200
    };

    const qrOptions = { ...defaultOptions, ...options };
    const dataURL = await QRCode.toDataURL(data, qrOptions);
    return dataURL;
  } catch (error) {
    logger.error(`Error generating QR code data URL: ${error.message}`);
    throw new Error(`Failed to generate QR code: ${error.message}`);
  }
};

/**
 * Generate QR code image and save to file
 * @param {string} data - Data to encode in QR code
 * @param {string} outputPath - Output file path
 * @param {Object} options - QR code options
 * @returns {Promise<string>} - Path to saved QR code image
 */
export const generateQRCodeFile = async (data, outputPath, options = {}) => {
  try {
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const defaultOptions = {
      errorCorrectionLevel: 'H',
      type: 'png',
      margin: 1,
      color: {
        dark: '#3b82f6',  // MediMantra blue
        light: '#ffffff'  // White background
      },
      width: 300
    };

    const qrOptions = { ...defaultOptions, ...options };
    await QRCode.toFile(outputPath, data, qrOptions);
    return outputPath;
  } catch (error) {
    logger.error(`Error generating QR code file: ${error.message}`);
    throw new Error(`Failed to generate QR code file: ${error.message}`);
  }
};

/**
 * Generate appointment QR code for patient
 * @param {Object} appointment - Appointment details
 * @param {string} userId - User ID
 * @returns {Promise<string>} - QR code as data URL
 */
export const generateAppointmentQR = async (appointment, userId) => {
  try {
    // Create secure data for QR code
    const qrData = JSON.stringify({
      appointmentId: appointment._id,
      patientId: appointment.patient._id || appointment.patient,
      doctorId: appointment.doctor._id || appointment.doctor,
      scheduled: appointment.scheduledStartTime,
      verification: userId.substring(0, 8)
    });

    return generateQRCodeDataURL(qrData);
  } catch (error) {
    logger.error(`Error generating appointment QR code: ${error.message}`);
    throw new Error(`Failed to generate appointment QR code: ${error.message}`);
  }
};

/**
 * Generate prescription QR code
 * @param {Object} prescription - Prescription details
 * @returns {Promise<string>} - QR code as data URL
 */
export const generatePrescriptionQR = async (prescription) => {
  try {
    // Create secure data for QR code
    const qrData = JSON.stringify({
      prescriptionId: prescription._id,
      patientId: prescription.patient,
      doctorId: prescription.doctor,
      issued: prescription.createdAt,
      verification: prescription._id.substring(0, 8)
    });

    return generateQRCodeDataURL(qrData);
  } catch (error) {
    logger.error(`Error generating prescription QR code: ${error.message}`);
    throw new Error(`Failed to generate prescription QR code: ${error.message}`);
  }
};

/**
 * Generate patient identity QR code
 * @param {Object} patient - Patient details
 * @returns {Promise<string>} - Path to saved QR code image
 */
export const generatePatientIDQR = async (patient) => {
  try {
    // Create secure data for QR code
    const qrData = JSON.stringify({
      patientId: patient._id,
      userId: patient.user._id || patient.user,
      name: `${patient.user.firstName} ${patient.user.lastName}`,
      verification: patient._id.substring(0, 8)
    });

    const outputDir = path.join(process.cwd(), 'public', 'qrcodes', 'patients');
    const outputPath = path.join(outputDir, `${patient._id}.png`);
    
    return await generateQRCodeFile(qrData, outputPath);
  } catch (error) {
    logger.error(`Error generating patient ID QR code: ${error.message}`);
    throw new Error(`Failed to generate patient ID QR code: ${error.message}`);
  }
};

/**
 * Generate doctor identity QR code for profile
 * @param {Object} doctor - Doctor details
 * @returns {Promise<string>} - QR code as data URL
 */
export const generateDoctorProfileQR = async (doctor) => {
  try {
    // Create public-facing data for QR code - for public doctor profile
    const profileData = JSON.stringify({
      doctorId: doctor._id,
      name: `Dr. ${doctor.user.firstName} ${doctor.user.lastName}`,
      specializations: doctor.specializations,
      url: `${process.env.FRONTEND_URL}/doctors/${doctor._id}`
    });

    return generateQRCodeDataURL(profileData);
  } catch (error) {
    logger.error(`Error generating doctor profile QR code: ${error.message}`);
    throw new Error(`Failed to generate doctor profile QR code: ${error.message}`);
  }
};