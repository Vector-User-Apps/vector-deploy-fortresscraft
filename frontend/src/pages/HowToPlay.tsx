import { useNavigate } from 'react-router-dom'
import { TOWER_CONFIGS, ENEMY_CONFIGS } from '@/game/constants'

const TOWER_ICONS: Record<string, string> = {
  arrow: '🏹',
  cannon: '💣',
  frost: '❄',
  sniper: '🎯',
  tesla: '⚡',
}

const ENEMY_ICONS: Record<string, string> = {
  grunt: '👹',
  runner: '💨',
  tank: '🛡',
  healer: '💚',
  boss: '👑',
}

export function HowToPlay() {
  const navigate = useNavigate()

  return (
    <div
      data-testid="how-to-play"
      className="min-h-screen"
      style={{
        background: 'var(--color-bg)',
        color: 'var(--color-fg)',
        fontFamily: 'var(--font-body)',
      }}
    >
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 transition-colors"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-accent)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          ← Back
        </button>

        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-weight-bold)',
            fontSize: 'var(--font-size-3xl)',
            marginBottom: '32px',
          }}
        >
          How to Play
        </h1>

        {/* Game Mechanics */}
        <Section title="Battle Tactics">
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
            Dark creatures spawn and march along a winding path toward your castle. Place defenses on
            the grid to vanquish them before they breach your gates. You start with <strong
            style={{ color: 'var(--color-fg)' }}>150 gold</strong> and <strong style={{ color: 'var(--color-fg)' }}>20 lives</strong>.
            Slaying creatures earns gold to build and strengthen more defenses. Survive as many waves as the fates allow!
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <InfoCard label="Starting Gold" value="150" color="#D4A24C" />
            <InfoCard label="Starting Lives" value="20" color="var(--palette-green-400)" />
            <InfoCard label="Sell Refund" value="50%" color="var(--color-accent)" />
          </div>
        </Section>

        {/* Towers */}
        <Section title="Tower Types">
          <div className="flex flex-col gap-3">
            {Object.values(TOWER_CONFIGS).map((config) => (
              <div
                key={config.type}
                className="flex items-start gap-3 p-4 rounded"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>{TOWER_ICONS[config.type]}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      style={{
                        fontWeight: 'var(--font-weight-bold)',
                        color: config.color,
                      }}
                    >
                      {config.name}
                    </span>
                    <span
                      style={{
                        fontSize: 'var(--font-size-xs)',
                        color: '#D4A24C',
                      }}
                    >
                      ● {config.cost}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 'var(--line-height-relaxed)',
                    }}
                  >
                    {config.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Enemies */}
        <Section title="Dark Creatures">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.values(ENEMY_CONFIGS).map((config) => (
              <div
                key={config.type}
                className="flex items-center gap-3 p-3 rounded"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <span style={{ fontSize: '1.3rem' }}>{ENEMY_ICONS[config.type]}</span>
                <div>
                  <span
                    style={{
                      fontWeight: 'var(--font-weight-medium)',
                      color: config.color,
                      fontSize: 'var(--font-size-sm)',
                    }}
                  >
                    {config.name}
                  </span>
                  <div
                    style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    HP: {config.baseHp} · Speed: {config.speed} · Reward: ●{config.reward}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Tips */}
        <Section title="Wisdom of the Elders">
          <ul
            className="flex flex-col gap-2"
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--line-height-relaxed)',
              paddingLeft: '20px',
            }}
          >
            <li>Place Frost towers near the path to slow dark creatures for your damage towers.</li>
            <li>Cannon towers excel against clusters — place them near tight path turns.</li>
            <li>Sniper towers have extreme range — place them centrally to cover more of the trail.</li>
            <li>Tesla chain lightning is devastating on dense hordes.</li>
            <li>Boss waves arrive every 10 waves — save gold for upgrades before then!</li>
            <li>Use 2x or 3x speed to hasten the easier skirmishes.</li>
          </ul>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 'var(--font-weight-semibold)',
          fontSize: 'var(--font-size-xl)',
          marginBottom: '16px',
          color: 'var(--color-fg)',
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  )
}

function InfoCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="p-3 rounded text-center"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color }}>
        {value}
      </div>
      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
        {label}
      </div>
    </div>
  )
}
