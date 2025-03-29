import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
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
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  rating: {
    type: Number,
    required: [true, "Rating is required"],
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: [true, "Review title is required"],
    trim: true,
    maxlength: 100
  },
  reviewText: {
    type: String,
    required: [true, "Review text is required"],
    trim: true,
    maxlength: 1000
  },
  categories: {
    knowledge: {
      type: Number,
      min: 1,
      max: 5
    },
    bedside_manner: {
      type: Number,
      min: 1,
      max: 5
    },
    waiting_time: {
      type: Number,
      min: 1,
      max: 5
    },
    cleanliness: {
      type: Number,
      min: 1,
      max: 5
    },
    staff_friendliness: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  recommends: {
    type: Boolean,
    default: null
  },
  treatmentEffective: {
    type: Boolean,
    default: null
  },
  wouldVisitAgain: {
    type: Boolean,
    default: null
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isVerifiedPatient: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending'
  },
  moderationNotes: String,
  response: {
    text: String,
    respondedAt: Date,
    isPublic: {
      type: Boolean,
      default: true
    }
  },
  helpfulVotes: {
    count: {
      type: Number,
      default: 0
    },
    voters: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      votedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  reportedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['inappropriate', 'spam', 'false_information', 'personal_attack', 'other'],
      default: 'other'
    },
    comments: String,
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

// Indexes for efficient querying
reviewSchema.index({ doctor: 1, createdAt: -1 });
reviewSchema.index({ patient: 1, doctor: 1 }, { unique: true });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ status: 1 });

// Post-save hook to update doctor's average rating
reviewSchema.post('save', async function() {
  try {
    const Doctor = mongoose.model('Doctor');
    
    // Calculate new average
    const reviews = await this.constructor.find({ 
      doctor: this.doctor,
      status: 'approved'
    });
    
    if (!reviews || reviews.length === 0) return;
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    // Update doctor document
    await Doctor.findOneAndUpdate(
      { user: this.doctor },
      { 
        'ratings.average': parseFloat(averageRating.toFixed(1)),
        'ratings.count': reviews.length
      }
    );
  } catch (error) {
    console.error('Error updating doctor rating:', error);
  }
});

// Method to mark review as helpful
reviewSchema.methods.markHelpful = async function(userId) {
  // Check if user already voted
  if (this.helpfulVotes.voters.some(v => v.user.toString() === userId.toString())) {
    return this;
  }
  
  this.helpfulVotes.voters.push({ user: userId });
  this.helpfulVotes.count = this.helpfulVotes.voters.length;
  
  await this.save();
  return this;
};

// Method to add doctor response
reviewSchema.methods.addResponse = async function(responseText, isPublic = true) {
  this.response = {
    text: responseText,
    respondedAt: new Date(),
    isPublic
  };
  
  await this.save();
  return this;
};

// Method to report review
reviewSchema.methods.report = async function(userId, reason, comments) {
  // Check if user already reported
  if (this.reportedBy.some(r => r.user.toString() === userId.toString())) {
    return this;
  }
  
  this.reportedBy.push({
    user: userId,
    reason,
    comments
  });
  
  // If report count exceeds threshold, flag the review for moderation
  if (this.reportedBy.length >= 3 && this.status === 'approved') {
    this.status = 'flagged';
  }
  
  await this.save();
  return this;
};

// Static method to find pending reviews for moderation
reviewSchema.statics.findPendingModeration = function() {
  return this.find({
    $or: [
      { status: 'pending' },
      { status: 'flagged' }
    ]
  })
  .sort({ createdAt: 1 })
  .populate('patient', 'firstName lastName')
  .populate('doctor', 'firstName lastName');
};

// Static method to find top reviews for a doctor
reviewSchema.statics.findTopForDoctor = function(doctorId, limit = 5) {
  return this.find({
    doctor: doctorId,
    status: 'approved'
  })
  .sort({ helpfulVotes: -1, createdAt: -1 })
  .limit(limit)
  .populate('patient', 'firstName lastName avatar');
};

export default mongoose.model('Review', reviewSchema);
