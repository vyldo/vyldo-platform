import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  subcategories: [{
    name: String,
    slug: String,
    description: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  gigCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1, order: 1 });

export default mongoose.model('Category', categorySchema);
