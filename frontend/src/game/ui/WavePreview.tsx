import { useGameStore } from '../state'
import { getNextWavePreview } from '../systems/waves'

const ENEMY_ICONS: Record<string, string> = {
  grunt: '👹',
  runner: '💨',
  tank: '🛡',
  healer: '💚',
  boss: '👑',
}

export function WavePreview() {
  const phase = useGameStore((s) => s.phase)
  const wave = useGameStore((s) => s.wave)

  if (phase !== 'between_waves') return null

  const nextWave = wave + 1
  const preview = getNextWavePreview(nextWave)

  return (
    <div
      data-testid="wave-preview"
      className="absolute top-14 left-1/2 -translate-x-1/2 z-10"
      style={{
        fontFamily: "'Lora', serif",
        background: 'rgba(15,26,14,0.9)',
        border: '1px solid rgba(200,150,62,0.2)',
        padding: '8px 16px',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div
        style={{
          fontSize: '0.6rem',
          color: '#C8963E',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          marginBottom: '4px',
          textAlign: 'center',
          textShadow: '0 0 8px rgba(200,150,62,0.4)',
        }}
      >
        Next Wave {nextWave}
      </div>
      <div className="flex items-center gap-3">
        {preview.map(({ type, count }) => (
          <div key={type} className="flex items-center gap-1">
            <span style={{ fontSize: '1rem' }}>{ENEMY_ICONS[type]}</span>
            <span
              style={{
                fontSize: '0.7rem',
                color: '#C8963E',
                fontWeight: 600,
              }}
            >
              ×{count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
