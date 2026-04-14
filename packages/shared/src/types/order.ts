import { BaseEntity } from './common';

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  STRIPE = 'STRIPE',
  RAZORPAY = 'RAZORPAY',
  COD = 'COD',
}

export interface OrderItemResponse {
  id: string;
  qty: number;
  price: number;
  productId: string;
  product?: {
    name: string;
    image: string;
    slug: string;
  };
}

export interface ShippingAddressResponse {
  id: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderResponse extends BaseEntity {
  user?: {
    id: string;
    name: string;
    email: string;
  };
  orderItems: OrderItemResponse[];
  shippingAddress: ShippingAddressResponse;
  paymentMethod: PaymentMethod;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  status: OrderStatus;
  stripePaymentIntentId?: string | null;
  paidAt: string | null;
  deliveredAt: string | null;
}




