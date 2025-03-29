import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Hospital name is required"],
    trim: true
  },
  type: {
    type: String,
    enum: ['hospital', 'clinic', 'diagnostic_center', 'specialty_center', 'nursing_home', 'other'],
    required: true
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
    fax: String
  },
  facilities: [{
    name: String,
    isAvailable: {
      type: Boolean,
      default: true
    },
    description: String
  }],
  departments: [{
    name: String,
    description: String,
    contactPerson: String,
    contactNumber: String
  }],
  doctors: [{
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    department: String,
    designation: String,
    consultationDays: [String],
    consultationHours: String
  }],
  specializations: [String],
  accreditations: [{
    name: String,
    issuedBy: String,
    validUntil: Date,
    certificateUrl: String
  }],
  operatingHours: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    open: Boolean,
    openTime: String,
    closeTime: String
  }],
  emergencyServices: {
    available: {
      type: Boolean,
      default: false
    },
    hours: String,
    contactNumber: String
  },
  insuranceAccepted: [{
    provider: String,
    plans: [String],
    verificationContact: String
  }],
  images: [{
    url: String,
    caption: String,
    type: {
      type: String,
      enum: ['exterior', 'interior', 'facility', 'room', 'equipment', 'other'],
      default: 'other'
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
  description: {
    short: {
      type: String,
      maxlength: 200
    },
    detailed: {
      type: String,
      maxlength: 2000
    }
  },
  establishedYear: Number,
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
  }
}, { timestamps: true });

// Indexes
hospitalSchema.index({ name: 1 });
hospitalSchema.index({ 'address.city': 1, 'address.state': 1 });
hospitalSchema.index({ specializations: 1 });
hospitalSchema.index({ type: 1 });
hospitalSchema.index({ 'ratings.average': -1 });
hospitalSchema.index({ name: 'text', 'description.detailed': 'text', specializations: 'text' });

// Method to add a doctor to the hospital
hospitalSchema.methods.addDoctor = async function(doctorId, department, designation, consultationInfo) {
  if (!this.doctors.some(d => d.doctor.toString() === doctorId.toString())) {
    this.doctors.push({
      doctor: doctorId,
      department,
      designation,
      consultationDays: consultationInfo.days || [],
      consultationHours: consultationInfo.hours || ''
    });
    await this.save();
  }
  return this;
};

// Method to remove a doctor from the hospital
hospitalSchema.methods.removeDoctor = async function(doctorId) {
  this.doctors = this.doctors.filter(d => d.doctor.toString() !== doctorId.toString());
  await this.save();
  return this;
};

// Method to add a review
hospitalSchema.methods.addReview = async function(userId, rating, comment) {
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

// Static method to find nearest hospitals by coordinates
hospitalSchema.statics.findNearest = function(lat, lng, maxDistance = 10, limit = 10) {
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

// Static method to find top-rated hospitals
hospitalSchema.statics.findTopRated = function(limit = 10) {
  return this.find({ 'ratings.count': { $gt: 0 } })
    .sort({ 'ratings.average': -1 })
    .limit(limit);
};

// Static method to find hospitals by specialization
hospitalSchema.statics.findBySpecialization = function(specialization) {
  return this.find({ specializations: { $regex: new RegExp(specialization, 'i') } });
};

export default mongoose.model('Hospital', hospitalSchema);
