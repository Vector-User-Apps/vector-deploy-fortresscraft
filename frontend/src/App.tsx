/**
 * Main App Component
 *
 * Pre-wrapped with DialogProvider to enable the useDialog hook throughout the app.
 * Add your routes, layout, and other providers here.
 */

import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { DialogProvider } from '@/components/ui'

const LandingPage = lazy(() => import('@/pages/LandingPage').then(m => ({ default: m.LandingPage })))
const AuthCallback = lazy(() => import('@/pages/AuthCallback').then(m => ({ default: m.AuthCallback })))
const MainMenu = lazy(() => import('@/pages/MainMenu').then(m => ({ default: m.MainMenu })))
const GamePage = lazy(() => import('@/pages/GamePage').then(m => ({ default: m.GamePage })))
const GameOver = lazy(() => import('@/pages/GameOver').then(m => ({ default: m.GameOver })))
const LeaderboardPage = lazy(() => import('@/pages/LeaderboardPage').then(m => ({ default: m.LeaderboardPage })))
const HowToPlay = lazy(() => import('@/pages/HowToPlay').then(m => ({ default: m.HowToPlay })))
const AchievementsPage = lazy(() => import('@/pages/AchievementsPage').then(m => ({ default: m.AchievementsPage })))
const ArmoryPage = lazy(() => import('@/pages/ArmoryPage').then(m => ({ default: m.ArmoryPage })))
const WaveForecast = lazy(() => import('@/pages/WaveForecast').then(m => ({ default: m.WaveForecast })))
const AdminPage = lazy(() => import('@/pages/AdminPage').then(m => ({ default: m.AdminPage })))

function App() {
  return (
    <DialogProvider>
      <BrowserRouter>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/play" element={<MainMenu />} />
            <Route path="/play/game" element={<GamePage />} />
            <Route path="/play/gameover" element={<GameOver />} />
            <Route path="/play/achievements" element={<AchievementsPage />} />
            <Route path="/play/armory" element={<ArmoryPage />} />
            <Route path="/play/forecast" element={<WaveForecast />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/how-to-play" element={<HowToPlay />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </DialogProvider>
  )
}

export default App
