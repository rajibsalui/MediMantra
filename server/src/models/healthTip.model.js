import mongoose from 'mongoose';

const healthTipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  content: {
    type: String,
    required: [true, "Content is required"]
  },
  summary: {
    type: String,
    required: [true, "Summary is required"],
    maxlength: 500
  },
  category: {
    type: String,
    enum: [
      'general_health', 'nutrition', 'fitness', 'mental_health', 'women_health', 
      'men_health', 'child_health', 'senior_health', 'preventive_care', 'disease_management',
      'medical_news', 'home_remedies', 'seasonal_tips', 'wellness', 'lifestyle'
    ],
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  authorName: String,
  authorCredentials: String,
  authorImage: String,
  image: {
    url: String,
    altText: String,
    caption: String
  },
  tags: [String],
  relatedConditions: [String],
  readTime: {
    type: Number, // in minutes
    default: 3
  },
  references: [{
    title: String,
    url: String
  }],
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: String,
    userImage: String,
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    likes: {
      type: Number,
      default: 0
    },
    isApproved: {
      type: Boolean,
      default: true
    }
  }],
  isFeatured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedDate: Date,
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    ogImage: String
  }
}, { timestamps: true });

// Indexes for efficient querying
healthTipSchema.index({ title: 'text', content: 'text', summary: 'text', tags: 'text' });
healthTipSchema.index({ category: 1 });
healthTipSchema.index({ publishDate: -1 });
healthTipSchema.index({ status: 1 });
healthTipSchema.index({ slug: 1 });
healthTipSchema.index({ tags: 1 });

// Pre-save hook to generate slug if one isn't provided
healthTipSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')  // Remove non-word chars
      .replace(/[\s_-]+/g, '-')   // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, '')    // Remove leading/trailing hyphens
      + '-' + Date.now().toString().slice(-4);  // Add timestamp to ensure uniqueness
  }
  next();
});

// Method to increment view count
healthTipSchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save();
  return this;
};

// Method to like article
healthTipSchema.methods.like = async function() {
  this.likes += 1;
  await this.save();
  return this;
};

// Method to add comment
healthTipSchema.methods.addComment = async function(userId, userName, userImage, comment) {
  this.comments.push({
    user: userId,
    userName,
    userImage,
    comment
  });
  await this.save();
  return this;
};

// Method to publish article
healthTipSchema.methods.publish = async function() {
  this.status = 'published';
  this.publishDate = new Date();
  await this.save();
  return this;
};

// Method to mark as featured
healthTipSchema.methods.markAsFeatured = async function(isFeatured = true) {
  this.isFeatured = isFeatured;
  await this.save();
  return this;
};

// Static method to find featured articles
healthTipSchema.statics.findFeatured = function(limit = 5) {
  return this.find({ 
    status: 'published',
    isFeatured: true
  })
  .sort({ publishDate: -1 })
  .limit(limit);
};

// Static method to find recent articles
healthTipSchema.statics.findRecent = function(limit = 10) {
  return this.find({ status: 'published' })
    .sort({ publishDate: -1 })
    .limit(limit);
};

// Static method to find popular articles
healthTipSchema.statics.findPopular = function(limit = 10) {
  return this.find({ status: 'published' })
    .sort({ views: -1 })
    .limit(limit);
};

// Static method to find articles by category
healthTipSchema.statics.findByCategory = function(category, limit = 20) {
  return this.find({
    category,
    status: 'published'
  })
  .sort({ publishDate: -1 })
  .limit(limit);
};

// Static method to find articles by tag
healthTipSchema.statics.findByTag = function(tag, limit = 20) {
  return this.find({
    tags: tag,
    status: 'published'
  })
  .sort({ publishDate: -1 })
  .limit(limit);
};

// Static method to search articles
healthTipSchema.statics.search = function(query, limit = 20) {
  return this.find({
    $text: { $search: query },
    status: 'published'
  })
  .sort({ score: { $meta: 'textScore' } })
  .limit(limit);
};

export default mongoose.model('HealthTip', healthTipSchema);
