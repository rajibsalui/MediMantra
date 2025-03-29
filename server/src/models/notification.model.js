import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'appointment_created',
      'appointment_confirmed',
      'appointment_cancelled',
      'appointment_reminder',
      'prescription_added',
      'medical_record_created',
      'payment_received',
      'payment_failed',
      'review_received',
      'doctor_response',
      'message_received',
      'system_alert',
      'verification_code',
      'account_update'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  action: {
    type: String,
    enum: ['navigate', 'dismiss', 'approve', 'reject', 'respond'],
    default: 'navigate'
  },
  actionLink: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  relatedDocument: {
    model: {
      type: String,
      enum: ['Appointment', 'Prescription', 'MedicalRecord', 'Payment', 'Review', 'Message']
    },
    id: mongoose.Schema.Types.ObjectId
  },
  expiresAt: Date,
  deliveryChannels: [{
    channel: {
      type: String,
      enum: ['app', 'email', 'sms', 'push'],
      default: 'app'
    },
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: Date,
    error: String
  }]
}, { timestamps: true });

// Indexes for efficient querying
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ 'relatedDocument.model': 1, 'relatedDocument.id': 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for automatic deletion

// Method to mark notification as read
notificationSchema.methods.markAsRead = async function() {
  this.read = true;
  await this.save();
  return this;
};

// Method to mark notification as sent through a channel
notificationSchema.methods.markAsSent = async function(channel, error = null) {
  const channelObj = this.deliveryChannels.find(c => c.channel === channel);
  
  if (channelObj) {
    channelObj.sent = !error;
    channelObj.sentAt = new Date();
    channelObj.error = error;
  } else {
    this.deliveryChannels.push({
      channel,
      sent: !error,
      sentAt: new Date(),
      error
    });
  }
  
  await this.save();
  return this;
};

// Static method to find unread notifications for a user
notificationSchema.statics.findUnreadForUser = function(userId, limit = 20) {
  return this.find({
    recipient: userId,
    read: false
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .populate('sender', 'firstName lastName avatar role');
};

// Static method to count unread notifications for a user
notificationSchema.statics.countUnreadForUser = function(userId) {
  return this.countDocuments({
    recipient: userId,
    read: false
  });
};

// Static method to mark all user notifications as read
notificationSchema.statics.markAllAsRead = async function(userId) {
  return this.updateMany(
    { recipient: userId, read: false },
    { read: true }
  );
};

// Static method to create and send a notification
notificationSchema.statics.createNotification = async function(notificationData) {
  try {
    const notification = new this(notificationData);
    await notification.save();
    
    // Here you could integrate with external notification services
    // For example, send emails, SMS, or push notifications
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export default mongoose.model('Notification', notificationSchema);
