export function formatDistanceKm(distanceKm?: number): string | undefined {
  if (distanceKm === undefined) return undefined;
  if (!Number.isFinite(distanceKm)) return undefined;
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(distanceKm < 10 ? 1 : 0)} km`;
}

export function formatMinutes(minutes?: number): string | undefined {
  if (minutes === undefined) return undefined;
  if (!Number.isFinite(minutes)) return undefined;
  return `${Math.max(0, Math.trunc(minutes))} min`;
}

export function formatCurrencyBaht(amount: number): string {
  const n = Number.isFinite(amount) ? amount : 0;
  const formatted = n % 1 === 0 ? String(n.toFixed(0)) : String(n.toFixed(2));
  return `฿ ${formatted}`;
}
