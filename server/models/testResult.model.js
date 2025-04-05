import mongoose from 'mongoose';

const testResultSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  testName: {
    type: String,
    required: true,
    trim: true
  },
  testType: {
    type: String,
    enum: ['blood', 'urine', 'imaging', 'pathology', 'other'],
    required: true
  },
  testDate: {
    type: Date,
    required: true
  },
  results: {
    type: String,
    trim: true
  },
  normalRange: {
    type: String,
    trim: true
  },
  interpretation: {
    type: String,
    trim: true
  },
  laboratory: {
    name: String,
    address: String,
    contactInfo: String
  },
  fileUrl: {
    type: String
  },
  fileId: {
    type: String
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const TestResult = mongoose.model('TestResult', testResultSchema);

export default TestResult;
