import { NavLink, Outlet } from 'react-router-dom'

export function Shell() {
  return (
    <div className="shell">
      <header className="shell__header">
        <div className="shell__bar">
          <NavLink to="/" className="shell__brand" end>
            <span className="shell__mark" aria-hidden />
            <span className="shell__name">AAT</span>
          </NavLink>
          <nav className="shell__nav" aria-label="Main">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `shell__link${isActive ? ' shell__link--active' : ''}`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `shell__link${isActive ? ' shell__link--active' : ''}`
              }
            >
              Dashboard
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="shell__main">
        <Outlet />
      </main>
    </div>
  )
}
