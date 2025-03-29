import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Medication name is required"],
    trim: true
  },
  brandNames: [String],
  genericName: {
    type: String,
    required: [true, "Generic name is required"],
    trim: true
  },
  drugCode: {
    type: String,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    enum: [
      'antibiotics', 'analgesics', 'antivirals', 'antifungals', 'antihistamines',
      'antidepressants', 'antipsychotics', 'anxiolytics', 'antihypertensives',
      'antidiabetics', 'anticoagulants', 'corticosteroids', 'bronchodilators',
      'antiemetics', 'antacids', 'laxatives', 'diuretics', 'hormones',
      'immunosuppressants', 'vitamins', 'minerals', 'herbal', 'other'
    ],
    required: true
  },
  description: {
    type: String,
    required: [true, "Description is required"]
  },
  dosageForms: [{
    form: {
      type: String,
      enum: [
        'tablet', 'capsule', 'liquid', 'syrup', 'injection', 'powder', 
        'cream', 'ointment', 'gel', 'lotion', 'spray', 'drops', 'inhaler', 
        'patch', 'suppository', 'other'
      ],
      required: true
    },
    strength: String, // e.g., "500mg", "10mg/ml"
    route: {
      type: String,
      enum: [
        'oral', 'topical', 'intravenous', 'intramuscular', 'subcutaneous',
        'inhalation', 'rectal', 'vaginal', 'nasal', 'ophthalmic', 'otic', 'other'
      ],
      required: true
    }
  }],
  activeIngredients: [{
    name: String,
    quantity: String
  }],
  usedFor: [String], // conditions this medication is used to treat
  contraindications: [String],
  sideEffects: [{
    effect: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe', 'life_threatening'],
      default: 'mild'
    },
    frequency: {
      type: String,
      enum: ['very_common', 'common', 'uncommon', 'rare', 'very_rare'],
      default: 'uncommon'
    }
  }],
  drugInteractions: [{
    drug: {
      type: String,
      required: true
    },
    interactionEffect: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe', 'contraindicated'],
      default: 'moderate'
    },
    recommendation: String
  }],
  foodInteractions: [{
    food: String,
    effect: String,
    recommendation: String
  }],
  alcoholInteraction: {
    hasInteraction: {
      type: Boolean,
      default: false
    },
    description: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe', 'contraindicated'],
      default: 'moderate'
    }
  },
  pregnancyCategory: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'X', 'N'],
    default: 'N' // Not classified
  },
  breastfeedingSafety: {
    type: String,
    enum: ['safe', 'moderate_risk', 'high_risk', 'unknown'],
    default: 'unknown'
  },
  kidneySafety: {
    type: String,
    enum: ['safe', 'use_with_caution', 'contraindicated', 'unknown'],
    default: 'unknown'
  },
  liverSafety: {
    type: String,
    enum: ['safe', 'use_with_caution', 'contraindicated', 'unknown'],
    default: 'unknown'
  },
  storageInstructions: String,
  manufacturer: {
    name: String,
    website: String,
    country: String
  },
  approvedBy: [String], // e.g., ["FDA", "EMA", "CDSCO"]
  prescriptionRequired: {
    type: Boolean,
    default: true
  },
  availability: {
    type: String,
    enum: ['widely_available', 'limited_availability', 'temporarily_unavailable', 'discontinued'],
    default: 'widely_available'
  },
  approximatePrice: {
    amount: Number,
    currency: {
      type: String,
      default: 'INR'
    },
    unit: {
      type: String,
      default: 'per pack'
    }
  },
  images: [{
    url: String,
    caption: String
  }],
  dosageInstructions: {
    adult: {
      standard: String,
      maximum: String
    },
    pediatric: {
      standard: String,
      byAge: [{
        ageRange: String,
        dosage: String
      }],
      byWeight: String
    },
    elderly: String,
    renalImpairment: String,
    hepaticImpairment: String
  },
  commonInstructions: [String], // e.g., ["Take with food", "Avoid sun exposure"]
  references: [{
    title: String,
    url: String
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'under_review', 'discontinued', 'recalled'],
    default: 'active'
  }
}, { timestamps: true });

// Indexes
medicationSchema.index({ name: 1 });
medicationSchema.index({ genericName: 1 });
medicationSchema.index({ drugCode: 1 });
medicationSchema.index({ category: 1 });
medicationSchema.index({ usedFor: 1 });
medicationSchema.index({ name: 'text', genericName: 'text', brandNames: 'text', description: 'text', usedFor: 'text' });

// Method to check if medication interacts with another medication
medicationSchema.methods.interactsWith = function(medicationName) {
  const interaction = this.drugInteractions.find(interaction => 
    interaction.drug.toLowerCase() === medicationName.toLowerCase() ||
    medicationName.toLowerCase().includes(interaction.drug.toLowerCase()) ||
    interaction.drug.toLowerCase().includes(medicationName.toLowerCase())
  );
  
  return interaction || null;
};

// Method to check if medication is safe for a patient condition
medicationSchema.methods.isSafeFor = function(condition) {
  const isSafe = !this.contraindications.some(contraindication => 
    contraindication.toLowerCase() === condition.toLowerCase() ||
    condition.toLowerCase().includes(contraindication.toLowerCase()) ||
    contraindication.toLowerCase().includes(condition.toLowerCase())
  );
  
  return isSafe;
};

// Static method to find medications for a specific condition
medicationSchema.statics.findForCondition = function(condition) {
  return this.find({ 
    usedFor: { $regex: new RegExp(condition, 'i') },
    status: 'active'
  });
};

// Static method to find alternative medications
medicationSchema.statics.findAlternatives = function(genericName) {
  return this.find({ 
    genericName: { $regex: new RegExp(`^${genericName}$`, 'i') },
    status: 'active'
  });
};

// Static method to find medications by their category
medicationSchema.statics.findByCategory = function(category) {
  return this.find({ 
    category,
    status: 'active'
  });
};

// Static method to search medications
medicationSchema.statics.searchMedications = function(query, limit = 20) {
  return this.find({ 
    $or: [
      { name: { $regex: new RegExp(query, 'i') } },
      { genericName: { $regex: new RegExp(query, 'i') } },
      { brandNames: { $regex: new RegExp(query, 'i') } }
    ],
    status: 'active'
  })
  .limit(limit);
};

export default mongoose.model('Medication', medicationSchema);
