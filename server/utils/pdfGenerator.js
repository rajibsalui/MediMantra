import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadFile } from './fileUpload.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/prescriptions');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Generate a prescription PDF
 * @param {Object} prescription - The prescription object
 * @param {Object} doctor - The doctor object
 * @param {Object} patient - The patient object
 * @returns {Promise<Object>} - The uploaded file info
 */
export const generatePrescriptionPDF = async (prescription, doctor, patient) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Create a unique filename
      const filename = `prescription_${prescription._id}_${Date.now()}.pdf`;
      const filepath = path.join(uploadsDir, filename);
      
      // Create a new PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Prescription for ${patient.user.firstName} ${patient.user.lastName}`,
          Author: `Dr. ${doctor.user.firstName} ${doctor.user.lastName}`,
          Subject: 'Medical Prescription',
          Keywords: 'prescription, medicine, healthcare'
        }
      });
      
      // Pipe the PDF to a file
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);
      
      // Add header with logo and clinic info
      doc.fontSize(20).font('Helvetica-Bold').text('MediMantra Healthcare', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica').text('Your Health, Our Priority', { align: 'center' });
      doc.moveDown(0.5);
      
      // Add a horizontal line
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(1);
      
      // Doctor information
      doc.fontSize(14).font('Helvetica-Bold').text(`Dr. ${doctor.user.firstName} ${doctor.user.lastName}`);
      doc.fontSize(10).font('Helvetica')
        .text(`${doctor.specialties.join(', ')}`)
        .text(`Registration: ${doctor.registrationNumber} (${doctor.registrationCouncil})`)
        .text(`Clinic: ${doctor.clinicDetails?.name || 'MediMantra Clinic'}`);
      
      if (doctor.clinicDetails?.address) {
        const address = doctor.clinicDetails.address;
        doc.text(`${address.street}, ${address.city}, ${address.state}, ${address.zipCode}`);
      }
      
      doc.moveDown(1);
      
      // Patient information
      doc.fontSize(12).font('Helvetica-Bold').text('Patient Information:');
      doc.fontSize(10).font('Helvetica')
        .text(`Name: ${patient.user.firstName} ${patient.user.lastName}`)
        .text(`ID: ${patient._id}`)
        .text(`Date: ${new Date(prescription.createdAt).toLocaleDateString()}`);
      
      doc.moveDown(1);
      
      // Diagnosis
      if (prescription.diagnosis) {
        doc.fontSize(12).font('Helvetica-Bold').text('Diagnosis:');
        doc.fontSize(10).font('Helvetica').text(prescription.diagnosis);
        doc.moveDown(1);
      }
      
      // Medications
      doc.fontSize(12).font('Helvetica-Bold').text('Medications:');
      doc.moveDown(0.5);
      
      // Create a table-like structure for medications
      const tableTop = doc.y;
      const tableLeft = 50;
      const colWidths = [200, 100, 100, 100];
      
      // Table headers
      doc.fontSize(10).font('Helvetica-Bold')
        .text('Medication', tableLeft, tableTop)
        .text('Dosage', tableLeft + colWidths[0], tableTop)
        .text('Frequency', tableLeft + colWidths[0] + colWidths[1], tableTop)
        .text('Duration', tableLeft + colWidths[0] + colWidths[1] + colWidths[2], tableTop);
      
      doc.moveDown(0.5);
      let currentY = doc.y;
      
      // Draw a line under headers
      doc.moveTo(tableLeft, currentY - 5)
        .lineTo(tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], currentY - 5)
        .stroke();
      
      // Table rows
      prescription.medications.forEach((med, index) => {
        currentY = doc.y;
        
        doc.fontSize(10).font('Helvetica')
          .text(med.name, tableLeft, currentY)
          .text(med.dosage, tableLeft + colWidths[0], currentY)
          .text(med.frequency, tableLeft + colWidths[0] + colWidths[1], currentY)
          .text(med.duration, tableLeft + colWidths[0] + colWidths[1] + colWidths[2], currentY);
        
        // Add instructions if available
        if (med.instructions) {
          doc.moveDown(0.3);
          doc.fontSize(9).font('Helvetica-Italic')
            .text(`Instructions: ${med.instructions}`, tableLeft, doc.y, { width: 500 });
        }
        
        doc.moveDown(0.7);
      });
      
      // Add a line after medications
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(1);
      
      // Notes
      if (prescription.notes) {
        doc.fontSize(12).font('Helvetica-Bold').text('Additional Notes:');
        doc.fontSize(10).font('Helvetica').text(prescription.notes);
        doc.moveDown(1);
      }
      
      // Validity
      doc.fontSize(10).font('Helvetica')
        .text(`Valid from: ${new Date(prescription.startDate).toLocaleDateString()} to ${new Date(prescription.endDate).toLocaleDateString()}`);
      
      // Footer
      const pageHeight = doc.page.height;
      doc.fontSize(8).font('Helvetica')
        .text('This prescription is electronically generated through MediMantra Healthcare System.', 50, pageHeight - 100, { align: 'center' })
        .text('Please consult your doctor before changing any medication.', 50, pageHeight - 85, { align: 'center' });
      
      // Doctor's signature
      doc.fontSize(10).font('Helvetica-Bold')
        .text('Doctor\'s Signature:', 400, pageHeight - 150);
      
      doc.fontSize(10).font('Helvetica')
        .text(`Dr. ${doctor.user.firstName} ${doctor.user.lastName}`, 400, pageHeight - 120);
      
      // Finalize the PDF
      doc.end();
      
      // Wait for the stream to finish
      stream.on('finish', async () => {
        try {
          // Upload the file to cloud storage
          const fileObj = {
            path: filepath,
            originalname: filename,
            mimetype: 'application/pdf'
          };
          
          const uploadedFile = await uploadFile(fileObj, 'prescriptions');
          
          // Delete the local file after upload
          fs.unlink(filepath, (err) => {
            if (err) console.error('Error deleting local file:', err);
          });
          
          resolve(uploadedFile);
        } catch (error) {
          reject(error);
        }
      });
      
      stream.on('error', (error) => {
        reject(error);
      });
      
    } catch (error) {
      reject(error);
    }
  });
};
