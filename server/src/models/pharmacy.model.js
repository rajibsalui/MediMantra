import mongoose from 'mongoose';

const pharmacySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Pharmacy name is required"],
    trim: true
  },
  license: {
    number: {
      type: String,
      required: [true, "License number is required"],
      unique: true
    },
    issuedBy: String,
    validUntil: Date,
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    }
  },
  owner: {
    name: {
      type: String,
      required: [true, "Owner name is required"]
    },
    phone: String,
    email: String,
    qualification: String
  },
  address: {
    street: {
      type: String,
      required: [true, "Street address is required"]
    },
    city: {
      type: String,
      required: [true, "City is required"]
    },
    state: {
      type: String,
      required: [true, "State is required"]
    },
    zipCode: {
      type: String,
      required: [true, "ZIP code is required"]
    },
    country: {
      type: String,
      default: 'India'
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  contact: {
    phone: {
      type: String,
      required: [true, "Contact phone is required"]
    },
    email: String,
    website: String,
    alternatePhone: String
  },
  operatingHours: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    open: Boolean,
    openTime: String,
    closeTime: String
  }],
  services: [{
    type: String,
    enum: ['prescription_filling', 'otc_drugs', 'home_delivery', 'online_ordering', 'compounding', 'immunizations', 'health_screening', 'counseling', 'other']
  }],
  acceptsInsurance: {
    type: Boolean,
    default: false
  },
  insuranceProviders: [String],
  paymentMethods: [{
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'upi', 'netbanking', 'insurance', 'other']
  }],
  isHomeDelvery: {
    type: Boolean,
    default: false
  },
  deliveryArea: {
    radius: Number, // in kilometers
    zipCodes: [String]
  },
  minimumOrderForDelivery: {
    type: Number,
    default: 0
  },
  deliveryCharges: {
    type: Number,
    default: 0
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
  specialties: [String], // e.g., "Ayurvedic", "Homeopathic", "Allopathic", etc.
  images: [{
    url: String,
    caption: String,
    isPrimary: Boolean
  }],
  pharmacists: [{
    name: String,
    registrationNumber: String,
    qualification: String,
    shiftHours: String
  }],
  inventory: {
    lastUpdated: Date,
    status: {
      type: String,
      enum: ['well_stocked', 'limited', 'unknown'],
      default: 'unknown'
    }
  },
  verified: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'under_review', 'suspended'],
    default: 'active'
  },
  establishedYear: Number,
  description: String
}, { timestamps: true });

// Indexes
pharmacySchema.index({ name: 1 });
pharmacySchema.index({ 'address.city': 1, 'address.state': 1 });
pharmacySchema.index({ services: 1 });
pharmacySchema.index({ 'license.number': 1 });
pharmacySchema.index({ 'ratings.average': -1 });
pharmacySchema.index({ name: 'text', description: 'text', specialties: 'text' });

// Method to add a review
pharmacySchema.methods.addReview = async function(userId, rating, comment) {
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

// Static method to find pharmacies with home delivery
pharmacySchema.statics.findWithHomeDelivery = function() {
  return this.find({ isHomeDelvery: true });
};

// Static method to find pharmacies by service
pharmacySchema.statics.findByService = function(service) {
  return this.find({ services: service });
};

// Static method to find nearest pharmacies by coordinates
pharmacySchema.statics.findNearest = function(lat, lng, maxDistance = 5, limit = 10) {
  return this.aggregate([
    {
      $geoNear: {
        near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
        distanceField: "distance",
        maxDistance: maxDistance * 1000, // convert km to meters
        spherical: true
      }
    },
    { $limit: limit }
  ]);
};

// Static method to find pharmacies by specialty
pharmacySchema.statics.findBySpecialty = function(specialty) {
  return this.find({ specialties: { $regex: new RegExp(specialty, 'i') } });
};

export default mongoose.model('Pharmacy', pharmacySchema);
