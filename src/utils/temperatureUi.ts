/** Thresholds for functional accent colors (°C). */
export const TEMP_HOT_C = 30
export const TEMP_COLD_C = 12

export type TemperatureBand = 'hot' | 'cold' | 'comfort'

export function temperatureBand(celsius: number): TemperatureBand {
  if (celsius > TEMP_HOT_C) return 'hot'
  if (celsius < TEMP_COLD_C) return 'cold'
  return 'comfort'
}
