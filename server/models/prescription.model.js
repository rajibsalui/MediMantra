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
}, { _id: false });

const prescriptionSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
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
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  fileUrl: {
    type: String
  },
  fileId: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  }
}, { 
  timestamps: true 
});

// Pre-save hook to set endDate if not provided
prescriptionSchema.pre('save', function(next) {
  if (!this.endDate) {
    // Default to 30 days from start date
    const endDate = new Date(this.startDate);
    endDate.setDate(endDate.getDate() + 30);
    this.endDate = endDate;
  }
  next();
});

// Virtual for checking if prescription is active
prescriptionSchema.virtual('isActive').get(function() {
  return new Date() <= new Date(this.endDate) && this.status === 'active';
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);

export default Prescription;
