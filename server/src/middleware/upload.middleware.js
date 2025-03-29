import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage destination based on file type
const getStorage = (fileType) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      let uploadPath;
      
      switch (fileType) {
        case 'avatar':
          uploadPath = path.join(__dirname, '../../uploads/avatars');
          break;
        case 'document':
          uploadPath = path.join(__dirname, '../../uploads/documents');
          break;
        case 'prescription':
          uploadPath = path.join(__dirname, '../../uploads/prescriptions');
          break;
        case 'lab-report':
          uploadPath = path.join(__dirname, '../../uploads/lab-reports');
          break;
        case 'medical-image':
          uploadPath = path.join(__dirname, '../../uploads/medical-images');
          break;
        default:
          uploadPath = path.join(__dirname, '../../uploads/others');
      }
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
    }
  });
};

// File filter to validate file types
const fileFilter = (req, file, cb) => {
  // Define allowed file types based on upload type
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedDocTypes = /pdf|doc|docx|txt|rtf/;
  
  let isValid = false;
  
  // Check file type based on mimetype or extension
  if (file.fieldname === 'avatar' || file.fieldname === 'image') {
    isValid = allowedImageTypes.test(path.extname(file.originalname).toLowerCase()) || 
              allowedImageTypes.test(file.mimetype.split('/')[1]);
  } else if (file.fieldname === 'document' || file.fieldname === 'report') {
    isValid = allowedDocTypes.test(path.extname(file.originalname).toLowerCase()) || 
              allowedDocTypes.test(file.mimetype.split('/')[1]);
  } else {
    // Allow any file type for other uploads
    isValid = true;
  }
  
  if (isValid) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Please upload a valid file.'), false);
  }
};

// Configure different upload handlers for different file types
export const uploadMiddleware = {
  single: (fieldName) => {
    const fileType = fieldName === 'avatar' ? 'avatar' : 
                    fieldName === 'document' ? 'document' :
                    fieldName === 'prescription' ? 'prescription' : 'others';
                    
    return multer({
      storage: getStorage(fileType),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
      },
      fileFilter
    }).single(fieldName);
  },
  
  multiple: (fieldName, maxCount = 5) => {
    const fileType = fieldName === 'images' ? 'medical-image' : 
                    fieldName === 'documents' ? 'document' : 'others';
                    
    return multer({
      storage: getStorage(fileType),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
        files: maxCount
      },
      fileFilter
    }).array(fieldName, maxCount);
  },
  
  fields: (fieldsArray) => {
    return multer({
      storage: getStorage('others'),
      limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max file size
      },
      fileFilter
    }).fields(fieldsArray);
  }
};
