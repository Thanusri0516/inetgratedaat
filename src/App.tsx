import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { Shell } from './layout/Shell'
import { DashboardPage } from './pages/DashboardPage'
import { LandingPage } from './pages/LandingPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
