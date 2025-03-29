import Appointment from '../models/appointment.model.js';
import MedicalRecord from '../models/medicalRecord.model.js';
import Prescription from '../models/prescription.model.js';
import { User } from '../models/user.model.js';
import Doctor from '../models/doctor.model.js';
import Patient from '../models/patient.model.js';
import Payment from '../models/payment.model.js';
import Notification from '../models/notification.model.js';
import TelemedicineSession from '../models/telemedicine.model.js';
import { LabTest } from '../models/labTest.model.js';

// Get patient dashboard data
export const getPatientDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user is a patient
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can access patient dashboard'
      });
    }

    // Get upcoming appointments
    const upcomingAppointments = await Appointment.find({
      patient: userId,
      appointmentDate: { $gte: new Date() },
      status: { $nin: ['cancelled', 'completed'] }
    })
      .sort({ appointmentDate: 1 })
      .limit(5)
      .populate('doctor', 'firstName lastName specializations avatar');

    // Get recent medical records
    const recentMedicalRecords = await MedicalRecord.find({
      patient: userId
    })
      .sort({ recordDate: -1 })
      .limit(5)
      .populate('doctor', 'firstName lastName specializations');

    // Get active prescriptions
    const activePrescriptions = await Prescription.find({
      patient: userId,
      status: { $in: ['active', 'dispensed'] }
    })
      .sort({ prescriptionDate: -1 })
      .limit(5)
      .populate('doctor', 'firstName lastName');

    // Get recent payments
    const recentPayments = await Payment.find({
      patient: userId
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get pending lab tests
    const pendingLabTests = await LabTest.find({
      patient: userId,
      status: { $in: ['pending', 'in_progress'] }
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get unread notifications count
    const unreadNotificationsCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false
    });

    res.status(200).json({
      success: true,
      dashboardData: {
        appointments: {
          upcoming: upcomingAppointments,
          count: await Appointment.countDocuments({
            patient: userId,
            appointmentDate: { $gte: new Date() },
            status: { $nin: ['cancelled', 'completed'] }
          })
        },
        medicalRecords: {
          recent: recentMedicalRecords,
          count: await MedicalRecord.countDocuments({ patient: userId })
        },
        prescriptions: {
          active: activePrescriptions,
          count: await Prescription.countDocuments({
            patient: userId,
            status: { $in: ['active', 'dispensed'] }
          })
        },
        payments: {
          recent: recentPayments
        },
        labTests: {
          pending: pendingLabTests,
          count: await LabTest.countDocuments({
            patient: userId,
            status: { $in: ['pending', 'in_progress'] }
          })
        },
        notifications: {
          unreadCount: unreadNotificationsCount
        }
      }
    });
  } catch (error) {
    console.error('Get patient dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
};

// Get doctor dashboard data
export const getDoctorDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user is a doctor
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can access doctor dashboard'
      });
    }

    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await Appointment.find({
      doctor: userId,
      appointmentDate: { $gte: today, $lt: tomorrow },
      status: { $nin: ['cancelled'] }
    })
      .sort({ appointmentDate: 1 })
      .populate('patient', 'firstName lastName avatar');

    // Get upcoming appointments (next 7 days)
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingAppointments = await Appointment.find({
      doctor: userId,
      appointmentDate: { $gte: tomorrow, $lt: nextWeek },
      status: { $nin: ['cancelled', 'completed'] }
    })
      .sort({ appointmentDate: 1 })
      .limit(10)
      .populate('patient', 'firstName lastName avatar');

    // Get pending telemedicine sessions
    const pendingTelemedicineSessions = await TelemedicineSession.find({
      doctor: userId,
      status: 'scheduled',
      scheduledStartTime: { $gte: today }
    })
      .sort({ scheduledStartTime: 1 })
      .limit(5)
      .populate('patient', 'firstName lastName avatar')
      .populate('appointment');

    // Get pending lab results to review
    const pendingLabResults = await LabTest.find({
      requestedBy: userId,
      status: 'completed',
      isVerified: false
    })
      .sort({ completedAt: -1 })
      .limit(5)
      .populate('patient', 'firstName lastName');

    // Get recent patients
    const recentPatients = await Appointment.aggregate([
      { $match: { doctor: userId, status: 'completed' } },
      { $sort: { appointmentDate: -1 } },
      { $group: { _id: '$patient', lastAppointment: { $first: '$appointmentDate' } } },
      { $limit: 10 }
    ]);

    // Populate patient details
    const patientIds = recentPatients.map(p => p._id);
    const patientDetails = await User.find({ _id: { $in: patientIds } })
      .select('firstName lastName avatar');

    const populatedRecentPatients = recentPatients.map(p => {
      const details = patientDetails.find(pd => pd._id.toString() === p._id.toString());
      return {
        ...p,
        patientDetails: details
      };
    });

    // Get unread notifications count
    const unreadNotificationsCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false
    });

    res.status(200).json({
      success: true,
      dashboardData: {
        appointments: {
          today: todayAppointments,
          upcoming: upcomingAppointments,
          todayCount: todayAppointments.length,
          upcomingCount: await Appointment.countDocuments({
            doctor: userId,
            appointmentDate: { $gte: tomorrow, $lt: nextWeek },
            status: { $nin: ['cancelled', 'completed'] }
          })
        },
        telemedicine: {
          pending: pendingTelemedicineSessions,
          count: await TelemedicineSession.countDocuments({
            doctor: userId,
            status: 'scheduled',
            scheduledStartTime: { $gte: today }
          })
        },
        labTests: {
          pendingResults: pendingLabResults,
          count: await LabTest.countDocuments({
            requestedBy: userId,
            status: 'completed',
            isVerified: false
          })
        },
        patients: {
          recent: populatedRecentPatients
        },
        notifications: {
          unreadCount: unreadNotificationsCount
        }
      }
    });
  } catch (error) {
    console.error('Get doctor dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
};

// Get admin dashboard data
export const getAdminDashboard = async (req, res) => {
  try {
    // Check if user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can access admin dashboard'
      });
    }

    // Get user counts
    const userCounts = {
      total: await User.countDocuments({ isActive: true }),
      doctors: await User.countDocuments({ role: 'doctor', isActive: true }),
      patients: await User.countDocuments({ role: 'patient', isActive: true }),
      staff: await User.countDocuments({ 
        role: { $in: ['admin', 'lab', 'pharmacy'] }, 
        isActive: true 
      })
    };

    // Get pending doctor verifications
    const pendingDoctorVerifications = await Doctor.countDocuments({ verificationStatus: 'pending' });

    // Get appointment stats
    const appointmentStats = {
      total: await Appointment.countDocuments(),
      completed: await Appointment.countDocuments({ status: 'completed' }),
      upcoming: await Appointment.countDocuments({ 
        appointmentDate: { $gte: new Date() },
        status: { $nin: ['cancelled', 'completed'] }
      }),
      cancelled: await Appointment.countDocuments({ status: 'cancelled' })
    };

    // Get recent registrations
    const recentRegistrations = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('firstName lastName email role createdAt');

    // Get revenue stats
    const payments = await Payment.find({ status: 'completed' });
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

    // Get monthly revenue for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyRevenue = await Payment.aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({
      success: true,
      dashboardData: {
        users: userCounts,
        appointments: appointmentStats,
        revenue: {
          total: totalRevenue,
          monthly: monthlyRevenue
        },
        pendingTasks: {
          doctorVerifications: pendingDoctorVerifications,
          labTests: await LabTest.countDocuments({ status: 'pending' })
        },
        recentRegistrations
      }
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
};

// Get quick statistics
export const getQuickStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let stats = {};

    if (userRole === 'patient') {
      stats = {
        upcomingAppointments: await Appointment.countDocuments({
          patient: userId,
          appointmentDate: { $gte: new Date() },
          status: { $nin: ['cancelled', 'completed'] }
        }),
        activePrescriptions: await Prescription.countDocuments({
          patient: userId,
          status: { $in: ['active', 'dispensed'] }
        }),
        pendingLabTests: await LabTest.countDocuments({
          patient: userId,
          status: { $in: ['pending', 'in_progress'] }
        }),
        unreadNotifications: await Notification.countDocuments({
          recipient: userId,
          isRead: false
        })
      };
    } else if (userRole === 'doctor') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      stats = {
        todayAppointments: await Appointment.countDocuments({
          doctor: userId,
          appointmentDate: { $gte: today, $lt: tomorrow },
          status: { $nin: ['cancelled'] }
        }),
        pendingAppointments: await Appointment.countDocuments({
          doctor: userId,
          appointmentDate: { $gte: tomorrow },
          status: { $nin: ['cancelled', 'completed'] }
        }),
        pendingTelemedicine: await TelemedicineSession.countDocuments({
          doctor: userId,
          status: 'scheduled',
          scheduledStartTime: { $gte: today }
        }),
        unreadNotifications: await Notification.countDocuments({
          recipient: userId,
          isRead: false
        })
      };
    } else if (userRole === 'admin') {
      stats = {
        totalUsers: await User.countDocuments({ isActive: true }),
        pendingDoctorVerifications: await Doctor.countDocuments({ verificationStatus: 'pending' }),
        todayAppointments: await Appointment.countDocuments({
          appointmentDate: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }),
        unreadNotifications: await Notification.countDocuments({
          recipient: userId,
          isRead: false
        })
      };
    }

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get quick stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quick statistics',
      error: error.message
    });
  }
};

// Get activity log
export const getActivityLog = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 20, skip = 0 } = req.query;

    // Create a combined activity log from different models
    // For a real application, you might want to use a dedicated activity log model
    const activities = [];

    // Get recent appointments
    const appointments = await Appointment.find({
      $or: [{ patient: userId }, { doctor: userId }]
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('doctor', 'firstName lastName')
      .populate('patient', 'firstName lastName');

    appointments.forEach(appointment => {
      activities.push({
        type: 'appointment',
        action: appointment.status,
        date: appointment.updatedAt || appointment.createdAt,
        details: {
          id: appointment._id,
          title: `Appointment with ${req.user.role === 'doctor' 
            ? `${appointment.patient.firstName} ${appointment.patient.lastName}` 
            : `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`}`,
          status: appointment.status,
          date: appointment.appointmentDate
        }
      });
    });

    // Get recent prescriptions (if doctor or patient)
    if (req.user.role === 'doctor' || req.user.role === 'patient') {
      const query = req.user.role === 'doctor' ? { doctor: userId } : { patient: userId };
      
      const prescriptions = await Prescription.find(query)
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('doctor', 'firstName lastName')
        .populate('patient', 'firstName lastName');

      prescriptions.forEach(prescription => {
        activities.push({
          type: 'prescription',
          action: prescription.status,
          date: prescription.updatedAt || prescription.createdAt,
          details: {
            id: prescription._id,
            title: `Prescription for ${prescription.patient.firstName} ${prescription.patient.lastName}`,
            status: prescription.status,
            date: prescription.prescriptionDate
          }
        });
      });
    }

    // Sort activities by date
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Paginate results
    const paginatedActivities = activities.slice(parseInt(skip), parseInt(skip) + parseInt(limit));

    res.status(200).json({
      success: true,
      count: paginatedActivities.length,
      total: activities.length,
      activities: paginatedActivities
    });
  } catch (error) {
    console.error('Get activity log error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity log',
      error: error.message
    });
  }
};
