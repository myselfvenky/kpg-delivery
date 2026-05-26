import { useQuery } from '@tanstack/react-query';

import { getRestaurantItems } from '@/api/kpg';

export function useRestaurantItems(restaurantId: number) {
  return useQuery({
    queryKey: ['restaurant-items', restaurantId],
    queryFn: () => getRestaurantItems(restaurantId),
    enabled: Number.isFinite(restaurantId) && restaurantId > 0,
    staleTime: 60_000,
  });
}
