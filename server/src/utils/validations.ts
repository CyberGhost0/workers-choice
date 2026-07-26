import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['CUSTOMER']).optional(), // Only CUSTOMER allowed via public registration
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const profileSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  bio: z.string().optional(),
});

export const businessProfileSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  yearsExperience: z.number().min(0).optional(),
  hourlyRate: z.number().min(0).optional(),
});

export const serviceSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  priceType: z.enum(['HOURLY', 'FIXED', 'STARTING_AT']).optional(),
  images: z.array(z.string()).optional(),
});

export const productSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price is required'),
  stockQuantity: z.number().min(0).optional(),
  images: z.array(z.string()).optional(),
});

export const orderSchema = z.object({
  providerId: z.string().min(1, 'Provider is required'),
  serviceId: z.string().optional(),
  scheduledDate: z.string().optional(),
  totalAmount: z.number().min(0, 'Amount is required'),
});

export const reviewSchema = z.object({
  orderId: z.string().min(1, 'Order is required'),
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().optional(),
  images: z.array(z.string()).optional(),
});

export const messageSchema = z.object({
  receiverId: z.string().min(1, 'Receiver is required'),
  orderId: z.string().optional(),
  content: z.string().min(1, 'Message content is required'),
  attachments: z.array(z.string()).optional(),
});

export const orderStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'ACCEPTED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'DISPUTED',
  ]),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
