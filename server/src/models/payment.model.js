import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  amount: {
    type: Number,
    required: [true, "Payment amount is required"],
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'upi', 'netbanking', 'wallet', 'cash', 'insurance', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded', 'disputed'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  gatewayResponse: {
    gatewayName: String,
    gatewayTransactionId: String,
    gatewayPaymentId: String,
    responseCode: String,
    responseMessage: String,
    raw: Object
  },
  metadata: {
    billNumber: String,
    taxAmount: Number,
    discountAmount: Number,
    insuranceCoverage: Number
  },
  description: String,
  paymentDate: {
    type: Date,
    default: Date.now
  },
  refunds: [{
    amount: Number,
    reason: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    refundDate: {
      type: Date,
      default: Date.now
    },
    transactionId: String,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  paymentBreakdown: [{
    item: String,
    description: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number,
    category: {
      type: String,
      enum: ['consultation', 'procedure', 'medication', 'lab_test', 'facility', 'other']
    }
  }],
  billingAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  invoiceUrl: String,
  receiptUrl: String,
  paymentProofImage: String,
  notes: String
}, { timestamps: true });

// Indexes for efficient querying
paymentSchema.index({ patient: 1, paymentDate: -1 });
paymentSchema.index({ doctor: 1, paymentDate: -1 });
paymentSchema.index({ appointmentId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 });

// Virtual to calculate total refunded amount
paymentSchema.virtual('totalRefundedAmount').get(function() {
  if (!this.refunds || this.refunds.length === 0) return 0;
  return this.refunds
    .filter(refund => refund.status === 'completed')
    .reduce((sum, refund) => sum + refund.amount, 0);
});

// Method to process refund
paymentSchema.methods.processRefund = async function(refundData) {
  // Prevent refunding more than the original amount
  const currentlyRefunded = this.totalRefundedAmount;
  const newRefundAmount = refundData.amount;
  
  if (currentlyRefunded + newRefundAmount > this.amount) {
    throw new Error('Total refund amount cannot exceed the original payment amount');
  }
  
  this.refunds.push(refundData);
  
  // Update payment status
  if (currentlyRefunded + newRefundAmount === this.amount) {
    this.status = 'refunded';
  } else if (this.refunds.length > 0) {
    this.status = 'partially_refunded';
  }
  
  await this.save();
  return this;
};

// Method to mark payment as completed
paymentSchema.methods.markAsCompleted = async function(transactionDetails) {
  this.status = 'completed';
  this.transactionId = transactionDetails.transactionId;
  this.gatewayResponse = {
    ...this.gatewayResponse,
    ...transactionDetails
  };
  
  await this.save();
  return this;
};

// Static method to find payments by date range
paymentSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    paymentDate: {
      $gte: startDate,
      $lte: endDate
    }
  })
  .sort({ paymentDate: -1 })
  .populate('patient', 'firstName lastName email')
  .populate('doctor', 'firstName lastName');
};

// Static method to generate payment summary for a period
paymentSchema.statics.generateSummary = async function(startDate, endDate, doctorId = null) {
  const match = {
    paymentDate: {
      $gte: startDate,
      $lte: endDate
    },
    status: 'completed'
  };
  
  if (doctorId) {
    match.doctor = mongoose.Types.ObjectId(doctorId);
  }
  
  const summary = await this.aggregate([
    { $match: match },
    { $group: {
      _id: null,
      totalRevenue: { $sum: '$amount' },
      transactionCount: { $sum: 1 },
      averageAmount: { $avg: '$amount' }
    }},
    { $project: {
      _id: 0,
      totalRevenue: 1,
      transactionCount: 1,
      averageAmount: { $round: ['$averageAmount', 2] }
    }}
  ]);
  
  return summary[0] || { totalRevenue: 0, transactionCount: 0, averageAmount: 0 };
};

export default mongoose.model('Payment', paymentSchema);
