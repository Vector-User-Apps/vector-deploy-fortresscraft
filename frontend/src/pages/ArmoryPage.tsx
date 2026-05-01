import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TOWER_CONFIGS } from '@/game/constants'
import type { TowerType } from '@/game/types'

const TOWER_KEYS: TowerType[] = ['arrow', 'cannon', 'frost', 'sniper', 'tesla']
const TOWER_ICONS: Record<TowerType, string> = {
  arrow: '🏹', cannon: '🪨', frost: '❄️', sniper: '🔮', tesla: '🌿',
}
const TOWER_SPECIALS: Record<TowerType, string> = {
  arrow: 'Rapid Fire',
  cannon: 'Splash Damage',
  frost: 'Slow Effect',
  sniper: 'Extreme Range',
  tesla: 'Nature\'s Wrath',
}
const STRONG_VS: Record<TowerType, string> = {
  arrow: 'Runners & Healers',
  cannon: 'Goblin swarms',
  frost: 'All enemies (support)',
  sniper: 'Trolls & Dragons',
  tesla: 'Mixed hordes',
}

const STAT_MAX = { damage: 150, range: 10, fireRate: 3 }

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');

  .arm {
    min-height: 100vh;
    background: #0F1A0E;
    color: #E8DFC8;
    font-family: 'Lora', serif;
    position: relative;
    overflow-x: hidden;
  }

  .arm-stripe {
    position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 100;
    background: linear-gradient(90deg, #2A1E0A, #C8963E, #2A1E0A);
    box-shadow: 0 0 12px rgba(200,150,62,0.3);
  }

  .arm-grid-bg {
    position: fixed; inset: 0; pointer-events: none;
    background: rgba(200,150,62,0.02);
  }

  .arm-back {
    position: fixed; top: 10px; left: 16px; z-index: 200;
    background: transparent;
    border: 1px solid rgba(200,150,62,0.25);
    color: rgba(232,223,200,0.45);
    font-family: 'Lora', serif;
    font-size: 0.55rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    padding: 5px 14px;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
  }
  .arm-back:hover { border-color: rgba(200,150,62,0.6); color: rgba(232,223,200,0.9); }

  .arm-content {
    max-width: 960px;
    margin: 0 auto;
    padding: 5rem 1.5rem 3rem;
    position: relative; z-index: 10;
    animation: arm-in 0.6s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes arm-in {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .arm-label {
    font-size: 0.52rem; letter-spacing: 0.45em; text-transform: uppercase;
    color: #C8963E; opacity: 0.8; margin-bottom: 0.5rem;
    display: flex; align-items: center; gap: 0.5rem;
  }
  .arm-label::before { content: ''; width: 18px; height: 1px; background: #C8963E; opacity: 0.5; }

  .arm-title {
    font-family: 'Cinzel', serif;
    font-size: clamp(1.8rem, 4vw, 2.8rem);
    color: #fff; text-shadow: 0 0 24px rgba(200,150,62,0.2);
    margin-bottom: 0.4rem;
  }
  .arm-subtitle {
    font-size: 0.72rem; letter-spacing: 0.08em;
    color: rgba(232,223,200,0.45); margin-bottom: 2.5rem;
  }

  /* ── Tower selector tabs ── */
  .arm-tabs {
    display: flex; gap: 1px;
    border: 1px solid rgba(200,150,62,0.18);
    background: rgba(200,150,62,0.1);
    margin-bottom: 2rem;
    overflow: hidden;
  }
  .arm-tab {
    flex: 1;
    background: #142212;
    border: none;
    color: rgba(232,223,200,0.45);
    font-family: 'Lora', serif;
    font-size: 0.58rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    padding: 0.85rem 0.5rem;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    display: flex; flex-direction: column; align-items: center; gap: 0.35rem;
    position: relative;
  }
  .arm-tab::after {
    content: '';
    position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
    background: transparent;
    transition: background 0.15s, box-shadow 0.15s;
  }
  .arm-tab:hover { background: rgba(200,150,62,0.04); color: rgba(232,223,200,0.7); }
  .arm-tab.active {
    background: rgba(200,150,62,0.06);
    color: #E8DFC8;
  }
  .arm-tab.active::after {
    background: var(--tab-color, #C8963E);
    box-shadow: 0 0 10px var(--tab-color, #C8963E);
  }
  .arm-tab-icon { font-size: 1.3rem; }
  .arm-tab-name { font-size: 0.5rem; }
  @media (max-width: 500px) {
    .arm-tab-name { display: none; }
    .arm-tab { padding: 0.7rem 0.3rem; }
  }

  /* ── Tower detail panel ── */
  .arm-detail {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    background: rgba(200,150,62,0.12);
    border: 1px solid rgba(200,150,62,0.18);
    animation: arm-detail-in 0.35s ease both;
  }
  @keyframes arm-detail-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @media (max-width: 600px) { .arm-detail { grid-template-columns: 1fr; } }

  /* Left: Tower identity */
  .arm-identity {
    background: #142212;
    padding: 2rem;
    display: flex; flex-direction: column;
    position: relative; overflow: hidden;
  }
  .arm-identity::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: var(--tw-color, #C8963E);
    box-shadow: 0 0 14px var(--tw-color, #C8963E);
  }
  .arm-big-icon {
    font-size: 4rem;
    filter: drop-shadow(0 0 16px var(--tw-glow, rgba(200,150,62,0.4)));
    margin-bottom: 1.25rem;
    display: block;
  }
  .arm-tw-name {
    font-family: 'Cinzel', serif;
    font-size: 1.6rem;
    color: #fff;
    margin-bottom: 0.3rem;
    display: block;
  }
  .arm-tw-cost {
    font-size: 0.68rem;
    color: #D4A24C;
    text-shadow: 0 0 8px rgba(212,162,76,0.4);
    letter-spacing: 0.15em;
    margin-bottom: 0.75rem;
    display: block;
  }
  .arm-tw-desc {
    font-size: 0.7rem; line-height: 1.6;
    color: rgba(232,223,200,0.5);
    margin-bottom: 1.25rem;
  }
  .arm-tw-tags {
    display: flex; flex-wrap: wrap; gap: 0.4rem;
    margin-top: auto;
  }
  .arm-tw-tag {
    font-size: 0.44rem; letter-spacing: 0.25em; text-transform: uppercase;
    padding: 0.15rem 0.5rem;
    border: 1px solid var(--tw-color, #C8963E);
    color: var(--tw-color, #C8963E);
  }

  /* Right: Stats + upgrade tiers */
  .arm-stats-panel {
    background: #142212;
    padding: 2rem;
    display: flex; flex-direction: column; gap: 1.5rem;
  }

  /* Tier selector */
  .arm-tier-row {
    display: flex; gap: 0.5rem;
  }
  .arm-tier-btn {
    flex: 1;
    background: rgba(200,150,62,0.04);
    border: 1px solid rgba(200,150,62,0.15);
    color: rgba(232,223,200,0.45);
    font-family: 'Cinzel', serif;
    font-size: 0.65rem;
    letter-spacing: 0.15em;
    padding: 0.55rem 0;
    cursor: pointer;
    transition: all 0.15s;
    text-align: center;
  }
  .arm-tier-btn:hover {
    border-color: rgba(200,150,62,0.35);
    color: rgba(232,223,200,0.7);
  }
  .arm-tier-btn.active {
    border-color: var(--tw-color, #C8963E);
    color: #E8DFC8;
    background: rgba(200,150,62,0.08);
    box-shadow: 0 0 8px var(--tw-glow, rgba(200,150,62,0.15));
  }

  /* Stat rows */
  .arm-stat-group { display: flex; flex-direction: column; gap: 0.9rem; }
  .arm-stat-row { display: flex; flex-direction: column; gap: 0.25rem; }
  .arm-stat-header {
    display: flex; justify-content: space-between; align-items: baseline;
  }
  .arm-stat-label {
    font-size: 0.52rem; letter-spacing: 0.25em; text-transform: uppercase;
    color: rgba(232,223,200,0.35);
  }
  .arm-stat-val {
    font-family: 'Cinzel', serif;
    font-size: 0.85rem;
    color: var(--tw-color, #C8963E);
    text-shadow: 0 0 6px var(--tw-glow, rgba(200,150,62,0.3));
  }
  .arm-stat-bar {
    height: 3px;
    background: rgba(200,150,62,0.08);
    overflow: hidden;
  }
  .arm-stat-fill {
    height: 100%;
    background: var(--tw-color, #C8963E);
    box-shadow: 0 0 6px var(--tw-glow, rgba(200,150,62,0.3));
    transition: width 0.3s ease;
  }

  /* Special ability callout */
  .arm-special {
    border: 1px solid rgba(200,150,62,0.15);
    background: rgba(200,150,62,0.03);
    padding: 0.85rem 1rem;
    display: flex; flex-direction: column; gap: 0.25rem;
  }
  .arm-special-label {
    font-size: 0.45rem; letter-spacing: 0.3em; text-transform: uppercase;
    color: rgba(232,223,200,0.3);
  }
  .arm-special-val {
    font-family: 'Cinzel', serif;
    font-size: 0.85rem;
    color: var(--tw-color, #C8963E);
  }

  /* Upgrade cost callout */
  .arm-upgrade-cost {
    margin-top: auto;
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(200,150,62,0.1);
  }
  .arm-cost-label {
    font-size: 0.5rem; letter-spacing: 0.25em; text-transform: uppercase;
    color: rgba(232,223,200,0.3);
  }
  .arm-cost-val {
    font-family: 'Cinzel', serif;
    font-size: 0.9rem;
    color: #D4A24C;
    text-shadow: 0 0 8px rgba(212,162,76,0.35);
  }
`

export function ArmoryPage() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<TowerType>('arrow')
  const [tier, setTier] = useState(0)

  const cfg = TOWER_CONFIGS[selected]
  const lvl = cfg.levels[tier]

  return (
    <>
      <style>{STYLES}</style>
      <div className="arm" data-testid="armory-page">
        <div className="arm-stripe" />
        <div className="arm-grid-bg" />

        <button className="arm-back" onClick={() => navigate('/play')}>← Back</button>

        <div className="arm-content">
          <div className="arm-label">Blacksmith's Workshop</div>
          <h1 className="arm-title">War Arsenal</h1>
          <p className="arm-subtitle">
            Study the defenses of the realm. Know thy weapons before the battle begins.
          </p>

          {/* Tower selector */}
          <div className="arm-tabs">
            {TOWER_KEYS.map((key) => {
              const tc = TOWER_CONFIGS[key]
              return (
                <button
                  key={key}
                  className={`arm-tab${selected === key ? ' active' : ''}`}
                  style={{ '--tab-color': tc.color } as React.CSSProperties}
                  onClick={() => { setSelected(key); setTier(0) }}
                >
                  <span className="arm-tab-icon">{TOWER_ICONS[key]}</span>
                  <span className="arm-tab-name">{tc.name.replace(' Tower', '')}</span>
                </button>
              )
            })}
          </div>

          {/* Detail panel */}
          <div
            key={selected}
            className="arm-detail"
            style={{
              '--tw-color': cfg.color,
              '--tw-glow': cfg.color + '40',
            } as React.CSSProperties}
          >
            {/* Left: Identity */}
            <div className="arm-identity">
              <span className="arm-big-icon">{TOWER_ICONS[selected]}</span>
              <span className="arm-tw-name">{cfg.name}</span>
              <span className="arm-tw-cost">⬡ {cfg.cost} GOLD</span>
              <p className="arm-tw-desc">{cfg.description}</p>
              <div className="arm-tw-tags">
                <span className="arm-tw-tag">{TOWER_SPECIALS[selected]}</span>
                <span className="arm-tw-tag">Tier {tier + 1}/{cfg.maxLevel}</span>
              </div>
            </div>

            {/* Right: Stats */}
            <div className="arm-stats-panel">
              {/* Tier buttons */}
              <div className="arm-tier-row">
                {cfg.levels.map((_, i) => (
                  <button
                    key={i}
                    className={`arm-tier-btn${tier === i ? ' active' : ''}`}
                    onClick={() => setTier(i)}
                  >
                    Tier {i + 1}
                  </button>
                ))}
              </div>

              {/* Stat bars */}
              <div className="arm-stat-group">
                <div className="arm-stat-row">
                  <div className="arm-stat-header">
                    <span className="arm-stat-label">Damage</span>
                    <span className="arm-stat-val">{lvl.damage}</span>
                  </div>
                  <div className="arm-stat-bar">
                    <div className="arm-stat-fill" style={{ width: `${(lvl.damage / STAT_MAX.damage) * 100}%` }} />
                  </div>
                </div>

                <div className="arm-stat-row">
                  <div className="arm-stat-header">
                    <span className="arm-stat-label">Range</span>
                    <span className="arm-stat-val">{lvl.range}</span>
                  </div>
                  <div className="arm-stat-bar">
                    <div className="arm-stat-fill" style={{ width: `${(lvl.range / STAT_MAX.range) * 100}%` }} />
                  </div>
                </div>

                <div className="arm-stat-row">
                  <div className="arm-stat-header">
                    <span className="arm-stat-label">Fire Rate</span>
                    <span className="arm-stat-val">{lvl.fireRate}/s</span>
                  </div>
                  <div className="arm-stat-bar">
                    <div className="arm-stat-fill" style={{ width: `${(lvl.fireRate / STAT_MAX.fireRate) * 100}%` }} />
                  </div>
                </div>
              </div>

              {/* Special ability */}
              {(lvl.splashRadius || lvl.chainCount || lvl.slowFactor) && (
                <div className="arm-special">
                  <span className="arm-special-label">Special Ability</span>
                  <span className="arm-special-val">
                    {lvl.splashRadius && `Splash Radius: ${lvl.splashRadius}`}
                    {lvl.chainCount && `Chain Targets: ${lvl.chainCount}`}
                    {lvl.slowFactor && `Slow: ${Math.round((1 - lvl.slowFactor) * 100)}%`}
                  </span>
                </div>
              )}

              {/* Strong vs */}
              <div className="arm-special">
                <span className="arm-special-label">Strong Against</span>
                <span className="arm-special-val" style={{ fontSize: '0.72rem' }}>
                  {STRONG_VS[selected]}
                </span>
              </div>

              {/* Upgrade cost */}
              <div className="arm-upgrade-cost">
                <span className="arm-cost-label">
                  {lvl.upgradeCost ? 'Upgrade Cost' : 'Max Level'}
                </span>
                <span className="arm-cost-val">
                  {lvl.upgradeCost ? `⬡ ${lvl.upgradeCost} GOLD` : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
