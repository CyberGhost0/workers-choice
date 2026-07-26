import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { uploadToCloudinary } from '../services/uploadService';

export const uploadImage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      throw createError('No file uploaded', 400);
    }

    const result = await uploadToCloudinary(req.file, 'workers-choice/images');

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    throw error;
  }
};

export const uploadMultipleImages = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      throw createError('No files uploaded', 400);
    }

    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file, 'workers-choice/images')
    );

    const results = await Promise.all(uploadPromises);

    const images = results.map((result) => ({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    }));

    res.json({ images });
  } catch (error) {
    throw error;
  }
};

export const uploadVideo = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      throw createError('No file uploaded', 400);
    }

    const result = await uploadToCloudinary(req.file, 'workers-choice/videos');

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
    });
  } catch (error) {
    throw error;
  }
};
