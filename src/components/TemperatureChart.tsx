import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type Chart,
  type ChartOptions,
  type ScriptableContext,
  type TooltipItem,
} from 'chart.js'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { lastPointPulsePlugin } from '../chart/lastPointPulsePlugin'
import { fetchTemperatureHistory } from '../api/temperature'
import type { HistoryRange, LiveTemperature, TemperatureHistory } from '../api/types'
import { IconChart } from './DashboardIcons'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  lastPointPulsePlugin,
)

const RANGE_TABS: { key: HistoryRange; label: string }[] = [
  { key: '1h', label: '1H' },
  { key: '6h', label: '6H' },
  { key: '24h', label: '24H' },
  { key: '1w', label: '1W' },
]

function chartColors(dark: boolean) {
  const line = dark ? '#c084fc' : '#7c3aed'
  const lineRgb = dark ? '192, 132, 252' : '124, 58, 237'
  return {
    grid: dark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(15, 23, 42, 0.08)',
    text: dark ? '#e5e7eb' : '#374151',
    line,
    lineRgb,
  }
}

type Props = {
  liveReading: LiveTemperature | null
}

export function TemperatureChart({ liveReading }: Props) {
  const [history, setHistory] = useState<TemperatureHistory | null>(null)
  const [range, setRange] = useState<HistoryRange>('24h')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dark, setDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
  const chartRef = useRef<Chart<'line'>>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setDark(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const h = await fetchTemperatureHistory(range)
        if (!cancelled) setHistory(h)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not load history')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [range])

  useEffect(() => {
    if (!history?.values.length) return
    const id = window.setInterval(() => {
      chartRef.current?.update('none')
    }, 450)
    return () => clearInterval(id)
  }, [history])

  const rangeLabel = RANGE_TABS.find((t) => t.key === range)?.label ?? range

  const options = useMemo<ChartOptions<'line'>>(() => {
    const c = chartColors(dark)
    const lastIdx = (history?.values.length ?? 0) - 1

    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.94)',
          titleColor: '#f9fafb',
          bodyColor: '#e5e7eb',
          padding: 12,
          cornerRadius: 10,
          callbacks: {
            label(item: TooltipItem<'line'>) {
              const y = item.parsed.y
              if (y == null) return ''
              if (item.datasetIndex === 1) {
                return ` Live (panel): ${y}°C`
              }
              if (item.dataIndex === lastIdx) {
                return ` Latest in window: ${y}°C`
              }
              return ` ${y}°C`
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: c.grid },
          ticks: { color: c.text, maxRotation: 0, autoSkip: true, maxTicksLimit: 10 },
        },
        y: {
          grid: { color: c.grid },
          ticks: { color: c.text },
          title: {
            display: true,
            text: '°C',
            color: c.text,
            font: { size: 11 },
          },
        },
      },
    }
  }, [dark, history?.values.length])

  const data = useMemo(() => {
    const c = chartColors(dark)
    const labels = history?.labels ?? []
    const values = history?.values ?? []
    const lastIdx = values.length - 1

    const gradientFill = (ctx: CanvasRenderingContext2D, chartArea: { top: number; bottom: number }) => {
      const g = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
      g.addColorStop(0, `rgba(${c.lineRgb}, 0.02)`)
      g.addColorStop(0.4, `rgba(${c.lineRgb}, 0.14)`)
      g.addColorStop(0.75, `rgba(${c.lineRgb}, 0.28)`)
      g.addColorStop(1, `rgba(${c.lineRgb}, 0.38)`)
      return g
    }

    const main = {
      label: 'Temperature',
      data: values,
      borderColor: c.line,
      backgroundColor: (context: ScriptableContext<'line'>) => {
        const { chart } = context
        const { ctx, chartArea } = chart
        if (!chartArea) return `rgba(${c.lineRgb}, 0.15)`
        return gradientFill(ctx, chartArea)
      },
      tension: 0.38,
      fill: true,
      borderWidth: 2.5,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointHoverBorderWidth: 2,
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: c.line,
    }

    const overlay =
      liveReading && lastIdx >= 0
        ? {
            label: 'Live reading',
            data: labels.map((_, i) => (i === lastIdx ? liveReading.celsius : null)) as (number | null)[],
            borderColor: 'transparent',
            backgroundColor: '#f97316',
            showLine: false,
            pointRadius: (ctx: ScriptableContext<'line'>) =>
              ctx.dataIndex === lastIdx ? 7 : 0,
            pointHoverRadius: 9,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointBackgroundColor: '#ea580c',
          }
        : null

    return {
      labels,
      datasets: overlay ? [main, overlay] : [main],
    } as const
  }, [history, dark, liveReading])

  const subLine = loading
    ? 'Loading…'
    : `${rangeLabel} window · pulsing marker = latest / live`

  return (
    <article className="dash-card dash-card--chart">
      <header className="dash-card__head dash-card__head--chart">
        <div className="dash-card__titleblock">
          <span className="dash-card__icon dash-card__icon--chart dash-card__icon--sm">
            <IconChart />
          </span>
          <div className="dash-card__titles">
            <h2>Temperature trend</h2>
            <p className="dash-card__sub">{subLine}</p>
          </div>
        </div>
        <div className="dash-chart-range" role="tablist" aria-label="Chart time range">
          {RANGE_TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={range === key}
              className={`dash-chart-range__btn${range === key ? ' dash-chart-range__btn--active' : ''}`}
              onClick={() => setRange(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </header>
      <div className="dash-chart-frame">
        <div className="dash-chart-wrap">
          {loading ? (
            <p className="dash-muted dash-chart-wrap__msg dash-loading">Loading series…</p>
          ) : error ? (
            <p className="dash-error dash-chart-wrap__msg">{error}</p>
          ) : (
            <Line ref={chartRef} data={data} options={options} />
          )}
        </div>
      </div>
    </article>
  )
}
