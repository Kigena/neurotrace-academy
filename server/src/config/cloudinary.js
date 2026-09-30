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

// Only these types are accepted, for both Cloudinary and local storage.
// The stored extension is derived from the MIME type, never from the
// client-supplied filename, so HTML/SVG/JS cannot be hosted via uploads.
export const ALLOWED_UPLOAD_TYPES = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
};

export class UploadTypeError extends Error {
    constructor() {
        super('Unsupported file type. Allowed: JPEG, PNG, GIF, WebP, PDF');
        this.status = 400;
    }
}

export function uploadFileFilter(req, file, cb) {
    if (ALLOWED_UPLOAD_TYPES[file.mimetype]) return cb(null, true);
    cb(new UploadTypeError());
}

const safeExtension = (file) => ALLOWED_UPLOAD_TYPES[file.mimetype] || '.bin';

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
        cb(null, uniqueSuffix + safeExtension(file));
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
        const baseName = path.basename(file.originalname, path.extname(file.originalname))
            .replace(/[^a-zA-Z0-9-]/g, '_')
            .slice(0, 80);
        cb(null, `${uniqueSuffix}-${baseName}${safeExtension(file)}`);
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
    fileFilter: uploadFileFilter,
    limits: { fileSize: 10 * 1024 * 1024, files: 1 } // 10MB
});

export const chatUpload = multer({
    storage: chatStorage,
    fileFilter: uploadFileFilter,
    limits: { fileSize: 10 * 1024 * 1024, files: 1 } // 10MB
});

export default cloudinary;
