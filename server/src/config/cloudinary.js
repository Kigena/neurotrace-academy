import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage for case images
export const caseStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'neurotrace/cases',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
        transformation: [{ width: 1200, crop: 'limit' }], // Optimize large images
        resource_type: 'auto' // Auto-detect image vs pdf
    }
});

// Storage for chat attachments
export const chatStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'neurotrace/chat',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
        transformation: [{ width: 1200, crop: 'limit' }],
        resource_type: 'auto'
    }
});

// Multer upload instances
export const caseUpload = multer({
    storage: caseStorage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

export const chatUpload = multer({
    storage: chatStorage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

export default cloudinary;
