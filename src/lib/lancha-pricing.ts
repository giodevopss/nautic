export const LANCHA_DURATION_OPTIONS = [4, 8] as const;

export type LanchaDurationHours = (typeof LANCHA_DURATION_OPTIONS)[number];

export const LANCHA_PACKAGE_PRICE: Record<string, Record<LanchaDurationHours, number>> = {
  "lancha-24": { 4: 800, 8: 1100 },
  "lancha-29": { 4: 1000, 8: 1200 },
};

export function isLanchaDuration(hours: number): hours is LanchaDurationHours {
  return LANCHA_DURATION_OPTIONS.includes(hours as LanchaDurationHours);
}

export function getLanchaPackagePrice(
  vehicleId: string,
  durationHours: number,
): number | null {
  if (!isLanchaDuration(durationHours)) return null;
  return LANCHA_PACKAGE_PRICE[vehicleId]?.[durationHours] ?? null;
}

/** Texto curto para o select (ex.: "4h R$ 800,00 · 8h R$ 1.100,00"). */
export function getLanchaPackagesSummary(
  vehicleId: string,
  formatPrice: (n: number) => string,
): string | null {
  const row = LANCHA_PACKAGE_PRICE[vehicleId];
  if (!row) return null;
  return `4h ${formatPrice(row[4])} · 8h ${formatPrice(row[8])}`;
}
