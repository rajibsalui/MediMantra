import mongoose from 'mongoose';

const availabilitySlotSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      required: true,
    },
    slots: [
      {
        startTime: {
          type: String,
          required: true,
        },
        endTime: {
          type: String,
          required: true,
        },
        isBooked: {
          type: Boolean,
          default: false,
        },
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'Other', '']
  },
  qualifications: [{
    degree: {
      type: String,
      required: true,
      trim: true
    },
    institution: {
      type: String,
      required: true,   
      trim: true
    },
    year: {
      type: Number,
      required: true
    }
  }],
  specialties: [{
    type: String,
    required: true,
    trim: true
  }],
  experience: {
    type: Number,
    required: true,
    min: 0
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  registrationCouncil: {
    type: String,
    required: true,
    trim: true
  },
  clinicDetails: {
    name: {
      type: String,
      trim: true
    },
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
    contactNumber: String
  },
  hospitalAffiliations: [{
    name: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    from: {
      type: Date
    },
    to: {
      type: Date
    },
    current: {
      type: Boolean,
      default: false
    }
  }],
  availability: [availabilitySlotSchema],
  consultationFee: {
    inPerson: {
      type: Number,
      required: true
    },
    video: {
      type: Number
    },
    phone: {
      type: Number
    }
  },
  averageRating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  reviews: [reviewSchema],
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    verified: {
      type: Boolean,
      default: false
    }
  }],
  bio: {
    type: String,
    trim: true
  },
  languages: [{
    type: String,
    trim: true
  }],
  videoConsultation: {
    available: {
      type: Boolean,
      default: false
    },
    platform: {
      type: String,
      enum: ['zoom', 'google-meet', 'microsoft-teams', 'custom'],
      default: 'zoom'
    }
  },
  acceptingNewPatients: {
    type: Boolean,
    default: true
  },
  customFields: {
    type: Map,
    of: String
  },
  registrationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    trim: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add this method to your User schema
doctorSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
// Virtual for full name
doctorSchema.virtual('fullName').get(function() {
  return `Dr. ${this.user.firstName} ${this.user.lastName}`;
});

// Virtual for pending appointments
doctorSchema.virtual('pendingAppointments', {
  ref: 'Appointment',
  localField: '_id',
  foreignField: 'doctor',
  match: { status: 'scheduled' }
});

// Update average rating when a new review is added
doctorSchema.methods.updateAverageRating = async function() {
  const doctor = await this.model('Doctor').findById(this._id);
  const totalRating = doctor.reviews.reduce((sum, review) => sum + review.rating, 0);
  doctor.averageRating = totalRating / doctor.reviews.length || 0;
  doctor.totalReviews = doctor.reviews.length;
  await doctor.save();
};

// Method to check doctor availability
doctorSchema.methods.isAvailableAt = function(day, time) {
  const daySchedule = this.availability.find(a => a.day === day && a.isAvailable);
  if (!daySchedule) return false;
  
  return daySchedule.slots.some(slot => {
    const start = slot.startTime;
    const end = slot.endTime;
    return time >= start && time < end && !slot.isBooked;
  });
};

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;