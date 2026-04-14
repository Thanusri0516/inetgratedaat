import { useCallback, useEffect, useState } from 'react'
import { fetchLiveTemperature } from '../api/temperature'
import type { LiveTemperature } from '../api/types'
import { temperatureBand } from '../utils/temperatureUi'
import { IconThermometer } from './DashboardIcons'

const POLL_MS = 15_000

type Props = {
  onLiveChange?: (reading: LiveTemperature) => void
}

function formatOptional(n: number | undefined, unit: string): string {
  return n == null || Number.isNaN(n) ? '—' : `${n}${unit}`
}

export function LiveTemperatureCard({ onLiveChange }: Props) {
  const [data, setData] = useState<LiveTemperature | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const next = await fetchLiveTemperature()
      setData(next)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load temperature')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
    const id = window.setInterval(() => void load(), POLL_MS)
    return () => window.clearInterval(id)
  }, [load])

  useEffect(() => {
    if (data) onLiveChange?.(data)
  }, [data, onLiveChange])

  const band = data ? temperatureBand(data.celsius) : 'comfort'
  const bandClass =
    band === 'hot' ? 'dash-card--temp-hot' : band === 'cold' ? 'dash-card--temp-cold' : ''

  return (
    <article className={`dash-card dash-card--live dash-card--compact ${bandClass}`.trim()}>
      <header className="dash-card__head dash-card__head--compact">
        <div className="dash-card__titleblock">
          <span className="dash-card__icon dash-card__icon--live dash-card__icon--sm">
            <IconThermometer />
          </span>
          <h2>Live</h2>
        </div>
        <span className="dash-pill dash-pill--live dash-pill--breathe">Live</span>
      </header>
      {loading && !data ? (
        <p className="dash-muted dash-loading dash-muted--sm">Syncing…</p>
      ) : error && !data ? (
        <p className="dash-error">{error}</p>
      ) : data ? (
        <div className={`dash-stat dash-stat--live dash-stat--band-${band}`}>
          <div className="dash-live-body">
            <div className="dash-live-main">
              <p className="dash-temp dash-temp--compact">
                {data.celsius}
                <span className="dash-temp__unit">{data.unit}</span>
              </p>
              <p className="dash-muted dash-meta-tiny">
                {data.source ? `${data.source} · ` : null}
                {new Date(data.updatedAt).toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </p>
            </div>
            <dl className="dash-live-extra">
              <div className="dash-live-extra__row">
                <dt>High</dt>
                <dd>{formatOptional(data.highCelsius, '°')}</dd>
              </div>
              <div className="dash-live-extra__row">
                <dt>Low</dt>
                <dd>{formatOptional(data.lowCelsius, '°')}</dd>
              </div>
              <div className="dash-live-extra__row">
                <dt>Humidity</dt>
                <dd>{formatOptional(data.humidityPercent, '%')}</dd>
              </div>
            </dl>
          </div>
        </div>
      ) : null}
      {error && data ? <p className="dash-error dash-card__meta">{error}</p> : null}
    </article>
  )
}
