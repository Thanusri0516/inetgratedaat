export type LiveTemperature = {
  celsius: number
  unit: string
  updatedAt: string
  source?: string
  /** Daily high (°C), if provided by the backend. */
  highCelsius?: number
  /** Daily low (°C), if provided by the backend. */
  lowCelsius?: number
  /** Relative humidity %, if provided by the backend. */
  humidityPercent?: number
}

/** Time window for `/temperature/history?range=…` (mock + suggested API contract). */
export type HistoryRange = '1h' | '6h' | '24h' | '1w'

export type TemperatureHistory = {
  labels: string[]
  values: number[]
}

export type TemperaturePrediction = {
  celsius: number
  unit: string
  validAt: string
  horizonLabel?: string
}

export type ChatResponse = {
  reply: string
}
