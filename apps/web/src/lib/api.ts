import {
  AuthResponse,
  CheckoutRequest,
  PaginatedResponse,
  ProductListResponse,
} from '@ecommerce/shared';

import {
  Product,
  Order,
  User,
  CheckoutResponse,
  OrderStatus,
  PaymentMethod,
} from '@/types';

/**
 * Base URL for the API server.
 * Uses NEXT_PUBLIC_ prefix to ensure availability in the browser.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Standard fetch wrapper for API communication.
 * Implements robust JSON error parsing and credential handling.
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    let errorMessage = `API Error: ${res.status}`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Fallback if response is not JSON
    }
    throw new Error(errorMessage);
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

/**
 * Product-related endpoints.
 */
export const productApi = {
  getAll: (page = 1, keyword = '', category = '', status = 'active') =>
    apiFetch<ProductListResponse>(
      `/api/v1/products?page=${page}&keyword=${keyword}&category=${category}&status=${status}`
    ),
  getBySlug: (slug: string) =>
    apiFetch<Product>(`/api/v1/products/${slug}`),
  getTop: () =>
    apiFetch<Product[]>('/api/v1/products/top'),
  create: (data: Partial<Product>) =>
    apiFetch<Product>('/api/v1/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Product>) =>
    apiFetch<Product>(`/api/v1/products/manage/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiFetch<{ message: string }>(`/api/v1/products/manage/${id}`, {
      method: 'DELETE',
    }),
  createReview: (productId: string, data: { rating: number; comment: string }) =>
    apiFetch<{ message: string }>(`/api/v1/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

/**
 * User & Profile endpoints.
 */
export const userApi = {
  login: (email: string, password: string) =>
    apiFetch<AuthResponse>('/api/v1/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (name: string, email: string, password: string) =>
    apiFetch<AuthResponse>('/api/v1/users/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
  logout: () =>
    apiFetch<{ message: string }>('/api/v1/users/logout', { method: 'POST' }),
  getProfile: () =>
    apiFetch<User>('/api/v1/users/profile'),
  updateProfile: (data: { name?: string; email?: string; password?: string }) =>
    apiFetch<User>('/api/v1/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

/**
 * Order-related endpoints.
 */
export const orderApi = {
  getMyOrders: () =>
    apiFetch<Order[]>('/api/v1/orders/my-orders'),
  getById: (id: string) =>
    apiFetch<Order>(`/api/v1/orders/${id}`),
  getAll: (page = 1) =>
    apiFetch<PaginatedResponse<Order>>(
      `/api/v1/orders?page=${page}`
    ),
};

/**
 * Checkout lifecycle endpoints.
 */
export const checkoutApi = {
  createSession: (data: CheckoutRequest) =>
    apiFetch<CheckoutResponse>('/api/v1/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export { OrderStatus, PaymentMethod };
export type { Product, User, Order };

import { 
  CreateProductRequest, 
  UpdateProductRequest, 
  UpdateStockRequest,
  UpdateOrderStatusRequest,
  RegisterRequest
} from '@ecommerce/shared';

/**
 * Admin-restricted endpoints.
 */
export const adminApi = {
  // Products
  createProduct: (data: CreateProductRequest) =>
    apiFetch<Product>('/api/v1/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProduct: (id: string, data: UpdateProductRequest) =>
    apiFetch<Product>(`/api/v1/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  toggleArchiveProduct: (id: string) =>
    apiFetch<{ message: string }>(`/api/v1/admin/products/${id}`, {
      method: 'DELETE',
    }),
  updateStock: (id: string, qty: number) =>
    apiFetch<Product>(`/api/v1/admin/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ qty } as UpdateStockRequest),
    }),

  // Orders
  getOrders: (page = 1) =>
    apiFetch<PaginatedResponse<Order>>(`/api/v1/admin/orders?page=${page}`),
  updateOrderStatus: (id: string, status: string) =>
    apiFetch<Order>(`/api/v1/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status } as UpdateOrderStatusRequest),
    }),

  // Systems & Metrics
  getMetrics: () =>
    apiFetch<{ 
      totalProducts: number; 
      totalOrders: number; 
      activeOrders: number; 
      totalSales: number 
    }>('/api/v1/admin/metrics'),
  createAdminUser: (data: RegisterRequest) =>
    apiFetch<{ user: User; message: string }>('/api/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
