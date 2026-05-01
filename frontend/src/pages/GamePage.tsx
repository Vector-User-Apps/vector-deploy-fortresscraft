import { useEffect, useCallback } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Battlefield } from '@/game/components/Battlefield'
import { HUD } from '@/game/ui/HUD'
import { TowerPanel } from '@/game/ui/TowerPanel'
import { TowerInfo } from '@/game/ui/TowerInfo'
import { WaveControls } from '@/game/ui/WaveControls'
import { WavePreview } from '@/game/ui/WavePreview'
import { WaveStartCinematic } from '@/game/components/WaveStartCinematic'
import { LowHealthWarning } from '@/game/components/LowHealthWarning'
import { GoldSparkleOverlay, useGoldSparkle } from '@/game/components/GoldSparkle'
import { Minimap } from '@/game/ui/Minimap'
import { BulletTimeOverlay, } from '@/game/ui/BulletTime'
import { useBulletTimeStore } from '@/game/bulletTimeStore'
import { useGameStore } from '@/game/state'

export function GamePage() {
  const { isAuthenticated, loading } = useAuth()
  const phase = useGameStore((s) => s.phase)
  const setPhase = useGameStore((s) => s.setPhase)
  const navigate = useNavigate()
  const { coins, setCoins, spawnCoins } = useGoldSparkle()

  useEffect(() => {
    // Initialize game in between_waves phase so player can place towers first
    if (phase === 'menu') {
      setPhase('between_waves')
      useBulletTimeStore.getState().reset()
    }
  }, [phase, setPhase])

  useEffect(() => {
    if (phase === 'gameover') {
      navigate('/play/gameover', { replace: true })
    }
  }, [phase, navigate])

  const handleGoldAwarded = useCallback(() => {
    const cx = window.innerWidth * (0.3 + Math.random() * 0.4)
    const cy = window.innerHeight * (0.3 + Math.random() * 0.4)
    spawnCoins(cx, cy, 3 + Math.floor(Math.random() * 3))
  }, [spawnCoins])

  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/" replace />

  return (
    <div data-testid="game-page" className="relative w-full h-screen overflow-hidden" style={{ background: '#0F1A0E' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
        .game-ui-panel {
          background: rgba(15,26,14,0.92) !important;
          border-color: rgba(200,150,62,0.2) !important;
          font-family: 'Lora', serif !important;
          backdrop-filter: blur(12px);
        }
        .game-ui-panel * { font-family: 'Lora', serif; }
        .game-ui-heading { font-family: 'Cinzel', serif !important; }
      `}</style>
      <Battlefield onGoldAwarded={handleGoldAwarded} />
      <BulletTimeOverlay />
      <HUD />
      <TowerPanel />
      <TowerInfo />
      <WaveControls />
      <WavePreview />
      <WaveStartCinematic />
      <LowHealthWarning />
      <GoldSparkleOverlay coins={coins} setCoins={setCoins} />
      <Minimap />
    </div>
  )
}
