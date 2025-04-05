import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  dosage: {
    type: String,
    required: true,
    trim: true
  },
  frequency: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: String,
    required: true,
    trim: true
  },
  instructions: {
    type: String,
    trim: true
  }
}, { _id: true });

const prescriptionSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  date: {
    type: Date,
    default: Date.now
  },
  medications: [medicationSchema],
  diagnosis: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  followUp: {
    recommended: {
      type: Boolean,
      default: false
    },
    date: Date,
    notes: String
  },
  fileUrl: {
    type: String
  },
  fileId: {
    type: String
  }
}, {
  timestamps: true
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);

export default Prescription;
