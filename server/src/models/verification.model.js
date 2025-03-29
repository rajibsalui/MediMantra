import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: String,
  phone: String,
  emailCode: String,
  phoneCode: String,
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry
  }
}, { timestamps: true });

export default mongoose.model('Verification', verificationSchema);