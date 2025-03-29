import HealthTip from '../models/healthTip.model.js';
import { User } from '../models/user.model.js';

// Create a new health tip (admin or doctor only)
export const createHealthTip = async (req, res) => {
  try {
    // Check if user is admin or doctor
    if (req.user.role !== 'admin' && req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Only admins and doctors can create health tips'
      });
    }

    const { title, content, category, tags, imageUrl } = req.body;

    // Validate required fields
    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, and category are required'
      });
    }

    // Create health tip
    const healthTip = await HealthTip.create({
      title,
      content,
      category,
      tags: tags || [],
      imageUrl,
      author: req.user._id,
      status: req.user.role === 'admin' ? 'published' : 'pending'
    });

    res.status(201).json({
      success: true,
      message: req.user.role === 'admin' ? 'Health tip created and published' : 'Health tip submitted for review',
      healthTip
    });
  } catch (error) {
    console.error('Create health tip error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating health tip',
      error: error.message
    });
  }
};

// Get all health tips
export const getAllHealthTips = async (req, res) => {
  try {
    const { limit = 10, skip = 0, category, tag, featured, search } = req.query;

    // Build query
    const query = { status: 'published' };

    if (category) {
      query.category = category;
    }

    if (tag) {
      query.tags = { $in: [tag] };
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: { $regex: searchRegex } },
        { content: { $regex: searchRegex } },
        { tags: { $in: [searchRegex] } }
      ];
    }

    // Get health tips
    const healthTips = await HealthTip.find(query)
      .populate('author', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await HealthTip.countDocuments(query);

    res.status(200).json({
      success: true,
      count: healthTips.length,
      total,
      healthTips
    });
  } catch (error) {
    console.error('Get health tips error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching health tips',
      error: error.message
    });
  }
};

// Get health tip by ID
export const getHealthTipById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find health tip
    const healthTip = await HealthTip.findById(id)
      .populate('author', 'firstName lastName avatar specializations');

    if (!healthTip) {
      return res.status(404).json({
        success: false,
        message: 'Health tip not found'
      });
    }

    // Check if health tip is published or user has permission
    if (
      healthTip.status !== 'published' &&
      (!req.user || 
        (req.user._id.toString() !== healthTip.author._id.toString() &&
         req.user.role !== 'admin'))
    ) {
      return res.status(403).json({
        success: false,
        message: 'This health tip is not available'
      });
    }

    // Increment view count
    healthTip.viewCount += 1;
    await healthTip.save();

    res.status(200).json({
      success: true,
      healthTip
    });
  } catch (error) {
    console.error('Get health tip error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching health tip',
      error: error.message
    });
  }
};

// Update health tip
export const updateHealthTip = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user._id;

    // Find health tip
    const healthTip = await HealthTip.findById(id);
    if (!healthTip) {
      return res.status(404).json({
        success: false,
        message: 'Health tip not found'
      });
    }

    // Check authorization (only the author or admin can update)
    if (
      healthTip.author.toString() !== userId.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this health tip'
      });
    }

    // Update fields
    const allowedUpdates = ['title', 'content', 'category', 'tags', 'imageUrl'];
    Object.keys(updates).forEach(update => {
      if (allowedUpdates.includes(update)) {
        healthTip[update] = updates[update];
      }
    });

    // If non-admin user is updating a published tip, set status back to pending
    if (
      req.user.role !== 'admin' &&
      healthTip.status === 'published' &&
      (updates.title || updates.content || updates.category)
    ) {
      healthTip.status = 'pending';
    }

    // Admin can update status and featured flag
    if (req.user.role === 'admin') {
      if (updates.status) healthTip.status = updates.status;
      if (updates.isFeatured !== undefined) healthTip.isFeatured = updates.isFeatured;
    }

    // Add to update history
    healthTip.updateHistory.push({
      updatedBy: userId,
      updatedAt: new Date()
    });

    await healthTip.save();

    res.status(200).json({
      success: true,
      message: 'Health tip updated successfully',
      healthTip
    });
  } catch (error) {
    console.error('Update health tip error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating health tip',
      error: error.message
    });
  }
};

// Delete health tip
export const deleteHealthTip = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find health tip
    const healthTip = await HealthTip.findById(id);
    if (!healthTip) {
      return res.status(404).json({
        success: false,
        message: 'Health tip not found'
      });
    }

    // Check authorization (only the author or admin can delete)
    if (
      healthTip.author.toString() !== userId.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this health tip'
      });
    }

    // Delete health tip
    await healthTip.remove();

    res.status(200).json({
      success: true,
      message: 'Health tip deleted successfully'
    });
  } catch (error) {
    console.error('Delete health tip error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting health tip',
      error: error.message
    });
  }
};

// Get featured health tips
export const getFeaturedHealthTips = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    // Get featured health tips
    const healthTips = await HealthTip.find({
      status: 'published',
      isFeatured: true
    })
      .populate('author', 'firstName lastName avatar specializations')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: healthTips.length,
      healthTips
    });
  } catch (error) {
    console.error('Get featured health tips error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured health tips',
      error: error.message
    });
  }
};

// Get health tips by author
export const getHealthTipsByAuthor = async (req, res) => {
  try {
    const { authorId } = req.params;
    const { limit = 10, skip = 0 } = req.query;

    // Build query
    const query = { author: authorId };
    
    // If not author or admin, show only published tips
    if (
      !req.user ||
      (req.user._id.toString() !== authorId && req.user.role !== 'admin')
    ) {
      query.status = 'published';
    }

    // Get health tips
    const healthTips = await HealthTip.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await HealthTip.countDocuments(query);

    res.status(200).json({
      success: true,
      count: healthTips.length,
      total,
      healthTips
    });
  } catch (error) {
    console.error('Get author health tips error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching author health tips',
      error: error.message
    });
  }
};

// Like health tip
export const likeHealthTip = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find health tip
    const healthTip = await HealthTip.findById(id);
    if (!healthTip) {
      return res.status(404).json({
        success: false,
        message: 'Health tip not found'
      });
    }

    // Check if health tip is published
    if (healthTip.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Cannot like unpublished health tip'
      });
    }

    // Check if user has already liked
    const alreadyLiked = healthTip.likes.includes(userId);
    
    if (alreadyLiked) {
      // Unlike
      healthTip.likes = healthTip.likes.filter(id => id.toString() !== userId.toString());
    } else {
      // Like
      healthTip.likes.push(userId);
    }

    await healthTip.save();

    res.status(200).json({
      success: true,
      message: alreadyLiked ? 'Health tip unliked' : 'Health tip liked',
      likesCount: healthTip.likes.length,
      liked: !alreadyLiked
    });
  } catch (error) {
    console.error('Like health tip error:', error);
    res.status(500).json({
      success: false,
      message: 'Error liking health tip',
      error: error.message
    });
  }
};

// Get categories
export const getCategories = async (req, res) => {
  try {
    // Get distinct categories with count
    const categories = await HealthTip.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      categories: categories.map(cat => ({
        name: cat._id,
        count: cat.count
      }))
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

// Get related health tips
export const getRelatedHealthTips = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 4 } = req.query;

    // Find health tip
    const healthTip = await HealthTip.findById(id);
    if (!healthTip) {
      return res.status(404).json({
        success: false,
        message: 'Health tip not found'
      });
    }

    // Get related health tips by category or tags
    const relatedTips = await HealthTip.find({
      _id: { $ne: id },
      status: 'published',
      $or: [
        { category: healthTip.category },
        { tags: { $in: healthTip.tags } }
      ]
    })
      .populate('author', 'firstName lastName avatar')
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: relatedTips.length,
      healthTips: relatedTips
    });
  } catch (error) {
    console.error('Get related health tips error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching related health tips',
      error: error.message
    });
  }
};

// Get pending health tips (admin only)
export const getPendingHealthTips = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can access pending health tips'
      });
    }

    const { limit = 10, skip = 0 } = req.query;

    // Get pending health tips
    const healthTips = await HealthTip.find({ status: 'pending' })
      .populate('author', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await HealthTip.countDocuments({ status: 'pending' });

    res.status(200).json({
      success: true,
      count: healthTips.length,
      total,
      healthTips
    });
  } catch (error) {
    console.error('Get pending health tips error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending health tips',
      error: error.message
    });
  }
};
