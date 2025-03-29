import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  adminType: {
    type: String,
    enum: ['super_admin', 'system_admin', 'content_admin', 'support_admin', 'doctor_verification', 'finance_admin'],
    required: true
  },
  permissions: [{
    type: String,
    enum: [
      'manage_users', 'verify_doctors', 'manage_content', 'manage_payments',
      'manage_appointments', 'system_settings', 'reports_access', 'manage_admins',
      'support_tickets', 'view_analytics', 'manage_prescriptions', 'pharmacy_management'
    ]
  }],
  department: {
    type: String,
    default: 'Administration'
  },
  employeeId: {
    type: String,
    unique: true,
    sparse: true
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String,
  activityLogs: [{
    action: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String,
    ipAddress: String
  }],
  contactNumber: String,
  alternateEmail: String,
  signature: String
}, { timestamps: true });

// Index for efficient querying
adminSchema.index({ adminType: 1 });
adminSchema.index({ employeeId: 1 });
adminSchema.index({ isActive: 1 });

// Method to check if admin has a specific permission
adminSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission);
};

// Method to log admin activity
adminSchema.methods.logActivity = async function(action, details, ipAddress) {
  this.activityLogs.push({
    action,
    details,
    ipAddress,
    timestamp: new Date()
  });
  
  this.lastActive = new Date();
  await this.save();
  return this;
};

// Method to grant permission
adminSchema.methods.grantPermission = async function(permission) {
  if (!this.permissions.includes(permission)) {
    this.permissions.push(permission);
    await this.save();
  }
  return this;
};

// Method to revoke permission
adminSchema.methods.revokePermission = async function(permission) {
  this.permissions = this.permissions.filter(p => p !== permission);
  await this.save();
  return this;
};

// Static method to find admins by permission
adminSchema.statics.findByPermission = function(permission) {
  return this.find({
    permissions: permission,
    isActive: true
  }).populate('user', 'firstName lastName email avatar');
};

// Static method to find active super admins
adminSchema.statics.findSuperAdmins = function() {
  return this.find({
    adminType: 'super_admin',
    isActive: true
  }).populate('user', 'firstName lastName email avatar');
};

// Static method to find admins who can verify doctors
adminSchema.statics.findDoctorVerifiers = function() {
  return this.find({
    $or: [
      { adminType: 'doctor_verification' },
      { permissions: 'verify_doctors' }
    ],
    isActive: true
  }).populate('user', 'firstName lastName email avatar');
};

export default mongoose.model('Admin', adminSchema);
