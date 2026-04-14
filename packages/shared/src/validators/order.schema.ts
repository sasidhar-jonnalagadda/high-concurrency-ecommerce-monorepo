import { z } from 'zod';
import { PaymentMethod, OrderStatus } from '../types/order';

export const shippingAddressSchema = z.object({
  address: z.string()
    .trim()
    .min(1, 'Address is required')
    .max(200, 'Address cannot exceed 200 characters'),
  city: z.string()
    .trim()
    .min(1, 'City is required')
    .max(100, 'City cannot exceed 100 characters'),
  postalCode: z.string()
    .trim()
    .min(1, 'Postal code is required')
    .max(20, 'Postal code cannot exceed 20 characters'),
  country: z.string()
    .trim()
    .min(1, 'Country is required')
    .max(100, 'Country cannot exceed 100 characters'),
});

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Product ID is required'),
        qty: z.number().int().positive('Quantity must be at least 1'),
      })
    )
    .min(1, 'At least one item is required'),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.nativeEnum(PaymentMethod),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export type CheckoutRequest = z.infer<typeof checkoutSchema>;
export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
export type UpdateOrderStatusRequest = z.infer<typeof updateOrderStatusSchema>;
