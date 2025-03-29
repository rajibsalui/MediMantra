import mongoose from 'mongoose';

const telemedicineSessionSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  doctorToken: {
    type: String,
    required: true
  },
  patientToken: {
    type: String,
    required: true
  },
  scheduledStartTime: {
    type: Date,
    required: true
  },
  actualStartTime: Date,
  endTime: Date,
  duration: Number, // in seconds
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'missed'],
    default: 'scheduled'
  },
  doctorJoined: {
    type: Boolean,
    default: false
  },
  patientJoined: {
    type: Boolean,
    default: false
  },
  sessionNotes: String,
  cancellationDetails: {
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    cancelledAt: Date
  },
  recordingUrl: String,
  technicalIssues: [{
    issue: String,
    time: Date
  }]
}, {
  timestamps: true
});

const TelemedicineSession = mongoose.model('TelemedicineSession', telemedicineSessionSchema);

export default TelemedicineSession;