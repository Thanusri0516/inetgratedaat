import { Temperature } from '../models/Temperature.js'

export function getTemperaturePrediction() {
  return Temperature.getPrediction()
}
