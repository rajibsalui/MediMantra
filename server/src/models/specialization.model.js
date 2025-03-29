import mongoose from 'mongoose';

const specializationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Specialization name is required"],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, "Description is required"]
  },
  icon: {
    type: String,
    default: 'medical-bag' // Default icon name
  },
  image: {
    type: String,
    default: ''
  },
  parentSpecialty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Specialization',
    default: null
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  averageConsultationFee: {
    type: Number,
    default: 0
  },
  relatedConditions: [{
    type: String,
    trim: true
  }],
  commonProcedures: [{
    name: String,
    description: String
  }],
  qualifications: [{
    type: String,
    trim: true
  }],
  keywords: [{
    type: String,
    trim: true
  }],
  seoMetadata: {
    title: String,
    description: String,
    keywords: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

// Text search index
specializationSchema.index({ 
  name: 'text', 
  description: 'text', 
  'relatedConditions': 'text', 
  'keywords': 'text' 
});

// Pre-save hook to generate slug
specializationSchema.pre('save', function(next) {
  if (!this.slug || this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Static method to find popular specialties
specializationSchema.statics.findPopular = function(limit = 10) {
  return this.find({ isPopular: true, status: 'active' })
    .sort({ order: 1 })
    .limit(limit);
};

// Static method to find by related condition
specializationSchema.statics.findByCondition = function(condition) {
  return this.find({ 
    relatedConditions: { $regex: new RegExp(condition, 'i') },
    status: 'active'
  });
};

// Static method to find top level specialties (those without parent)
specializationSchema.statics.findTopLevel = function() {
  return this.find({ 
    parentSpecialty: null,
    status: 'active'
  }).sort({ order: 1, name: 1 });
};

// Static method to find subspecialties
specializationSchema.statics.findSubSpecialties = function(parentId) {
  return this.find({ 
    parentSpecialty: parentId,
    status: 'active'
  }).sort({ order: 1, name: 1 });
};

// Static method to recalculate and update average consultation fee
specializationSchema.statics.updateAverageConsultationFee = async function(specializationId) {
  try {
    const Doctor = mongoose.model('Doctor');
    
    const doctors = await Doctor.find({
      specializations: specializationId,
      'consultationFee': { $gt: 0 }
    });
    
    if (doctors && doctors.length > 0) {
      const totalFee = doctors.reduce((sum, doc) => sum + doc.consultationFee, 0);
      const averageFee = totalFee / doctors.length;
      
      await this.findByIdAndUpdate(specializationId, { 
        averageConsultationFee: Math.round(averageFee) 
      });
    }
  } catch (error) {
    console.error('Error updating average consultation fee:', error);
  }
};

export default mongoose.model('Specialization', specializationSchema);
