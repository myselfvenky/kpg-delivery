import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type LatLng = { latitude: number; longitude: number };

export type LocationState = {
  selected: {
    coords: LatLng;
    address?: string;
  };
  setSelected: (coords: LatLng, address?: string) => void;
};

const DEFAULT_COORDS: LatLng = {
  latitude: 9.731875299999999,
  longitude: 100.0135929,
};

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      selected: { coords: DEFAULT_COORDS },
      setSelected: (coords, address) =>
        set({
          selected: { coords, address: address?.trim() ? address.trim() : undefined },
        }),
    }),
    {
      name: 'location-v1',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);
