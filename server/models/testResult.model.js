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
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  testName: {
    type: String,
    required: true,
    trim: true
  },
  testDate: {
    type: Date,
    default: Date.now
  },
  testType: {
    type: String,
    enum: ['blood', 'urine', 'imaging', 'pathology', 'other'],
    default: 'other'
  },
  results: {
    type: Map,
    of: String
  },
  normalRanges: {
    type: Map,
    of: String
  },
  interpretation: {
    type: String,
    trim: true
  },
  fileUrl: {
    type: String
  },
  fileId: {
    type: String
  },
  labName: {
    type: String,
    trim: true
  },
  isAbnormal: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true
  }
}, { 
  timestamps: true 
});

const TestResult = mongoose.model('TestResult', testResultSchema);

export default TestResult;
