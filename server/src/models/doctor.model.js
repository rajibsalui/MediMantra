import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  registrationNumber: {
    type: String,
    required: [true, "Registration number is required"],
    unique: true,
    trim: true
  },
  qualifications: [{
    degree: {
      type: String,
      required: true
    },
    institution: String,
    year: Number
  }],
  specializations: [{
    type: String,
    required: [true, "At least one specialization is required"]
  }],
  experience: {
    type: Number, // in years
    required: [true, "Years of experience is required"],
    min: 0
  },
  practiceLocations: [{
    hospitalName: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'India'
      }
    },
    contactNumber: String,
    workingHours: String
  }],
  consultationFee: {
    type: Number,
    required: [true, "Consultation fee is required"],
    min: 0
  },
  availabilitySchedule: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    slots: [{
      startTime: String,
      endTime: String,
      isAvailable: {
        type: Boolean,
        default: true
      }
    }]
  }],
  languages: [{
    type: String
  }],
  bio: {
    type: String,
    maxlength: 1000
  },
  profileImage: {
    type: String,
    default: ""
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    documentType: {
      type: String,
      enum: ['degree', 'license', 'certification', 'identity', 'other']
    },
    documentUrl: String,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    }
  }],
  professionalMemberships: [{
    organization: String,
    membershipId: String,
    joinDate: Date
  }],
  acceptingNewPatients: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Virtual for full name
doctorSchema.virtual('fullName').get(async function() {
  const userDoc = await mongoose.model('User').findById(this.user);
  if (userDoc) {
    return `Dr. ${userDoc.firstName} ${userDoc.lastName}`;
  }
  return "Dr.";
});

// Method to calculate years of practice from experience
doctorSchema.methods.yearsOfPractice = function() {
  return this.experience;
};

// Method to check if doctor is available at specific time
doctorSchema.methods.isAvailable = function(day, time) {
  const daySchedule = this.availabilitySchedule.find(s => s.day === day);
  if (!daySchedule) return false;
  
  const timeSlot = daySchedule.slots.find(slot => {
    const start = new Date(`2000-01-01T${slot.startTime}`);
    const end = new Date(`2000-01-01T${slot.endTime}`);
    const checkTime = new Date(`2000-01-01T${time}`);
    return checkTime >= start && checkTime <= end && slot.isAvailable;
  });
  
  return !!timeSlot;
};

// Static method to find doctors by specialization
doctorSchema.statics.findBySpecialization = function(specialization) {
  return this.find({ specializations: { $regex: new RegExp(specialization, 'i') } })
    .populate('user', 'firstName lastName email phone avatar');
};

// Static method to find top-rated doctors
doctorSchema.statics.findTopRated = function(limit = 10) {
  return this.find({ 'ratings.count': { $gt: 0 } })
    .sort({ 'ratings.average': -1 })
    .limit(limit)
    .populate('user', 'firstName lastName email phone avatar');
};

export default mongoose.model('Doctor', doctorSchema);
