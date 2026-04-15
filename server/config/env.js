import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..', '..')
const envFile = path.join(rootDir, '.env')

function loadEnvFile() {
  if (!fs.existsSync(envFile)) {
    return
  }

  const content = fs.readFileSync(envFile, 'utf8')

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) {
      continue
    }

    const separatorIndex = line.indexOf('=')
    if (separatorIndex === -1) {
      continue
    }

    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim()

    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

loadEnvFile()

export const config = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net',
    database: process.env.DATABASE_NAME || 'aat_dashboard',
  },
  server: {
    port: Number(process.env.PORT) || 3001,
    env: process.env.NODE_ENV || 'development',
  },
  arduino: {
    enabled: process.env.ENABLE_ARDUINO !== 'false',
    port: process.env.ARDUINO_PORT || 'COM3',
    baudRate: Number(process.env.ARDUINO_BAUD_RATE) || 115200,
  },
}

export function validateConfig() {
  if (!config.mongodb.uri.includes('mongodb')) {
    console.warn('MONGODB_URI is not configured correctly and database access will fail.')
  }

  console.log(
    `Server config: port=${config.server.port}, env=${config.server.env}, arduino=${config.arduino.enabled ? config.arduino.port : 'disabled'}`,
  )
}
