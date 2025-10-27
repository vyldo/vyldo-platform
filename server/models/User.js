import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  coverImage: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    maxlength: 600,
    default: '',
  },
  tagline: {
    type: String,
    maxlength: 100,
    default: '',
  },
  role: {
    type: String,
    enum: ['buyer', 'seller', 'admin', 'team'],
    default: 'buyer',
  },
  sellerLevel: {
    type: String,
    enum: ['new_seller', 'level_1', 'level_2', 'top_rated'],
    default: 'new_seller',
  },
  permissions: {
    manageUsers: { type: Boolean, default: false },
    suspendUsers: { type: Boolean, default: false },
    manageGigs: { type: Boolean, default: false },
    suspendGigs: { type: Boolean, default: false },
    manageOrders: { type: Boolean, default: false },
    cancelOrders: { type: Boolean, default: false },
    manageWithdrawals: { type: Boolean, default: false },
    manageWallets: { type: Boolean, default: false },
    viewAnalytics: { type: Boolean, default: false },
    viewTeamAnalytics: { type: Boolean, default: false },
    manageTeam: { type: Boolean, default: false },
    manageSupport: { type: Boolean, default: false },
    manageVerified: { type: Boolean, default: false },
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verifiedText: {
    type: String,
    default: 'Verified Account',
  },
  verifiedBadgeType: {
    type: String,
    enum: ['default', 'gold', 'premium', 'official', 'partner', 'custom'],
    default: 'default',
  },
  verifiedBadgeImage: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isSuspended: {
    type: Boolean,
    default: false,
  },
  suspendedAt: Date,
  suspendedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  suspensionReason: String,
  skills: [{
    type: String,
    trim: true,
  }],
  languages: [{
    language: String,
    proficiency: {
      type: String,
      enum: ['basic', 'conversational', 'fluent', 'native'],
    },
  }],
  education: [{
    institution: String,
    degree: String,
    field: String,
    yearFrom: Number,
    yearTo: Number,
    description: String,
  }],
  experience: [{
    title: String,
    company: String,
    location: String,
    yearFrom: Number,
    yearTo: Number,
    current: Boolean,
    description: String,
  }],
  portfolio: [{
    title: String,
    description: String,
    image: String,
    url: String,
  }],
  verification: {
    email: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: Boolean,
      default: false,
    },
    identity: {
      type: Boolean,
      default: false,
    },
  },
  profileCompletion: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  hiveAccount: {
    type: String,
    trim: true,
    default: '',
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  totalOrders: {
    type: Number,
    default: 0,
  },
  totalEarnings: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  banReason: {
    type: String,
    default: '',
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  twoFactorSecret: {
    type: String,
    default: '',
  },
  // Team member availability for task assignment
  isAvailableForTasks: {
    type: Boolean,
    default: true, // Auto-available when created
  },
  // Admin override for availability (if set, user cannot change)
  availabilityLockedByAdmin: {
    type: Boolean,
    default: false,
  },
  taskStats: {
    withdrawalsHandled: {
      type: Number,
      default: 0,
    },
    withdrawalsValue: {
      type: Number,
      default: 0,
    },
    ticketsHandled: {
      type: Number,
      default: 0,
    },
    lastAssignedAt: {
      type: Date,
    },
  },
}, {
  timestamps: true,
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.calculateProfileCompletion = function() {
  let completion = 0;
  
  if (this.displayName) completion += 10;
  if (this.avatar) completion += 10;
  if (this.coverImage) completion += 5;
  if (this.bio && this.bio.length >= 50) completion += 10;
  if (this.tagline) completion += 5;
  if (this.skills && this.skills.length >= 3) completion += 10;
  if (this.languages && this.languages.length >= 1) completion += 10;
  if (this.education && this.education.length >= 1) completion += 15;
  if (this.experience && this.experience.length >= 1) completion += 15;
  if (this.portfolio && this.portfolio.length >= 1) completion += 10;
  
  this.profileCompletion = completion;
  return completion;
};

userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ 'rating.average': -1 });
userSchema.index({ totalOrders: -1 });

export default mongoose.model('User', userSchema);
