import { useCallback, useEffect, useState } from 'react'
import { fetchPredictedTemperature } from '../api/temperature'
import { IconSpark } from './DashboardIcons'
import type { TemperaturePrediction } from '../api/types'

export function PredictedTemperatureCard() {
  const [data, setData] = useState<TemperaturePrediction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const next = await fetchPredictedTemperature()
      setData(next)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load prediction')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <article className="dash-card dash-card--predicted dash-card--compact">
      <header className="dash-card__head dash-card__head--compact">
        <div className="dash-card__titleblock">
          <span className="dash-card__icon dash-card__icon--predicted dash-card__icon--sm">
            <IconSpark />
          </span>
          <h2>Forecast</h2>
        </div>
        <button type="button" className="dash-linkbtn" onClick={() => void load()}>
          Refresh
        </button>
      </header>
      {loading && !data ? (
        <p className="dash-muted dash-loading dash-muted--sm">Loading…</p>
      ) : error && !data ? (
        <p className="dash-error">{error}</p>
      ) : data ? (
        <div className="dash-stat dash-stat--predicted">
          <p className="dash-temp dash-temp--predicted">
            {data.celsius}
            <span className="dash-temp__unit">{data.unit}</span>
          </p>
          {data.horizonLabel ? (
            <p className="dash-muted dash-card__meta">{data.horizonLabel}</p>
          ) : null}
          <p className="dash-muted dash-card__meta">
            Target time{' '}
            {new Date(data.validAt).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
        </div>
      ) : null}
      {error && data ? <p className="dash-error dash-card__meta">{error}</p> : null}
    </article>
  )
}
