import multer from 'multer';
import cloudinary from 'cloudinary';
import { Request } from 'express';
import { createError } from '../middleware/errorHandler';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Local fallback storage (used when Cloudinary is not configured / fails)
const LOCAL_UPLOAD_DIR = path.join(__dirname, '..', '..', 'public', 'uploads');

interface UploadResult {
  secure_url: string;
  public_id?: string;
}

const saveLocal = (file: Express.Multer.File, folder: string): UploadResult => {
  if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
    fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
  }
  const safeFolder = folder.replace(/[^a-z0-9]/gi, '_');
  const dir = path.join(LOCAL_UPLOAD_DIR, safeFolder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const ext = (file.originalname.split('.').pop() || 'bin').split('?')[0];
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  fs.writeFileSync(path.join(dir, filename), file.buffer);
  // Relative URL served by the static route at /uploads
  return { secure_url: `/uploads/${safeFolder}/${filename}` };
};


// Configure multer storage
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(createError('Only image and video files are allowed', 400));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

export const uploadToCloudinary = (
  file: Express.Multer.File,
  folder: string
): Promise<{ secure_url: string; public_id?: string; width?: number; height?: number; duration?: number }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error || !result) {
          // Fall back to local storage when Cloudinary is unavailable/invalid
          try {
            console.warn('Cloudinary upload failed, using local fallback:', (error as any)?.message);
            resolve(saveLocal(file, folder));
          } catch (localErr) {
            reject(localErr instanceof Error ? localErr : createError('Upload failed', 500));
          }
        } else {
          resolve({ secure_url: result.secure_url, public_id: result.public_id });
        }
      }
    );

    uploadStream.end(file.buffer);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.v2.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
};
