import { getDatabase } from '../config/mongodb.js'

function round(value, digits = 1) {
  return Number.parseFloat(Number(value).toFixed(digits))
}

function formatHistoryLabel(date, range) {
  const parsed = date instanceof Date ? date : new Date(date)

  if (range === '1w') {
    return parsed.toLocaleDateString(undefined, { weekday: 'short' })
  }

  return parsed.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export class Temperature {
  static async create(data) {
    const db = await getDatabase()
    const collection = db.collection('temperature_buckets')

    const reading = {
      timestamp: data.timestamp || new Date(),
      value: data.temperature,
      humidity: data.humidity,
      metadata: {
        location: data.location || 'Lab',
        source: data.source || 'Arduino',
        deviceId: data.deviceId || 'DHT11-001',
      },
    }

    const result = await collection.insertOne(reading)
    return { _id: result.insertedId, ...reading }
  }

  static async getLatest() {
    try {
      const db = await getDatabase()
      const collection = db.collection('temperature_buckets')

      const [latest, stats] = await Promise.all([
        collection.findOne({}, { sort: { timestamp: -1 } }),
        collection
          .aggregate([
            {
              $match: {
                timestamp: {
                  $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                },
              },
            },
            {
              $group: {
                _id: null,
                maxTemp: { $max: '$value' },
                minTemp: { $min: '$value' },
              },
            },
          ])
          .toArray(),
      ])

      if (!latest) {
        return {
          celsius: 0,
          humidityPercent: 0,
          unit: 'C',
          updatedAt: new Date().toISOString(),
          source: 'No Data',
          highCelsius: 0,
          lowCelsius: 0,
        }
      }

      const summary = stats[0]

      return {
        celsius: round(latest.value),
        humidityPercent: round(latest.humidity || 0),
        unit: 'C',
        updatedAt: latest.timestamp.toISOString(),
        source: latest.metadata?.source || 'MongoDB',
        highCelsius: round(summary?.maxTemp ?? latest.value),
        lowCelsius: round(summary?.minTemp ?? latest.value),
      }
    } catch (error) {
      console.error('Error fetching latest temperature:', error.message)
      return {
        celsius: 0,
        humidityPercent: 0,
        unit: 'C',
        updatedAt: new Date().toISOString(),
        source: 'Backend Error',
        highCelsius: 0,
        lowCelsius: 0,
      }
    }
  }

  static async getHistory(range = '24h') {
    try {
      const db = await getDatabase()
      const collection = db.collection('temperature_buckets')
      const now = Date.now()
      const rangeMap = {
        '1h': 60 * 60 * 1000,
        '6h': 6 * 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '1w': 7 * 24 * 60 * 60 * 1000,
      }
      const startTime = new Date(now - (rangeMap[range] || rangeMap['24h']))

      const readings = await collection
        .find({ timestamp: { $gte: startTime } })
        .sort({ timestamp: 1 })
        .toArray()

      return {
        labels: readings.map((reading) => formatHistoryLabel(reading.timestamp, range)),
        values: readings.map((reading) => round(reading.value)),
      }
    } catch (error) {
      console.error('Error fetching temperature history:', error.message)
      return { labels: [], values: [] }
    }
  }

  static async getStatistics(range = '24h') {
    try {
      const db = await getDatabase()
      const collection = db.collection('temperature_buckets')
      const rangeMap = {
        '1h': 60 * 60 * 1000,
        '6h': 6 * 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '1w': 7 * 24 * 60 * 60 * 1000,
      }
      const startTime = new Date(Date.now() - (rangeMap[range] || rangeMap['24h']))

      const stats = await collection
        .aggregate([
          { $match: { timestamp: { $gte: startTime } } },
          {
            $group: {
              _id: null,
              avgTemp: { $avg: '$value' },
              maxTemp: { $max: '$value' },
              minTemp: { $min: '$value' },
              avgHumidity: { $avg: '$humidity' },
              count: { $sum: 1 },
            },
          },
        ])
        .toArray()

      if (!stats[0]) {
        return { avgTemp: 0, maxTemp: 0, minTemp: 0, avgHumidity: 0, count: 0 }
      }

      return {
        avgTemp: round(stats[0].avgTemp ?? 0),
        maxTemp: round(stats[0].maxTemp ?? 0),
        minTemp: round(stats[0].minTemp ?? 0),
        avgHumidity: round(stats[0].avgHumidity ?? 0),
        count: stats[0].count ?? 0,
      }
    } catch (error) {
      console.error('Error fetching statistics:', error.message)
      return { avgTemp: 0, maxTemp: 0, minTemp: 0, avgHumidity: 0, count: 0 }
    }
  }

  static async getPrediction() {
    const db = await getDatabase()
    const collection = db.collection('temperature_buckets')
    const recent = await collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(6)
      .toArray()

    const latest = recent[0]
    if (!latest) {
      return {
        celsius: 0,
        unit: 'C',
        validAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        horizonLabel: 'Next hour',
      }
    }

    const values = recent.map((entry) => entry.value).reverse()
    const avgDelta =
      values.length > 1
        ? values.slice(1).reduce((sum, value, index) => sum + (value - values[index]), 0) /
          (values.length - 1)
        : 0

    return {
      celsius: round(latest.value + avgDelta),
      unit: 'C',
      validAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      horizonLabel: 'Next hour',
    }
  }

  static async seedMockData() {
    const db = await getDatabase()
    const collection = db.collection('temperature_buckets')

    await collection.deleteMany({})

    const readings = []
    const now = Date.now()
    const baseReading = 29.4

    for (let i = 47; i >= 0; i -= 1) {
      const timestamp = new Date(now - i * 30 * 60 * 1000)
      const offset = 47 - i
      const wave = Math.sin(offset / 3) * 2.2
      const drift = Math.cos(offset / 5) * 0.7
      const celsius = round(baseReading + wave + drift)

      readings.push({
        timestamp,
        value: celsius,
        humidity: Math.round(54 + Math.sin(offset / 4) * 10),
        metadata: {
          location: 'Lab',
          source: 'Mock Data',
          deviceId: 'DHT11-001',
        },
      })
    }

    await collection.insertMany(readings)
    console.log(`Seeded ${readings.length} mock readings`)
  }
}
