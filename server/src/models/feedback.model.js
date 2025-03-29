import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userType: {
    type: String,
    enum: ['patient', 'doctor', 'admin', 'anonymous', 'staff'],
    default: 'anonymous'
  },
  feedbackType: {
    type: String,
    enum: ['general', 'bug', 'feature_request', 'complaint', 'praise', 'suggestion', 'usability', 'other'],
    required: true
  },
  subject: {
    type: String,
    required: [true, "Subject is required"],
    trim: true
  },
  message: {
    type: String,
    required: [true, "Feedback message is required"],
    trim: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  category: {
    type: String,
    enum: [
      'ui_ux', 'performance', 'appointment', 'prescription', 
      'payment', 'consultation', 'technical', 'support', 
      'medical_record', 'security', 'privacy', 'other'
    ],
    default: 'other'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['new', 'in_review', 'in_progress', 'resolved', 'closed', 'reopened'],
    default: 'new'
  },
  pageUrl: String, // URL where feedback was submitted from
  screenshots: [{
    url: String,
    description: String
  }],
  browserInfo: {
    browser: String,
    version: String,
    os: String,
    device: String
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  responses: [{
    responder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    responderName: String,
    message: String,
    date: {
      type: Date,
      default: Date.now
    },
    isPublic: {
      type: Boolean,
      default: true
    }
  }],
  internalNotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  resolution: {
    resolutionType: {
      type: String,
      enum: ['fixed', 'wont_fix', 'duplicate', 'working_as_intended', 'cannot_reproduce', 'implemented', 'other']
    },
    resolutionDetails: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedDate: Date
  },
  tags: [String],
  source: {
    type: String,
    enum: ['website', 'mobile_app', 'email', 'phone', 'in_person', 'chat', 'social_media', 'other'],
    default: 'website'
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  contactDetails: {
    email: String,
    phone: String,
    preferredContactMethod: {
      type: String,
      enum: ['email', 'phone', 'none'],
      default: 'email'
    }
  },
  ipAddress: String,
  isFeatureConsideration: {
    type: Boolean,
    default: false
  },
  featureVotes: {
    type: Number,
    default: 0
  },
  relatedTo: {
    entityType: {
      type: String,
      enum: ['appointment', 'prescription', 'doctor', 'hospital', 'pharmacy', 'payment', 'other']
    },
    entityId: mongoose.Schema.Types.ObjectId
  }
}, { timestamps: true });

// Indexes for efficient querying
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ feedbackType: 1 });
feedbackSchema.index({ category: 1 });
feedbackSchema.index({ priority: 1 });
feedbackSchema.index({ user: 1 });
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ subject: 'text', message: 'text' });

// Method to add a response
feedbackSchema.methods.addResponse = async function(responderId, responderName, message, isPublic = true) {
  this.responses.push({
    responder: responderId,
    responderName,
    message,
    isPublic
  });
  
  // Update status if it's the first response
  if (this.responses.length === 1 && this.status === 'new') {
    this.status = 'in_review';
  }
  
  await this.save();
  return this;
};

// Method to assign feedback to team member
feedbackSchema.methods.assign = async function(userId) {
  this.assignedTo = userId;
  if (this.status === 'new') {
    this.status = 'in_review';
  }
  
  await this.save();
  return this;
};

// Method to update status
feedbackSchema.methods.updateStatus = async function(newStatus) {
  this.status = newStatus;
  
  await this.save();
  return this;
};

// Method to resolve feedback
feedbackSchema.methods.resolve = async function(resolutionData) {
  this.resolution = {
    ...resolutionData,
    resolvedDate: new Date()
  };
  this.status = 'resolved';
  
  await this.save();
  return this;
};

// Method to add internal note
feedbackSchema.methods.addInternalNote = async function(userId, note) {
  this.internalNotes.push({
    user: userId,
    note
  });
  
  await this.save();
  return this;
};

// Method to upvote feature request
feedbackSchema.methods.upvoteFeature = async function() {
  if (this.feedbackType === 'feature_request') {
    this.featureVotes += 1;
    this.isFeatureConsideration = true;
    await this.save();
  }
  return this;
};

// Static method to find unresolved feedback
feedbackSchema.statics.findUnresolved = function() {
  return this.find({
    status: { $in: ['new', 'in_review', 'in_progress', 'reopened'] }
  })
  .sort({ priority: -1, createdAt: 1 });
};

// Static method to find top feature requests
feedbackSchema.statics.findTopFeatureRequests = function(limit = 10) {
  return this.find({
    feedbackType: 'feature_request',
    isFeatureConsideration: true
  })
  .sort({ featureVotes: -1 })
  .limit(limit);
};

// Static method to find feedback by categories
feedbackSchema.statics.findByCategory = function(category) {
  return this.find({ category })
    .sort({ createdAt: -1 });
};

// Static method to generate feedback summary
feedbackSchema.statics.generateSummary = async function(startDate, endDate) {
  const match = {};
  if (startDate && endDate) {
    match.createdAt = { $gte: startDate, $lte: endDate };
  }
  
  return this.aggregate([
    { $match: match },
    { $group: {
      _id: '$feedbackType',
      count: { $sum: 1 },
      averageRating: { $avg: '$rating' }
    }},
    { $sort: { count: -1 } }
  ]);
};

export default mongoose.model('Feedback', feedbackSchema);
