import { useGameStore } from '../state'

export function HUD() {
  const gold = useGameStore((s) => s.gold)
  const lives = useGameStore((s) => s.lives)
  const wave = useGameStore((s) => s.wave)
  const score = useGameStore((s) => s.score)

  return (
    <div
      data-testid="hud"
      className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-2 md:px-6 md:py-3 game-ui-panel"
      style={{
        background: 'linear-gradient(180deg, rgba(15,26,14,0.95) 0%, rgba(15,26,14,0.7) 80%, transparent 100%)',
        fontFamily: "'Lora', serif",
        borderBottom: '1px solid rgba(200,150,62,0.15)',
      }}
    >
      <div className="flex items-center gap-3 md:gap-6">
        <HUDStat
          testId="hud.wave"
          icon="⚔"
          label="Wave"
          value={wave || '—'}
          color="#C8963E"
        />
        <HUDStat
          testId="hud.score"
          icon="★"
          label="Score"
          value={score.toLocaleString()}
          color="#D4A24C"
        />
      </div>
      <div className="flex items-center gap-3 md:gap-6">
        <HUDStat
          testId="hud.gold"
          icon="●"
          label="Gold"
          value={gold}
          color="#D4A24C"
        />
        <HUDStat
          testId="hud.lives"
          icon="♥"
          label="Lives"
          value={lives}
          color={lives <= 5 ? '#FF2200' : '#C8963E'}
        />
      </div>
    </div>
  )
}

function HUDStat({
  testId,
  icon,
  label,
  value,
  color,
}: {
  testId: string
  icon: string
  label: string
  value: string | number
  color: string
}) {
  return (
    <div data-testid={testId} className="flex items-center gap-1.5">
      <span style={{ color, fontSize: '1.1rem', textShadow: `0 0 8px ${color}66` }}>{icon}</span>
      <div className="flex flex-col leading-none">
        <span
          className="hidden md:block"
          style={{
            fontSize: '0.6rem',
            color: 'rgba(232,223,200,0.45)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            fontFamily: "'Lora', serif",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            color: '#E8DFC8',
            fontFamily: "'Lora', serif",
          }}
        >
          {value}
        </span>
      </div>
    </div>
  )
}
