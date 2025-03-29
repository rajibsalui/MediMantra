import Appointment from '../models/appointment.model.js';
import { User } from '../models/user.model.js';
import Doctor from '../models/doctor.model.js';
import Payment from '../models/payment.model.js';
import Notification from '../models/notification.model.js';
import TelemedicineSession from '../models/telemedicine.model.js';
import { LabTest } from '../models/labTest.model.js';
import Review from '../models/review.model.js';
import MedicalRecord from '../models/medicalRecord.model.js';
import Prescription from '../models/prescription.model.js';

// Get general analytics (admin only)
export const getGeneralAnalytics = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can access analytics'
      });
    }

    const { period = 'month' } = req.query;
    
    // Define time periods for query
    let startDate = new Date();
    let groupBy;
    
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid period. Use "week", "month", or "year"'
      });
    }
    
    // User registration trends
    const userRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
          patients: {
            $sum: { $cond: [{ $eq: ['$role', 'patient'] }, 1, 0] }
          },
          doctors: {
            $sum: { $cond: [{ $eq: ['$role', 'doctor'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    // Appointment trends
    const appointmentTrends = await Appointment.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
          telemedicine: {
            $sum: { $cond: [{ $eq: ['$appointmentType', 'telemedicine'] }, 1, 0] }
          },
          inPerson: {
            $sum: { $cond: [{ $eq: ['$appointmentType', 'in-person'] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    // Revenue trends
    const revenueTrends = await Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: groupBy,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    // Get top doctors by appointments
    const topDoctors = await Appointment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$doctor',
          appointmentCount: { $sum: 1 }
        }
      },
      { $sort: { appointmentCount: -1 } },
      { $limit: 10 }
    ]);
    
    // Get doctor details
    const doctorIds = topDoctors.map(d => d._id);
    const doctorDetails = await User.find({ _id: { $in: doctorIds } })
      .select('firstName lastName');
    
    const topDoctorsWithDetails = topDoctors.map(doc => {
      const details = doctorDetails.find(d => d._id.toString() === doc._id.toString());
      return {
        doctorId: doc._id,
        name: details ? `${details.firstName} ${details.lastName}` : 'Unknown',
        appointmentCount: doc.appointmentCount
      };
    });
    
    // Get service type distribution
    const serviceDistribution = await Appointment.aggregate([
      { 
        $group: { 
          _id: '$appointmentType', 
          count: { $sum: 1 } 
        } 
      }
    ]);
    
    res.status(200).json({
      success: true,
      analytics: {
        userRegistrations,
        appointmentTrends,
        revenueTrends,
        topDoctors: topDoctorsWithDetails,
        serviceDistribution
      }
    });
  } catch (error) {
    console.error('Get general analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
};

// Get doctor performance analytics
export const getDoctorPerformanceAnalytics = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can access doctor performance analytics'
      });
    }
    
    const { doctorId } = req.params;
    
    // Check if doctor exists
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    // Get appointment statistics
    const appointmentStats = {
      total: await Appointment.countDocuments({ doctor: doctorId }),
      completed: await Appointment.countDocuments({ doctor: doctorId, status: 'completed' }),
      cancelled: await Appointment.countDocuments({ doctor: doctorId, status: 'cancelled' }),
      upcoming: await Appointment.countDocuments({
        doctor: doctorId,
        appointmentDate: { $gte: new Date() },
        status: { $nin: ['cancelled', 'completed'] }
      })
    };
    
    // Calculate no-show rate
    const noShows = await Appointment.countDocuments({ doctor: doctorId, status: 'missed' });
    appointmentStats.noShowRate = appointmentStats.total > 0 
      ? (noShows / appointmentStats.total) * 100 
      : 0;
    
    // Get average appointment duration
    const completedAppointmentsWithDuration = await Appointment.find({
      doctor: doctorId,
      status: 'completed',
      'completionDetails.completedAt': { $exists: true },
      duration: { $exists: true }
    });
    
    let averageDuration = 0;
    if (completedAppointmentsWithDuration.length > 0) {
      const totalDuration = completedAppointmentsWithDuration.reduce(
        (sum, appt) => sum + (appt.duration || 0), 0
      );
      averageDuration = totalDuration / completedAppointmentsWithDuration.length;
    }
    
    // Get patient feedback
    const reviews = await Review.find({ doctor: doctorId });
    
    const reviewStats = {
      count: reviews.length,
      averageRating: 0,
      ratingDistribution: {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0
      }
    };
    
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      reviewStats.averageRating = totalRating / reviews.length;
      
      // Calculate rating distribution
      reviews.forEach(review => {
        reviewStats.ratingDistribution[review.rating]++;
      });
    }
    
    // Get revenue generated
    const payments = await Payment.find({
      doctor: doctorId,
      status: 'completed'
    });
    
    const revenue = {
      total: payments.reduce((sum, payment) => sum + payment.amount, 0),
      count: payments.length
    };
    
    // Get telemedicine stats
    const telemedicineStats = {
      total: await TelemedicineSession.countDocuments({ doctor: doctorId }),
      completed: await TelemedicineSession.countDocuments({ 
        doctor: doctorId, 
        status: 'completed' 
      })
    };
    
    // Get prescription stats
    const prescriptionStats = {
      total: await Prescription.countDocuments({ doctor: doctorId }),
      active: await Prescription.countDocuments({ 
        doctor: doctorId, 
        status: 'active' 
      }),
      dispensed: await Prescription.countDocuments({ 
        doctor: doctorId, 
        status: 'dispensed' 
      })
    };
    
    // Get monthly activity
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyActivity = await Appointment.aggregate([
      { 
        $match: { 
          doctor: doctorId, 
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          appointmentsCount: { $sum: 1 },
          completedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      doctorPerformance: {
        doctorInfo: {
          name: `${doctor.firstName} ${doctor.lastName}`,
          id: doctor._id
        },
        appointments: appointmentStats,
        averageDuration,
        reviews: reviewStats,
        revenue,
        telemedicine: telemedicineStats,
        prescriptions: prescriptionStats,
        monthlyActivity
      }
    });
  } catch (error) {
    console.error('Get doctor performance analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor performance analytics',
      error: error.message
    });
  }
};

// Get patient engagement analytics
export const getPatientEngagementAnalytics = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can access patient engagement analytics'
      });
    }
    
    // Get active vs inactive patients
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const activePatients = await User.countDocuments({ 
      role: 'patient',
      lastActive: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // active in last 30 days
    });
    
    // Patient appointments analytics
    const appointmentsPerPatient = await Appointment.aggregate([
      {
        $group: {
          _id: '$patient',
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          average: { $avg: '$count' },
          max: { $max: '$count' },
          min: { $min: '$count' }
        }
      }
    ]);
    
    // Appointment show rate
    const allAppointments = await Appointment.countDocuments({
      status: { $in: ['completed', 'missed'] }
    });
    
    const completedAppointments = await Appointment.countDocuments({
      status: 'completed'
    });
    
    const showRate = allAppointments > 0 
      ? (completedAppointments / allAppointments) * 100 
      : 0;
    
    // Telemedicine engagement
    const telemedicineAppointments = await Appointment.countDocuments({
      appointmentType: 'telemedicine'
    });
    
    const telemedicineRate = totalPatients > 0
      ? (telemedicineAppointments / totalPatients) * 100
      : 0;
    
    // App usage statistics (simulated for this example)
    const appUsageStats = {
      dailyActiveUsers: Math.round(totalPatients * 0.3), // simulated 30% DAU
      monthlyActiveUsers: Math.round(totalPatients * 0.7), // simulated 70% MAU
      averageSessionDuration: 12, // minutes
      mostUsedFeatures: [
        { feature: 'appointments', usageCount: Math.round(totalPatients * 0.8) },
        { feature: 'prescriptions', usageCount: Math.round(totalPatients * 0.6) },
        { feature: 'medical_records', usageCount: Math.round(totalPatients * 0.4) },
        { feature: 'telemedicine', usageCount: Math.round(totalPatients * 0.3) },
        { feature: 'medibot', usageCount: Math.round(totalPatients * 0.2) }
      ]
    };
    
    // Retention rate (simulated)
    const retentionStats = {
      sevenDay: 85, // percentage
      thirtyDay: 68,
      ninetyDay: 52
    };
    
    res.status(200).json({
      success: true,
      engagement: {
        patientCounts: {
          total: totalPatients,
          active: activePatients,
          inactive: totalPatients - activePatients,
          activeRate: (activePatients / totalPatients) * 100
        },
        appointments: {
          perPatient: appointmentsPerPatient[0] || { average: 0, max: 0, min: 0 },
          showRate
        },
        telemedicine: {
          appointments: telemedicineAppointments,
          utilization: telemedicineRate
        },
        appUsage: appUsageStats,
        retention: retentionStats
      }
    });
  } catch (error) {
    console.error('Get patient engagement analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient engagement analytics',
      error: error.message
    });
  }
};

// Get revenue analytics
export const getRevenueAnalytics = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can access revenue analytics'
      });
    }
    
    const { period } = req.query;
    
    // Define time range based on period
    let startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else {
      // Default to all-time
      startDate = new Date(0); // Jan 1, 1970
    }
    
    // Get total revenue
    const payments = await Payment.find({
      status: 'completed',
      createdAt: { $gte: startDate }
    });
    
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Revenue by payment method
    const revenueByMethod = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Revenue by doctor specialization
    const revenueBySpecialization = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'doctors',
          localField: 'doctor',
          foreignField: 'user',
          as: 'doctorInfo'
        }
      },
      { $unwind: '$doctorInfo' },
      { $unwind: '$doctorInfo.specializations' },
      {
        $group: {
          _id: '$doctorInfo.specializations',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);
    
    // Revenue trend
    const revenueTrend = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: period === 'week' || period === 'month' ? { $dayOfMonth: '$createdAt' } : null
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    // Refund statistics
    const refundStats = await Payment.aggregate([
      {
        $match: {
          'refund.status': 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$refund.amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const refundsTotal = refundStats.length > 0 ? refundStats[0].total : 0;
    const refundsCount = refundStats.length > 0 ? refundStats[0].count : 0;
    
    res.status(200).json({
      success: true,
      revenue: {
        total: totalRevenue,
        transactionCount: payments.length,
        average: payments.length > 0 ? totalRevenue / payments.length : 0,
        byMethod: revenueByMethod,
        bySpecialization: revenueBySpecialization,
        trend: revenueTrend,
        refunds: {
          total: refundsTotal,
          count: refundsCount,
          rate: payments.length > 0 ? (refundsCount / payments.length) * 100 : 0
        }
      }
    });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue analytics',
      error: error.message
    });
  }
};

// Get operational analytics
export const getOperationalAnalytics = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can access operational analytics'
      });
    }
    
    // Get appointment efficiency
    const appointmentStats = {
      total: await Appointment.countDocuments(),
      completed: await Appointment.countDocuments({ status: 'completed' }),
      cancelled: await Appointment.countDocuments({ status: 'cancelled' }),
      missed: await Appointment.countDocuments({ status: 'missed' }),
      rescheduled: await Appointment.countDocuments({ isRescheduled: true })
    };
    
    // Calculate rates
    appointmentStats.completionRate = appointmentStats.total > 0 
      ? (appointmentStats.completed / appointmentStats.total) * 100 
      : 0;
    
    appointmentStats.cancellationRate = appointmentStats.total > 0 
      ? (appointmentStats.cancelled / appointmentStats.total) * 100 
      : 0;
    
    appointmentStats.missedRate = appointmentStats.total > 0 
      ? (appointmentStats.missed / appointmentStats.total) * 100 
      : 0;
    
    // Get doctor utilization
    const totalDoctors = await User.countDocuments({ role: 'doctor', isActive: true });
    
    const doctorAppointments = await Appointment.aggregate([
      {
        $group: {
          _id: '$doctor',
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          average: { $avg: '$count' },
          max: { $max: '$count' },
          min: { $min: '$count' }
        }
      }
    ]);
    
    // Get telemedicine usage stats
    const telemedicineStats = {
      total: await TelemedicineSession.countDocuments(),
      completed: await TelemedicineSession.countDocuments({ status: 'completed' }),
      cancelled: await TelemedicineSession.countDocuments({ status: 'cancelled' }),
      missed: await TelemedicineSession.countDocuments({ status: 'missed' })
    };
    
    telemedicineStats.completionRate = telemedicineStats.total > 0 
      ? (telemedicineStats.completed / telemedicineStats.total) * 100 
      : 0;
    
    // Lab test turnaround time
    const completedLabTests = await LabTest.find({
      status: 'completed',
      startedAt: { $exists: true },
      completedAt: { $exists: true }
    });
    
    let averageTurnaroundTime = 0;
    if (completedLabTests.length > 0) {
      const totalTime = completedLabTests.reduce((sum, test) => {
        const duration = test.completedAt - test.startedAt; // in milliseconds
        return sum + duration / (1000 * 60 * 60); // convert to hours
      }, 0);
      
      averageTurnaroundTime = totalTime / completedLabTests.length;
    }
    
    // Pharmacy dispensing stats
    const prescriptionStats = {
      total: await Prescription.countDocuments(),
      dispensed: await Prescription.countDocuments({ status: 'dispensed' }),
      active: await Prescription.countDocuments({ status: 'active' }),
      expired: await Prescription.countDocuments({ status: 'expired' })
    };
    
    prescriptionStats.dispensingRate = prescriptionStats.total > 0 
      ? (prescriptionStats.dispensed / prescriptionStats.total) * 100 
      : 0;
    
    res.status(200).json({
      success: true,
      operational: {
        appointments: appointmentStats,
        doctors: {
          total: totalDoctors,
          appointmentsPerDoctor: doctorAppointments[0] || { average: 0, max: 0, min: 0 },
          utilization: totalDoctors > 0 
            ? (await Appointment.countDocuments() / totalDoctors) 
            : 0
        },
        telemedicine: telemedicineStats,
        labTests: {
          averageTurnaroundTime, // in hours
          pending: await LabTest.countDocuments({ status: 'pending' }),
          inProgress: await LabTest.countDocuments({ status: 'in_progress' })
        },
        pharmacy: prescriptionStats
      }
    });
  } catch (error) {
    console.error('Get operational analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching operational analytics',
      error: error.message
    });
  }
};
