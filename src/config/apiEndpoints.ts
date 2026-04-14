/**
 * Backend contract: all client requests use paths below, resolved as
 * `${VITE_API_BASE_URL}${path}`. Change paths here when your API is ready.
 */
export const API_ENDPOINTS = {
  liveTemperature: '/temperature/live',
  temperatureHistory: '/temperature/history',
  predictedTemperature: '/temperature/predicted',
  chat: '/chat',
} as const
