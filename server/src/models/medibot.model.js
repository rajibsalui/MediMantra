import mongoose from 'mongoose';

const medibotConversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: function() {
      return `Conversation ${new Date().toLocaleDateString()}`;
    }
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'bot', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      intents: [String],
      entities: [String],
      confidence: Number,
      suggestedAction: String,
      relatedConditions: [String],
      sources: [String],
      isImportant: Boolean
    },
    reactions: {
      helpful: {
        type: Boolean,
        default: null
      },
      feedback: String
    }
  }],
  symptomAnalysis: {
    symptoms: [{
      name: String,
      severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe', 'unknown'],
        default: 'unknown'
      },
      duration: String,
      bodyLocation: String
    }],
    possibleConditions: [{
      name: String,
      probability: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      },
      description: String,
      suggestedActions: [String]
    }],
    urgencyLevel: {
      type: String,
      enum: ['non_urgent', 'routine', 'urgent', 'emergency'],
      default: 'routine'
    }
  },
  recommendations: [{
    type: {
      type: String,
      enum: ['self_care', 'medication', 'doctor_visit', 'emergency', 'lifestyle', 'follow_up'],
      required: true
    },
    description: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    timeframe: String,
    specialist: String
  }],
  status: {
    type: String,
    enum: ['active', 'completed', 'escalated_to_doctor', 'archived'],
    default: 'active'
  },
  feedbackProvided: {
    type: Boolean,
    default: false
  },
  overallFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    improvementSuggestions: String
  },
  escalatedTo: {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    date: Date
  },
  tags: [String],
  metadata: {
    platform: String,
    browser: String,
    device: String,
    ipAddress: String,
    location: String
  },
  language: {
    type: String,
    default: 'en'
  }
}, { timestamps: true });

// Indexes for efficient querying
medibotConversationSchema.index({ user: 1, createdAt: -1 });
medibotConversationSchema.index({ status: 1 });
medibotConversationSchema.index({ tags: 1 });
medibotConversationSchema.index({ 'symptomAnalysis.urgencyLevel': 1 });

// Method to add a new message to the conversation
medibotConversationSchema.methods.addMessage = async function(message) {
  this.messages.push(message);
  await this.save();
  return this;
};

// Method to analyze symptoms based on conversation
medibotConversationSchema.methods.analyzeSymptoms = async function(symptoms, conditions, urgency) {
  this.symptomAnalysis = {
    symptoms,
    possibleConditions: conditions,
    urgencyLevel: urgency
  };
  
  await this.save();
  return this;
};

// Method to add recommendations
medibotConversationSchema.methods.addRecommendations = async function(recommendations) {
  this.recommendations = recommendations;
  await this.save();
  return this;
};

// Method to complete conversation
medibotConversationSchema.methods.complete = async function() {
  this.status = 'completed';
  await this.save();
  return this;
};

// Method to escalate to doctor
medibotConversationSchema.methods.escalateToDoctor = async function(doctorId, reason) {
  this.status = 'escalated_to_doctor';
  this.escalatedTo = {
    doctor: doctorId,
    reason,
    date: new Date()
  };
  
  await this.save();
  return this;
};

// Method to add feedback
medibotConversationSchema.methods.provideFeedback = async function(feedback) {
  this.overallFeedback = feedback;
  this.feedbackProvided = true;
  
  await this.save();
  return this;
};

// Method to extract user symptoms from conversation
medibotConversationSchema.methods.extractSymptoms = function() {
  // This would use NLP in a real implementation
  // For demonstration, we're just returning any symptoms found in the symptomAnalysis
  return this.symptomAnalysis?.symptoms || [];
};

// Static method to find all conversations for a user
medibotConversationSchema.statics.findForUser = function(userId) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 });
};

// Static method to find urgent conversations
medibotConversationSchema.statics.findUrgentConversations = function() {
  return this.find({
    'symptomAnalysis.urgencyLevel': { $in: ['urgent', 'emergency'] },
    status: { $in: ['active', 'escalated_to_doctor'] }
  })
  .sort({ createdAt: -1 })
  .populate('user', 'firstName lastName email phone');
};

// Knowledge base schema - for storing medical information the bot can access
const medibotKnowledgeSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['condition', 'symptom', 'medication', 'procedure', 'general', 'protocol'],
    required: true
  },
  name: {
    type: String,
    required: true,
    index: true
  },
  aliases: [String],
  description: {
    type: String,
    required: true
  },
  details: {
    causes: [String],
    symptoms: [String],
    treatments: [String],
    preventions: [String],
    riskFactors: [String],
    complications: [String],
    whenToSeekCare: String
  },
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe', 'variable', 'emergency'],
    default: 'variable'
  },
  commonQuestions: [{
    question: String,
    answer: String
  }],
  tags: [String],
  relatedEntities: [{
    entityType: {
      type: String,
      enum: ['condition', 'symptom', 'medication', 'procedure']
    },
    entityId: mongoose.Schema.Types.ObjectId,
    relationshipType: {
      type: String,
      enum: ['causes', 'treats', 'preventedBy', 'symptomsOf', 'complicationOf', 'riskFactorFor']
    }
  }],
  source: {
    name: String,
    url: String,
    lastUpdated: Date,
    verifiedBy: String
  },
  isReviewed: {
    type: Boolean,
    default: false
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewDate: Date
}, { timestamps: true });

// Indexes for knowledge base
medibotKnowledgeSchema.index({ name: 'text', aliases: 'text', description: 'text' });
medibotKnowledgeSchema.index({ category: 1, name: 1 }, { unique: true });
medibotKnowledgeSchema.index({ tags: 1 });

const MedibotConversation = mongoose.model('MedibotConversation', medibotConversationSchema);
const MedibotKnowledge = mongoose.model('MedibotKnowledge', medibotKnowledgeSchema);

export { MedibotConversation, MedibotKnowledge };
