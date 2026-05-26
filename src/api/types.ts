export type RestaurantApiDto = {
  id: number;
  name?: string | null;
  description?: string | null;
  logo_url?: string | null;
  image_url?: string | null;
  rating?: string | null;
  rating_count?: number | null;
  distance?: number | null;
  is_active?: 0 | 1 | null;
  is_pinned?: 0 | 1 | null;
  is_sponsored?: boolean | null;
  is_ecofriendly?: boolean | null;
  is_pureveg?: boolean | null;
  delivery_time?: string | null;
  has_selfpickup?: boolean | null;
};

export type RestaurantListResponseDto = {
  restaurants?: RestaurantApiDto[] | null;
  page?: number | null;
  has_more?: boolean | null;
};

export type RestaurantItemApiDto = {
  id: number;
  restaurant_id?: number | null;
  item_category_id?: number | null;
  name?: string | null;
  price?: string | null;
  old_price?: string | null;
  image?: string | null;
  image_id?: number | null;
  is_recommended?: 0 | 1 | null;
  is_popular?: 0 | 1 | null;
  is_new?: 0 | 1 | null;
  manage_stock?: boolean | null;
  stock_qty?: number | null;
  deleted_at?: string | null;
  desc?: string | null;
  tags?: unknown;
  placeholder_image?: string | null;
  is_active?: boolean | null;
  is_veg?: 0 | 1 | null;
  order_column?: number | null;
  ss_is_schedulable?: number | null;
  ss_schedule_type?: unknown;
  zone_id?: number | null;
  category_name?: string | null;
  addon_categories?: unknown[] | null;
};

export type RestaurantItemsResponseDto = {
  recommended?: RestaurantItemApiDto[] | null;
  items?: Record<string, RestaurantItemApiDto[] | null> | null;
};

export type Restaurant = {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
  imageUrl?: string;
  rating?: number;
  ratingCount?: number;
  distanceKm?: number;
  deliveryTimeMinutes?: number;
  tags: {
    ecoFriendly: boolean;
    pureVeg: boolean;
    sponsored: boolean;
    pinned: boolean;
  };
  isActive: boolean;
  hasSelfPickup: boolean;
};

export type RestaurantItem = {
  id: number;
  restaurantId?: number;
  name: string;
  description?: string;
  price: number;
  oldPrice?: number;
  imageUrl?: string;
  isVeg: boolean;
  isPopular: boolean;
  isNew: boolean;
  isActive: boolean;
  categoryName: string;
};
