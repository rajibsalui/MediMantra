import mongoose from 'mongoose';

const callRecordSchema = new mongoose.Schema({
  caller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // Duration in seconds
    default: 0
  },
  callType: {
    type: String,
    enum: ['audio', 'video'],
    default: 'video'
  },
  status: {
    type: String,
    enum: ['completed', 'missed', 'rejected', 'failed'],
    default: 'completed'
  },
  notes: {
    type: String,
    trim: true
  }
}, { 
  timestamps: true 
});

// Indexes for faster queries
callRecordSchema.index({ caller: 1, createdAt: -1 });
callRecordSchema.index({ receiver: 1, createdAt: -1 });
callRecordSchema.index({ appointment: 1 });

const CallRecord = mongoose.model('CallRecord', callRecordSchema);

export default CallRecord;
