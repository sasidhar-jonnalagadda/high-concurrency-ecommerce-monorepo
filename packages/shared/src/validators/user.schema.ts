import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Name is required')
    .max(50, 'Name cannot exceed 50 characters'),
  email: z.string()
    .trim()
    .toLowerCase()
    .email('Invalid email address')
    .max(100, 'Email cannot exceed 100 characters'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password cannot exceed 100 characters'),
});

export const loginSchema = z.object({
  email: z.string()
    .trim()
    .toLowerCase()
    .email('Invalid email address'),
  password: z.string()
    .min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(50).optional(),
  email: z.string().trim().toLowerCase().email().max(100).optional(),
  password: z.string().min(6).max(100).optional(),
}).refine(data => data.name || data.email || data.password, {
  message: 'At least one field must be provided for update',
});

export type RegisterRequest = z.infer<typeof registerSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>;

