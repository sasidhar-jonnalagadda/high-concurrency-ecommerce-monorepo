import { AuthResponse } from '@ecommerce/shared';
import { User } from './api';

/**
 * --- Auth State ---
 */
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null; // Tracks login/registration failures
  setUser: (user: User | null) => void;
  clearError: () => void;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (name: string, email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
}

/**
 * --- Cart Structures ---
 */
export interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  countInStock: number;
  qty: number;
}

export interface CartState {
  items: CartItem[];
  isHydrated: boolean; // Tracks if persisted state has been loaded
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  } | null;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  setShippingAddress: (address: CartState['shippingAddress']) => void;
  setHydrated: () => void;
  clearCart: () => void;
  totalItems: () => number;
  itemsPrice: () => number;
  taxPrice: () => number;
  shippingPrice: () => number;
  totalPrice: () => number;
}
