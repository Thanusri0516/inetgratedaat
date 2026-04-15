/**
 * Backend contract: all client requests use paths below, resolved as
 * `${VITE_API_BASE_URL}${path}`. Change paths here when your API is ready.
 */
export const API_ENDPOINTS = {
  liveTemperature: '/api/temperature/live',
  temperatureHistory: '/api/temperature/history',
  predictedTemperature: '/api/temperature/predicted',
  chat: '/api/chatbot',
} as const
