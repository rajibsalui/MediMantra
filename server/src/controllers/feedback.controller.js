import Feedback from '../models/feedback.model.js';
import { User } from '../models/user.model.js';
import Notification from '../models/notification.model.js';

// Submit feedback
export const submitFeedback = async (req, res) => {
  try {
    const { 
      type,
      subject,
      message,
      rating,
      category,
      isAnonymous = false
    } = req.body;
    
    const userId = req.user ? req.user._id : null;
    
    // Validate required fields
    if (!type || !message) {
      return res.status(400).json({
        success: false,
        message: 'Feedback type and message are required'
      });
    }
    
    // Create feedback
    const feedback = await Feedback.create({
      user: userId,
      type,
      subject,
      message,
      rating,
      category,
      isAnonymous,
      status: 'pending',
      metadata: {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      }
    });
    
    // Notify admins about new feedback
    await Notification.createNotification({
      recipient: null, // System notification for admins
      sender: userId,
      type: 'new_feedback',
      title: 'New Feedback Submitted',
      message: `New ${type} feedback: ${subject || 'No subject'}`,
      relatedDocument: {
        model: 'Feedback',
        id: feedback._id
      },
      isAdminNotification: true
    });
    
    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedbackId: feedback._id
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback',
      error: error.message
    });
  }
};

// Get user feedback
export const getUserFeedback = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10, skip = 0 } = req.query;
    
    // Get feedback
    const feedback = await Feedback.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Feedback.countDocuments({ user: userId });
    
    res.status(200).json({
      success: true,
      count: feedback.length,
      total,
      feedback
    });
  } catch (error) {
    console.error('Get user feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: error.message
    });
  }
};

// Get feedback by ID
export const getFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Find feedback
    const feedback = await Feedback.findById(id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    // Check authorization
    if (
      (feedback.user && feedback.user.toString() !== userId.toString()) &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this feedback'
      });
    }
    
    res.status(200).json({
      success: true,
      feedback
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: error.message
    });
  }
};

// Update feedback (user)
export const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, rating, subject } = req.body;
    const userId = req.user._id;
    
    // Find feedback
    const feedback = await Feedback.findById(id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    // Check authorization
    if (!feedback.user || feedback.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this feedback'
      });
    }
    
    // Check if feedback can be updated
    if (feedback.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot update feedback with status "${feedback.status}"`
      });
    }
    
    // Update feedback
    if (message) feedback.message = message;
    if (rating) feedback.rating = rating;
    if (subject) feedback.subject = subject;
    
    await feedback.save();
    
    res.status(200).json({
      success: true,
      message: 'Feedback updated successfully',
      feedback
    });
  } catch (error) {
    console.error('Update feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating feedback',
      error: error.message
    });
  }
};

// Process feedback (admin)
export const processFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, response, tags, internalNotes } = req.body;
    const userId = req.user._id;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can process feedback'
      });
    }
    
    // Validate status
    if (!status || !['pending', 'in_progress', 'resolved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required'
      });
    }
    
    // Find feedback
    const feedback = await Feedback.findById(id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    // Update feedback
    feedback.status = status;
    if (response) feedback.response = response;
    if (tags) feedback.tags = tags;
    if (internalNotes) feedback.internalNotes = internalNotes;
    
    feedback.processingDetails = {
      processedBy: userId,
      processedAt: new Date()
    };
    
    await feedback.save();
    
    // If feedback is resolved or rejected, notify the user
    if ((status === 'resolved' || status === 'rejected') && feedback.user) {
      await Notification.createNotification({
        recipient: feedback.user,
        sender: userId,
        type: 'feedback_processed',
        title: 'Feedback Update',
        message: `Your feedback has been ${status}`,
        relatedDocument: {
          model: 'Feedback',
          id: feedback._id
        }
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Feedback processed successfully',
      feedback
    });
  } catch (error) {
    console.error('Process feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing feedback',
      error: error.message
    });
  }
};

// Get all feedback (admin only)
export const getAllFeedback = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can access all feedback'
      });
    }
    
    const { 
      status, 
      type, 
      category, 
      limit = 10, 
      skip = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (category) {
      query.category = category;
    }
    
    // Get feedback with populated user data
    const feedback = await Feedback.find(query)
      .populate('user', 'firstName lastName email avatar')
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Feedback.countDocuments(query);
    
    // Count feedback by status
    const statusCounts = await Feedback.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    res.status(200).json({
      success: true,
      count: feedback.length,
      total,
      statusCounts: statusCounts.reduce((obj, item) => {
        obj[item._id] = item.count;
        return obj;
      }, {}),
      feedback
    });
  } catch (error) {
    console.error('Get all feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: error.message
    });
  }
};

// Get feedback statistics (admin only)
export const getFeedbackStatistics = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can access feedback statistics'
      });
    }
    
    // Get total feedback count
    const totalFeedback = await Feedback.countDocuments();
    
    // Get feedback by type
    const feedbackByType = await Feedback.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get feedback by category
    const feedbackByCategory = await Feedback.aggregate([
      { $match: { category: { $exists: true, $ne: null } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get feedback by status
    const feedbackByStatus = await Feedback.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Get average rating
    const ratingStats = await Feedback.aggregate([
      { $match: { rating: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: null,
          average: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get feedback trends over time
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const feedbackTrends = await Feedback.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      statistics: {
        totalFeedback,
        feedbackByType,
        feedbackByCategory,
        feedbackByStatus: feedbackByStatus.reduce((obj, item) => {
          obj[item._id] = item.count;
          return obj;
        }, {}),
        ratingStats: ratingStats.length > 0 ? {
          average: ratingStats[0].average,
          count: ratingStats[0].count
        } : { average: 0, count: 0 },
        feedbackTrends
      }
    });
  } catch (error) {
    console.error('Get feedback statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback statistics',
      error: error.message
    });
  }
};

// Delete feedback (admin only)
export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete feedback'
      });
    }
    
    // Find feedback
    const feedback = await Feedback.findById(id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    // Delete feedback
    await feedback.remove();
    
    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting feedback',
      error: error.message
    });
  }
};
