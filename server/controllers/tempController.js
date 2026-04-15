import { Temperature } from '../models/Temperature.js'

export function getLiveTemperature() {
  return Temperature.getLatest()
}

export function getTemperatureHistory(range) {
  return Temperature.getHistory(range)
}
