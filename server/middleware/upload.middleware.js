import multer from 'multer';
import { storage } from '../config/cloudinary.config.js';

// File filter for validation
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Document file filter
const documentFileFilter = (req, file, cb) => {
  const allowedMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only document files are allowed!'), false);
  }
};

// Image upload middleware with Cloudinary
export const uploadMiddleware = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB
  },
  fileFilter: imageFileFilter
});

// Document upload middleware with Cloudinary
export const documentUploadMiddleware = multer({
  storage: storage,
  params: {
    folder: 'medimantra/documents',
  },
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB
  },
  fileFilter: documentFileFilter
});