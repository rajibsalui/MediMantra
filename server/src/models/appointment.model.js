import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointmentDate: {
    type: Date,
    required: [true, "Appointment date is required"]
  },
  timeSlot: {
    startTime: {
      type: String,
      required: [true, "Start time is required"]
    },
    endTime: {
      type: String,
      required: [true, "End time is required"]
    }
  },
  appointmentType: {
    type: String,
    enum: ['in-person', 'video', 'phone'],
    default: 'in-person'
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show', 'rescheduled'],
    default: 'scheduled'
  },
  reasonForVisit: {
    type: String,
    required: [true, "Reason for visit is required"]
  },
  symptoms: [{
    type: String
  }],
  notes: {
    patientNotes: String,
    doctorNotes: String
  },
  vitals: {
    temperature: Number, // in Celsius
    bloodPressure: String, // e.g., "120/80"
    heartRate: Number, // beats per minute
    respiratoryRate: Number, // breaths per minute
    oxygenSaturation: Number, // percentage
    weight: Number, // in kg
    height: Number // in cm
  },
  prescriptions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  }],
  followUpAppointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentDetails: {
    amount: Number,
    transactionId: String,
    paymentMethod: String,
    paymentDate: Date
  },
  cancellationReason: String,
  cancellationDate: Date,
  rescheduledFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  reminders: [{
    sentAt: Date,
    channel: {
      type: String,
      enum: ['email', 'sms', 'push']
    }
  }]
}, { timestamps: true });

// Indexes for efficient querying
appointmentSchema.index({ patient: 1, appointmentDate: -1 });
appointmentSchema.index({ doctor: 1, appointmentDate: -1 });
appointmentSchema.index({ appointmentDate: 1, status: 1 });

// Method to check if appointment can be cancelled
appointmentSchema.methods.canBeCancelled = function() {
  // Appointments can be cancelled if they are scheduled or confirmed
  // and the appointment date is in the future
  if (this.status !== 'scheduled' && this.status !== 'confirmed') {
    return false;
  }
  
  const now = new Date();
  const appointmentTime = new Date(this.appointmentDate);
  
  // Appointments can be cancelled if they're at least 4 hours away
  const fourHoursInMs = 4 * 60 * 60 * 1000;
  return appointmentTime.getTime() - now.getTime() > fourHoursInMs;
};

// Method to cancel appointment
appointmentSchema.methods.cancel = async function(reason) {
  if (!this.canBeCancelled()) {
    throw new Error('This appointment cannot be cancelled');
  }
  
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancellationDate = new Date();
  
  await this.save();
  return this;
};

// Method to reschedule appointment
appointmentSchema.methods.reschedule = async function(newDate, newTimeSlot) {
  if (this.status === 'completed' || this.status === 'no-show') {
    throw new Error('This appointment cannot be rescheduled');
  }
  
  // Create a new appointment with reference to this one
  const rescheduledAppointment = new mongoose.model('Appointment')({
    patient: this.patient,
    doctor: this.doctor,
    appointmentDate: newDate,
    timeSlot: newTimeSlot,
    appointmentType: this.appointmentType,
    status: 'scheduled',
    reasonForVisit: this.reasonForVisit,
    symptoms: this.symptoms,
    notes: this.notes,
    rescheduledFrom: this._id
  });
  
  // Update this appointment
  this.status = 'rescheduled';
  
  await rescheduledAppointment.save();
  await this.save();
  
  return rescheduledAppointment;
};

// Static method to find upcoming appointments for a patient
appointmentSchema.statics.findUpcomingForPatient = function(patientId) {
  const now = new Date();
  return this.find({
    patient: patientId,
    appointmentDate: { $gt: now },
    status: { $in: ['scheduled', 'confirmed'] }
  })
  .sort({ appointmentDate: 1 })
  .populate('doctor', 'firstName lastName specializations');
};

// Static method to find upcoming appointments for a doctor
appointmentSchema.statics.findUpcomingForDoctor = function(doctorId) {
  const now = new Date();
  return this.find({
    doctor: doctorId,
    appointmentDate: { $gt: now },
    status: { $in: ['scheduled', 'confirmed'] }
  })
  .sort({ appointmentDate: 1 })
  .populate('patient', 'firstName lastName dateOfBirth gender');
};

export default mongoose.model('Appointment', appointmentSchema);
