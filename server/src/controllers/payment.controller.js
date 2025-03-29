import Payment from '../models/payment.model.js';
import Appointment from '../models/appointment.model.js';
import { User } from '../models/user.model.js';
import Doctor from '../models/doctor.model.js';
import Notification from '../models/notification.model.js';
import crypto from 'crypto';

// Create a new payment
export const createPayment = async (req, res) => {
  try {
    const {
      appointmentId,
      amount,
      paymentMethod,
      currency = 'USD'
    } = req.body;
    
    const userId = req.user._id;
    
    // Validate required fields
    if (!appointmentId || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID, amount, and payment method are required'
      });
    }
    
    // Find appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check if user is the patient or admin
    if (
      appointment.patient.toString() !== userId.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to make this payment'
      });
    }
    
    // Check if payment already exists
    const existingPayment = await Payment.findOne({
      appointment: appointmentId,
      status: { $in: ['completed', 'processing'] }
    });
    
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment already exists for this appointment'
      });
    }
    
    // Generate unique transaction reference
    const transactionRef = crypto.randomBytes(6).toString('hex').toUpperCase();
    
    // Create payment
    const payment = await Payment.create({
      patient: appointment.patient,
      doctor: appointment.doctor,
      appointment: appointmentId,
      amount,
      currency,
      paymentMethod,
      transactionRef,
      status: 'processing',
      metadata: {
        paymentDate: new Date(),
        initiatedBy: userId,
        deviceInfo: req.headers['user-agent']
      }
    });
    
    // Update appointment with payment reference
    appointment.paymentDetails = {
      ...appointment.paymentDetails,
      amount,
      paymentMethod,
      transactionRef,
      paymentId: payment._id,
      paymentStatus: 'processing',
      updatedAt: new Date()
    };
    
    await appointment.save();
    
    // In a real-world scenario, you would integrate with a payment gateway here
    // For this example, we'll simulate a successful payment
    
    // Simulate processing delay
    setTimeout(async () => {
      try {
        // Update payment status
        payment.status = 'completed';
        payment.completedAt = new Date();
        await payment.save();
        
        // Update appointment payment status
        await Appointment.findByIdAndUpdate(appointmentId, {
          'paymentDetails.paymentStatus': 'completed',
          'paymentDetails.updatedAt': new Date()
        });
        
        // Notify doctor
        await Notification.createNotification({
          recipient: appointment.doctor,
          sender: userId,
          type: 'payment_received',
          title: 'Payment Received',
          message: `Payment of ${amount} ${currency} received for appointment`,
          relatedDocument: {
            model: 'Payment',
            id: payment._id
          }
        });
      } catch (error) {
        console.error('Payment completion error:', error);
      }
    }, 2000);
    
    res.status(201).json({
      success: true,
      message: 'Payment initiated successfully',
      payment: {
        _id: payment._id,
        amount,
        currency,
        transactionRef,
        status: payment.status
      }
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment',
      error: error.message
    });
  }
};

// Create a payment intent (for Stripe or other payment processor)
export const createPaymentIntent = async (req, res) => {
  try {
    const { appointmentId, amount, currency = 'USD' } = req.body;
    const userId = req.user._id;
    
    // Validate required fields
    if (!appointmentId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID and amount are required'
      });
    }
    
    // Find appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check if user is the patient
    if (appointment.patient.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to create a payment intent for this appointment'
      });
    }
    
    // In a real implementation, this would interface with a payment processor like Stripe
    // For demonstration purposes, we'll create a mock payment intent
    
    // Generate a mock client secret
    const clientSecret = `pi_${Date.now()}_secret_${Math.random().toString(36).substring(2, 15)}`;
    
    // Return the client secret to the frontend
    res.status(200).json({
      success: true,
      clientSecret,
      amount,
      currency
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment intent',
      error: error.message
    });
  }
};

// Get payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Find payment
    const payment = await Payment.findById(id)
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName')
      .populate('appointment');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Check authorization
    if (
      payment.patient.toString() !== userId.toString() &&
      payment.doctor.toString() !== userId.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this payment'
      });
    }
    
    res.status(200).json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment',
      error: error.message
    });
  }
};

// Get payments for user (patient)
export const getUserPayments = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, limit = 10, skip = 0 } = req.query;
    
    // Check if user is a patient
    if (req.user.role !== 'patient' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access these payments'
      });
    }
    
    // Build query
    const query = { patient: userId };
    
    if (status) {
      query.status = status;
    }
    
    // Get payments
    const payments = await Payment.find(query)
      .populate('doctor', 'firstName lastName specializations')
      .populate('appointment')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Payment.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      payments
    });
  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user payments',
      error: error.message
    });
  }
};

// Get payments for doctor
export const getDoctorPayments = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, limit = 10, skip = 0, startDate, endDate } = req.query;
    
    // Check if user is a doctor
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access these payments'
      });
    }
    
    // Build query
    const query = { doctor: userId };
    
    if (status) {
      query.status = status;
    }
    
    // Add date range if provided
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Get payments
    const payments = await Payment.find(query)
      .populate('patient', 'firstName lastName')
      .populate('appointment')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Payment.countDocuments(query);
    
    // Calculate total earnings
    const totalAmount = await Payment.aggregate([
      { $match: { ...query, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      totalEarnings: totalAmount.length > 0 ? totalAmount[0].total : 0,
      payments
    });
  } catch (error) {
    console.error('Get doctor payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor payments',
      error: error.message
    });
  }
};

// Process payment (update payment status after processing)
export const processPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, transactionDetails } = req.body;
    
    // Validate status
    if (!status || !['processing', 'completed', 'failed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required: processing, completed, or failed'
      });
    }
    
    // Find payment
    const payment = await Payment.findById(id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Check authorization (only admin or payment system can process)
    if (req.user.role !== 'admin' && !req.isPaymentSystem) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to process payments'
      });
    }
    
    // Update payment status
    payment.status = status;
    payment.processingDetails = {
      processedAt: new Date(),
      processedBy: req.user._id,
      ...transactionDetails
    };
    
    await payment.save();
    
    // Update appointment status if payment is completed
    if (status === 'completed' && payment.appointment) {
      await Appointment.findByIdAndUpdate(payment.appointment, {
        'paymentDetails.paymentStatus': status,
        'paymentDetails.updatedAt': new Date()
      });
    }
    
    // Notify patient
    await Notification.createNotification({
      recipient: payment.patient,
      type: 'payment_status',
      title: `Payment ${status}`,
      message: `Your payment of ${payment.amount} ${payment.currency} is ${status}`,
      relatedDocument: {
        model: 'Payment',
        id: payment._id
      }
    });
    
    res.status(200).json({
      success: true,
      message: `Payment marked as ${status}`,
      payment
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payment',
      error: error.message
    });
  }
};

// Verify payment (for webhook callbacks)
export const verifyPayment = async (req, res) => {
  try {
    const { transactionRef, status, gatewayResponse } = req.body;
    
    // Validate required fields
    if (!transactionRef || !status) {
      return res.status(400).json({
        success: false,
        message: 'Transaction reference and status are required'
      });
    }
    
    // Find payment by transaction reference
    const payment = await Payment.findOne({ transactionRef });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Update payment status
    payment.status = status;
    payment.gatewayResponse = gatewayResponse;
    payment.verifiedAt = new Date();
    
    await payment.save();
    
    // Update appointment payment status
    if (payment.appointment) {
      await Appointment.findByIdAndUpdate(payment.appointment, {
        'paymentDetails.paymentStatus': status,
        'paymentDetails.updatedAt': new Date()
      });
    }
    
    // Notify user about payment verification
    if (payment.patient) {
      await Notification.createNotification({
        recipient: payment.patient,
        type: 'payment_verified',
        title: `Payment ${status === 'completed' ? 'Successful' : 'Failed'}`,
        message: `Your payment of ${payment.amount} ${payment.currency} has been ${status === 'completed' ? 'verified' : 'declined'}`,
        relatedDocument: {
          model: 'Payment',
          id: payment._id
        }
      });
    }
    
    res.status(200).json({
      success: true,
      message: `Payment ${status === 'completed' ? 'verified' : 'declined'} successfully`,
      payment
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message
    });
  }
};

// Get payment status
export const getPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Find payment
    const payment = await Payment.findById(id).select('status patient doctor amount currency transactionRef createdAt');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Check authorization (patient, doctor, or admin can check status)
    if (
      payment.patient.toString() !== userId.toString() &&
      payment.doctor.toString() !== userId.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this payment'
      });
    }
    
    res.status(200).json({
      success: true,
      payment: {
        _id: payment._id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        transactionRef: payment.transactionRef,
        createdAt: payment.createdAt
      }
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment status',
      error: error.message
    });
  }
};

// Generate an invoice PDF for a payment
export const generateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Find payment with related details
    const payment = await Payment.findById(id)
      .populate('patient', 'firstName lastName email address')
      .populate('doctor', 'firstName lastName')
      .populate('appointment');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Check authorization
    if (
      payment.patient._id.toString() !== userId.toString() &&
      payment.doctor._id.toString() !== userId.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to generate an invoice for this payment'
      });
    }
    
    // In a real application, this would use a PDF library like PDFKit to generate a PDF
    // For this example, we'll just return JSON data that could be used to render an invoice
    
    const invoiceData = {
      invoiceNumber: `INV-${payment._id.toString().substring(0, 8).toUpperCase()}`,
      issueDate: new Date(),
      dueDate: payment.dueDate || new Date(),
      paymentDate: payment.metadata?.paymentDate || payment.updatedAt,
      status: payment.status,
      
      from: {
        name: 'MediMantra Health Services',
        address: '123 Healthcare Avenue, Medical District',
        city: 'Wellness City',
        state: 'Health State',
        zip: '12345',
        phone: '+1-234-567-8901',
        email: 'billing@medimantra.com'
      },
      
      to: {
        name: `${payment.patient.firstName} ${payment.patient.lastName}`,
        email: payment.patient.email,
        address: payment.patient.address
      },
      
      items: [
        {
          description: payment.appointment 
            ? `Medical consultation with Dr. ${payment.doctor.firstName} ${payment.doctor.lastName} on ${new Date(payment.appointment.appointmentDate).toLocaleDateString()}`
            : 'Medical services',
          quantity: 1,
          rate: payment.amount,
          amount: payment.amount
        }
      ],
      
      subtotal: payment.amount,
      tax: payment.tax || 0,
      discount: payment.discount || 0,
      total: payment.amount,
      
      paymentMethod: payment.paymentMethod,
      transactionRef: payment.transactionRef,
      
      notes: 'Thank you for choosing MediMantra for your healthcare needs.',
      terms: 'Payment is due immediately upon receipt of this invoice unless other arrangements have been made.'
    };
    
    // In a real implementation, we would generate a PDF here
    // For now, just return the invoice data
    res.status(200).json({
      success: true,
      invoice: invoiceData
    });
  } catch (error) {
    console.error('Generate invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating invoice',
      error: error.message
    });
  }
};

// Process refund
export const refundPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, refundAmount } = req.body;
    const userId = req.user._id;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Reason for refund is required'
      });
    }
    
    // Find payment
    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Check if payment is completed
    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Only completed payments can be refunded'
      });
    }
    
    // Check if already refunded
    if (payment.refund && payment.refund.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment has already been refunded'
      });
    }
    
    // Check authorization (only doctor, admin, or patient can initiate refund)
    if (
      payment.doctor.toString() !== userId.toString() &&
      payment.patient.toString() !== userId.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to refund this payment'
      });
    }
    
    // Set refund amount (default to full refund if not specified)
    const amount = refundAmount || payment.amount;
    
    // In a real-world scenario, you would integrate with a payment gateway for the refund
    // For this example, we'll simulate a successful refund
    
    // Update payment with refund info
    payment.refund = {
      amount,
      reason,
      status: 'completed',
      refundedBy: userId,
      refundedAt: new Date()
    };
    
    await payment.save();
    
    // Notify patient
    if (payment.patient.toString() !== userId.toString()) {
      await Notification.createNotification({
        recipient: payment.patient,
        sender: userId,
        type: 'payment_refunded',
        title: 'Payment Refunded',
        message: `Your payment of ${amount} ${payment.currency} has been refunded`,
        relatedDocument: {
          model: 'Payment',
          id: payment._id
        }
      });
    }
    
    // Notify doctor
    if (payment.doctor.toString() !== userId.toString()) {
      await Notification.createNotification({
        recipient: payment.doctor,
        sender: userId,
        type: 'payment_refunded',
        title: 'Payment Refunded',
        message: `Payment of ${amount} ${payment.currency} has been refunded`,
        relatedDocument: {
          model: 'Payment',
          id: payment._id
        }
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Payment refunded successfully',
      refund: payment.refund
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing refund',
      error: error.message
    });
  }
};

// Get payment analytics (admin only)
export const getPaymentAnalytics = async (req, res) => {
  try {
    // Check authorization
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can access payment analytics'
      });
    }
    
    const { period, startDate, endDate } = req.query;
    
    // Build date range for query
    let dateQuery = {};
    const now = new Date();
    
    if (period === 'today') {
      const today = new Date(now.setHours(0, 0, 0, 0));
      dateQuery = { createdAt: { $gte: today } };
    } else if (period === 'week') {
      const lastWeek = new Date(now);
      lastWeek.setDate(lastWeek.getDate() - 7);
      dateQuery = { createdAt: { $gte: lastWeek } };
    } else if (period === 'month') {
      const lastMonth = new Date(now);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      dateQuery = { createdAt: { $gte: lastMonth } };
    } else if (period === 'year') {
      const lastYear = new Date(now);
      lastYear.setFullYear(lastYear.getFullYear() - 1);
      dateQuery = { createdAt: { $gte: lastYear } };
    } else if (startDate && endDate) {
      dateQuery = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }
    
    // Get completed payments
    const completedPayments = await Payment.find({
      status: 'completed',
      ...dateQuery
    });
    
    // Calculate total revenue
    const totalRevenue = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Get payment counts by status
    const paymentStatusCounts = await Payment.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Get payment methods distribution
    const paymentMethodCounts = await Payment.aggregate([
      { $match: { status: 'completed', ...dateQuery } },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$amount' } } }
    ]);
    
    // Get daily revenue trend
    const dailyRevenue = await Payment.aggregate([
      { 
        $match: { 
          status: 'completed',
          ...dateQuery
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    // Get refund statistics
    const refundStats = await Payment.aggregate([
      { $match: { 'refund.status': 'completed', ...dateQuery } },
      {
        $group: {
          _id: null,
          totalRefunded: { $sum: '$refund.amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      analytics: {
        totalRevenue,
        transactionCount: completedPayments.length,
        averageTransaction: completedPayments.length > 0 ? totalRevenue / completedPayments.length : 0,
        statusCounts: paymentStatusCounts.reduce((obj, item) => {
          obj[item._id] = item.count;
          return obj;
        }, {}),
        paymentMethods: paymentMethodCounts,
        dailyRevenue,
        refunds: refundStats.length > 0 ? {
          totalRefunded: refundStats[0].totalRefunded,
          count: refundStats[0].count
        } : { totalRefunded: 0, count: 0 }
      }
    });
  } catch (error) {
    console.error('Get payment analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment analytics',
      error: error.message
    });
  }
};

// Get pending payments (admin only)
export const getPendingPayments = async (req, res) => {
  try {
    // Check authorization
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can access pending payments'
      });
    }
    
    const { limit = 10, skip = 0 } = req.query;
    
    // Get pending payments
    const payments = await Payment.find({ status: 'processing' })
      .populate('patient', 'firstName lastName email')
      .populate('doctor', 'firstName lastName')
      .populate('appointment')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Payment.countDocuments({ status: 'processing' });
    
    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      payments
    });
  } catch (error) {
    console.error('Get pending payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending payments',
      error: error.message
    });
  }
};

// Generate payment receipt
export const generateReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Find payment with related details
    const payment = await Payment.findById(id)
      .populate('patient', 'firstName lastName email')
      .populate('doctor', 'firstName lastName')
      .populate('appointment');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Check authorization
    if (
      payment.patient._id.toString() !== userId.toString() &&
      payment.doctor._id.toString() !== userId.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this receipt'
      });
    }
    
    // Generate receipt data
    const receiptData = {
      receiptNumber: payment.transactionRef,
      transactionDate: payment.createdAt,
      patient: {
        name: `${payment.patient.firstName} ${payment.patient.lastName}`,
        email: payment.patient.email
      },
      doctor: `Dr. ${payment.doctor.firstName} ${payment.doctor.lastName}`,
      service: payment.appointment ? 'Medical Consultation' : 'Medical Service',
      appointmentDate: payment.appointment ? payment.appointment.appointmentDate : null,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      refunded: payment.refund && payment.refund.status === 'completed'
    };
    
    res.status(200).json({
      success: true,
      receipt: receiptData
    });
  } catch (error) {
    console.error('Generate receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating receipt',
      error: error.message
    });
  }
};

// Get payments for user (generic function that handles both doctor and patient)
export const getPaymentsForUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, limit = 10, skip = 0, role } = req.query;
    
    // Build query based on user role
    let query = {};
    
    if (role === 'doctor' || req.user.role === 'doctor') {
      query.doctor = userId;
    } else {
      query.patient = userId;
    }
    
    if (status) {
      query.status = status;
    }
    
    // Get payments
    const payments = await Payment.find(query)
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName')
      .populate('appointment', 'appointmentDate status')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Payment.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      payments
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payments',
      error: error.message
    });
  }
};

// Get doctor earnings
export const getDoctorEarnings = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { period, startDate, endDate } = req.query;
    const userId = req.user._id;
    
    // Check authorization
    if (
      doctorId !== userId.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view these earnings'
      });
    }
    
    // Build date range for query
    let dateQuery = {};
    const now = new Date();
    let periodStartDate;
    
    if (startDate && endDate) {
      // Custom date range
      periodStartDate = new Date(startDate);
      const periodEndDate = new Date(endDate);
      dateQuery = {
        createdAt: { $gte: periodStartDate, $lte: periodEndDate }
      };
    } else if (period === 'today') {
      periodStartDate = new Date(now.setHours(0, 0, 0, 0));
      dateQuery = { createdAt: { $gte: periodStartDate } };
    } else if (period === 'week') {
      periodStartDate = new Date(now.setDate(now.getDate() - now.getDay()));
      periodStartDate.setHours(0, 0, 0, 0);
      dateQuery = { createdAt: { $gte: periodStartDate } };
    } else if (period === 'month') {
      periodStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
      dateQuery = { createdAt: { $gte: periodStartDate } };
    } else if (period === 'year') {
      periodStartDate = new Date(now.getFullYear(), 0, 1);
      dateQuery = { createdAt: { $gte: periodStartDate } };
    } else {
      // Default to all-time if period is not specified
      dateQuery = {};
    }
    
    // Get completed payments
    const query = {
      doctor: doctorId,
      status: 'completed',
      ...dateQuery
    };
    
    const payments = await Payment.find(query);
    
    // Calculate total earnings
    const totalEarnings = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Get currency distribution
    const currencyDistribution = {};
    payments.forEach(payment => {
      const currency = payment.currency || 'USD';
      if (!currencyDistribution[currency]) {
        currencyDistribution[currency] = 0;
      }
      currencyDistribution[currency] += payment.amount;
    });
    
    // Get earning trends by day
    const earningsByDay = await Payment.aggregate([
      { 
        $match: {
          doctor: doctorId,
          status: 'completed',
          ...dateQuery
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      earnings: {
        totalEarnings,
        paymentsCount: payments.length,
        currencyDistribution,
        period: period || 'all-time',
        earningsByDay
      }
    });
  } catch (error) {
    console.error('Get doctor earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching earnings',
      error: error.message
    });
  }
};

// Get payment receipt
export const getPaymentReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Find payment with related details
    const payment = await Payment.findById(id)
      .populate('patient', 'firstName lastName email')
      .populate('doctor', 'firstName lastName')
      .populate('appointment');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Check authorization
    if (
      payment.patient.toString() !== userId.toString() &&
      payment.doctor.toString() !== userId.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this payment receipt'
      });
    }
    
    // Generate receipt data
    const receiptData = {
      receiptNumber: payment.transactionRef,
      transactionDate: payment.createdAt,
      patient: {
        name: `${payment.patient.firstName} ${payment.patient.lastName}`,
        email: payment.patient.email
      },
      doctor: `Dr. ${payment.doctor.firstName} ${payment.doctor.lastName}`,
      service: payment.appointment ? 'Medical Consultation' : 'Medical Service',
      appointmentDate: payment.appointment ? payment.appointment.appointmentDate : null,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      refunded: payment.refund && payment.refund.status === 'completed'
    };
    
    res.status(200).json({
      success: true,
      receipt: receiptData
    });
  } catch (error) {
    console.error('Get payment receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating payment receipt',
      error: error.message
    });
  }
};

// Get payment metrics (admin only)
export const getPaymentMetrics = async (req, res) => {
  try {
    // Check authorization
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access payment metrics'
      });
    }
    
    const { period } = req.query;
    
    // Build date range for query
    let dateQuery = {};
    const now = new Date();
    
    if (period === 'today') {
      const startDate = new Date(now.setHours(0, 0, 0, 0));
      dateQuery = { createdAt: { $gte: startDate } };
    } else if (period === 'week') {
      const startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      dateQuery = { createdAt: { $gte: startDate } };
    } else if (period === 'month') {
      const startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      dateQuery = { createdAt: { $gte: startDate } };
    } else if (period === 'year') {
      const startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      dateQuery = { createdAt: { $gte: startDate } };
    }
    
    // Get completed payments
    const completedPayments = await Payment.find({
      status: 'completed',
      ...dateQuery
    });
    
    // Calculate total revenue
    const totalRevenue = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Get payment counts by status
    const paymentStatusCounts = await Payment.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Get payment methods distribution
    const paymentMethodCounts = await Payment.aggregate([
      { $match: { status: 'completed', ...dateQuery } },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$amount' } } }
    ]);
    
    // Get daily revenue trend
    const dailyRevenue = await Payment.aggregate([
      { $match: { status: 'completed', ...dateQuery } },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      metrics: {
        totalRevenue,
        totalPayments: completedPayments.length,
        paymentsByStatus: paymentStatusCounts.reduce((obj, item) => {
          obj[item._id] = item.count;
          return obj;
        }, {}),
        paymentMethods: paymentMethodCounts,
        dailyRevenue
      }
    });
  } catch (error) {
    console.error('Get payment metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment metrics',
      error: error.message
    });
  }
};
