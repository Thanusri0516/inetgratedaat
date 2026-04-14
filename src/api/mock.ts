import { API_ENDPOINTS } from '../config/apiEndpoints'
import type {
  ChatResponse,
  HistoryRange,
  LiveTemperature,
  TemperatureHistory,
  TemperaturePrediction,
} from './types'

export function mockDelay(ms = 350): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export function mockLiveTemperature(): LiveTemperature {
  const c = 20.5 + Math.random() * 5
  const cur = Math.round(c * 10) / 10
  const spread = 2 + Math.random() * 2.5
  return {
    celsius: cur,
    unit: '°C',
    updatedAt: new Date().toISOString(),
    source: 'Demo sensor',
    highCelsius: Math.round((cur + spread + Math.random()) * 10) / 10,
    lowCelsius: Math.round((cur - spread * 0.85 + Math.random() * 0.5) * 10) / 10,
    humidityPercent: Math.round(42 + Math.random() * 28),
  }
}

function labelForRange(t: Date, range: HistoryRange, total: number): string {
  if (range === '1w' && total <= 10) {
    return t.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })
  }
  return t.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function mockTemperatureHistory(range: HistoryRange): TemperatureHistory {
  const specs: Record<HistoryRange, { n: number; stepMs: number }> = {
    '1h': { n: 12, stepMs: 5 * 60 * 1000 },
    '6h': { n: 12, stepMs: 30 * 60 * 1000 },
    '24h': { n: 24, stepMs: 60 * 60 * 1000 },
    '1w': { n: 14, stepMs: 12 * 60 * 60 * 1000 },
  }
  const { n, stepMs } = specs[range]
  const labels: string[] = []
  const values: number[] = []
  const now = Date.now()
  for (let i = n - 1; i >= 0; i--) {
    const t = new Date(now - i * stepMs)
    labels.push(labelForRange(t, range, n))
    const wave = Math.sin((n - 1 - i) / 3) * 2.5
    values.push(Math.round((21 + wave + (Math.random() - 0.5) * 1.2) * 10) / 10)
  }
  return { labels, values }
}

export function mockPrediction(): TemperaturePrediction {
  const valid = new Date(Date.now() + 6 * 60 * 60 * 1000)
  return {
    celsius: 24.2,
    unit: '°C',
    validAt: valid.toISOString(),
    horizonLabel: 'In 6 hours',
  }
}

export function mockChatReply(message: string): ChatResponse {
  const q = message.trim().toLowerCase()
  if (!q) return { reply: 'Ask me about temperature trends or the dashboard.' }
  if (q.includes('temp') || q.includes('hot') || q.includes('cold')) {
    return {
      reply:
        'Live and predicted readings come from your API. In demo mode, values are simulated so the UI still works.',
    }
  }
  if (q.includes('chart') || q.includes('graph')) {
    return {
      reply: `The chart uses Chart.js and loads historical points from ${API_ENDPOINTS.temperatureHistory} (or mock data when no API base URL is set).`,
    }
  }
  return {
    reply: `You said: “${message.trim().slice(0, 120)}${message.trim().length > 120 ? '…' : ''}”. Set VITE_API_BASE_URL and implement ${API_ENDPOINTS.chat} on your backend for real replies.`,
  }
}
