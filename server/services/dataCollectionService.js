import { config } from '../config/env.js'
import { saveTemperatureReading } from '../controllers/tempController.js'
import { initializeArduinoSerial, listSerialPorts, onArduinoData } from './arduinoSerial.js'

export async function startArduinoPipeline(portName = config.arduino.port) {
  let targetPort = portName

  if (!targetPort) {
    const ports = await listSerialPorts()
    const detected = ports.find(
      (entry) =>
        entry.path?.toUpperCase().startsWith('COM') ||
        entry.manufacturer?.toLowerCase().includes('arduino'),
    )
    targetPort = detected?.path || 'COM3'
  }

  console.log(`Starting Arduino pipeline on ${targetPort}`)

  onArduinoData(async (data) => {
    try {
      const temperature = data.temperature ?? data.temp ?? data.t
      const humidity = data.humidity ?? data.hum ?? data.h ?? 0

      if (temperature == null || Number.isNaN(Number(temperature))) {
        return
      }

      const result = await saveTemperatureReading({
        temperature: Number.parseFloat(temperature),
        humidity: Number.parseFloat(humidity),
        location: 'Lab',
        source: 'Arduino DHT11',
      })

      if (result.status >= 400) {
        console.error('Failed to store Arduino reading:', result.body?.error || 'Unknown error')
        return
      }

      console.log('Saved Arduino reading to MongoDB')
    } catch (error) {
      console.error('Error processing Arduino data:', error.message)
    }
  })

  await initializeArduinoSerial(targetPort, config.arduino.baudRate)
  console.log('Arduino data pipeline started')
  return true
}

export async function stopArduinoPipeline() {
  try {
    const { closeArduinoConnection } = await import('./arduinoSerial.js')
    await closeArduinoConnection()
    console.log('Arduino pipeline stopped')
  } catch (error) {
    console.error('Error stopping pipeline:', error.message)
  }
}
