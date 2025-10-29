import express from 'express';
import HeroSettings from '../models/HeroSettings.js';
import { protect } from '../middleware/auth.js';
import { requireAdminOrTeam, requirePermission } from '../middleware/adminAuth.js';
import { upload, handleUploadError } from '../middleware/upload.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Get hero settings (public)
router.get('/hero', async (req, res) => {
  try {
    let settings = await HeroSettings.findOne({ isActive: true });
    
    // Create default settings if none exist
    if (!settings) {
      settings = await HeroSettings.create({
        title: 'Find Perfect Freelance Services',
        subtitle: 'Secure, transparent, instant payments with zero fees',
        videoUrl: '',
        posterUrl: '',
        isActive: true,
      });
    }

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Hero settings error:', error);
    res.status(500).json({ message: 'Failed to fetch hero settings' });
  }
});

// Helper function to delete old file
const deleteOldFile = (filePath) => {
  if (filePath && filePath.startsWith('/uploads/')) {
    const fullPath = path.join(__dirname, '../../', filePath);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
        console.log('🗑️ Deleted old file:', filePath);
      } catch (err) {
        console.error('Failed to delete old file:', err);
      }
    }
  }
};

// Upload hero video
router.post('/hero/upload-video', protect, requireAdminOrTeam, requirePermission('manageSettings'), upload.single('video'), handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }

    const videoUrl = `/uploads/hero/${req.file.filename}`;
    
    // Delete old video if exists
    const settings = await HeroSettings.findOne({ isActive: true });
    if (settings?.videoUrl) {
      deleteOldFile(settings.videoUrl);
    }

    console.log('✅ Video uploaded:', videoUrl);

    res.json({
      success: true,
      videoUrl,
      message: 'Video uploaded successfully',
    });
  } catch (error) {
    console.error('❌ Video upload error:', error);
    res.status(500).json({ message: error.message || 'Failed to upload video' });
  }
});

// Upload hero poster
router.post('/hero/upload-poster', protect, requireAdminOrTeam, requirePermission('manageSettings'), upload.single('poster'), handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No poster file uploaded' });
    }

    const posterUrl = `/uploads/hero/${req.file.filename}`;
    
    // Delete old poster if exists
    const settings = await HeroSettings.findOne({ isActive: true });
    if (settings?.posterUrl) {
      deleteOldFile(settings.posterUrl);
    }

    console.log('✅ Poster uploaded:', posterUrl);

    res.json({
      success: true,
      posterUrl,
      message: 'Poster uploaded successfully',
    });
  } catch (error) {
    console.error('❌ Poster upload error:', error);
    res.status(500).json({ message: error.message || 'Failed to upload poster' });
  }
});

// Update hero settings (admin only)
router.put('/hero', protect, requireAdminOrTeam, requirePermission('manageSettings'), async (req, res) => {
  try {
    const { title, subtitle, videoUrl, posterUrl, stats } = req.body;

    let settings = await HeroSettings.findOne({ isActive: true });

    if (!settings) {
      settings = await HeroSettings.create({
        title,
        subtitle,
        videoUrl,
        posterUrl,
        stats,
        isActive: true,
        updatedBy: req.user._id,
      });
    } else {
      settings.title = title || settings.title;
      settings.subtitle = subtitle || settings.subtitle;
      settings.videoUrl = videoUrl !== undefined ? videoUrl : settings.videoUrl;
      settings.posterUrl = posterUrl !== undefined ? posterUrl : settings.posterUrl;
      
      // Update stats if provided
      if (stats) {
        if (stats.freelancers) {
          settings.stats.freelancers.value = stats.freelancers.value || settings.stats.freelancers.value;
          settings.stats.freelancers.label = stats.freelancers.label || settings.stats.freelancers.label;
        }
        if (stats.projects) {
          settings.stats.projects.value = stats.projects.value || settings.stats.projects.value;
          settings.stats.projects.label = stats.projects.label || settings.stats.projects.label;
        }
        if (stats.satisfaction) {
          settings.stats.satisfaction.value = stats.satisfaction.value || settings.stats.satisfaction.value;
          settings.stats.satisfaction.label = stats.satisfaction.label || settings.stats.satisfaction.label;
        }
      }
      
      settings.updatedBy = req.user._id;
      await settings.save();
    }

    res.json({
      success: true,
      message: 'Hero settings updated successfully',
      settings,
    });
  } catch (error) {
    console.error('Update hero settings error:', error);
    res.status(500).json({ message: 'Failed to update hero settings' });
  }
});

export default router;
