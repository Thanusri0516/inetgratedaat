import { getLiveTemperature, getTemperatureHistory } from '../controllers/tempController.js'

export const temperatureRoutes = [
  {
    method: 'GET',
    path: '/api/temperature/live',
    handle() {
      return { status: 200, body: getLiveTemperature() }
    },
  },
  {
    method: 'GET',
    path: '/api/temperature/history',
    handle({ url }) {
      const range = url.searchParams.get('range') ?? '24h'
      return { status: 200, body: getTemperatureHistory(range) }
    },
  },
]
