import Prescription from '../models/prescription.model.js';
import { User } from '../models/user.model.js';
import Appointment from '../models/appointment.model.js';
import Notification from '../models/notification.model.js';
import MedicalRecord from '../models/medicalRecord.model.js';
import Doctor from '../models/doctor.model.js';
import Patient from '../models/patient.model.js';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import crypto from 'crypto';
import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create prescription
export const createPrescription = async (req, res) => {
  try {
    const {
      patientId,
      diagnosis,
      medications,
      instructions,
      notes,
      appointmentId
    } = req.body;
    
    const doctorId = req.user._id;
    
    // Validate required fields
    if (!patientId || !medications || !medications.length) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID and at least one medication are required'
      });
    }
    
    // Generate unique prescription number
    const prescriptionNumber = crypto.randomBytes(4).toString('hex').toUpperCase();
    
    // Create prescription
    const prescription = await Prescription.create({
      prescriptionNumber,
      patient: patientId,
      doctor: doctorId,
      diagnosis,
      medications,
      instructions,
      notes,
      appointment: appointmentId,
      prescriptionDate: new Date(),
      status: 'active'
    });
    
    // If appointment is provided, link prescription to it
    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, {
        $push: { prescriptions: prescription._id }
      });
    }
    
    // Create notification for patient
    await Notification.createNotification({
      recipient: patientId,
      sender: doctorId,
      type: 'new_prescription',
      title: 'New Prescription',
      message: 'Your doctor has issued a new prescription',
      relatedDocument: {
        model: 'Prescription',
        id: prescription._id
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      prescription
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating prescription',
      error: error.message
    });
  }
};

// Get prescription by ID
export const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Find prescription with related details
    const prescription = await Prescription.findById(id)
      .populate('doctor', 'firstName lastName specializations')
      .populate('patient', 'firstName lastName')
      .populate('appointment');
    
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }
    
    // Check authorization (only patient, doctor who created it, or admin/pharmacy can view)
    if (
      prescription.patient._id.toString() !== userId.toString() &&
      prescription.doctor._id.toString() !== userId.toString() &&
      req.user.role !== 'admin' &&
      req.user.role !== 'pharmacy'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this prescription'
      });
    }
    
    // For pharmacy users, log the access
    if (req.user.role === 'pharmacy') {
      prescription.pharmacyAccessLog.push({
        pharmacy: userId,
        accessedAt: new Date()
      });
      await prescription.save();
    }
    
    res.status(200).json({
      success: true,
      prescription
    });
  } catch (error) {
    console.error('Get prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching prescription',
      error: error.message
    });
  }
};

// Get prescriptions for patient
export const getPrescriptionsForPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status, limit = 10, skip = 0 } = req.query;
    
    // Check authorization (only the patient themselves, their doctor, or admin can access)
    if (
      req.user._id.toString() !== patientId &&
      req.user.role !== 'admin'
    ) {
      // Check if user is a doctor who has treated this patient
      if (req.user.role === 'doctor') {
        const hasAppointment = await Appointment.findOne({
          doctor: req.user._id,
          patient: patientId,
          status: 'completed'
        });
        
        if (!hasAppointment) {
          return res.status(403).json({
            success: false,
            message: 'You are not authorized to view prescriptions for this patient'
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to view these prescriptions'
        });
      }
    }
    
    // Build query
    const query = { patient: patientId };
    if (status) {
      query.status = status;
    }
    
    // Get prescriptions
    const prescriptions = await Prescription.find(query)
      .populate('doctor', 'firstName lastName specializations')
      .sort({ prescriptionDate: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Prescription.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: prescriptions.length,
      total,
      prescriptions
    });
  } catch (error) {
    console.error('Get patient prescriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching prescriptions',
      error: error.message
    });
  }
};

// Get prescriptions for doctor
export const getPrescriptionsForDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status, limit = 10, skip = 0 } = req.query;
    
    // Check authorization (only the doctor themselves or admin can access)
    if (
      req.user._id.toString() !== doctorId &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view these prescriptions'
      });
    }
    
    // Build query
    const query = { doctor: doctorId };
    if (status) {
      query.status = status;
    }
    
    // Get prescriptions
    const prescriptions = await Prescription.find(query)
      .populate('patient', 'firstName lastName')
      .sort({ prescriptionDate: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Prescription.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: prescriptions.length,
      total,
      prescriptions
    });
  } catch (error) {
    console.error('Get doctor prescriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching prescriptions',
      error: error.message
    });
  }
};

// Update prescription
export const updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { diagnosis, instructions, notes } = req.body;
    const userId = req.user._id;
    
    // Find prescription
    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }
    
    // Check authorization (only the doctor who created it or admin can update)
    if (
      prescription.doctor.toString() !== userId.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this prescription'
      });
    }
    
    // Check if prescription can be updated
    if (prescription.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed prescriptions cannot be updated'
      });
    }
    
    // Update prescription
    if (diagnosis !== undefined) prescription.diagnosis = diagnosis;
    if (instructions !== undefined) prescription.instructions = instructions;
    if (notes !== undefined) prescription.notes = notes;
    
    await prescription.save();
    
    res.status(200).json({
      success: true,
      message: 'Prescription updated successfully',
      prescription
    });
  } catch (error) {
    console.error('Update prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating prescription',
      error: error.message
    });
  }
};

// Add medication
export const addMedication = async (req, res) => {
  try {
    const { id } = req.params;
    const medication = req.body;
    const userId = req.user._id;
    
    // Validate medication data
    if (!medication.name || !medication.dosage || !medication.frequency) {
      return res.status(400).json({
        success: false,
        message: 'Medication name, dosage, and frequency are required'
      });
    }
    
    // Find prescription
    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }
    
    // Check authorization (only the doctor who created it or admin can add medication)
    if (
      prescription.doctor.toString() !== userId.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to modify this prescription'
      });
    }
    
    // Check if prescription can be updated
    if (prescription.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed prescriptions cannot be modified'
      });
    }
    
    // Add medication
    prescription.medications.push({
      ...medication,
      addedAt: new Date()
    });
    
    await prescription.save();
    
    res.status(200).json({
      success: true,
      message: 'Medication added successfully',
      medications: prescription.medications
    });
  } catch (error) {
    console.error('Add medication error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding medication',
      error: error.message
    });
  }
};

// Remove medication
export const removeMedication = async (req, res) => {
  try {
    const { id, medicationId } = req.params;
    const userId = req.user._id;
    
    // Find prescription
    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }
    
    // Check authorization (only the doctor who created it or admin can remove medication)
    if (
      prescription.doctor.toString() !== userId.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to modify this prescription'
      });
    }
    
    // Check if prescription can be updated
    if (prescription.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed prescriptions cannot be modified'
      });
    }
    
    // Remove medication
    prescription.medications = prescription.medications.filter(
      med => med._id.toString() !== medicationId
    );
    
    await prescription.save();
    
    res.status(200).json({
      success: true,
      message: 'Medication removed successfully',
      medications: prescription.medications
    });
  } catch (error) {
    console.error('Remove medication error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing medication',
      error: error.message
    });
  }
};

// Update medication
export const updateMedication = async (req, res) => {
  try {
    const { id, medicationId } = req.params;
    const updates = req.body;
    const userId = req.user._id;
    
    // Find prescription
    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }
    
    // Check authorization (only the doctor who created it or admin can update medication)
    if (
      prescription.doctor.toString() !== userId.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to modify this prescription'
      });
    }
    
    // Check if prescription can be updated
    if (prescription.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed prescriptions cannot be modified'
      });
    }
    
    // Find medication
    const medicationIndex = prescription.medications.findIndex(
      med => med._id.toString() === medicationId
    );
    
    if (medicationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found in prescription'
      });
    }
    
    // Update medication
    const medication = prescription.medications[medicationIndex];
    
    if (updates.name) medication.name = updates.name;
    if (updates.dosage) medication.dosage = updates.dosage;
    if (updates.frequency) medication.frequency = updates.frequency;
    if (updates.duration) medication.duration = updates.duration;
    if (updates.instructions) medication.instructions = updates.instructions;
    if (updates.route) medication.route = updates.route;
    if (updates.quantity) medication.quantity = updates.quantity;
    
    // Save the medication back to the array
    prescription.medications[medicationIndex] = medication;
    
    await prescription.save();
    
    res.status(200).json({
      success: true,
      message: 'Medication updated successfully',
      medication
    });
  } catch (error) {
    console.error('Update medication error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating medication',
      error: error.message
    });
  }
};

// Mark prescription as dispensed
export const markDispensed = async (req, res) => {
  try {
    const { id } = req.params;
    const { pharmacyNotes } = req.body;
    const userId = req.user._id;
    
    // Find prescription
    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }
    
    // Check authorization (only pharmacist or admin can mark as dispensed)
    if (req.user.role !== 'pharmacy' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to dispense prescriptions'
      });
    }
    
    // Check if prescription is active
    if (prescription.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Cannot dispense prescription with status "${prescription.status}"`
      });
    }
    
    // Update prescription
    prescription.status = 'dispensed';
    prescription.dispensingDetails = {
      dispensedBy: userId,
      dispensedAt: new Date(),
      pharmacy: userId,
      notes: pharmacyNotes
    };
    
    await prescription.save();
    
    // Create notification for patient
    await Notification.createNotification({
      recipient: prescription.patient,
      sender: userId,
      type: 'prescription_dispensed',
      title: 'Prescription Dispensed',
      message: 'Your prescription has been dispensed by the pharmacy',
      relatedDocument: {
        model: 'Prescription',
        id: prescription._id
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Prescription marked as dispensed',
      prescription
    });
  } catch (error) {
    console.error('Mark dispensed error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking prescription as dispensed',
      error: error.message
    });
  }
};

// Mark prescription as completed
export const markCompleted = async (req, res) => {
  try {
    const { id } = req.params;
    const { completionNotes } = req.body;
    const userId = req.user._id;
    
    // Find prescription
    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }
    
    // Check authorization (only doctor, pharmacy, or admin can mark as completed)
    if (
      prescription.doctor.toString() !== userId.toString() &&
      req.user.role !== 'pharmacy' &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to complete this prescription'
      });
    }
    
    // Check if prescription can be completed
    if (prescription.status === 'cancelled' || prescription.status === 'expired') {
      return res.status(400).json({
        success: false,
        message: `Cannot complete prescription with status "${prescription.status}"`
      });
    }
    
    // Update prescription
    prescription.status = 'completed';
    prescription.completionDetails = {
      completedBy: userId,
      completedAt: new Date(),
      notes: completionNotes
    };
    
    await prescription.save();
    
    res.status(200).json({
      success: true,
      message: 'Prescription marked as completed',
      prescription
    });
  } catch (error) {
    console.error('Mark completed error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking prescription as completed',
      error: error.message
    });
  }
};

// Check drug interactions
export const checkDrugInteractions = async (req, res) => {
  try {
    const { medications } = req.body;
    
    if (!medications || !Array.isArray(medications) || medications.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'At least two medications are required for interaction checking'
      });
    }
    
    // In a real application, this would connect to a drug interaction API
    // For demonstration, return a mock interaction result
    const mockInteractions = [
      {
        severity: 'moderate',
        description: 'May increase risk of serotonin syndrome',
        drugs: [medications[0], medications[1]],
        recommendation: 'Monitor for signs of serotonin syndrome'
      }
    ];
    
    res.status(200).json({
      success: true,
      interactions: mockInteractions
    });
  } catch (error) {
    console.error('Check drug interactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking drug interactions',
      error: error.message
    });
  }
};

// Generate prescription PDF
export const generatePrescriptionPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Find prescription with related details
    const prescription = await Prescription.findById(id)
      .populate('doctor', 'firstName lastName specializations registrationNumber')
      .populate('patient', 'firstName lastName dateOfBirth');
    
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }
    
    // Check authorization
    if (
      prescription.patient._id.toString() !== userId.toString() &&
      prescription.doctor._id.toString() !== userId.toString() &&
      req.user.role !== 'admin' &&
      req.user.role !== 'pharmacy'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this prescription'
      });
    }
    
    // Get doctor details
    const doctor = await Doctor.findOne({ user: prescription.doctor._id });
    
    // Get patient details
    const patient = await Patient.findOne({ user: prescription.patient._id });
    
    // Create PDF
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=prescription_${prescription.prescriptionNumber}.pdf`);
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Add content to PDF
    doc.fontSize(18).text('MediMantra Healthcare', { align: 'center' });
    doc.fontSize(14).text('Prescription', { align: 'center' });
    doc.moveDown();
    
    // Add prescription info
    doc.fontSize(12).text(`Prescription #: ${prescription.prescriptionNumber}`);
    doc.text(`Date: ${new Date(prescription.prescriptionDate).toLocaleDateString()}`);
    doc.moveDown();
    
    // Add doctor info
    doc.fontSize(12).text('Doctor Information:', { underline: true });
    doc.text(`Dr. ${prescription.doctor.firstName} ${prescription.doctor.lastName}`);
    if (doctor) {
      doc.text(`Specialization: ${doctor.specializations.join(', ')}`);
      doc.text(`Registration #: ${doctor.registrationNumber}`);
    }
    doc.moveDown();
    
    // Add patient info
    doc.fontSize(12).text('Patient Information:', { underline: true });
    doc.text(`Name: ${prescription.patient.firstName} ${prescription.patient.lastName}`);
    if (patient && patient.dateOfBirth) {
      const age = Math.floor((new Date() - new Date(patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000));
      doc.text(`Age: ${age} years`);
    }
    doc.moveDown();
    
    // Add diagnosis
    if (prescription.diagnosis) {
      doc.fontSize(12).text('Diagnosis:', { underline: true });
      doc.text(prescription.diagnosis);
      doc.moveDown();
    }
    
    // Add medications
    doc.fontSize(12).text('Medications:', { underline: true });
    prescription.medications.forEach((med, index) => {
      doc.text(`${index + 1}. ${med.name}`);
      doc.text(`   Dosage: ${med.dosage}`);
      doc.text(`   Frequency: ${med.frequency}`);
      if (med.duration) doc.text(`   Duration: ${med.duration}`);
      if (med.instructions) doc.text(`   Instructions: ${med.instructions}`);
      doc.moveDown(0.5);
    });
    doc.moveDown();
    
    // Add instructions
    if (prescription.instructions) {
      doc.fontSize(12).text('Instructions:', { underline: true });
      doc.text(prescription.instructions);
      doc.moveDown();
    }
    
    // Add QR code for verification
    const qrCodeData = `https://medimantra.com/verify-prescription/${prescription._id}`;
    try {
      const qrCodeDataURL = await QRCode.toDataURL(qrCodeData);
      doc.image(qrCodeDataURL, {
        fit: [100, 100],
        align: 'right',
        valign: 'bottom'
      });
    } catch (err) {
      console.error('QR code generation error:', err);
    }
    
    // Add footer
    doc.fontSize(10).text('This is a digital prescription generated by MediMantra Healthcare System.', {
      align: 'center',
      bottom: 50
    });
    
    // Finalize PDF
    doc.end();
    
  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating prescription PDF',
      error: error.message
    });
  }
};

// Get active prescriptions for patient
export const getActivePrescriptionsForPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { limit = 10, skip = 0 } = req.query;
    
    // Check authorization
    if (
      req.user._id.toString() !== patientId &&
      req.user.role !== 'admin' &&
      req.user.role !== 'doctor'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view these prescriptions'
      });
    }
    
    if (req.user.role === 'doctor') {
      // Doctors can only view if they've treated the patient
      const hasAppointment = await Appointment.findOne({
        doctor: req.user._id,
        patient: patientId,
        status: { $in: ['completed', 'confirmed'] }
      });
      
      if (!hasAppointment) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to view prescriptions for this patient'
        });
      }
    }
    
    // Get active prescriptions
    const prescriptions = await Prescription.find({
      patient: patientId,
      status: { $in: ['active', 'dispensed'] }
    })
      .populate('doctor', 'firstName lastName specializations')
      .sort({ prescriptionDate: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Prescription.countDocuments({
      patient: patientId,
      status: { $in: ['active', 'dispensed'] }
    });
    
    res.status(200).json({
      success: true,
      count: prescriptions.length,
      total,
      prescriptions
    });
  } catch (error) {
    console.error('Get active prescriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active prescriptions',
      error: error.message
    });
  }
};

// Verify prescription
export const verifyPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find prescription with related details
    const prescription = await Prescription.findById(id)
      .populate('doctor', 'firstName lastName')
      .populate('patient', 'firstName lastName');
    
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found or is invalid'
      });
    }
    
    // Check if prescription is expired
    const isExpired = prescription.status === 'expired' || 
      (prescription.expiryDate && new Date(prescription.expiryDate) < new Date());
    
    // Return verification details
    res.status(200).json({
      success: true,
      isValid: !isExpired && prescription.status !== 'cancelled',
      prescription: {
        prescriptionNumber: prescription.prescriptionNumber,
        status: prescription.status,
        isExpired,
        doctor: `Dr. ${prescription.doctor.firstName} ${prescription.doctor.lastName}`,
        patient: `${prescription.patient.firstName} ${prescription.patient.lastName}`,
        issueDate: prescription.prescriptionDate,
        medicationsCount: prescription.medications.length
      }
    });
  } catch (error) {
    console.error('Verify prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying prescription',
      error: error.message
    });
  }
};
