import cloudinary from '../config/cloudinary.config.js';

export const uploadImage = async (file) => {
  try {
    // Check file size (5MB limit)
    const sizeInMB = file.length / (1024 * 1024);
    if (sizeInMB > 5) {
      throw new Error('File size exceeds 5MB limit');
    }

    const result = await cloudinary.uploader.upload(file, {
      folder: 'pingme/avatars',
      width: 150,
      crop: "scale",
      resource_type: "auto",
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    });
    return result.secure_url;
  } catch (error) {
    throw new Error(error.message || 'Error uploading image');
  }
};