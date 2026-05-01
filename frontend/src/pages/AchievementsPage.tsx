import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStats, ACHIEVEMENTS } from '@/services/achievements'

const TIER_COLORS: Record<string, { border: string; glow: string; bg: string; label: string }> = {
  bronze:    { border: 'rgba(205,127,50,0.6)',  glow: 'rgba(205,127,50,0.25)',  bg: 'rgba(205,127,50,0.06)',  label: '#CD7F32' },
  silver:    { border: 'rgba(192,192,192,0.6)',  glow: 'rgba(192,192,192,0.25)', bg: 'rgba(192,192,192,0.06)', label: '#C0C0C0' },
  gold:      { border: 'rgba(250,204,21,0.6)',   glow: 'rgba(250,204,21,0.25)',  bg: 'rgba(250,204,21,0.06)',  label: '#FACC15' },
  legendary: { border: 'rgba(200,150,62,0.7)',   glow: 'rgba(200,150,62,0.35)',  bg: 'rgba(200,150,62,0.08)',  label: '#C8963E' },
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');

  .ach {
    min-height: 100vh;
    background: #0F1A0E;
    color: #E8DFC8;
    font-family: 'Lora', serif;
    position: relative;
    overflow-x: hidden;
  }

  /* Stripe bar */
  .ach-stripe {
    position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 100;
    background: linear-gradient(90deg, #2A1E0A, #C8963E, #2A1E0A);
    box-shadow: 0 0 12px rgba(200,150,62,0.3);
  }

  /* Grid bg */
  .ach-grid {
    position: fixed; inset: 0; pointer-events: none;
    background: rgba(200,150,62,0.02);
  }

  /* Back button */
  .ach-back {
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
    display: flex; align-items: center; gap: 6px;
  }
  .ach-back:hover {
    border-color: rgba(200,150,62,0.6);
    color: rgba(232,223,200,0.9);
  }

  /* Header */
  .ach-header {
    padding: 5rem 2rem 2rem;
    max-width: 900px;
    margin: 0 auto;
    position: relative;
    z-index: 10;
    animation: ach-fadein 0.6s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes ach-fadein {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .ach-sec-label {
    font-size: 0.52rem;
    letter-spacing: 0.45em;
    text-transform: uppercase;
    color: #C8963E;
    opacity: 0.8;
    margin-bottom: 0.5rem;
    display: flex; align-items: center; gap: 0.5rem;
  }
  .ach-sec-label::before {
    content: ''; width: 18px; height: 1px; background: #C8963E; opacity: 0.5;
  }
  .ach-title {
    font-family: 'Cinzel', serif;
    font-size: clamp(1.8rem, 4vw, 2.8rem);
    color: #fff;
    text-shadow: 0 0 24px rgba(200,150,62,0.2);
    margin-bottom: 0.5rem;
  }
  .ach-subtitle {
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    color: rgba(232,223,200,0.45);
    line-height: 1.6;
    margin-bottom: 2rem;
  }

  /* Summary stats bar */
  .ach-stats {
    display: flex;
    border: 1px solid rgba(200,150,62,0.18);
    margin-bottom: 2.5rem;
    overflow: hidden;
  }
  .ach-stat {
    flex: 1;
    padding: 0.85rem 1rem;
    text-align: center;
    border-right: 1px solid rgba(200,150,62,0.12);
    transition: background 0.15s;
  }
  .ach-stat:last-child { border-right: none; }
  .ach-stat:hover { background: rgba(200,150,62,0.04); }
  .ach-stat-n {
    font-family: 'Cinzel', serif;
    font-size: 1.4rem;
    color: #C8963E;
    text-shadow: 0 0 10px rgba(200,150,62,0.4);
    line-height: 1;
    display: block;
  }
  .ach-stat-l {
    font-size: 0.48rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: rgba(232,223,200,0.35);
    margin-top: 0.2rem;
    display: block;
  }
  @media (max-width: 500px) {
    .ach-stats { flex-wrap: wrap; }
    .ach-stat { flex: 1 1 50%; }
    .ach-stat:nth-child(2) { border-right: none; }
  }

  /* Medal grid */
  .ach-medals {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1px;
    background: rgba(200,150,62,0.1);
    border: 1px solid rgba(200,150,62,0.15);
    max-width: 900px;
    margin: 0 auto 3rem;
    padding: 0;
    position: relative; z-index: 10;
    animation: ach-fadein 0.6s cubic-bezier(0.16,1,0.3,1) both 0.15s;
  }

  /* Individual medal card */
  .ach-medal {
    background: #142212;
    padding: 1.5rem;
    position: relative;
    overflow: hidden;
    transition: background 0.2s;
  }
  .ach-medal:hover { background: rgba(200,150,62,0.04); }

  /* Top accent bar */
  .ach-medal::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: var(--medal-border);
    box-shadow: 0 0 10px var(--medal-glow);
    transition: box-shadow 0.2s;
  }

  .ach-medal.locked { opacity: 0.45; }
  .ach-medal.locked:hover { background: rgba(200,150,62,0.02); }
  .ach-medal.locked .ach-medal-icon { filter: grayscale(1) brightness(0.5); }

  /* Medal layout */
  .ach-medal-top {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 0.75rem;
  }
  .ach-medal-icon {
    font-size: 1.8rem;
    filter: drop-shadow(0 0 6px var(--medal-glow));
    transition: filter 0.2s;
  }
  .ach-medal-tier {
    font-size: 0.4rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    padding: 0.1rem 0.4rem;
    border: 1px solid var(--medal-border);
    color: var(--medal-label);
  }
  .ach-medal-name {
    font-family: 'Cinzel', serif;
    font-size: 0.95rem;
    color: #fff;
    display: block;
    margin-bottom: 0.3rem;
  }
  .ach-medal-desc {
    font-size: 0.62rem;
    line-height: 1.5;
    color: rgba(232,223,200,0.45);
    margin-bottom: 0.85rem;
  }

  /* Progress bar */
  .ach-bar-wrap {
    height: 3px;
    background: rgba(200,150,62,0.1);
    position: relative;
    overflow: hidden;
  }
  .ach-bar-fill {
    height: 100%;
    background: var(--medal-label);
    box-shadow: 0 0 6px var(--medal-glow);
    transition: width 0.4s ease;
  }
  .ach-bar-pct {
    font-size: 0.45rem;
    letter-spacing: 0.2em;
    color: rgba(232,223,200,0.3);
    text-align: right;
    margin-top: 0.3rem;
  }

  /* Unlocked badge */
  .ach-unlocked-badge {
    position: absolute; top: 0.6rem; right: 0.6rem;
    font-size: 0.4rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: rgba(232,223,200,0.3);
  }
`

export function AchievementsPage() {
  const navigate = useNavigate()

  const stats = useMemo(() => getStats(), [])

  const medals = useMemo(() =>
    ACHIEVEMENTS.map((a) => ({
      ...a,
      unlocked: a.check(stats),
      pct: a.progress(stats),
    }))
  , [stats])

  const unlockedCount = medals.filter((m) => m.unlocked).length

  return (
    <>
      <style>{STYLES}</style>
      <div className="ach" data-testid="achievements-page">
        <div className="ach-stripe" />
        <div className="ach-grid" />

        <button className="ach-back" onClick={() => navigate('/play')}>
          ← Back
        </button>

        <div className="ach-header">
          <div className="ach-sec-label">Hero's Legacy</div>
          <h1 className="ach-title">Hall of Valor</h1>
          <p className="ach-subtitle">
            Earn honors through valor in battle, survival, and the destruction of dark forces.
            {' '}{unlockedCount} of {medals.length} medals unlocked.
          </p>

          {/* Stats summary */}
          <div className="ach-stats">
            <div className="ach-stat">
              <span className="ach-stat-n">{stats.bestScore.toLocaleString()}</span>
              <span className="ach-stat-l">Best Score</span>
            </div>
            <div className="ach-stat">
              <span className="ach-stat-n">{stats.bestWave}</span>
              <span className="ach-stat-l">Best Wave</span>
            </div>
            <div className="ach-stat">
              <span className="ach-stat-n">{stats.totalKills.toLocaleString()}</span>
              <span className="ach-stat-l">Total Kills</span>
            </div>
            <div className="ach-stat">
              <span className="ach-stat-n">{stats.gamesPlayed}</span>
              <span className="ach-stat-l">Games Played</span>
            </div>
          </div>
        </div>

        {/* Medal grid */}
        <div className="ach-medals">
          {medals.map((m) => {
            const tc = TIER_COLORS[m.tier]
            return (
              <div
                key={m.id}
                className={`ach-medal${m.unlocked ? '' : ' locked'}`}
                style={{
                  '--medal-border': tc.border,
                  '--medal-glow': tc.glow,
                  '--medal-bg': tc.bg,
                  '--medal-label': tc.label,
                } as React.CSSProperties}
              >
                {m.unlocked && (
                  <span className="ach-unlocked-badge">Unlocked</span>
                )}
                <div className="ach-medal-top">
                  <span className="ach-medal-icon">{m.icon}</span>
                  <span className="ach-medal-tier">{m.tier}</span>
                </div>
                <span className="ach-medal-name">{m.name}</span>
                <p className="ach-medal-desc">{m.description}</p>
                <div className="ach-bar-wrap">
                  <div
                    className="ach-bar-fill"
                    style={{ width: `${Math.round(m.pct * 100)}%` }}
                  />
                </div>
                <div className="ach-bar-pct">
                  {m.unlocked ? 'Complete' : `${Math.round(m.pct * 100)}%`}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
