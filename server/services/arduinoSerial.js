import ReadlineParserPackage from '@serialport/parser-readline'
import SerialPortPackage from 'serialport'

const { ReadlineParser } = ReadlineParserPackage
const { SerialPort } = SerialPortPackage

let port = null
let parser = null
let isConnected = false

const listeners = {
  onData: null,
  onError: null,
  onConnect: null,
  onDisconnect: null,
}

function parseArduinoLine(line) {
  const trimmed = line.trim()
  if (!trimmed) {
    return null
  }

  try {
    return JSON.parse(trimmed)
  } catch {
    const match = trimmed.match(
      /temperature\s*:\s*([-+]?\d+(\.\d+)?)\s*(?:°|º)?c?\s*\|\s*humidity\s*:\s*([-+]?\d+(\.\d+)?)\s*%/i,
    )

    if (!match) {
      return null
    }

    return {
      temperature: Number.parseFloat(match[1]),
      humidity: Number.parseFloat(match[3]),
    }
  }
}

function withPortHint(error) {
  const message = error instanceof Error ? error.message : String(error)
  const lowered = message.toLowerCase()

  if (lowered.includes('access denied') || lowered.includes('cannot lock port')) {
    return `${message}. Close Arduino IDE Serial Monitor or any app using the same COM port, then restart the backend.`
  }

  return message
}

export async function initializeArduinoSerial(portName = 'COM3', baudRate = 115200) {
  port = new SerialPort({
    path: portName,
    baudRate,
    autoOpen: false,
  })

  parser = port.pipe(new ReadlineParser({ delimiter: '\n' }))

  parser.on('data', (line) => {
    const data = parseArduinoLine(line)

    if (!data) {
      if (line.trim()) {
        console.warn(`Skipped unrecognized Arduino line: ${line.trim()}`)
      }
      return
    }

    console.log('Arduino data:', data)
    listeners.onData?.(data)
  })

  port.on('error', (error) => {
    isConnected = false
    console.error(`Serial port error: ${withPortHint(error)}`)
    listeners.onError?.(error)
  })

  port.on('close', () => {
    isConnected = false
    console.log('Serial port closed')
    listeners.onDisconnect?.()
  })

  await new Promise((resolve, reject) => {
    port.open((error) => {
      if (error) {
        reject(new Error(withPortHint(error)))
        return
      }

      isConnected = true
      console.log(`Arduino connected on ${portName}`)
      listeners.onConnect?.()
      resolve()
    })
  })
}

export function onArduinoData(callback) {
  listeners.onData = callback
}

export function onArduinoError(callback) {
  listeners.onError = callback
}

export function onArduinoConnect(callback) {
  listeners.onConnect = callback
}

export function onArduinoDisconnect(callback) {
  listeners.onDisconnect = callback
}

export function isArduinoConnected() {
  return isConnected
}

export async function closeArduinoConnection() {
  if (!port || !isConnected) {
    return
  }

  await new Promise((resolve, reject) => {
    port.close((error) => {
      if (error) {
        reject(error)
        return
      }

      resolve()
    })
  })

  console.log('Serial connection closed')
}

export async function listSerialPorts() {
  try {
    return await SerialPort.list()
  } catch (error) {
    console.error('Failed to list serial ports:', error.message)
    return []
  }
}
