import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Product name is required')
    .max(100, 'Product name cannot exceed 100 characters'),
  image: z.string()
    .trim()
    .min(1, 'Image URL is required')
    .url('Invalid image URL'),
  description: z.string()
    .trim()
    .min(1, 'Description is required')
    .max(2000, 'Description cannot exceed 2000 characters'),
  brand: z.string()
    .trim()
    .min(1, 'Brand is required')
    .max(50, 'Brand cannot exceed 50 characters'),
  category: z.string()
    .trim()
    .min(1, 'Category is required')
    .max(50, 'Category cannot exceed 50 characters'),
  price: z.number()
    .positive('Price must be positive')
    .max(1_000_000, 'Price cannot exceed 1,000,000'),
  countInStock: z.number()
    .int()
    .min(0, 'Stock cannot be negative')
    .max(10_000, 'Stock cannot exceed 10,000'),
});

export const updateProductSchema = createProductSchema.partial();

export const createReviewSchema = z.object({
  rating: z.number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  comment: z.string()
    .trim()
    .min(1, 'Comment is required')
    .max(1000, 'Comment cannot exceed 1000 characters'),
});

export const updateStockSchema = z.object({
  qty: z.number().int().min(0, 'Stock cannot be negative'),
});

export type CreateProductRequest = z.infer<typeof createProductSchema>;
export type UpdateProductRequest = z.infer<typeof updateProductSchema>;
export type UpdateStockRequest = z.infer<typeof updateStockSchema>;
export type CreateReviewRequest = z.infer<typeof createReviewSchema>;

