import mongoose from 'mongoose';

const heroSettingsSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Find Perfect Freelance Services',
  },
  subtitle: {
    type: String,
    default: 'Secure, transparent, instant payments with zero fees',
  },
  videoUrl: {
    type: String,
    default: '',
  },
  posterUrl: {
    type: String,
    default: '',
  },
  stats: {
    freelancers: {
      value: {
        type: String,
        default: '10K+',
      },
      label: {
        type: String,
        default: 'Active Freelancers',
      },
    },
    projects: {
      value: {
        type: String,
        default: '50K+',
      },
      label: {
        type: String,
        default: 'Projects Completed',
      },
    },
    satisfaction: {
      value: {
        type: String,
        default: '98%',
      },
      label: {
        type: String,
        default: 'Satisfaction Rate',
      },
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

export default mongoose.model('HeroSettings', heroSettingsSchema);
