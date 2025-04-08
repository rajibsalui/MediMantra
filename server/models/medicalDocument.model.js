import mongoose from 'mongoose';

const medicalDocumentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['prescription', 'lab_report', 'imaging', 'discharge_summary', 'insurance', 'other'],
    default: 'other'
  },
  description: {
    type: String,
    trim: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileId: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  documentDate: {
    type: Date
  },
  isSharedWithDoctor: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  }]
}, { 
  timestamps: true 
});

const MedicalDocument = mongoose.model('MedicalDocument', medicalDocumentSchema);

export default MedicalDocument;
