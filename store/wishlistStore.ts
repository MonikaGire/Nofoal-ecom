import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistStore {
  items: string[]; // product slugs
  toggle: (slug: string) => void;
  isWishlisted: (slug: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (slug: string) => {
        const items = get().items;
        set({
          items: items.includes(slug)
            ? items.filter((s) => s !== slug)
            : [...items, slug],
        });
      },

      isWishlisted: (slug: string) => get().items.includes(slug),
    }),
    {
      name: 'nofoal-wishlist',
    }
  )
);
