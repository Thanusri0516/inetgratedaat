import { getTemperaturePrediction } from '../controllers/predictionController.js'

export const predictionRoutes = [
  {
    method: 'GET',
    path: '/api/temperature/predicted',
    async handle() {
      return { status: 200, body: await getTemperaturePrediction() }
    },
  },
]
