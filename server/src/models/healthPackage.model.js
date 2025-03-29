import mongoose from 'mongoose';

const healthPackageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Package name is required"],
    trim: true
  },
  code: {
    type: String,
    unique: true,
    required: [true, "Package code is required"]
  },
  description: {
    type: String,
    required: [true, "Description is required"]
  },
  shortDescription: {
    type: String,
    maxlength: 200
  },
  category: {
    type: String,
    enum: ['preventive', 'diagnostic', 'wellness', 'specialized', 'premium', 'basic', 'corporate', 'family', 'other'],
    required: true
  },
  targetAudience: {
    gender: {
      type: String,
      enum: ['male', 'female', 'all'],
      default: 'all'
    },
    minAge: Number,
    maxAge: Number,
    conditions: [String]
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: 0
  },
  discountedPrice: {
    type: Number,
    min: 0
  },
  validityPeriod: {
    value: {
      type: Number,
      default: 1
    },
    unit: {
      type: String,
      enum: ['days', 'months', 'years'],
      default: 'years'
    }
  },
  inclusions: [{
    type: {
      type: String,
      enum: ['consultation', 'laboratory', 'imaging', 'therapy', 'checkup', 'procedure', 'wellness', 'other'],
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: String,
    count: {
      type: Number,
      default: 1
    },
    specialNotes: String
  }],
  labTests: [{
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabTest'
    },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabPackage'
    }
  }],
  consultations: [{
    specialization: String,
    count: {
      type: Number,
      default: 1
    },
    consultationType: {
      type: String,
      enum: ['in-person', 'video', 'phone', 'any'],
      default: 'any'
    }
  }],
  benefits: [String],
  exclusions: [String],
  termsAndConditions: String,
  images: [{
    url: String,
    alt: String,
    isPrimary: Boolean
  }],
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  tags: [String],
  relevantHealthConditions: [String],
  faqs: [{
    question: String,
    answer: String
  }],
  availableAt: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital'
  }],
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
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
  status: {
    type: String,
    enum: ['active', 'inactive', 'limited_time', 'coming_soon'],
    default: 'active'
  },
  limitedTimeOffer: {
    isLimited: {
      type: Boolean,
      default: false
    },
    startDate: Date,
    endDate: Date,
    specialPrice: Number
  },
  redemptionInstructions: String,
  seoMetadata: {
    title: String,
    description: String,
    keywords: [String]
  }
}, { timestamps: true });

// Indexes for efficient querying
healthPackageSchema.index({ name: 'text', description: 'text', shortDescription: 'text', tags: 'text' });
healthPackageSchema.index({ category: 1 });
healthPackageSchema.index({ price: 1 });
healthPackageSchema.index({ 'targetAudience.gender': 1 });
healthPackageSchema.index({ status: 1 });
healthPackageSchema.index({ 'ratings.average': -1 });

// Calculate savings percentage
healthPackageSchema.virtual('savingsPercentage').get(function() {
  if (!this.discountedPrice || !this.price || this.discountedPrice >= this.price) {
    return 0;
  }
  return Math.round(((this.price - this.discountedPrice) / this.price) * 100);
});

// Format validity period
healthPackageSchema.virtual('validityFormatted').get(function() {
  if (!this.validityPeriod) return '';
  const { value, unit } = this.validityPeriod;
  return `${value} ${value === 1 ? unit.slice(0, -1) : unit}`;
});

// Calculate total number of components
healthPackageSchema.virtual('componentsCount').get(function() {
  return (this.inclusions?.length || 0) + (this.labTests?.length || 0) + (this.consultations?.length || 0);
});

// Method to add a review
healthPackageSchema.methods.addReview = async function(userId, rating, comment) {
  // Check if user already reviewed
  const existingReviewIndex = this.reviews.findIndex(r => 
    r.user.toString() === userId.toString()
  );
  
  if (existingReviewIndex >= 0) {
    // Update existing review
    this.reviews[existingReviewIndex] = {
      user: userId,
      rating,
      comment,
      date: new Date()
    };
  } else {
    // Add new review
    this.reviews.push({
      user: userId,
      rating,
      comment
    });
  }
  
  // Recalculate average rating
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.ratings.average = parseFloat((totalRating / this.reviews.length).toFixed(1));
  this.ratings.count = this.reviews.length;
  
  await this.save();
  return this;
};

// Method to check if package is valid for specific user
healthPackageSchema.methods.isValidForUser = function(userDetails) {
  if (!userDetails) return true;
  
  const { gender, age } = userDetails;
  
  // Check gender restriction
  if (this.targetAudience.gender !== 'all' && gender !== this.targetAudience.gender) {
    return false;
  }
  
  // Check age restriction
  if (age) {
    if (this.targetAudience.minAge && age < this.targetAudience.minAge) {
      return false;
    }
    
    if (this.targetAudience.maxAge && age > this.targetAudience.maxAge) {
      return false;
    }
  }
  
  return true;
};

// Static method to find packages by category
healthPackageSchema.statics.findByCategory = function(category) {
  return this.find({ 
    category, 
    status: 'active' 
  })
  .sort({ price: 1 });
};

// Static method to find packages by price range
healthPackageSchema.statics.findByPriceRange = function(minPrice, maxPrice) {
  return this.find({ 
    price: { $gte: minPrice, $lte: maxPrice },
    status: 'active'
  })
  .sort({ price: 1 });
};

// Static method to find featured packages
healthPackageSchema.statics.findFeatured = function(limit = 5) {
  return this.find({ 
    isFeatured: true,
    status: 'active'
  })
  .sort({ 'ratings.average': -1 })
  .limit(limit);
};

// Static method to find packages suitable for specific conditions
healthPackageSchema.statics.findForCondition = function(condition) {
  return this.find({
    relevantHealthConditions: { $regex: new RegExp(condition, 'i') },
    status: 'active'
  });
};

export default mongoose.model('HealthPackage', healthPackageSchema);
