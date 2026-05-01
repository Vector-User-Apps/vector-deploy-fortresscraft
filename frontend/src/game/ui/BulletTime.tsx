import { useEffect } from 'react'
import { useBulletTimeStore, COOLDOWN, DURATION } from '../bulletTimeStore'
import { useGameStore } from '../state'

export function BulletTimeOverlay() {
  const active = useBulletTimeStore((s) => s.active)
  const remaining = useBulletTimeStore((s) => s.remaining)

  if (!active) return null

  const progress = remaining / DURATION

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 50,
        background: `radial-gradient(ellipse at center, rgba(200,150,62,${0.06 * progress}) 0%, rgba(100,80,20,${0.12 * progress}) 100%)`,
        border: `2px solid rgba(200,150,62,${0.2 * progress})`,
        boxShadow: `inset 0 0 80px rgba(200,150,62,${0.15 * progress}), inset 0 0 200px rgba(140,100,30,${0.08 * progress})`,
        transition: 'all 0.3s ease',
      }}
    >
      {/* Vignette edges */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(15,26,14,0.25) 100%)',
        }}
      />
      {/* "BULLET TIME" label */}
      <div
        style={{
          position: 'absolute',
          top: '8%',
          right: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          opacity: 0.7,
        }}
      >
        <div
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#C8963E',
            boxShadow: '0 0 8px #C8963E, 0 0 16px rgba(200,150,62,0.5)',
            animation: 'btPulse 0.6s ease-in-out infinite alternate',
          }}
        />
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            fontFamily: "'Cinzel', serif",
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#C8963E',
            textShadow: '0 0 10px rgba(200,150,62,0.6)',
          }}
        >
          BULLET TIME
        </span>
      </div>
      <style>{`
        @keyframes btPulse {
          from { opacity: 0.4; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}

export function BulletTimeButton() {
  const active = useBulletTimeStore((s) => s.active)
  const cooldown = useBulletTimeStore((s) => s.cooldown)
  const activate = useBulletTimeStore((s) => s.activate)
  const phase = useGameStore((s) => s.phase)

  const ready = !active && cooldown <= 0
  const cooldownProgress = cooldown > 0 ? cooldown / COOLDOWN : 0

  // Keyboard binding — spacebar
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault()
        const currentPhase = useGameStore.getState().phase
        if (currentPhase === 'playing') {
          useBulletTimeStore.getState().activate()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (phase !== 'playing' && phase !== 'paused') return null

  const SIZE = 48
  const STROKE = 3
  const RADIUS = (SIZE - STROKE) / 2
  const CIRC = 2 * Math.PI * RADIUS

  return (
    <button
      data-testid="bullet-time-btn"
      onClick={() => {
        if (phase === 'playing') activate()
      }}
      disabled={!ready || phase !== 'playing'}
      title={ready ? 'Bullet Time (Space)' : `Cooldown: ${Math.ceil(cooldown)}s`}
      style={{
        position: 'relative',
        width: SIZE,
        height: SIZE,
        border: 'none',
        background: active
          ? 'rgba(200,150,62,0.3)'
          : ready
            ? 'rgba(15,26,14,0.9)'
            : 'rgba(15,26,14,0.7)',
        cursor: ready && phase === 'playing' ? 'pointer' : 'not-allowed',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        boxShadow: active
          ? '0 0 20px rgba(200,150,62,0.5), 0 0 40px rgba(200,150,62,0.2)'
          : ready
            ? '0 0 10px rgba(200,150,62,0.15)'
            : 'none',
        opacity: ready || active ? 1 : 0.6,
      }}
    >
      {/* Cooldown ring */}
      <svg
        width={SIZE}
        height={SIZE}
        style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
      >
        {/* Background ring */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={active ? 'rgba(200,150,62,0.3)' : 'rgba(255,255,255,0.1)'}
          strokeWidth={STROKE}
        />
        {/* Progress ring */}
        {(cooldownProgress > 0 || active) && (
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={active ? '#C8963E' : '#6B4E1A'}
            strokeWidth={STROKE}
            strokeDasharray={CIRC}
            strokeDashoffset={
              active
                ? CIRC * (1 - useBulletTimeStore.getState().remaining / DURATION)
                : CIRC * (1 - cooldownProgress)
            }
            strokeLinecap="square"
            style={{ transition: active ? 'none' : 'stroke-dashoffset 0.3s ease' }}
          />
        )}
      </svg>

      {/* Icon — hourglass/clock */}
      <span
        style={{
          fontSize: '18px',
          lineHeight: 1,
          filter: active ? 'drop-shadow(0 0 4px rgba(200,150,62,0.8))' : 'none',
          position: 'relative',
          zIndex: 1,
        }}
      >
        ⏳
      </span>

      {/* Cooldown number */}
      {cooldown > 0 && !active && (
        <span
          style={{
            position: 'absolute',
            bottom: '-2px',
            right: '-2px',
            fontSize: '9px',
            fontWeight: 700,
            fontFamily: "'Lora', serif",
            color: 'rgba(232,223,200,0.45)',
            background: 'rgba(15,26,14,0.95)',
            padding: '1px 4px',
            lineHeight: 1.2,
          }}
        >
          {Math.ceil(cooldown)}
        </span>
      )}

      {/* "SPACE" hint */}
      {ready && (
        <span
          style={{
            position: 'absolute',
            bottom: '-14px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '8px',
            fontWeight: 600,
            fontFamily: "'Lora', serif",
            color: 'rgba(232,223,200,0.35)',
            letterSpacing: '1px',
            whiteSpace: 'nowrap',
            opacity: 0.6,
          }}
        >
          SPACE
        </span>
      )}
    </button>
  )
}
