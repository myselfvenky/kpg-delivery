import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FavoritesState = {
  favoriteRestaurantIds: Record<number, true>;
  toggleFavorite: (restaurantId: number) => void;
  isFavorite: (restaurantId: number) => boolean;
  clear: () => void;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteRestaurantIds: {},
      toggleFavorite: (restaurantId) => {
        set((state) => {
          const next = { ...state.favoriteRestaurantIds };
          if (next[restaurantId]) delete next[restaurantId];
          else next[restaurantId] = true;
          return { favoriteRestaurantIds: next };
        });
      },
      isFavorite: (restaurantId) => Boolean(get().favoriteRestaurantIds[restaurantId]),
      clear: () => set({ favoriteRestaurantIds: {} }),
    }),
    {
      name: 'favorites-v1',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);
