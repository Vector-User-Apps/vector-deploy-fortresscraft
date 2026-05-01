import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TOWER_CONFIGS, ENEMY_CONFIGS } from '@/game/constants'
import type { TowerType } from '@/game/types'

const TOWER_KEYS: TowerType[] = ['arrow', 'cannon', 'frost', 'sniper', 'tesla']
const ENEMY_KEYS = ['grunt', 'runner', 'tank', 'healer', 'boss'] as const
const TOWER_ICONS: Record<TowerType, string> = {
  arrow: '🏹', cannon: '💣', frost: '❄️', sniper: '🎯', tesla: '⚡',
}
const ENEMY_ICONS: Record<string, string> = {
  grunt: '👹', runner: '💨', tank: '🛡️', healer: '💚', boss: '☠️',
}

// Effectiveness ratings: how well each tower handles each enemy (1-5)
const EFFECTIVENESS: Record<TowerType, Record<string, number>> = {
  arrow:  { grunt: 4, runner: 5, tank: 2, healer: 4, boss: 2 },
  cannon: { grunt: 5, runner: 3, tank: 3, healer: 3, boss: 3 },
  frost:  { grunt: 3, runner: 5, tank: 4, healer: 3, boss: 4 },
  sniper: { grunt: 2, runner: 1, tank: 5, healer: 3, boss: 5 },
  tesla:  { grunt: 4, runner: 3, tank: 2, healer: 5, boss: 3 },
}

const RATING_LABELS = ['', 'Weak', 'Low', 'Fair', 'Strong', 'Lethal']
const RATING_COLORS = ['', '#EF4444', '#F59E0B', '#A78BFA', '#4ADE80', '#FF5500']

type EnemyKey = typeof ENEMY_KEYS[number]

const THREAT_ASSESSMENT: Record<string, { threat: string; weakness: string; tactic: string }> = {
  grunt:  { threat: 'Low',      weakness: 'Splash damage',       tactic: 'Cannon towers shred grunt swarms. Stack at chokepoints.' },
  runner: { threat: 'Medium',   weakness: 'Frost + Arrow combo', tactic: 'Freeze them first — arrows finish the job before they escape.' },
  tank:   { threat: 'High',     weakness: 'Sniper piercing',     tactic: 'Sniper towers bypass armor. Place at max range for sustained DPS.' },
  healer: { threat: 'Critical', weakness: 'Tesla chain',         tactic: 'Tesla chains jump to healers hiding behind tanks. Prioritize.' },
  boss:   { threat: 'Extreme',  weakness: 'Frost + Sniper',      tactic: 'Slow them with frost, let snipers stack damage. All-in required.' },
}

const THREAT_COLORS: Record<string, string> = {
  'Low': '#4ADE80', 'Medium': '#FACC15', 'High': '#F97316', 'Critical': '#EF4444', 'Extreme': '#DC2626',
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Share+Tech+Mono&display=swap');

  .intel {
    min-height: 100vh;
    background: #060300;
    color: #ffe4cc;
    font-family: 'Share Tech Mono', monospace;
    position: relative;
    overflow-x: hidden;
  }
  .intel::after {
    content: '';
    position: fixed; inset: 0; pointer-events: none; z-index: 50;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px);
  }

  .intel-stripe {
    position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 100;
    background: repeating-linear-gradient(90deg, #FF5500 0, #FF5500 14px, #1a0300 14px, #1a0300 28px);
    animation: intel-stripe 0.8s linear infinite;
    box-shadow: 0 0 18px rgba(255,85,0,0.55);
  }
  @keyframes intel-stripe { from { background-position: 0 0; } to { background-position: 28px 0; } }

  .intel-grid-bg {
    position: fixed; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(255,85,0,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,85,0,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  .intel-back {
    position: fixed; top: 10px; left: 16px; z-index: 200;
    background: transparent;
    border: 1px solid rgba(255,85,0,0.25);
    color: rgba(255,228,204,0.5);
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.55rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    padding: 5px 14px;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
  }
  .intel-back:hover { border-color: rgba(255,85,0,0.6); color: rgba(255,228,204,0.9); }

  .intel-content {
    max-width: 1060px;
    margin: 0 auto;
    padding: 5rem 1.5rem 3rem;
    position: relative; z-index: 10;
    animation: intel-in 0.6s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes intel-in {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .intel-label {
    font-size: 0.52rem; letter-spacing: 0.45em; text-transform: uppercase;
    color: #FF5500; opacity: 0.8; margin-bottom: 0.5rem;
    display: flex; align-items: center; gap: 0.5rem;
  }
  .intel-label::before { content: ''; width: 18px; height: 1px; background: #FF5500; opacity: 0.5; }

  .intel-title {
    font-family: 'Black Ops One', sans-serif;
    font-size: clamp(1.8rem, 4vw, 2.8rem);
    color: #fff; text-shadow: 0 0 24px rgba(255,85,0,0.2);
    margin-bottom: 0.4rem;
  }
  .intel-subtitle {
    font-size: 0.72rem; letter-spacing: 0.08em;
    color: rgba(255,228,204,0.4); margin-bottom: 2.5rem;
  }

  /* ── Section Headers ── */
  .intel-section-label {
    font-size: 0.48rem; letter-spacing: 0.4em; text-transform: uppercase;
    color: #FF5500; opacity: 0.7; margin-bottom: 1rem;
    display: flex; align-items: center; gap: 0.6rem;
    padding-top: 2rem;
  }
  .intel-section-label::before,
  .intel-section-label::after {
    content: ''; flex: 1; height: 1px; background: rgba(255,85,0,0.15);
  }

  /* ── Effectiveness Matrix ── */
  .intel-matrix {
    border: 1px solid rgba(255,85,0,0.18);
    background: #0a0400;
    overflow-x: auto;
    margin-bottom: 0.5rem;
  }
  .intel-matrix table {
    width: 100%;
    border-collapse: collapse;
    min-width: 580px;
  }
  .intel-matrix th,
  .intel-matrix td {
    padding: 0.7rem 0.6rem;
    text-align: center;
    border: 1px solid rgba(255,85,0,0.08);
  }
  .intel-matrix thead th {
    background: rgba(255,85,0,0.06);
    font-size: 0.5rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(255,228,204,0.5);
    font-weight: normal;
  }
  .intel-matrix thead th:first-child {
    text-align: left;
    padding-left: 1rem;
  }
  .intel-matrix tbody td:first-child {
    text-align: left;
    padding-left: 1rem;
    font-size: 0.6rem;
    letter-spacing: 0.15em;
    color: rgba(255,228,204,0.7);
  }
  .intel-matrix tbody tr {
    transition: background 0.15s;
  }
  .intel-matrix tbody tr:hover {
    background: rgba(255,85,0,0.03);
  }

  /* Matrix cell rating */
  .intel-cell {
    display: flex; flex-direction: column; align-items: center; gap: 0.2rem;
  }
  .intel-cell-pips {
    display: flex; gap: 2px;
  }
  .intel-pip {
    width: 6px; height: 6px;
    border: 1px solid rgba(255,85,0,0.2);
    transition: all 0.15s;
  }
  .intel-pip.filled {
    border-color: var(--pip-color);
    background: var(--pip-color);
    box-shadow: 0 0 4px var(--pip-color);
  }
  .intel-cell-label {
    font-size: 0.4rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--pip-color);
    opacity: 0.8;
  }

  /* ── Enemy Dossier Tabs ── */
  .intel-enemy-tabs {
    display: flex; gap: 1px;
    border: 1px solid rgba(255,85,0,0.18);
    background: rgba(255,85,0,0.1);
    margin-bottom: 0;
    overflow: hidden;
  }
  .intel-enemy-tab {
    flex: 1;
    background: #0a0400;
    border: none;
    color: rgba(255,228,204,0.4);
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.55rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    padding: 0.8rem 0.5rem;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    display: flex; flex-direction: column; align-items: center; gap: 0.3rem;
    position: relative;
  }
  .intel-enemy-tab::after {
    content: '';
    position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
    background: transparent;
    transition: background 0.15s, box-shadow 0.15s;
  }
  .intel-enemy-tab:hover { background: rgba(255,85,0,0.04); color: rgba(255,228,204,0.7); }
  .intel-enemy-tab.active {
    background: rgba(255,85,0,0.06);
    color: #ffe4cc;
  }
  .intel-enemy-tab.active::after {
    background: var(--enemy-color, #FF5500);
    box-shadow: 0 0 10px var(--enemy-color, #FF5500);
  }
  .intel-enemy-icon { font-size: 1.2rem; }
  .intel-enemy-name { font-size: 0.45rem; }
  @media (max-width: 500px) {
    .intel-enemy-name { display: none; }
    .intel-enemy-tab { padding: 0.6rem 0.3rem; }
  }

  /* ── Dossier Panel ── */
  .intel-dossier {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    background: rgba(255,85,0,0.12);
    border: 1px solid rgba(255,85,0,0.18);
    border-top: none;
    animation: intel-dossier-in 0.3s ease both;
  }
  @keyframes intel-dossier-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @media (max-width: 640px) { .intel-dossier { grid-template-columns: 1fr; } }

  .intel-dossier-left {
    background: #0a0400;
    padding: 1.8rem;
    display: flex; flex-direction: column;
    position: relative; overflow: hidden;
  }
  .intel-dossier-left::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: var(--enemy-color, #FF5500);
    box-shadow: 0 0 14px var(--enemy-color, #FF5500);
  }
  .intel-enemy-big-icon {
    font-size: 3.5rem;
    filter: drop-shadow(0 0 14px var(--enemy-glow, rgba(255,85,0,0.4)));
    margin-bottom: 1rem;
  }
  .intel-enemy-title {
    font-family: 'Black Ops One', sans-serif;
    font-size: 1.4rem;
    color: #fff;
    margin-bottom: 0.3rem;
  }
  .intel-threat-badge {
    display: inline-block;
    font-size: 0.48rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    padding: 0.2rem 0.6rem;
    border: 1px solid;
    margin-bottom: 1rem;
    width: fit-content;
  }

  .intel-enemy-stats {
    display: flex; flex-direction: column; gap: 0.7rem;
    margin-bottom: 1.2rem;
  }
  .intel-enemy-stat {
    display: flex; justify-content: space-between; align-items: center;
  }
  .intel-enemy-stat-label {
    font-size: 0.5rem; letter-spacing: 0.2em; text-transform: uppercase;
    color: rgba(255,228,204,0.35);
  }
  .intel-enemy-stat-val {
    font-family: 'Black Ops One', sans-serif;
    font-size: 0.8rem;
    color: var(--enemy-color, #FF5500);
  }
  .intel-enemy-stat-bar {
    flex: 1;
    height: 2px;
    background: rgba(255,85,0,0.08);
    margin: 0 0.8rem;
    position: relative;
    overflow: hidden;
  }
  .intel-enemy-stat-fill {
    position: absolute; top: 0; left: 0; height: 100%;
    background: var(--enemy-color, #FF5500);
    box-shadow: 0 0 4px var(--enemy-glow, rgba(255,85,0,0.3));
    transition: width 0.3s ease;
  }

  .intel-dossier-right {
    background: #0a0400;
    padding: 1.8rem;
    display: flex; flex-direction: column; gap: 1.2rem;
  }

  .intel-weakness-box {
    border: 1px solid rgba(255,85,0,0.15);
    background: rgba(255,85,0,0.03);
    padding: 0.85rem 1rem;
    display: flex; flex-direction: column; gap: 0.25rem;
  }
  .intel-weakness-label {
    font-size: 0.45rem; letter-spacing: 0.3em; text-transform: uppercase;
    color: rgba(255,228,204,0.3);
  }
  .intel-weakness-val {
    font-family: 'Black Ops One', sans-serif;
    font-size: 0.8rem;
    color: #4ADE80;
  }

  .intel-tactic-box {
    border: 1px solid rgba(255,85,0,0.15);
    background: rgba(255,85,0,0.03);
    padding: 0.85rem 1rem;
    display: flex; flex-direction: column; gap: 0.3rem;
  }
  .intel-tactic-label {
    font-size: 0.45rem; letter-spacing: 0.3em; text-transform: uppercase;
    color: rgba(255,228,204,0.3);
  }
  .intel-tactic-text {
    font-size: 0.68rem; line-height: 1.7;
    color: rgba(255,228,204,0.6);
  }

  /* Tower matchup bars in dossier */
  .intel-matchups {
    display: flex; flex-direction: column; gap: 0.6rem;
  }
  .intel-matchup-row {
    display: flex; align-items: center; gap: 0.6rem;
  }
  .intel-matchup-tower {
    font-size: 0.9rem;
    width: 1.6rem;
    text-align: center;
    flex-shrink: 0;
  }
  .intel-matchup-name {
    font-size: 0.45rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(255,228,204,0.35);
    width: 3.5rem;
    flex-shrink: 0;
  }
  .intel-matchup-bar-bg {
    flex: 1;
    height: 4px;
    background: rgba(255,85,0,0.08);
    overflow: hidden;
  }
  .intel-matchup-bar-fill {
    height: 100%;
    transition: width 0.4s ease;
  }
  .intel-matchup-rating {
    font-size: 0.42rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    width: 2.5rem;
    text-align: right;
    flex-shrink: 0;
  }

  /* ── Legend ── */
  .intel-legend {
    display: flex; gap: 1.2rem; flex-wrap: wrap;
    padding: 0.8rem 1rem;
    border: 1px solid rgba(255,85,0,0.1);
    background: rgba(255,85,0,0.02);
    margin-top: 0.5rem;
  }
  .intel-legend-item {
    display: flex; align-items: center; gap: 0.4rem;
    font-size: 0.42rem; letter-spacing: 0.15em; text-transform: uppercase;
    color: rgba(255,228,204,0.4);
  }
  .intel-legend-swatch {
    width: 8px; height: 8px;
    border: 1px solid;
  }
`

export function TacticalIntel() {
  const navigate = useNavigate()
  const [selectedEnemy, setSelectedEnemy] = useState<EnemyKey>('grunt')

  const enemyCfg = ENEMY_CONFIGS[selectedEnemy]
  const threat = THREAT_ASSESSMENT[selectedEnemy]
  const threatColor = THREAT_COLORS[threat.threat]

  // Stat maxes for bar scaling
  const maxHp = ENEMY_CONFIGS.boss.baseHp
  const maxSpeed = ENEMY_CONFIGS.runner.speed
  const maxReward = ENEMY_CONFIGS.boss.reward

  return (
    <>
      <style>{STYLES}</style>
      <div className="intel" data-testid="tactical-intel-page">
        <div className="intel-stripe" />
        <div className="intel-grid-bg" />

        <button className="intel-back" onClick={() => navigate('/play')}>← Back</button>

        <div className="intel-content">
          <div className="intel-label">Intelligence Division</div>
          <h1 className="intel-title">Tactical Intel</h1>
          <p className="intel-subtitle">
            Tower effectiveness ratings and enemy threat analysis. Study the matrix before you deploy.
          </p>

          {/* ── Effectiveness Matrix ── */}
          <div className="intel-section-label">Engagement Matrix</div>

          <div className="intel-matrix">
            <table>
              <thead>
                <tr>
                  <th>Tower \ Enemy</th>
                  {ENEMY_KEYS.map((e) => (
                    <th key={e}>
                      <span style={{ fontSize: '1rem', display: 'block', marginBottom: '0.2rem' }}>{ENEMY_ICONS[e]}</span>
                      {ENEMY_CONFIGS[e].name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TOWER_KEYS.map((t) => {
                  const tc = TOWER_CONFIGS[t]
                  return (
                    <tr key={t}>
                      <td>
                        <span style={{ marginRight: '0.5rem' }}>{TOWER_ICONS[t]}</span>
                        {tc.name.replace(' Tower', '')}
                      </td>
                      {ENEMY_KEYS.map((e) => {
                        const rating = EFFECTIVENESS[t][e]
                        const color = RATING_COLORS[rating]
                        return (
                          <td key={e}>
                            <div className="intel-cell" style={{ '--pip-color': color } as React.CSSProperties}>
                              <div className="intel-cell-pips">
                                {[1, 2, 3, 4, 5].map((i) => (
                                  <div key={i} className={`intel-pip${i <= rating ? ' filled' : ''}`} />
                                ))}
                              </div>
                              <span className="intel-cell-label">{RATING_LABELS[rating]}</span>
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="intel-legend">
            {[1, 2, 3, 4, 5].map((r) => (
              <div key={r} className="intel-legend-item">
                <div
                  className="intel-legend-swatch"
                  style={{ background: RATING_COLORS[r], borderColor: RATING_COLORS[r] }}
                />
                {RATING_LABELS[r]}
              </div>
            ))}
          </div>

          {/* ── Enemy Dossiers ── */}
          <div className="intel-section-label">Enemy Dossiers</div>

          <div className="intel-enemy-tabs">
            {ENEMY_KEYS.map((e) => {
              const ec = ENEMY_CONFIGS[e]
              return (
                <button
                  key={e}
                  className={`intel-enemy-tab${selectedEnemy === e ? ' active' : ''}`}
                  style={{ '--enemy-color': ec.color } as React.CSSProperties}
                  onClick={() => setSelectedEnemy(e)}
                >
                  <span className="intel-enemy-icon">{ENEMY_ICONS[e]}</span>
                  <span className="intel-enemy-name">{ec.name}</span>
                </button>
              )
            })}
          </div>

          <div
            key={selectedEnemy}
            className="intel-dossier"
            style={{
              '--enemy-color': enemyCfg.color,
              '--enemy-glow': enemyCfg.color + '40',
            } as React.CSSProperties}
          >
            {/* Left: Enemy identity & stats */}
            <div className="intel-dossier-left">
              <div className="intel-enemy-big-icon">{ENEMY_ICONS[selectedEnemy]}</div>
              <div className="intel-enemy-title">{enemyCfg.name}</div>
              <div
                className="intel-threat-badge"
                style={{ color: threatColor, borderColor: threatColor }}
              >
                Threat: {threat.threat}
              </div>

              <div className="intel-enemy-stats">
                <div className="intel-enemy-stat">
                  <span className="intel-enemy-stat-label">HP</span>
                  <div className="intel-enemy-stat-bar">
                    <div className="intel-enemy-stat-fill" style={{ width: `${(enemyCfg.baseHp / maxHp) * 100}%` }} />
                  </div>
                  <span className="intel-enemy-stat-val">{enemyCfg.baseHp}</span>
                </div>
                <div className="intel-enemy-stat">
                  <span className="intel-enemy-stat-label">Speed</span>
                  <div className="intel-enemy-stat-bar">
                    <div className="intel-enemy-stat-fill" style={{ width: `${(enemyCfg.speed / maxSpeed) * 100}%` }} />
                  </div>
                  <span className="intel-enemy-stat-val">{enemyCfg.speed}</span>
                </div>
                <div className="intel-enemy-stat">
                  <span className="intel-enemy-stat-label">Bounty</span>
                  <div className="intel-enemy-stat-bar">
                    <div className="intel-enemy-stat-fill" style={{ width: `${(enemyCfg.reward / maxReward) * 100}%` }} />
                  </div>
                  <span className="intel-enemy-stat-val">⬡ {enemyCfg.reward}</span>
                </div>
                <div className="intel-enemy-stat">
                  <span className="intel-enemy-stat-label">Lives Cost</span>
                  <div className="intel-enemy-stat-bar">
                    <div className="intel-enemy-stat-fill" style={{ width: `${(enemyCfg.liveCost / 10) * 100}%` }} />
                  </div>
                  <span className="intel-enemy-stat-val">{enemyCfg.liveCost}</span>
                </div>
              </div>
            </div>

            {/* Right: Weakness, tactic, matchups */}
            <div className="intel-dossier-right">
              <div className="intel-weakness-box">
                <span className="intel-weakness-label">Primary Weakness</span>
                <span className="intel-weakness-val">{threat.weakness}</span>
              </div>

              <div className="intel-tactic-box">
                <span className="intel-tactic-label">Recommended Tactic</span>
                <span className="intel-tactic-text">{threat.tactic}</span>
              </div>

              <div className="intel-weakness-box" style={{ borderColor: 'rgba(255,85,0,0.12)' }}>
                <span className="intel-weakness-label">Tower Matchups</span>
              </div>

              <div className="intel-matchups">
                {TOWER_KEYS.map((t) => {
                  const rating = EFFECTIVENESS[t][selectedEnemy]
                  const color = RATING_COLORS[rating]
                  return (
                    <div key={t} className="intel-matchup-row">
                      <span className="intel-matchup-tower">{TOWER_ICONS[t]}</span>
                      <span className="intel-matchup-name">{TOWER_CONFIGS[t].name.replace(' Tower', '')}</span>
                      <div className="intel-matchup-bar-bg">
                        <div
                          className="intel-matchup-bar-fill"
                          style={{
                            width: `${(rating / 5) * 100}%`,
                            background: color,
                            boxShadow: `0 0 6px ${color}`,
                          }}
                        />
                      </div>
                      <span className="intel-matchup-rating" style={{ color }}>
                        {RATING_LABELS[rating]}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
