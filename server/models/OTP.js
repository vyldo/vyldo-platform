import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['signup', 'password-reset'],
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
    max: 4,
  },
  ipAddress: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    default: 'Unknown',
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Auto-delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Hash OTP before saving
otpSchema.pre('save', async function(next) {
  if (this.isModified('otp')) {
    const bcrypt = await import('bcryptjs');
    this.otp = await bcrypt.default.hash(this.otp, 10);
  }
  next();
});

// Method to verify OTP
otpSchema.methods.verifyOTP = async function(inputOTP) {
  const bcrypt = await import('bcryptjs');
  return await bcrypt.default.compare(inputOTP, this.otp);
};

export default mongoose.model('OTP', otpSchema);
