import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types';
import * as api from '@/lib/api';

interface CartStore {
  items: CartItem[];
  total: number;
  isOpen: boolean;
  isLoading: boolean;

  // Actions
  openCart: () => void;
  closeCart: () => void;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  syncCart: () => Promise<void>;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      isOpen: false,
      isLoading: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      addItem: async (productId: string, quantity = 1) => {
        const MAX_QTY = 2;
        const existing = get().items.find(i => i.productId === productId);
        const currentQty = existing?.quantity || 0;
        if (currentQty >= MAX_QTY) return; // already at max
        const allowedQty = Math.min(quantity, MAX_QTY - currentQty);
        set({ isLoading: true });
        try {
          const res = await api.addToCart(productId, allowedQty);
          set({ items: res.cart.items, total: res.cart.total, isLoading: false, isOpen: true });
        } catch (err) {
          console.error('Add to cart error:', err);
          set({ isLoading: false });
        }
      },

      updateItem: async (productId: string, quantity: number) => {
        const MAX_QTY = 2;
        if (quantity < 1) return get().removeItem(productId);
        const cappedQty = Math.min(quantity, MAX_QTY);
        set({ isLoading: true });
        try {
          const res = await api.updateCartItem(productId, cappedQty);
          set({ items: res.cart.items, total: res.cart.total, isLoading: false });
        } catch (err) {
          console.error('Update cart error:', err);
          set({ isLoading: false });
        }
      },

      removeItem: async (productId: string) => {
        set({ isLoading: true });
        try {
          const res = await api.removeFromCart(productId);
          set({ items: res.cart.items, total: res.cart.total, isLoading: false });
        } catch (err) {
          console.error('Remove from cart error:', err);
          set({ isLoading: false });
        }
      },

      clearCart: async () => {
        try {
          await api.clearCart();
          set({ items: [], total: 0 });
        } catch (err) {
          console.error('Clear cart error:', err);
        }
      },

      syncCart: async () => {
        try {
          const res = await api.getCart();
          set({ items: res.cart.items, total: res.cart.total });
        } catch (err) {
          console.error('Sync cart error:', err);
        }
      },
    }),
    {
      name: 'nofoal-cart',
      partialize: (state) => ({ items: state.items, total: state.total }),
    }
  )
);
