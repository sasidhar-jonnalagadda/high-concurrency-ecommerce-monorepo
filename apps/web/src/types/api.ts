import {
  ProductResponse,
  ReviewResponse,
  UserResponse,
  OrderResponse,
  OrderItemResponse,
  ShippingAddressResponse,
  CheckoutRequest,
  OrderStatus,
  PaymentMethod,
  UserRole
} from '@ecommerce/shared';

export type Product = ProductResponse;
export type Review = ReviewResponse;
export type User = UserResponse;
export type Order = OrderResponse;
export type OrderItem = OrderItemResponse;
export type ShippingAddress = ShippingAddressResponse;

export interface CheckoutResponse {
  orderId: string;
  sessionId: string;
  url: string;
}

export type { CheckoutRequest };
export { OrderStatus, PaymentMethod, UserRole };
