'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartState, CartItem } from '@/types';

/**
 * Global shopping cart store.
 * Now includes hydration tracking for Next.js and stricter stock validation.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: false,
      shippingAddress: null,

      addItem: (item: CartItem) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId
          );
          
          if (existing) {
            // Guard: Never exceed stock even when adding to existing item
            const newQty = Math.min(existing.qty + item.qty, item.countInStock);
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, qty: newQty }
                  : i
              ),
            };
          }
          
          return { items: [...state.items, item] };
        }),

      removeItem: (productId: string) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      updateQty: (productId: string, qty: number) =>
        set((state) => ({
          items: state.items.map((i) => {
            if (i.productId === productId) {
              // Internal Guard: Apply stock capping during direct updates
              return { ...i, qty: Math.min(qty, i.countInStock) };
            }
            return i;
          }),
        })),

      setShippingAddress: (address) => set({ shippingAddress: address }),
      
      setHydrated: () => set({ isHydrated: true }),

      clearCart: () => set({ items: [], shippingAddress: null }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),

      itemsPrice: () => {
        const price = get().items.reduce((sum, i) => sum + i.price * i.qty, 0);
        return Number(price.toFixed(2));
      },

      taxPrice: () => {
        const itemsPrice = get().itemsPrice();
        return Number((itemsPrice * 0.18).toFixed(2));
      },

      shippingPrice: () => (get().itemsPrice() > 500 ? 0 : 50),

      totalPrice: () => {
        const ip = get().itemsPrice();
        const tp = get().taxPrice();
        const sp = get().shippingPrice();
        return Number((ip + tp + sp).toFixed(2));
      },
    }),
    {
      name: 'cart-storage',
      // Trigger hydration flag once storage is successfully merged
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
