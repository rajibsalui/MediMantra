import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  documentType: {
    type: String,
    enum: ['prescription', 'lab_result', 'imaging', 'vaccination', 'discharge_summary', 'other'],
    required: true
  },
  documentDate: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    trim: true
  },
  fileUrl: {
    type: String
  },
  fileId: {
    type: String
  },
  fileName: {
    type: String
  },
  fileType: {
    type: String
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

export default MedicalRecord;
