import { Temperature } from '../models/Temperature.js'

/**
 * Get live temperature reading
 */
export async function getLiveTemperature() {
  return await Temperature.getLatest()
}

/**
 * Get temperature history
 */
export async function getTemperatureHistory(range) {
  return await Temperature.getHistory(range)
}

/**
 * Get temperature statistics
 */
export async function getTemperatureStatistics(range) {
  return await Temperature.getStatistics(range)
}

/**
 * Save temperature reading from Arduino or API
 */
export async function saveTemperatureReading(data) {
  try {
    const reading = await Temperature.create({
      temperature: data.temperature || data.temp || 0,
      humidity: data.humidity || 0,
      timestamp: data.timestamp || new Date(),
      location: data.location || 'Lab',
      source: data.source || 'Arduino',
    })
    return { status: 201, body: { success: true, reading } }
  } catch (error) {
    console.error('Error saving temperature:', error.message)
    return { status: 500, body: { error: error.message } }
  }
}
