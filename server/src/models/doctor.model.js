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
    type: String
  }],
  experience: {
    type: Number, // in years
    default: 0
  },
  consultationFee: {
    type: Number,
    default: 500
  },
  profileImage: {
    type: String,
    default: ""
  },
  practiceLocations: [{
    hospitalName: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    }
  }],
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
  bio: {
    type: String,
    maxlength: 1000
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

// Static method to find doctors by specialization
doctorSchema.statics.findBySpecialization = function(specialization) {
  return this.find({ specializations: { $regex: new RegExp(specialization, 'i') } })
    .populate('user', 'firstName lastName email phone avatar');
};

export default mongoose.model('Doctor', doctorSchema);
