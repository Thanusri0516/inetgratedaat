import { Link } from 'react-router-dom'

export function LandingPage() {
  return (
    <div className="landing">
      <section className="landing__hero">
        <p className="landing__eyebrow">Temperature intelligence</p>
        <h1 className="landing__title">
          Monitor, forecast, and chat — in one calm dashboard.
        </h1>
        <p className="landing__lede">
          Track conditions in real time, review how temperature has moved, see what’s forecast next,
          and talk to an assistant — all from one simple workspace built for monitoring and decisions.
        </p>
        <div className="landing__actions">
          <Link to="/dashboard" className="landing__cta landing__cta--primary">
            Open dashboard
          </Link>
        </div>
      </section>

      <section className="landing__features" aria-labelledby="features-heading">
        <h2 id="features-heading" className="landing__section-title">
          What you get
        </h2>
        <ul className="landing__feature-grid">
          <li className="landing__feature">
            <span className="landing__feature-icon" aria-hidden>
              ◉
            </span>
            <h3 className="landing__feature-title">Live temperature</h3>
            <p className="landing__feature-text">Current readings that stay up to date as sensors refresh.</p>
          </li>
          <li className="landing__feature">
            <span className="landing__feature-icon" aria-hidden>
              〰
            </span>
            <h3 className="landing__feature-title">Trend charts</h3>
            <p className="landing__feature-text">Visual history so you can spot shifts and patterns quickly.</p>
          </li>
          <li className="landing__feature">
            <span className="landing__feature-icon" aria-hidden>
              🔥
            </span>
            <h3 className="landing__feature-title">Predictions</h3>
            <p className="landing__feature-text">See predicted temperature so you can plan ahead.</p>
          </li>
          <li className="landing__feature">
            <span className="landing__feature-icon" aria-hidden>
              💬
            </span>
            <h3 className="landing__feature-title">Chatbot</h3>
            <p className="landing__feature-text">Ask questions in natural language alongside your data.</p>
          </li>
        </ul>
      </section>
    </div>
  )
}
