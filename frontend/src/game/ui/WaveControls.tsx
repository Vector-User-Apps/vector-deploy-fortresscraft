import { useGameStore } from '../state'
import { BulletTimeButton } from './BulletTime'
import type { GameSpeed } from '../types'

export function WaveControls() {
  const phase = useGameStore((s) => s.phase)
  const speed = useGameStore((s) => s.speed)
  const startWave = useGameStore((s) => s.startWave)
  const pause = useGameStore((s) => s.pause)
  const resume = useGameStore((s) => s.resume)
  const setSpeed = useGameStore((s) => s.setSpeed)

  if (phase === 'menu' || phase === 'gameover') return null

  const speeds: GameSpeed[] = [1, 2, 3]

  return (
    <div
      data-testid="wave-controls"
      className="absolute bottom-16 md:bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2"
      style={{ fontFamily: "'Lora', serif" }}
    >
      {/* Start Wave / Pause */}
      {phase === 'between_waves' && (
        <button
          data-testid="wave-controls.start"
          onClick={startWave}
          className="px-5 py-2 transition-all"
          style={{
            background: '#C8963E',
            color: '#fff',
            border: 'none',
            fontSize: '0.75rem',
            fontWeight: 700,
            fontFamily: "'Cinzel', serif",
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            boxShadow: '0 0 20px rgba(200,150,62,0.4), 0 0 40px rgba(200,150,62,0.15)',
            textShadow: '0 0 8px rgba(200,150,62,0.8)',
          }}
        >
          Start Wave
        </button>
      )}

      {phase === 'playing' && (
        <button
          onClick={pause}
          className="px-4 py-2 transition-all"
          style={{
            background: 'rgba(15,26,14,0.9)',
            color: '#E8DFC8',
            border: '1px solid rgba(200,150,62,0.25)',
            fontSize: '0.75rem',
            cursor: 'pointer',
            fontFamily: "'Lora', serif",
          }}
        >
          ⏸ Pause
        </button>
      )}

      {phase === 'paused' && (
        <button
          onClick={resume}
          className="px-4 py-2 transition-all"
          style={{
            background: '#C8963E',
            color: '#fff',
            border: 'none',
            fontSize: '0.75rem',
            fontWeight: 700,
            fontFamily: "'Cinzel', serif",
            letterSpacing: '0.08em',
            cursor: 'pointer',
            textShadow: '0 0 8px rgba(200,150,62,0.8)',
          }}
        >
          ▶ Resume
        </button>
      )}

      {/* Bullet Time */}
      {(phase === 'playing' || phase === 'paused') && <BulletTimeButton />}

      {/* Speed controls */}
      {(phase === 'playing' || phase === 'paused') && (
        <div
          className="flex overflow-hidden"
          style={{
            border: '1px solid rgba(200,150,62,0.2)',
            background: 'rgba(15,26,14,0.9)',
          }}
        >
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className="px-3 py-2 transition-all"
              style={{
                background: speed === s ? 'rgba(200,150,62,0.2)' : 'transparent',
                color: speed === s ? '#C8963E' : 'rgba(232,223,200,0.45)',
                border: 'none',
                fontSize: '0.7rem',
                fontWeight: speed === s ? 700 : 400,
                cursor: 'pointer',
                borderRight:
                  s < 3 ? '1px solid rgba(200,150,62,0.15)' : 'none',
                fontFamily: "'Lora', serif",
                textShadow: speed === s ? '0 0 6px rgba(200,150,62,0.5)' : 'none',
              }}
            >
              {s}×
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
