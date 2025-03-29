import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';

// Get the directory name using ES module syntax
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const subfolder = req.body.subfolder || 'general';
    const folderPath = path.join(uploadsDir, subfolder);
    
    // Create subfolder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    
    cb(null, folderPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: uuid + original extension
    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    cb(null, fileName);
  }
});

// File filter for allowed file types
const fileFilter = (req, file, cb) => {
  // Allow only certain file types
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and PDF files are allowed.'), false);
  }
};

// Configure multer upload instance
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
  fileFilter: fileFilter
});

/**
 * Upload a file and return the URL
 * @param {Object} file - The file object from multer
 * @param {String} subFolder - The subfolder to upload to (optional)
 * @returns {Promise<{url: string}>} - URL of the uploaded file
 */
export const uploadFile = async (file, subFolder = 'general') => {
  return new Promise((resolve, reject) => {
    try {
      // If file is already uploaded by multer
      if (file.path) {
        const relativePath = path.relative(uploadsDir, file.path);
        return resolve({
          url: `/uploads/${relativePath.replace(/\\/g, '/')}`
        });
      }
      
      // Create folder if it doesn't exist
      const targetFolder = path.join(uploadsDir, subFolder);
      if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder, { recursive: true });
      }
      
      // Generate unique file name
      const fileExt = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExt}`;
      const filePath = path.join(targetFolder, fileName);
      
      // Create write stream and write the file
      const writeStream = fs.createWriteStream(filePath);
      writeStream.write(file.buffer);
      writeStream.end();
      
      writeStream.on('finish', () => {
        resolve({
          url: `/uploads/${subFolder}/${fileName}`
        });
      });
      
      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Delete a file by URL
 * @param {String} fileUrl - The URL of the file to delete
 * @returns {Promise<boolean>} - Success status
 */
export const deleteFile = async (fileUrl) => {
  try {
    if (!fileUrl || !fileUrl.startsWith('/uploads/')) {
      return false; // Not a valid file URL
    }
    
    // Extract relative path from the URL
    const relativePath = fileUrl.replace('/uploads/', '');
    const filePath = path.join(uploadsDir, relativePath);
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

export default { upload, uploadFile, deleteFile };
