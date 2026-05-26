# KPG Delivery (Demo)

Expo + TypeScript demo implementing:

- Restaurant list (paginated) with FlashList
- Restaurant detail with grouped items + cart quantity controls
- Location selection with OpenStreetMap + Nominatim reverse geocoding

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

## Screens

- Restaurants: [index.tsx](src/app/index.tsx)
- Restaurant detail: [[id].tsx](src/app/restaurants/[id].tsx)
- Location selection: [explore.tsx](src/app/explore.tsx)

## Architecture

- Data fetching/caching: TanStack Query
  - Infinite query for restaurant pagination
  - Query keys include selected location coordinates
- Local state: Zustand (persisted)
  - Cart quantities (by item id)
  - Favorite restaurants (by restaurant id)
  - Selected location (coords + address)
- API layer: small typed wrapper and normalizers
  - Defensive parsing for inconsistent/missing fields
  - De-duplication by id for list + item responses
- Map implementation: OpenStreetMap via Leaflet inside a WebView
  - Fixed center pin overlay; map moves under the pin
  - Reverse geocoding via Nominatim (debounced + distance threshold)

## Decisions & trade-offs

- WebView-based maps were chosen to ensure OSM tiles are used directly (no Google/Apple basemaps).
- Nominatim calls are debounced and gated by movement distance to avoid excessive requests.
- Persistence is used for a realistic UX (cart/favorites/location survive restarts).
