import { User } from '../models/user.model.js';
import Appointment from '../models/appointment.model.js';
import Doctor from '../models/doctor.model.js';
import Patient from '../models/patient.model.js';
import Payment from '../models/payment.model.js';
import Review from '../models/review.model.js';
import Prescription from '../models/prescription.model.js';
import Admin from '../models/admin.model.js';
import Notification from '../models/notification.model.js';

// Get dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    // Ensure user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get counts
    const userCount = await User.countDocuments({ isActive: true });
    const doctorCount = await Doctor.countDocuments({ verificationStatus: 'verified' });
    const patientCount = await Patient.countDocuments();
    const appointmentCount = await Appointment.countDocuments();
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });
    const pendingAppointments = await Appointment.countDocuments({ 
      status: { $in: ['scheduled', 'confirmed'] },
      appointmentDate: { $gte: new Date() }
    });

    // Get payments info
    const payments = await Payment.find({ status: 'completed' });
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

    // Get recent activities
    const recentAppointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('doctor', 'firstName lastName')
      .populate('patient', 'firstName lastName');

    // Get pending doctor verifications
    const pendingVerifications = await Doctor.countDocuments({ verificationStatus: 'pending' });

    // Get pending reviews
    const pendingReviews = await Review.countDocuments({ status: 'pending' });

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: userCount,
          doctors: doctorCount,
          patients: patientCount
        },
        appointments: {
          total: appointmentCount,
          completed: completedAppointments,
          cancelled: cancelledAppointments,
          pending: pendingAppointments
        },
        revenue: {
          total: totalRevenue
        },
        pending: {
          doctorVerifications: pendingVerifications,
          reviews: pendingReviews
        },
        recentActivity: recentAppointments
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};

// Get user list
export const getUserList = async (req, res) => {
  try {
    // Ensure user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { role, status, limit = 10, skip = 0, search } = req.query;

    // Build query
    const query = {};
    
    if (role) {
      query.role = role;
    }
    
    if (status) {
      if (status === 'active') {
        query.isActive = true;
      } else if (status === 'inactive') {
        query.isActive = false;
      } else if (status === 'verified') {
        query.isEmailVerified = true;
      } else if (status === 'unverified') {
        query.isEmailVerified = false;
      }
    }
    
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { firstName: { $regex: searchRegex } },
        { lastName: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { phone: { $regex: searchRegex } }
      ];
    }

    // Get users
    const users = await User.find(query)
      .select('-password -resetPassword -verification')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      users
    });
  } catch (error) {
    console.error('Get user list error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Get user profile (admin view)
export const getUserProfile = async (req, res) => {
  try {
    // Ensure user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { id } = req.params;

    // Get user
    const user = await User.findById(id).select('-password -resetPassword -verification');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get role-specific data
    let profileData = null;
    
    if (user.role === 'doctor') {
      profileData = await Doctor.findOne({ user: id });
    } else if (user.role === 'patient') {
      profileData = await Patient.findOne({ user: id });
    } else if (user.role === 'admin') {
      profileData = await Admin.findOne({ user: id });
    }

    // Get user activity
    const appointments = await Appointment.find({
      $or: [
        { patient: id },
        { doctor: id }
      ]
    }).select('appointmentDate status createdAt').sort({ createdAt: -1 }).limit(5);

    const payments = await Payment.find({
      $or: [
        { patient: id },
        { doctor: id }
      ]
    }).select('amount status createdAt').sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      success: true,
      user,
      profileData,
      activity: {
        appointments,
        payments
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
};

// Update user status
export const updateUserStatus = async (req, res) => {
  try {
    // Ensure user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { id } = req.params;
    const { isActive, accountStatus, note } = req.body;

    // Get user
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update status
    if (isActive !== undefined) {
      user.isActive = isActive;
    }
    
    if (accountStatus) {
      user.accountStatus = accountStatus;
    }

    // Add status change to history
    user.statusHistory.push({
      status: isActive ? 'activated' : 'deactivated',
      updatedBy: req.user._id,
      updatedAt: new Date(),
      note
    });

    await user.save();

    // Notify user
    await Notification.createNotification({
      recipient: id,
      sender: req.user._id,
      type: 'account_status_change',
      title: 'Account Status Updated',
      message: `Your account has been ${isActive ? 'activated' : 'deactivated'}.`,
      metadata: {
        newStatus: isActive ? 'active' : 'inactive'
      }
    });

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        _id: user._id,
        isActive: user.isActive,
        accountStatus: user.accountStatus
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  }
};

// Verify doctor
export const verifyDoctor = async (req, res) => {
  try {
    // Ensure user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { id } = req.params;
    const { status, notes } = req.body;

    // Get doctor
    const doctor = await Doctor.findOne({ user: id });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Update verification status
    doctor.verificationStatus = status;
    doctor.verificationNotes = notes;
    doctor.verifiedBy = req.user._id;
    doctor.verifiedAt = new Date();

    await doctor.save();

    // If approved, update user status
    if (status === 'verified') {
      await User.findByIdAndUpdate(id, {
        accountStatus: 'active',
        isActive: true
      });
    }

    // Notify doctor
    await Notification.createNotification({
      recipient: id,
      sender: req.user._id,
      type: 'doctor_verification',
      title: 'Verification Status Update',
      message: `Your doctor verification is ${status === 'verified' ? 'approved' : 'rejected'}.`,
      metadata: {
        verificationStatus: status,
        notes
      }
    });

    res.status(200).json({
      success: true,
      message: `Doctor ${status === 'verified' ? 'verified' : 'rejected'} successfully`,
      doctor: {
        _id: doctor._id,
        verificationStatus: doctor.verificationStatus
      }
    });
  } catch (error) {
    console.error('Verify doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying doctor',
      error: error.message
    });
  }
};

// Get pending doctor verifications
export const getPendingDoctorVerifications = async (req, res) => {
  try {
    // Ensure user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { limit = 10, skip = 0 } = req.query;

    // Get pending verifications
    const doctors = await Doctor.find({ verificationStatus: 'pending' })
      .populate('user', 'firstName lastName email phone avatar createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Doctor.countDocuments({ verificationStatus: 'pending' });

    res.status(200).json({
      success: true,
      count: doctors.length,
      total,
      doctors
    });
  } catch (error) {
    console.error('Get pending verifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending verifications',
      error: error.message
    });
  }
};

// Send system notification
export const sendSystemNotification = async (req, res) => {
  try {
    // Ensure user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const {
      recipients, // 'all', or specific roles like ['doctor', 'patient'], or array of user IDs
      title,
      message,
      type = 'system',
      link
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    let userIds = [];

    // Get recipients based on criteria
    if (recipients === 'all') {
      const users = await User.find({ isActive: true }).select('_id');
      userIds = users.map(user => user._id);
    } else if (Array.isArray(recipients) && recipients.some(r => ['doctor', 'patient', 'admin'].includes(r))) {
      // Recipients are role types
      const users = await User.find({ 
        role: { $in: recipients },
        isActive: true
      }).select('_id');
      userIds = users.map(user => user._id);
    } else if (Array.isArray(recipients) && recipients.length > 0) {
      // Recipients are specific user IDs
      userIds = recipients;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Valid recipients must be provided'
      });
    }

    // Create notifications
    const notifications = [];
    for (const userId of userIds) {
      const notification = await Notification.create({
        recipient: userId,
        sender: req.user._id,
        title,
        message,
        type,
        link
      });
      notifications.push(notification);
    }

    res.status(201).json({
      success: true,
      message: `System notification sent to ${userIds.length} recipients`,
      count: notifications.length
    });
  } catch (error) {
    console.error('Send system notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending system notification',
      error: error.message
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    // Ensure user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { id } = req.params;

    // Get user
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Instead of actually deleting, deactivate and anonymize
    user.isActive = false;
    user.accountStatus = 'deleted';
    user.email = `deleted_${user._id}@example.com`;
    user.phone = '';
    user.firstName = 'Deleted';
    user.lastName = 'User';
    user.isAnonymized = true;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User marked as deleted and anonymized'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};
