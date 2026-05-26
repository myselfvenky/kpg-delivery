import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CartState = {
  quantitiesByItemId: Record<number, number>;
  setQuantity: (itemId: number, quantity: number) => void;
  increment: (itemId: number) => void;
  decrement: (itemId: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      quantitiesByItemId: {},
      setQuantity: (itemId, quantity) => {
        const q = Math.max(0, Math.trunc(quantity));
        set((state) => {
          const next = { ...state.quantitiesByItemId };
          if (q === 0) delete next[itemId];
          else next[itemId] = q;
          return { quantitiesByItemId: next };
        });
      },
      increment: (itemId) => {
        const current = get().quantitiesByItemId[itemId] ?? 0;
        get().setQuantity(itemId, current + 1);
      },
      decrement: (itemId) => {
        const current = get().quantitiesByItemId[itemId] ?? 0;
        get().setQuantity(itemId, current - 1);
      },
      clear: () => set({ quantitiesByItemId: {} }),
    }),
    {
      name: 'cart-v1',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);
