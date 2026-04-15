import {
  getLiveTemperature,
  getTemperatureHistory,
  getTemperatureStatistics,
  saveTemperatureReading,
} from '../controllers/tempController.js'

export const temperatureRoutes = [
  {
    method: 'GET',
    path: '/api/temperature/live',
    handle: async () => {
      const data = await getLiveTemperature()
      return { status: 200, body: data }
    },
  },
  {
    method: 'GET',
    path: '/api/temperature/history',
    handle: async ({ url }) => {
      const range = url.searchParams.get('range') ?? '24h'
      const data = await getTemperatureHistory(range)
      return { status: 200, body: data }
    },
  },
  {
    method: 'GET',
    path: '/api/temperature/stats',
    handle: async ({ url }) => {
      const range = url.searchParams.get('range') ?? '24h'
      const data = await getTemperatureStatistics(range)
      return { status: 200, body: data }
    },
  },
  {
    method: 'POST',
    path: '/api/temperature',
    handle: async ({ body }) => {
      return await saveTemperatureReading(body)
    },
  },
]
