import { fetchJson } from '@/api/http';
import type {
  Restaurant,
  RestaurantApiDto,
  RestaurantItem,
  RestaurantItemApiDto,
  RestaurantItemsResponseDto,
  RestaurantListResponseDto,
} from '@/api/types';

const BASE_URL = 'https://hub.delivery-kpg.com/api/v2';

function toNumber(value: unknown): number | undefined {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(n) ? n : undefined;
}

function toInt(value: unknown): number | undefined {
  const n = toNumber(value);
  if (n === undefined) return undefined;
  const i = Math.trunc(n);
  return Number.isFinite(i) ? i : undefined;
}

function cleanText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function uniqById<T extends { id: number }>(items: T[]): T[] {
  const seen = new Set<number>();
  const result: T[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    result.push(item);
  }
  return result;
}

function normalizeRestaurant(dto: RestaurantApiDto): Restaurant {
  const deliveryTimeMinutes = toInt(dto.delivery_time);
  return {
    id: dto.id,
    name: cleanText(dto.name) ?? 'Unknown restaurant',
    description: cleanText(dto.description),
    logoUrl: cleanText(dto.logo_url),
    imageUrl: cleanText(dto.image_url),
    rating: toNumber(dto.rating),
    ratingCount: dto.rating_count ?? undefined,
    distanceKm: dto.distance ?? undefined,
    deliveryTimeMinutes,
    tags: {
      ecoFriendly: Boolean(dto.is_ecofriendly),
      pureVeg: Boolean(dto.is_pureveg),
      sponsored: Boolean(dto.is_sponsored),
      pinned: dto.is_pinned === 1,
    },
    isActive: dto.is_active === 1,
    hasSelfPickup: Boolean(dto.has_selfpickup),
  };
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeItem(dto: RestaurantItemApiDto, fallbackCategory: string): RestaurantItem {
  const desc = cleanText(dto.desc);
  const description = desc ? stripHtml(desc) : undefined;
  return {
    id: dto.id,
    restaurantId: dto.restaurant_id ?? undefined,
    name: cleanText(dto.name) ?? 'Unnamed item',
    description,
    price: toNumber(dto.price) ?? 0,
    oldPrice: toNumber(dto.old_price),
    imageUrl: cleanText(dto.image),
    isVeg: dto.is_veg === 1,
    isPopular: dto.is_popular === 1,
    isNew: dto.is_new === 1,
    isActive: dto.is_active ?? true,
    categoryName: cleanText(dto.category_name) ?? fallbackCategory,
  };
}

export async function getRestaurants(params: {
  latitude: number;
  longitude: number;
  limit: number;
  page: number;
}): Promise<{ restaurants: Restaurant[]; page: number; hasMore: boolean }> {
  const url = new URL(`${BASE_URL}/restaurants`);
  url.searchParams.set('latitude', String(params.latitude));
  url.searchParams.set('longitude', String(params.longitude));
  url.searchParams.set('limit', String(params.limit));
  url.searchParams.set('page', String(params.page));

  const data = await fetchJson<RestaurantListResponseDto>(url.toString(), { timeoutMs: 20_000 });
  const raw = (data.restaurants ?? []).filter(Boolean) as RestaurantApiDto[];
  const normalized = uniqById(raw).map(normalizeRestaurant).filter((r) => r.isActive);

  return {
    restaurants: normalized,
    page: data.page ?? params.page,
    hasMore: Boolean(data.has_more),
  };
}

export async function getRestaurantItems(restaurantId: number): Promise<{
  categories: { title: string; items: RestaurantItem[] }[];
  recommended: RestaurantItem[];
}> {
  const url = `${BASE_URL}/restaurants/${restaurantId}/items`;
  const data = await fetchJson<RestaurantItemsResponseDto>(url, { timeoutMs: 20_000 });

  const recommended = uniqById(
    ((data.recommended ?? []) as RestaurantItemApiDto[]).map((dto) => normalizeItem(dto, 'Popular'))
  );

  const itemsObj = data.items ?? {};
  const categories: { title: string; items: RestaurantItem[] }[] = [];
  for (const [category, items] of Object.entries(itemsObj)) {
    const normalizedItems = uniqById(
      ((items ?? []) as RestaurantItemApiDto[]).map((dto) => normalizeItem(dto, category))
    ).filter((i) => i.isActive);

    if (normalizedItems.length) {
      categories.push({ title: category || 'Other', items: normalizedItems });
    }
  }

  categories.sort((a, b) => a.title.localeCompare(b.title));

  return { categories, recommended };
}
