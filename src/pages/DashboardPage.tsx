import { useState } from 'react'
import { Chatbot } from '../components/Chatbot'
import { LiveTemperatureCard } from '../components/LiveTemperatureCard'
import { PredictedTemperatureCard } from '../components/PredictedTemperatureCard'
import { TemperatureChart } from '../components/TemperatureChart'
import type { LiveTemperature } from '../api/types'

export function DashboardPage() {
  const [liveReading, setLiveReading] = useState<LiveTemperature | null>(null)

  return (
    <div className="dashboard">
      <header className="dashboard__hero">
        <p className="dashboard__eyebrow">Overview</p>
        <div className="dashboard__hero-row">
          <div className="dashboard__hero-copy">
            <h1 className="dashboard__title">Dashboard</h1>
            <p className="dashboard__subtitle">
              Live readings, history, forecasts, and assistant — in one place.
            </p>
          </div>
        </div>
      </header>

      <div className="dashboard__grid">
        <div className="dashboard__top-row">
          <LiveTemperatureCard onLiveChange={setLiveReading} />
          <PredictedTemperatureCard />
        </div>
        <TemperatureChart liveReading={liveReading} />
      </div>

      <Chatbot />
    </div>
  )
}
