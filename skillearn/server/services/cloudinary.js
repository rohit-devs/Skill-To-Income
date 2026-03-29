const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for task submissions
const taskStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'skillearn/submissions',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'gif', 'mp4', 'zip'],
    resource_type: 'auto',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});

// Storage for profile avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'skillearn/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }],
  },
});

// Storage for task reference images
const referenceStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'skillearn/references',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type: 'auto',
  },
});

const uploadSubmission = multer({
  storage: taskStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

const uploadReference = multer({
  storage: referenceStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Delete a file from Cloudinary
const deleteFile = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
    return false;
  }
};

module.exports = { uploadSubmission, uploadAvatar, uploadReference, deleteFile, cloudinary };
