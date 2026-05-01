import { useGameStore } from '../state'
import { TOWER_CONFIGS } from '../constants'
import type { TowerType } from '../types'

const TOWER_ICONS: Record<TowerType, string> = {
  arrow: '🏹',
  cannon: '💣',
  frost: '❄',
  sniper: '🎯',
  tesla: '⚡',
}

export function TowerPanel() {
  const gold = useGameStore((s) => s.gold)
  const selectedTowerType = useGameStore((s) => s.selectedTowerType)
  const selectTowerType = useGameStore((s) => s.selectTowerType)
  const phase = useGameStore((s) => s.phase)

  if (phase === 'menu' || phase === 'gameover') return null

  return (
    <div
      data-testid="tower-panel"
      className="absolute bottom-0 left-0 right-0 md:bottom-auto md:top-16 md:right-3 md:left-auto z-10"
      style={{ fontFamily: "'Lora', serif" }}
    >
      <div
        className="flex md:flex-col gap-1.5 p-2 md:p-2 overflow-x-auto md:overflow-visible"
        style={{
          background: 'rgba(15,26,14,0.92)',
          borderTop: '1px solid rgba(200,150,62,0.2)',
          borderLeft: '1px solid rgba(200,150,62,0.15)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          className="hidden md:block px-2 pb-1 mb-1"
          style={{
            fontSize: '0.6rem',
            color: '#C8963E',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            borderBottom: '1px solid rgba(200,150,62,0.2)',
            fontFamily: "'Cinzel', serif",
            textShadow: '0 0 10px rgba(200,150,62,0.4)',
          }}
        >
          Towers
        </div>
        {Object.values(TOWER_CONFIGS).map((config) => {
          const canAfford = gold >= config.cost
          const isSelected = selectedTowerType === config.type

          return (
            <button
              key={config.type}
              data-testid={`tower-panel.tower.${config.type}`}
              onClick={() =>
                selectTowerType(isSelected ? null : (config.type as TowerType))
              }
              disabled={!canAfford}
              className="flex-shrink-0 flex items-center gap-2 px-3 py-2 md:py-2 transition-all"
              style={{
                background: isSelected
                  ? 'rgba(200,150,62,0.15)'
                  : 'transparent',
                border: isSelected
                  ? '1px solid rgba(200,150,62,0.5)'
                  : '1px solid transparent',
                opacity: canAfford ? 1 : 0.4,
                cursor: canAfford ? 'pointer' : 'not-allowed',
                minWidth: '80px',
                fontFamily: "'Lora', serif",
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{TOWER_ICONS[config.type as TowerType]}</span>
              <div className="flex flex-col items-start leading-tight">
                <span
                  style={{
                    fontSize: '0.7rem',
                    color: isSelected ? '#C8963E' : '#E8DFC8',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {config.name.replace(' Tower', '')}
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    color: canAfford ? '#D4A24C' : 'rgba(232,223,200,0.45)',
                  }}
                >
                  ● {config.cost}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
