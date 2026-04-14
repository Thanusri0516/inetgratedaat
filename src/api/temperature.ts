import { API_ENDPOINTS } from '../config/apiEndpoints'
import { getJson, useMockApi } from './client'
import {
  mockDelay,
  mockLiveTemperature,
  mockPrediction,
  mockTemperatureHistory,
} from './mock'
import type {
  HistoryRange,
  LiveTemperature,
  TemperatureHistory,
  TemperaturePrediction,
} from './types'

export async function fetchLiveTemperature(): Promise<LiveTemperature> {
  if (useMockApi()) {
    await mockDelay(300)
    return mockLiveTemperature()
  }
  return getJson<LiveTemperature>(API_ENDPOINTS.liveTemperature)
}

export async function fetchTemperatureHistory(
  range: HistoryRange = '24h',
): Promise<TemperatureHistory> {
  if (useMockApi()) {
    await mockDelay(400)
    return mockTemperatureHistory(range)
  }
  const q = new URLSearchParams({ range })
  return getJson<TemperatureHistory>(`${API_ENDPOINTS.temperatureHistory}?${q}`)
}

export async function fetchPredictedTemperature(): Promise<TemperaturePrediction> {
  if (useMockApi()) {
    await mockDelay(350)
    return mockPrediction()
  }
  return getJson<TemperaturePrediction>(API_ENDPOINTS.predictedTemperature)
}
