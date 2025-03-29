import mongoose from 'mongoose';

const labTestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Test name is required"],
    trim: true
  },
  testCode: {
    type: String,
    required: [true, "Test code is required"],
    unique: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['biochemistry', 'microbiology', 'hematology', 'immunology', 'imaging', 'pathology', 'molecular', 'genetic', 'urine', 'stool', 'other'],
    required: true
  },
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
  preparationInstructions: {
    type: String,
    default: "No special preparation required."
  },
  sampleType: {
    type: String,
    enum: ['blood', 'urine', 'stool', 'saliva', 'tissue', 'swab', 'sputum', 'csf', 'other'],
    required: true
  },
  sampleRequirements: String,
  fasting: {
    required: {
      type: Boolean,
      default: false
    },
    duration: {
      type: Number, // hours
      default: 0
    },
    instructions: String
  },
  reportTime: {
    value: {
      type: Number,
      default: 1
    },
    unit: {
      type: String,
      enum: ['hours', 'days', 'weeks'],
      default: 'days'
    }
  },
  normalRanges: [{
    gender: {
      type: String,
      enum: ['male', 'female', 'all'],
      default: 'all'
    },
    ageGroup: {
      min: Number, // in years
      max: Number // in years
    },
    range: {
      lower: String,
      upper: String,
      unit: String
    },
    condition: String // any special condition related to this range
  }],
  parameters: [{
    name: String,
    description: String,
    unit: String,
    referenceRange: String
  }],
  indicationsFor: [String], // health conditions that might require this test
  contraindications: [String],
  standardPrice: {
    type: Number,
    required: true,
    min: 0
  },
  homeCollectionAvailable: {
    type: Boolean,
    default: false
  },
  homeCollectionPrice: {
    type: Number,
    default: 0,
    min: 0
  },
  discounts: [{
    name: String,
    percentage: Number,
    validFrom: Date,
    validUntil: Date,
    code: String
  }],
  relatedTests: [{
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabTest'
    },
    relationship: {
      type: String,
      enum: ['alternative', 'follow_up', 'prerequisite', 'complementary'],
      default: 'complementary'
    }
  }],
  packages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabPackage'
  }],
  faq: [{
    question: String,
    answer: String
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active'
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  approvalStatus: {
    type: String,
    enum: ['approved', 'pending', 'rejected'],
    default: 'approved'
  },
  metaInfo: {
    keywords: [String],
    searchTerms: [String]
  }
}, { timestamps: true });

// Lab Test Package Schema
const labPackageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Package name is required"],
    trim: true
  },
  code: {
    type: String,
    required: [true, "Package code is required"],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, "Package description is required"]
  },
  tests: [{
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabTest',
      required: true
    },
    isRequired: {
      type: Boolean,
      default: true
    }
  }],
  category: {
    type: String,
    enum: ['general', 'specialized', 'comprehensive', 'preventive', 'disease_specific'],
    default: 'general'
  },
  forConditions: [String], // health conditions this package is designed for
  forGender: {
    type: String,
    enum: ['male', 'female', 'all'],
    default: 'all'
  },
  ageGroup: {
    min: Number, // in years
    max: Number // in years
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  actualValue: {
    type: Number,
    min: 0
  },
  homeCollectionAvailable: {
    type: Boolean,
    default: false
  },
  homeCollectionPrice: {
    type: Number,
    default: 0,
    min: 0
  },
  preparationInstructions: String,
  reportTime: {
    value: {
      type: Number,
      default: 1
    },
    unit: {
      type: String,
      enum: ['hours', 'days', 'weeks'],
      default: 'days'
    }
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active'
  },
  image: String
}, { timestamps: true });

// Lab test order schema
const labOrderSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tests: [{
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabTest'
    },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabPackage'
    },
    price: Number,
    discount: Number,
    finalPrice: Number
  }],
  laboratory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Laboratory'
  },
  orderNumber: {
    type: String,
    unique: true
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  scheduledDate: Date,
  scheduledTimeSlot: String,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'sample_collected', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  isHomeCollection: {
    type: Boolean,
    default: false
  },
  homeCollectionAddress: {
    fullName: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    landmark: String,
    instructions: String
  },
  collectionAgent: {
    name: String,
    phone: String,
    id: String
  },
  reportDeliveryMethod: {
    type: String,
    enum: ['email', 'download', 'physical', 'both'],
    default: 'both'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentDetails: {
    amount: Number,
    paidAmount: Number,
    discountAmount: Number,
    taxAmount: Number,
    transactionId: String,
    paymentMethod: String,
    paymentDate: Date
  },
  reports: [{
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabTest'
    },
    reportUrl: String,
    reportDate: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // Doctor or lab technician
    },
    remarks: String
  }],
  prescriptionImage: String,
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  },
  referenceNumber: String,
  instructions: String,
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date
  },
  cancellationReason: String,
  cancellationDate: Date,
  notes: String
}, { timestamps: true });

// Indexes
labTestSchema.index({ name: 1 });
labTestSchema.index({ testCode: 1 });
labTestSchema.index({ category: 1 });
labTestSchema.index({ standardPrice: 1 });
labTestSchema.index({ name: 'text', 'description.detailed': 'text', indicationsFor: 'text' });

labPackageSchema.index({ name: 1 });
labPackageSchema.index({ code: 1 });
labPackageSchema.index({ price: 1 });
labPackageSchema.index({ forConditions: 1 });
labPackageSchema.index({ name: 'text', description: 'text', forConditions: 'text' });

labOrderSchema.index({ patient: 1, orderDate: -1 });
labOrderSchema.index({ orderNumber: 1 });
labOrderSchema.index({ status: 1 });
labOrderSchema.index({ 'paymentDetails.transactionId': 1 });

// Method to calculate package actual value based on included tests
labPackageSchema.methods.calculateActualValue = async function() {
  try {
    let total = 0;
    for (const testObj of this.tests) {
      const test = await mongoose.model('LabTest').findById(testObj.test);
      if (test) {
        total += test.standardPrice;
      }
    }
    this.actualValue = total;
    return total;
  } catch (error) {
    console.error('Error calculating package value:', error);
    return 0;
  }
};

// Method to generate PDF report for a lab order
labOrderSchema.methods.generateReportPDF = async function() {
  // This would integrate with a PDF generation service
  // For demonstration purposes, just returning a mock URL
  const reportUrl = `https://api.medimantra.com/reports/${this._id}.pdf`;
  return reportUrl;
};

// Static method to find popular tests
labTestSchema.statics.findPopular = function(limit = 10) {
  return this.find({ isPopular: true, status: 'active' })
    .sort({ standardPrice: 1 })
    .limit(limit);
};

// Static method to find tests by health condition
labTestSchema.statics.findByCondition = function(condition) {
  return this.find({ 
    indicationsFor: { $regex: new RegExp(condition, 'i') },
    status: 'active'
  });
};

// Static method to find packages by health condition
labPackageSchema.statics.findByCondition = function(condition) {
  return this.find({ 
    forConditions: { $regex: new RegExp(condition, 'i') },
    status: 'active'
  });
};

const LabTest = mongoose.model('LabTest', labTestSchema);
const LabPackage = mongoose.model('LabPackage', labPackageSchema);
const LabOrder = mongoose.model('LabOrder', labOrderSchema);

export { LabTest, LabPackage, LabOrder };
