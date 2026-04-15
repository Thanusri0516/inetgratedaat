import { Temperature } from '../models/Temperature.js'

export async function getTemperaturePrediction() {
  return await Temperature.getPrediction()
}
