import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
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
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  appointmentType: {
    type: String,
    enum: ['in-person', 'video', 'phone'],
    default: 'in-person'
  },
  reason: {
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
    period: {
      type: String,
      enum: ['1 week', '2 weeks', '1 month', '3 months', '6 months']
    }
  },
  prescription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  },
  payment: {
    amount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'refunded'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['cash', 'card', 'upi', 'insurance', 'other'],
      default: 'cash'
    },
    transactionId: {
      type: String,
      trim: true
    },
    receiptUrl: {
      type: String
    }
  },
  videoCallDetails: {
    link: String,
    password: String,
    platform: {
      type: String,
      enum: ['zoom', 'google-meet', 'microsoft-teams', 'custom']
    }
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  feedback: {
    submitted: {
      type: Boolean,
      default: false
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String
  },
  medicalRecords: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRecord'
  }],
  cancellationReason: {
    type: String,
    trim: true
  },
  cancelledBy: {
    type: String,
    enum: ['doctor', 'patient', 'admin'],
  }
}, { 
  timestamps: true 
});

// Pre-save hook to validate appointment time doesn't overlap
appointmentSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('appointmentDate') || this.isModified('appointmentTime')) {
    const startDate = new Date(this.appointmentDate);
    
    // Check for existing appointments
    const existingAppointment = await this.constructor.findOne({
      doctor: this.doctor,
      _id: { $ne: this._id },  // Exclude current appointment when updating
      appointmentDate: this.appointmentDate,
      appointmentTime: this.appointmentTime,
      status: { $nin: ['cancelled', 'no-show'] }
    });

    if (existingAppointment) {
      const error = new Error('This time slot is already booked');
      return next(error);
    }
  }
  next();
});

// Index for faster queries
appointmentSchema.index({ doctor: 1, appointmentDate: 1, status: 1 });
appointmentSchema.index({ patient: 1, appointmentDate: 1, status: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;