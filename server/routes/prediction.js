import { getTemperaturePrediction } from '../controllers/predictionController.js'

export const predictionRoutes = [
  {
    method: 'GET',
    path: '/api/temperature/predicted',
    handle() {
      return { status: 200, body: getTemperaturePrediction() }
    },
  },
]
