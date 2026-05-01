import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateWave, waveHpScale, ENEMY_CONFIGS, TOWER_CONFIGS } from '@/game/constants'
import type { EnemyType, TowerType } from '@/game/types'

const ENEMY_ICONS: Record<EnemyType, string> = {
  grunt: '👹', runner: '💨', tank: '🛡️', healer: '✨', boss: '💀',
}
const TOWER_ICONS: Record<TowerType, string> = {
  arrow: '🏹', cannon: '💣', frost: '❄️', sniper: '🎯', tesla: '⚡',
}

function getRecommendedTowers(waveNum: number): TowerType[] {
  const wave = generateWave(waveNum)
  const types = new Set(wave.groups.map((g) => g.enemyType))
  const recs: TowerType[] = ['arrow'] // always useful
  if (types.has('runner')) recs.push('frost')
  if (types.has('grunt') && waveNum > 3) recs.push('cannon')
  if (types.has('tank') || types.has('boss')) recs.push('sniper')
  if (types.has('healer') || wave.groups.length >= 3) recs.push('tesla')
  return [...new Set(recs)]
}

function getDifficulty(waveNum: number): { label: string; color: string; pct: number } {
  if (waveNum % 10 === 0) return { label: 'SIEGE LORD', color: '#C44B3F', pct: 100 }
  if (waveNum <= 3) return { label: 'SKIRMISH', color: '#5CAD6A', pct: 20 }
  if (waveNum <= 6) return { label: 'RAID', color: '#D4A24C', pct: 40 }
  if (waveNum <= 12) return { label: 'ASSAULT', color: '#C8963E', pct: 65 }
  if (waveNum <= 20) return { label: 'ONSLAUGHT', color: '#C44B3F', pct: 85 }
  return { label: 'APOCALYPSE', color: '#9B2C2C', pct: 95 }
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Lora:wght@400;500;700&display=swap');

  .wf {
    min-height: 100vh;
    background: #0F1A0E;
    color: #E8DFC8;
    font-family: 'Lora', serif;
    position: relative;
    overflow-x: hidden;
  }
  .wf::after {
    content: '';
    position: fixed; inset: 0; pointer-events: none; z-index: 50;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px);
  }
  .wf-stripe {
    position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 100;
    background: repeating-linear-gradient(90deg, #C8963E 0, #C8963E 14px, #142212 14px, #142212 28px);
    animation: wf-s 0.8s linear infinite;
    box-shadow: 0 0 18px rgba(200,150,62,0.55);
  }
  @keyframes wf-s { from { background-position: 0 0; } to { background-position: 28px 0; } }
  .wf-grid-bg {
    position: fixed; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(200,150,62,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(200,150,62,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
  }
  .wf-back {
    position: fixed; top: 10px; left: 16px; z-index: 200;
    background: transparent;
    border: 1px solid rgba(200,150,62,0.25);
    color: rgba(232,223,200,0.5);
    font-family: 'Lora', serif;
    font-size: 0.55rem; letter-spacing: 0.2em; text-transform: uppercase;
    padding: 5px 14px; cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
  }
  .wf-back:hover { border-color: rgba(200,150,62,0.6); color: rgba(232,223,200,0.9); }
  .wf-content {
    max-width: 960px; margin: 0 auto;
    padding: 5rem 1.5rem 3rem;
    position: relative; z-index: 10;
    animation: wf-in 0.6s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes wf-in {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .wf-label {
    font-size: 0.52rem; letter-spacing: 0.45em; text-transform: uppercase;
    color: #C8963E; opacity: 0.8; margin-bottom: 0.5rem;
    display: flex; align-items: center; gap: 0.5rem;
  }
  .wf-label::before { content: ''; width: 18px; height: 1px; background: #C8963E; opacity: 0.5; }
  .wf-title {
    font-family: 'Cinzel', serif;
    font-size: clamp(1.8rem, 4vw, 2.8rem);
    color: #E8DFC8; text-shadow: 0 0 24px rgba(200,150,62,0.2);
    margin-bottom: 0.4rem;
  }
  .wf-subtitle {
    font-size: 0.72rem; letter-spacing: 0.08em;
    color: rgba(232,223,200,0.4); margin-bottom: 2rem;
  }

  /* Wave number slider */
  .wf-slider-wrap {
    display: flex; align-items: center; gap: 1rem;
    margin-bottom: 2rem;
    padding: 1rem 1.5rem;
    border: 1px solid rgba(200,150,62,0.15);
    background: rgba(200,150,62,0.03);
  }
  .wf-slider-label {
    font-size: 0.5rem; letter-spacing: 0.3em; text-transform: uppercase;
    color: rgba(232,223,200,0.35); flex-shrink: 0;
  }
  .wf-slider-num {
    font-family: 'Cinzel', serif;
    font-size: 1.6rem; color: #C8963E;
    text-shadow: 0 0 12px rgba(200,150,62,0.5);
    min-width: 48px; text-align: center; flex-shrink: 0;
  }
  .wf-slider {
    flex: 1;
    -webkit-appearance: none; appearance: none;
    height: 3px; background: rgba(200,150,62,0.15);
    outline: none; cursor: pointer;
  }
  .wf-slider::-webkit-slider-thumb {
    -webkit-appearance: none; appearance: none;
    width: 14px; height: 14px;
    background: #C8963E;
    border: none;
    box-shadow: 0 0 10px rgba(200,150,62,0.6);
    cursor: pointer;
  }
  .wf-slider::-moz-range-thumb {
    width: 14px; height: 14px;
    background: #C8963E; border: none;
    box-shadow: 0 0 10px rgba(200,150,62,0.6);
    cursor: pointer;
  }
  .wf-nav-btn {
    background: transparent;
    border: 1px solid rgba(200,150,62,0.25);
    color: rgba(232,223,200,0.5);
    font-family: 'Lora', serif;
    font-size: 0.75rem;
    width: 28px; height: 28px;
    cursor: pointer;
    transition: all 0.15s;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .wf-nav-btn:hover { border-color: rgba(200,150,62,0.5); color: rgba(232,223,200,0.9); }
  .wf-nav-btn:disabled { opacity: 0.3; cursor: default; }

  /* Dossier */
  .wf-panel {
    border: 1px solid rgba(200,150,62,0.18);
    background: rgba(200,150,62,0.08);
    animation: wf-panel-in 0.3s ease both;
  }
  @keyframes wf-panel-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* Difficulty + overview row */
  .wf-overview {
    display: grid; grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 1px; background: rgba(200,150,62,0.1);
  }
  @media (max-width: 550px) { .wf-overview { grid-template-columns: 1fr 1fr; } }
  .wf-ov-cell {
    background: #142212;
    padding: 1.2rem 1rem;
    text-align: center;
    transition: background 0.15s;
  }
  .wf-ov-cell:hover { background: rgba(200,150,62,0.04); }
  .wf-ov-val {
    font-family: 'Cinzel', serif;
    font-size: 1.15rem; line-height: 1; display: block;
  }
  .wf-ov-lbl {
    font-size: 0.45rem; letter-spacing: 0.25em; text-transform: uppercase;
    color: rgba(232,223,200,0.3);
    margin-top: 0.3rem; display: block;
  }

  /* Enemy breakdown */
  .wf-enemies-header {
    background: #142212;
    padding: 1rem 1.5rem;
    border-top: 1px solid rgba(200,150,62,0.1);
    font-size: 0.5rem; letter-spacing: 0.3em; text-transform: uppercase;
    color: rgba(232,223,200,0.3);
  }
  .wf-enemy-rows {
    background: rgba(200,150,62,0.08);
  }
  .wf-enemy-row {
    display: grid;
    grid-template-columns: 50px 1fr 80px 80px 80px;
    align-items: center;
    gap: 1px;
    background: rgba(200,150,62,0.08);
  }
  @media (max-width: 550px) {
    .wf-enemy-row { grid-template-columns: 40px 1fr 60px 60px; }
    .wf-enemy-row > :nth-child(5) { display: none; }
  }
  .wf-er-cell {
    background: #142212;
    padding: 0.75rem 0.8rem;
    transition: background 0.15s;
  }
  .wf-enemy-row:hover .wf-er-cell { background: rgba(200,150,62,0.04); }
  .wf-er-icon { font-size: 1.3rem; text-align: center; display: block; }
  .wf-er-name {
    font-family: 'Cinzel', serif;
    font-size: 0.78rem; color: #E8DFC8;
    display: block;
  }
  .wf-er-sub {
    font-size: 0.5rem; letter-spacing: 0.15em;
    color: rgba(232,223,200,0.3);
  }
  .wf-er-stat {
    font-family: 'Cinzel', serif;
    font-size: 0.8rem;
    text-align: center;
    display: block;
  }
  .wf-er-stat-lbl {
    font-size: 0.4rem; letter-spacing: 0.2em; text-transform: uppercase;
    color: rgba(232,223,200,0.25); text-align: center;
    display: block;
  }

  /* Recommended towers */
  .wf-recs {
    background: #142212;
    border-top: 1px solid rgba(200,150,62,0.1);
    padding: 1.25rem 1.5rem;
    display: flex; align-items: center; gap: 1.25rem;
    flex-wrap: wrap;
  }
  .wf-recs-label {
    font-size: 0.48rem; letter-spacing: 0.35em; text-transform: uppercase;
    color: rgba(232,223,200,0.3);
    flex-shrink: 0;
  }
  .wf-rec-tower {
    display: flex; align-items: center; gap: 0.4rem;
    padding: 0.3rem 0.65rem;
    border: 1px solid var(--rc, rgba(200,150,62,0.25));
    background: rgba(200,150,62,0.03);
    transition: background 0.15s, border-color 0.15s;
  }
  .wf-rec-tower:hover { background: rgba(200,150,62,0.06); border-color: var(--rc, #C8963E); }
  .wf-rec-icon { font-size: 0.9rem; }
  .wf-rec-name {
    font-size: 0.5rem; letter-spacing: 0.2em; text-transform: uppercase;
    color: rgba(232,223,200,0.6);
  }

  /* Visual timeline */
  .wf-timeline {
    background: #142212;
    border-top: 1px solid rgba(200,150,62,0.1);
    padding: 1.25rem 1.5rem;
  }
  .wf-timeline-label {
    font-size: 0.48rem; letter-spacing: 0.35em; text-transform: uppercase;
    color: rgba(232,223,200,0.3); margin-bottom: 0.75rem;
  }
  .wf-timeline-bar {
    display: flex; height: 28px; overflow: hidden;
    border: 1px solid rgba(200,150,62,0.12);
  }
  .wf-tl-segment {
    display: flex; align-items: center; justify-content: center;
    font-size: 0.8rem;
    transition: opacity 0.15s;
    position: relative;
    overflow: hidden;
  }
  .wf-tl-segment::after {
    content: '';
    position: absolute; right: 0; top: 0; bottom: 0; width: 1px;
    background: rgba(0,0,0,0.3);
  }
  .wf-tl-segment:last-child::after { display: none; }
`

export function WaveForecast() {
  const navigate = useNavigate()
  const [waveNum, setWaveNum] = useState(1)

  const waveData = useMemo(() => {
    const wave = generateWave(waveNum)
    const scale = waveHpScale(waveNum)
    const groups = wave.groups.map((g) => {
      const cfg = ENEMY_CONFIGS[g.enemyType]
      const scaledHp = Math.round(cfg.baseHp * scale)
      return {
        ...g,
        cfg,
        scaledHp,
        totalHp: scaledHp * g.count,
        icon: ENEMY_ICONS[g.enemyType as EnemyType],
      }
    })
    const totalEnemies = groups.reduce((s, g) => s + g.count, 0)
    const totalHp = groups.reduce((s, g) => s + g.totalHp, 0)
    const difficulty = getDifficulty(waveNum)
    const recommended = getRecommendedTowers(waveNum)
    return { groups, totalEnemies, totalHp, difficulty, recommended }
  }, [waveNum])

  // Timeline: proportional segments for each group
  const totalUnits = waveData.groups.reduce((s, g) => s + g.count, 0)

  return (
    <>
      <style>{STYLES}</style>
      <div className="wf" data-testid="wave-forecast-page">
        <div className="wf-stripe" />
        <div className="wf-grid-bg" />
        <button className="wf-back" onClick={() => navigate('/play')}>← Back</button>

        <div className="wf-content">
          <div className="wf-label">Seer's Counsel</div>
          <h1 className="wf-title">Scout Report</h1>
          <p className="wf-subtitle">
            Foresee the dark creatures that march upon thy realm. Prepare thy defenses wisely.
          </p>

          {/* Wave selector */}
          <div className="wf-slider-wrap">
            <span className="wf-slider-label">Wave</span>
            <button
              className="wf-nav-btn"
              disabled={waveNum <= 1}
              onClick={() => setWaveNum((n) => Math.max(1, n - 1))}
            >◀</button>
            <span className="wf-slider-num">{String(waveNum).padStart(2, '0')}</span>
            <input
              type="range"
              className="wf-slider"
              min={1}
              max={30}
              value={waveNum}
              onChange={(e) => setWaveNum(Number(e.target.value))}
            />
            <button
              className="wf-nav-btn"
              disabled={waveNum >= 30}
              onClick={() => setWaveNum((n) => Math.min(30, n + 1))}
            >▶</button>
          </div>

          {/* Panel */}
          <div key={waveNum} className="wf-panel">
            {/* Overview stats */}
            <div className="wf-overview">
              <div className="wf-ov-cell">
                <span className="wf-ov-val" style={{ color: waveData.difficulty.color }}>
                  {waveData.difficulty.label}
                </span>
                <span className="wf-ov-lbl">Threat</span>
              </div>
              <div className="wf-ov-cell">
                <span className="wf-ov-val" style={{ color: '#C8963E', textShadow: '0 0 8px rgba(200,150,62,0.4)' }}>
                  {waveData.totalEnemies}
                </span>
                <span className="wf-ov-lbl">Dark Creatures</span>
              </div>
              <div className="wf-ov-cell">
                <span className="wf-ov-val" style={{ color: '#C44B3F', textShadow: '0 0 8px rgba(196,75,63,0.3)' }}>
                  {waveData.totalHp.toLocaleString()}
                </span>
                <span className="wf-ov-lbl">Total Vitality</span>
              </div>
              <div className="wf-ov-cell">
                <span className="wf-ov-val" style={{ color: '#D4A24C', textShadow: '0 0 8px rgba(212,162,76,0.3)' }}>
                  ×{waveHpScale(waveNum).toFixed(2)}
                </span>
                <span className="wf-ov-lbl">HP Scale</span>
              </div>
            </div>

            {/* Enemy breakdown */}
            <div className="wf-enemies-header">Creature Composition</div>
            <div className="wf-enemy-rows">
              {waveData.groups.map((g, i) => (
                <div key={i} className="wf-enemy-row">
                  <div className="wf-er-cell" style={{ textAlign: 'center' }}>
                    <span className="wf-er-icon">{g.icon}</span>
                  </div>
                  <div className="wf-er-cell">
                    <span className="wf-er-name">{g.cfg.name}</span>
                    <span className="wf-er-sub">{g.count} beasts · {g.scaledHp} HP each</span>
                  </div>
                  <div className="wf-er-cell" style={{ textAlign: 'center' }}>
                    <span className="wf-er-stat" style={{ color: g.cfg.color }}>{g.totalHp.toLocaleString()}</span>
                    <span className="wf-er-stat-lbl">Total HP</span>
                  </div>
                  <div className="wf-er-cell" style={{ textAlign: 'center' }}>
                    <span className="wf-er-stat" style={{ color: '#D4A24C' }}>⬡ {g.cfg.reward * g.count}</span>
                    <span className="wf-er-stat-lbl">Gold Bounty</span>
                  </div>
                  <div className="wf-er-cell" style={{ textAlign: 'center' }}>
                    <span className="wf-er-stat" style={{ color: '#C44B3F' }}>{g.cfg.liveCost * g.count}</span>
                    <span className="wf-er-stat-lbl">Breach Cost</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual composition timeline */}
            <div className="wf-timeline">
              <div className="wf-timeline-label">Horde Composition</div>
              <div className="wf-timeline-bar">
                {waveData.groups.map((g, i) => (
                  <div
                    key={i}
                    className="wf-tl-segment"
                    style={{
                      flex: g.count / totalUnits,
                      background: g.cfg.color + '30',
                    }}
                    title={`${g.cfg.name} × ${g.count}`}
                  >
                    {g.count >= 3 && g.icon}
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended towers */}
            <div className="wf-recs">
              <span className="wf-recs-label">Counsel</span>
              {waveData.recommended.map((key) => {
                const tc = TOWER_CONFIGS[key]
                return (
                  <div
                    key={key}
                    className="wf-rec-tower"
                    style={{ '--rc': tc.color } as React.CSSProperties}
                  >
                    <span className="wf-rec-icon">{TOWER_ICONS[key]}</span>
                    <span className="wf-rec-name">{tc.name.replace(' Tower', '')}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
