const BASE_READING = 29.4

function round(value) {
  return Math.round(value * 10) / 10
}

function createReading(date, offset) {
  const wave = Math.sin(offset / 3) * 2.2
  const drift = Math.cos(offset / 5) * 0.7
  const celsius = round(BASE_READING + wave + drift)

  return {
    celsius,
    unit: 'C',
    updatedAt: date.toISOString(),
    source: 'Temperature DB',
    highCelsius: round(celsius + 2.4),
    lowCelsius: round(celsius - 2.1),
    humidityPercent: Math.round(54 + Math.sin(offset / 4) * 10),
  }
}

function formatHistoryLabel(updatedAt) {
  return new Date(updatedAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export class Temperature {
  static readings = Temperature.generateSeedData()

  static generateSeedData() {
    const readings = []
    const now = Date.now()

    for (let i = 47; i >= 0; i -= 1) {
      const date = new Date(now - i * 30 * 60 * 1000)
      readings.push(createReading(date, 47 - i))
    }

    return readings
  }

  static getAll() {
    return [...Temperature.readings]
  }

  static getLatest() {
    return Temperature.readings[Temperature.readings.length - 1]
  }

  static getHistory(range = '24h') {
    const specs = {
      '1h': { points: 6, step: 1 },
      '6h': { points: 12, step: 1 },
      '24h': { points: 24, step: 2 },
      '1w': { points: 14, step: 3 },
    }

    const selected = specs[range] ?? specs['24h']
    const labels = []
    const values = []
    const startIndex = Math.max(
      0,
      Temperature.readings.length - selected.points * selected.step,
    )

    for (let i = startIndex; i < Temperature.readings.length; i += selected.step) {
      const reading = Temperature.readings[i]
      labels.push(formatHistoryLabel(reading.updatedAt))
      values.push(reading.celsius)
    }

    return { labels, values }
  }

  static getPrediction() {
    const latest = Temperature.getLatest()
    const predicted = round(latest.celsius + 0.8)
    const validAt = new Date(Date.now() + 60 * 60 * 1000)

    return {
      celsius: predicted,
      unit: 'C',
      validAt: validAt.toISOString(),
      horizonLabel: 'Next hour',
    }
  }
}
