import http from 'node:http'
import { URL } from 'node:url'
import { closeConnection } from './config/mongodb.js'
import { config, validateConfig } from './config/env.js'
import { chatbotRoutes } from './routes/chatbot.js'
import { predictionRoutes } from './routes/prediction.js'
import { temperatureRoutes } from './routes/temperature.js'
import { startArduinoPipeline, stopArduinoPipeline } from './services/dataCollectionService.js'

const routes = [...temperatureRoutes, ...predictionRoutes, ...chatbotRoutes]

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(JSON.stringify(payload))
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      if (!body) {
        resolve({})
        return
      }

      try {
        resolve(JSON.parse(body))
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

const server = http.createServer(async (req, res) => {
  if (!req.url || !req.method) {
    sendJson(res, 400, { error: 'Invalid request' })
    return
  }

  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {})
    return
  }

  const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`)
  const route = routes.find((entry) => entry.method === req.method && entry.path === url.pathname)

  if (!route) {
    sendJson(res, 404, { error: 'Route not found' })
    return
  }

  try {
    const body = req.method === 'POST' ? await readJsonBody(req) : {}
    const response = await route.handle({ req, res, url, body })
    sendJson(res, response.status ?? 200, response.body)
  } catch (error) {
    sendJson(res, 400, {
      error: error instanceof Error ? error.message : 'Invalid request body',
    })
  }
})

async function shutdown() {
  console.log('\nShutting down gracefully...')
  await stopArduinoPipeline()
  await closeConnection()
  process.exit(0)
}

validateConfig()

server.listen(config.server.port, async () => {
  console.log(`Backend listening on http://localhost:${config.server.port}`)

  if (!config.arduino.enabled) {
    console.log('Arduino pipeline disabled by configuration')
    return
  }

  try {
    await startArduinoPipeline(config.arduino.port)
    console.log('Real-time data collection from Arduino enabled')
  } catch (error) {
    console.warn(
      `Arduino pipeline did not start: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
})

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
