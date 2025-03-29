import pkg from 'cloudinary';
const { v2: cloudinary } = pkg;
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'connectly/files',
    resource_type: 'auto',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'mp3', 'mp4'],
    max_file_size: 20000000 // 20MB
  }
});
 
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB
  },
  fileFilter: (req, file, cb) => {
    // Add file type validation here if needed
    cb(null, true);
  }
});

export const uploadFile = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: 'auto',
      folder: 'connectly/files'
    });
    return result.secure_url;
  } catch (error) {
    throw new Error('File upload failed');
  }
};