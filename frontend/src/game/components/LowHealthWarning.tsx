import { useGameStore } from '../state'

export function LowHealthWarning() {
  const lives = useGameStore((s) => s.lives)
  const phase = useGameStore((s) => s.phase)

  if (lives > 5 || phase === 'gameover' || phase === 'menu') return null

  // Intensity: 1 life = max, 5 lives = min
  const intensity = Math.max(0.15, 1 - (lives - 1) / 4)
  const isConstant = lives <= 1

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 40,
      }}
    >
      <style>{`
        @keyframes healthPulse {
          0%, 100% { opacity: ${intensity * 0.5}; }
          50% { opacity: ${intensity}; }
        }
      `}</style>
      <div
        style={{
          width: '100%',
          height: '100%',
          background: `radial-gradient(ellipse at center, transparent 40%, rgba(220, 38, 38, ${intensity * 0.6}) 100%)`,
          animation: isConstant ? 'none' : `healthPulse ${1.5 - intensity * 0.5}s ease-in-out infinite`,
          opacity: isConstant ? intensity : undefined,
        }}
      />
    </div>
  )
}
