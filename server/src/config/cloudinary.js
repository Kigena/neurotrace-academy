import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Check if Cloudinary is configured
const isCloudinaryConfigured = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
    console.log('✅ Cloudinary configured - using cloud storage');
    // Configure Cloudinary
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
} else {
    console.warn('⚠️ Cloudinary not configured - using local disk storage (ephemeral)');
    console.warn('⚠️ Images will be lost on server restart. Set up Cloudinary for persistence.');
}

// Fallback: Local disk storage (ephemeral)
const localCaseStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/cases';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const localChatStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, uniqueSuffix + '-' + safeName);
    }
});

// Storage for case images (Cloudinary or local fallback)
export const caseStorage = isCloudinaryConfigured
    ? new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'neurotrace/cases',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
            transformation: [{ width: 1200, crop: 'limit' }],
            resource_type: 'auto'
        }
    })
    : localCaseStorage;

// Storage for chat attachments (Cloudinary or local fallback)
export const chatStorage = isCloudinaryConfigured
    ? new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'neurotrace/chat',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
            transformation: [{ width: 1200, crop: 'limit' }],
            resource_type: 'auto'
        }
    })
    : localChatStorage;

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
