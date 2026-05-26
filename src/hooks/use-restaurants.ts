import { useInfiniteQuery } from '@tanstack/react-query';

import { getRestaurants } from '@/api/kpg';
import { useLocationStore } from '@/store/use-location-store';

export function useRestaurants(params?: { limit?: number }) {
  const coords = useLocationStore((s) => s.selected.coords);
  const limit = params?.limit ?? 10;

  return useInfiniteQuery({
    queryKey: ['restaurants', coords.latitude, coords.longitude, limit],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) =>
      getRestaurants({
        latitude: coords.latitude,
        longitude: coords.longitude,
        limit,
        page: pageParam,
      }),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  });
}
