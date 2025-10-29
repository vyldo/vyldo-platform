import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

['avatars', 'covers', 'gigs', 'portfolios', 'messages', 'deliverables', 'hero'].forEach(dir => {
  const dirPath = path.join(uploadDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads';
    
    if (req.baseUrl.includes('settings')) {
      folder = 'uploads/hero';
    } else if (req.baseUrl.includes('user')) {
      folder = file.fieldname === 'avatar' ? 'uploads/avatars' : 'uploads/covers';
    } else if (req.baseUrl.includes('gig')) {
      folder = 'uploads/gigs';
    } else if (req.baseUrl.includes('message')) {
      folder = 'uploads/messages';
    } else if (req.baseUrl.includes('order')) {
      folder = 'uploads/deliverables';
    } else if (file.fieldname === 'portfolio') {
      folder = 'uploads/portfolios';
    }
    
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // Allow common file types including ZIP, RAR, 7z
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar|7z|tar|gz|mp4|mov|avi|mkv|mp3|wav|psd|ai|svg|eps/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  // Common MIME types
  const allowedMimeTypes = [
    'image/', 'video/', 'audio/', 'application/pdf',
    'application/msword', 'application/vnd.openxmlformats',
    'application/zip', 'application/x-zip-compressed',
    'application/x-rar-compressed', 'application/x-7z-compressed',
    'application/x-tar', 'application/gzip',
    'text/plain', 'application/octet-stream'
  ];
  
  const mimetypeAllowed = allowedMimeTypes.some(type => file.mimetype.startsWith(type));

  if (mimetypeAllowed && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: images, documents, videos, archives (ZIP, RAR, 7z)'));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2GB limit
    files: 10, // Maximum 10 files at once
  },
  fileFilter,
});

// Error handling middleware for multer
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'File too large. Maximum size is 2GB',
        error: err.message 
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        message: 'Too many files. Maximum is 10 files',
        error: err.message 
      });
    }
    return res.status(400).json({ 
      message: 'File upload error',
      error: err.message 
    });
  }
  
  if (err) {
    return res.status(400).json({ 
      message: err.message || 'File upload failed',
      error: err.message 
    });
  }
  
  next();
};
