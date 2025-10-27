import express from 'express';
import Category from '../models/Category.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('order');
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch category' });
  }
});

export default router;
