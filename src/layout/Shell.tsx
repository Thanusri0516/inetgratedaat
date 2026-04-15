import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

export function Shell() {
  const [headerHidden, setHeaderHidden] = useState(false)

  useEffect(() => {
    let lastY = window.scrollY

    const onScroll = () => {
      const currentY = window.scrollY
      const scrollingDown = currentY > lastY
      const passedTop = currentY > 24
      const delta = Math.abs(currentY - lastY)

      if (delta < 6) return

      if (!passedTop) {
        setHeaderHidden(false)
      } else if (scrollingDown) {
        setHeaderHidden(true)
      } else {
        setHeaderHidden(false)
      }

      lastY = currentY
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="shell">
      <header className={`shell__header${headerHidden ? ' shell__header--hidden' : ''}`}>
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
          </nav>
        </div>
      </header>
      <main className="shell__main">
        <Outlet />
      </main>
    </div>
  )
}
