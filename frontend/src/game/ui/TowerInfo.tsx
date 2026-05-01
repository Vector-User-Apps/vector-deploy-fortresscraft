import { useGameStore } from '../state'
import { TOWER_CONFIGS } from '../constants'

export function TowerInfo() {
  const selectedTowerId = useGameStore((s) => s.selectedTowerId)
  const towers = useGameStore((s) => s.towers)
  const gold = useGameStore((s) => s.gold)
  const upgradeTower = useGameStore((s) => s.upgradeTower)
  const sellTower = useGameStore((s) => s.sellTower)
  const selectTower = useGameStore((s) => s.selectTower)

  if (!selectedTowerId) return null
  const tower = towers.find((t) => t.id === selectedTowerId)
  if (!tower) return null

  const config = TOWER_CONFIGS[tower.type]
  if (!config) return null
  const levelConfig = config.levels[tower.level]
  const isMaxLevel = !levelConfig.upgradeCost
  const canUpgrade = !isMaxLevel && gold >= (levelConfig.upgradeCost || 0)

  // Calculate sell refund
  let totalCost = config.cost
  for (let i = 0; i < tower.level; i++) {
    totalCost += config.levels[i].upgradeCost || 0
  }
  const refund = Math.floor(totalCost * 0.5)

  return (
    <div
      data-testid="tower-info"
      className="absolute bottom-16 md:bottom-auto md:top-16 left-3 z-10"
      style={{
        fontFamily: "'Lora', serif",
        background: 'rgba(15,26,14,0.95)',
        border: '1px solid rgba(200,150,62,0.2)',
        padding: '12px 16px',
        width: '220px',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#E8DFC8',
              fontFamily: "'Cinzel', serif",
              letterSpacing: '0.05em',
            }}
          >
            {config.name}
          </div>
          <div
            style={{
              fontSize: '0.65rem',
              color: '#C8963E',
              textShadow: '0 0 6px rgba(200,150,62,0.4)',
            }}
          >
            Level {tower.level + 1}/{config.maxLevel}
          </div>
        </div>
        <button
          onClick={() => selectTower(null)}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(232,223,200,0.45)',
            cursor: 'pointer',
            fontSize: '1.2rem',
            fontFamily: "'Lora', serif",
          }}
        >
          ✕
        </button>
      </div>

      {/* Stats */}
      <div className="flex flex-col gap-1 mb-3" style={{ fontSize: '0.7rem' }}>
        <StatRow label="Damage" value={levelConfig.damage} />
        <StatRow label="Range" value={levelConfig.range.toFixed(1)} />
        <StatRow label="Fire Rate" value={`${levelConfig.fireRate}/s`} />
        {levelConfig.splashRadius && (
          <StatRow label="Splash" value={levelConfig.splashRadius.toFixed(1)} />
        )}
        {levelConfig.chainCount && (
          <StatRow label="Chain" value={`${levelConfig.chainCount} targets`} />
        )}
        {levelConfig.slowFactor && (
          <StatRow
            label="Slow"
            value={`${Math.round((1 - levelConfig.slowFactor) * 100)}%`}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {!isMaxLevel ? (
          <button
            onClick={() => upgradeTower(tower.id)}
            disabled={!canUpgrade}
            className="flex-1 py-1.5 text-center transition-all"
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              background: canUpgrade ? '#C8963E' : 'rgba(200,150,62,0.1)',
              color: canUpgrade ? '#fff' : 'rgba(232,223,200,0.4)',
              border: canUpgrade ? 'none' : '1px solid rgba(200,150,62,0.15)',
              cursor: canUpgrade ? 'pointer' : 'not-allowed',
              opacity: canUpgrade ? 1 : 0.6,
              fontFamily: "'Lora', serif",
              textShadow: canUpgrade ? '0 0 6px rgba(200,150,62,0.6)' : 'none',
            }}
          >
            Upgrade (● {levelConfig.upgradeCost})
          </button>
        ) : (
          <div
            className="flex-1 py-1.5 text-center"
            style={{
              fontSize: '0.65rem',
              color: '#D4A24C',
              background: 'rgba(212,162,76,0.08)',
              border: '1px solid rgba(212,162,76,0.2)',
              fontFamily: "'Lora', serif",
            }}
          >
            Max Level
          </div>
        )}
        <button
          onClick={() => sellTower(tower.id)}
          className="py-1.5 px-3 transition-all"
          style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            background: 'rgba(255,34,0,0.12)',
            color: '#FF2200',
            border: '1px solid rgba(255,34,0,0.3)',
            cursor: 'pointer',
            fontFamily: "'Lora', serif",
          }}
        >
          Sell (● {refund})
        </button>
      </div>
    </div>
  )
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between">
      <span style={{ color: 'rgba(232,223,200,0.45)' }}>{label}</span>
      <span style={{ color: '#E8DFC8', fontWeight: 600 }}>
        {value}
      </span>
    </div>
  )
}
