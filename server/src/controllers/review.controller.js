import Review from '../models/review.model.js';
import Doctor from '../models/doctor.model.js';
import { User } from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import Appointment from '../models/appointment.model.js';

// Create a new review
export const createReview = async (req, res) => {
  try {
    const { doctorId, rating, comment, anonymous = false, appointmentId } = req.body;
    const patientId = req.user._id;

    // Validate required fields
    if (!doctorId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID and rating are required'
      });
    }

    // Validate rating value
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if doctor exists
    const doctor = await Doctor.findOne({ user: doctorId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check if patient has had an appointment with this doctor
    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment || appointment.patient.toString() !== patientId.toString() || 
          appointment.doctor.toString() !== doctorId.toString() || 
          appointment.status !== 'completed') {
        return res.status(403).json({
          success: false,
          message: 'You can only review doctors after completed appointments'
        });
      }
    } else {
      const hasAppointment = await Appointment.findOne({
        patient: patientId,
        doctor: doctorId,
        status: 'completed'
      });
      
      if (!hasAppointment) {
        return res.status(403).json({
          success: false,
          message: 'You can only review doctors you have had appointments with'
        });
      }
    }

    // Check if patient has already reviewed this doctor
    const existingReview = await Review.findOne({
      patient: patientId,
      doctor: doctorId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this doctor'
      });
    }

    // Create new review
    const review = await Review.create({
      doctor: doctorId,
      patient: patientId,
      rating,
      comment,
      appointment: appointmentId,
      isAnonymous: anonymous,
      status: 'pending'
    });

    // Update doctor's rating
    await updateDoctorRating(doctorId);

    // Notify doctor about the new review
    await Notification.createNotification({
      recipient: doctorId,
      sender: patientId,
      type: 'new_review',
      title: 'New Review',
      message: `You have received a new ${rating}-star review`,
      relatedDocument: {
        model: 'Review',
        id: review._id
      }
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully and pending approval',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating review',
      error: error.message
    });
  }
};

// Get review by ID
export const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id)
      .populate('doctor', 'firstName lastName specializations')
      .populate('patient', 'firstName lastName avatar');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Don't return pending or rejected reviews unless to the author, doctor, or admin
    if (review.status !== 'approved') {
      if (!req.user || 
          (req.user._id.toString() !== review.patient.toString() && 
           req.user._id.toString() !== review.doctor.toString() && 
           req.user.role !== 'admin')) {
        return res.status(403).json({
          success: false,
          message: 'This review is not available'
        });
      }
    }

    res.status(200).json({
      success: true,
      review
    });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching review',
      error: error.message
    });
  }
};

// Get reviews for a doctor
export const getReviewsForDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { limit = 10, skip = 0 } = req.query;

    // Make sure doctor exists
    const doctor = await Doctor.findOne({ user: doctorId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Get approved reviews
    const reviews = await Review.find({
      doctor: doctorId,
      status: 'approved'
    })
      .populate('patient', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Review.countDocuments({
      doctor: doctorId,
      status: 'approved'
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      reviews
    });
  } catch (error) {
    console.error('Get doctor reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

// Get reviews by patient
export const getReviewsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { limit = 10, skip = 0 } = req.query;

    // Check authorization
    if (req.user._id.toString() !== patientId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view these reviews'
      });
    }

    // Get reviews by patient
    const reviews = await Review.find({ patient: patientId })
      .populate('doctor', 'firstName lastName specializations')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Review.countDocuments({ patient: patientId });

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      reviews
    });
  } catch (error) {
    console.error('Get patient reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

// Update review
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, anonymous } = req.body;
    const userId = req.user._id;

    // Find review
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check authorization (only the author or admin can update)
    if (review.patient.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this review'
      });
    }

    // Validate rating if provided
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }
      review.rating = rating;
    }

    // Update other fields
    if (comment !== undefined) review.comment = comment;
    if (anonymous !== undefined) review.isAnonymous = anonymous;

    // If the review was already approved, set it back to pending
    if (review.status === 'approved') {
      review.status = 'pending';
    }

    await review.save();

    // Update doctor's rating
    if (rating !== undefined) {
      await updateDoctorRating(review.doctor);
    }

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: error.message
    });
  }
};

// Delete review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find review
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check authorization (only the author or admin can delete)
    if (review.patient.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this review'
      });
    }

    // Delete review
    await review.remove();

    // Update doctor's rating
    await updateDoctorRating(review.doctor);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
};

// Mark review as helpful
export const markReviewHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find review
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if review is approved
    if (review.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'This review is not available for interaction'
      });
    }

    // Check if user has already marked as helpful
    const alreadyMarked = review.helpfulVotes.includes(userId);
    
    if (alreadyMarked) {
      // Remove vote if already voted
      review.helpfulVotes = review.helpfulVotes.filter(id => id.toString() !== userId.toString());
      await review.save();
      
      res.status(200).json({
        success: true,
        message: 'Review unmarked as helpful',
        helpfulCount: review.helpfulVotes.length
      });
    } else {
      // Add vote
      review.helpfulVotes.push(userId);
      await review.save();
      
      res.status(200).json({
        success: true,
        message: 'Review marked as helpful',
        helpfulCount: review.helpfulVotes.length
      });
    }
  } catch (error) {
    console.error('Mark review helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: error.message
    });
  }
};

// Report review
export const reportReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Reason for reporting is required'
      });
    }

    // Find review
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if review is approved
    if (review.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'This review is not available for interaction'
      });
    }

    // Check if user has already reported
    const alreadyReported = review.reports.some(report => report.user.toString() === userId.toString());
    
    if (alreadyReported) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this review'
      });
    }

    // Add report
    review.reports.push({
      user: userId,
      reason,
      reportedAt: new Date()
    });

    // If review gets many reports, change status to pending for moderation
    if (review.reports.length >= 3) {
      review.status = 'pending';
      
      // Notify admin about reported review
      await Notification.createNotification({
        recipient: null, // System notification for admins
        type: 'review_reported',
        title: 'Review Reported',
        message: `A review has received multiple reports and needs moderation`,
        relatedDocument: {
          model: 'Review',
          id: review._id
        },
        isAdminNotification: true
      });
    }

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review reported successfully'
    });
  } catch (error) {
    console.error('Report review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reporting review',
      error: error.message
    });
  }
};

// Doctor response to review
export const respondToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;
    const userId = req.user._id;

    if (!response) {
      return res.status(400).json({
        success: false,
        message: 'Response text is required'
      });
    }

    // Find review
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check authorization (only the doctor being reviewed can respond)
    if (review.doctor.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to respond to this review'
      });
    }

    // Add or update response
    review.response = {
      text: response,
      respondedAt: new Date()
    };

    await review.save();

    // Notify patient about the response
    await Notification.createNotification({
      recipient: review.patient,
      sender: userId,
      type: 'review_response',
      title: 'Response to Your Review',
      message: 'A doctor has responded to your review',
      relatedDocument: {
        model: 'Review',
        id: review._id
      }
    });

    res.status(200).json({
      success: true,
      message: 'Response added successfully',
      review
    });
  } catch (error) {
    console.error('Respond to review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding response',
      error: error.message
    });
  }
};

// Admin moderation of reviews
export const moderateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, moderationNotes } = req.body;
    const userId = req.user._id;

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved or rejected.'
      });
    }

    // Find review
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check authorization (only admin can moderate)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to moderate reviews'
      });
    }

    // Update review status
    review.status = status;
    review.moderation = {
      moderatedBy: userId,
      moderatedAt: new Date(),
      notes: moderationNotes || ''
    };

    await review.save();

    // Update doctor's rating if review is approved or was previously approved
    if (status === 'approved' || review.status === 'approved') {
      await updateDoctorRating(review.doctor);
    }

    // Notify patient about moderation result
    await Notification.createNotification({
      recipient: review.patient,
      type: 'review_moderated',
      title: 'Review Moderation',
      message: `Your review has been ${status}`,
      relatedDocument: {
        model: 'Review',
        id: review._id
      }
    });

    res.status(200).json({
      success: true,
      message: `Review ${status} successfully`,
      review
    });
  } catch (error) {
    console.error('Moderate review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error moderating review',
      error: error.message
    });
  }
};

// Get pending reviews for moderation
export const getPendingReviews = async (req, res) => {
  try {
    const { limit = 10, skip = 0 } = req.query;

    // Check authorization (only admin can view pending reviews)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view pending reviews'
      });
    }

    // Get pending reviews
    const reviews = await Review.find({ status: 'pending' })
      .populate('doctor', 'firstName lastName specializations')
      .populate('patient', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Review.countDocuments({ status: 'pending' });

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      reviews
    });
  } catch (error) {
    console.error('Get pending reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending reviews',
      error: error.message
    });
  }
};

// Get review metrics for a doctor
export const getReviewMetrics = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    // Authorization (only the doctor or admin can see detailed metrics)
    if (req.user._id.toString() !== doctorId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view these metrics'
      });
    }

    // Get approved reviews
    const reviews = await Review.find({
      doctor: doctorId,
      status: 'approved'
    });

    // Calculate metrics
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;
    
    // Count ratings by star
    const ratingCounts = {
      1: reviews.filter(r => r.rating === 1).length,
      2: reviews.filter(r => r.rating === 2).length,
      3: reviews.filter(r => r.rating === 3).length,
      4: reviews.filter(r => r.rating === 4).length,
      5: reviews.filter(r => r.rating === 5).length
    };
    
    // Calculate percentage for each rating
    const ratingPercentages = {};
    for (let i = 1; i <= 5; i++) {
      ratingPercentages[i] = totalReviews > 0 
        ? Math.round((ratingCounts[i] / totalReviews) * 100) 
        : 0;
    }

    // Get recent reviews
    const recentReviews = await Review.find({
      doctor: doctorId,
      status: 'approved'
    })
      .populate('patient', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get review trends (by month)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const reviewTrends = await Review.aggregate([
      {
        $match: {
          doctor: doctorId,
          status: 'approved',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { 
            month: { $month: '$createdAt' }, 
            year: { $year: '$createdAt' } 
          },
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({
      success: true,
      metrics: {
        totalReviews,
        averageRating,
        ratingCounts,
        ratingPercentages,
        recentReviews,
        reviewTrends
      }
    });
  } catch (error) {
    console.error('Get review metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching review metrics',
      error: error.message
    });
  }
};

// Helper function to update doctor's rating
const updateDoctorRating = async (doctorId) => {
  try {
    // Get all approved reviews for the doctor
    const reviews = await Review.find({
      doctor: doctorId,
      status: 'approved'
    });
    
    const totalReviews = reviews.length;
    let averageRating = 0;
    
    if (totalReviews > 0) {
      const sumRatings = reviews.reduce((total, review) => total + review.rating, 0);
      averageRating = sumRatings / totalReviews;
    }
    
    // Update doctor's rating
    await Doctor.findOneAndUpdate(
      { user: doctorId },
      { 
        'ratings.average': averageRating,
        'ratings.count': totalReviews
      }
    );
    
  } catch (error) {
    console.error('Update doctor rating error:', error);
    throw error;
  }
};
