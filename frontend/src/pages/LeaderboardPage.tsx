import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLeaderboard, type LeaderboardEntry } from '@/services/leaderboard'

const MEDALS = ['#FACC15', '#C0C0C0', '#CD7F32']
const MEDAL_LABELS = ['1ST', '2ND', '3RD']
const MEDAL_GLOW = [
  'rgba(250,204,21,0.25)',
  'rgba(192,192,192,0.2)',
  'rgba(205,127,50,0.2)',
]

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');

  .lb {
    min-height: 100vh;
    background: #0F1A0E;
    color: #E8DFC8;
    font-family: 'Lora', serif;
    position: relative;
    overflow-x: hidden;
  }

  .lb-stripe {
    position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 100;
    background: linear-gradient(90deg, #2A1E0A, #C8963E, #2A1E0A);
    box-shadow: 0 0 12px rgba(200,150,62,0.3);
  }

  .lb-grid {
    position: fixed; inset: 0; pointer-events: none;
    background: rgba(200,150,62,0.02);
  }

  .lb-back {
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
  .lb-back:hover {
    border-color: rgba(200,150,62,0.6);
    color: rgba(232,223,200,0.9);
  }

  .lb-content {
    max-width: 720px;
    margin: 0 auto;
    padding: 5rem 1.5rem 3rem;
    position: relative;
    z-index: 10;
    animation: lb-fadein 0.6s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes lb-fadein {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .lb-sec-label {
    font-size: 0.52rem;
    letter-spacing: 0.45em;
    text-transform: uppercase;
    color: #C8963E;
    opacity: 0.8;
    margin-bottom: 0.5rem;
    display: flex; align-items: center; gap: 0.5rem;
  }
  .lb-sec-label::before {
    content: ''; width: 18px; height: 1px; background: #C8963E; opacity: 0.5;
  }

  .lb-title {
    font-family: 'Cinzel', serif;
    font-size: clamp(1.8rem, 4vw, 2.8rem);
    color: #fff;
    text-shadow: 0 0 24px rgba(200,150,62,0.2);
    margin-bottom: 0.5rem;
  }

  .lb-subtitle {
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    color: rgba(232,223,200,0.45);
    line-height: 1.6;
    margin-bottom: 2rem;
  }

  /* Podium */
  .lb-podium {
    display: flex;
    gap: 1px;
    background: rgba(200,150,62,0.1);
    border: 1px solid rgba(200,150,62,0.15);
    margin-bottom: 1px;
    align-items: stretch;
  }
  .lb-podium-card {
    flex: 1;
    background: #142212;
    padding: 1.2rem 0.75rem;
    text-align: center;
    position: relative;
    overflow: hidden;
    transition: background 0.2s;
  }
  .lb-podium-card:hover {
    background: rgba(200,150,62,0.04);
  }
  .lb-podium-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: var(--medal-color);
    box-shadow: 0 0 10px var(--medal-glow);
  }
  .lb-podium-card.first {
    flex: 1.15;
    padding: 1.5rem 0.75rem;
  }
  .lb-podium-rank {
    font-family: 'Cinzel', serif;
    font-size: 1.2rem;
    color: var(--medal-color);
    text-shadow: 0 0 8px var(--medal-glow);
    margin-bottom: 0.3rem;
    line-height: 1;
  }
  .lb-podium-card.first .lb-podium-rank {
    font-size: 1.6rem;
  }
  .lb-podium-name {
    font-size: 0.7rem;
    color: #E8DFC8;
    margin-bottom: 0.4rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .lb-podium-score {
    font-family: 'Cinzel', serif;
    font-size: 0.95rem;
    color: var(--medal-color);
    text-shadow: 0 0 6px var(--medal-glow);
    line-height: 1;
  }
  .lb-podium-card.first .lb-podium-score {
    font-size: 1.15rem;
  }
  .lb-podium-wave {
    font-size: 0.45rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(232,223,200,0.3);
    margin-top: 0.35rem;
  }

  /* Table */
  .lb-table {
    border: 1px solid rgba(200,150,62,0.15);
    border-top: none;
    overflow: hidden;
    animation: lb-fadein 0.6s cubic-bezier(0.16,1,0.3,1) both 0.15s;
  }
  .lb-table-head {
    display: grid;
    grid-template-columns: 48px 1fr 100px 60px;
    padding: 8px 16px;
    background: rgba(200,150,62,0.06);
    border-bottom: 1px solid rgba(200,150,62,0.12);
  }
  .lb-table-head span {
    font-size: 0.48rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: rgba(232,223,200,0.35);
  }
  .lb-row {
    display: grid;
    grid-template-columns: 48px 1fr 100px 60px;
    padding: 10px 16px;
    border-bottom: 1px solid rgba(200,150,62,0.06);
    transition: background 0.15s;
  }
  .lb-row:last-child { border-bottom: none; }
  .lb-row:hover { background: rgba(200,150,62,0.04); }
  .lb-row-rank {
    font-size: 0.7rem;
    color: rgba(232,223,200,0.35);
  }
  .lb-row-name {
    font-size: 0.72rem;
    color: #E8DFC8;
  }
  .lb-row-score {
    font-family: 'Cinzel', serif;
    font-size: 0.8rem;
    color: #D4A24C;
    text-shadow: 0 0 6px rgba(212,162,76,0.3);
  }
  .lb-row-wave {
    font-size: 0.65rem;
    color: rgba(232,223,200,0.35);
  }

  .lb-empty {
    text-align: center;
    color: rgba(232,223,200,0.35);
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    padding: 3rem 0;
  }

  .lb-loading {
    text-align: center;
    font-size: 0.55rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: #C8963E;
    opacity: 0.6;
    padding: 3rem 0;
  }

  .lb-error {
    text-align: center;
    color: #F87171;
    font-size: 0.72rem;
    padding: 3rem 0;
  }

  @media (max-width: 500px) {
    .lb-podium { flex-direction: column; }
    .lb-podium-card.first { flex: 1; }
    .lb-table-head,
    .lb-row { grid-template-columns: 36px 1fr 80px 50px; padding: 8px 12px; }
  }
`

export function LeaderboardPage() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getLeaderboard()
      .then(setEntries)
      .catch(() => setError('Failed to load leaderboard.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <style>{STYLES}</style>
      <div className="lb" data-testid="leaderboard-page">
        <div className="lb-stripe" />
        <div className="lb-grid" />

        <button className="lb-back" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="lb-content">
          <div className="lb-sec-label">Chronicle of Heroes</div>
          <h1 className="lb-title">Leaderboard</h1>
          <p className="lb-subtitle">
            The greatest heroes of the realm, ranked by their valor.
          </p>

          {loading && <div className="lb-loading">Loading scores...</div>}
          {error && <div className="lb-error">{error}</div>}

          {!loading && !error && entries.length === 0 && (
            <div className="lb-empty">No heroes have yet inscribed their names. Be the first.</div>
          )}

          {!loading && entries.length > 0 && (
            <div data-testid="leaderboard.table">
              {entries.slice(0, 3).length > 0 && (
                <div className="lb-podium">
                  {[1, 0, 2].map((podiumIdx) => {
                    const entry = entries[podiumIdx]
                    if (!entry) return null
                    return (
                      <div
                        key={entry.id}
                        className={`lb-podium-card${podiumIdx === 0 ? ' first' : ''}`}
                        style={{
                          '--medal-color': MEDALS[podiumIdx],
                          '--medal-glow': MEDAL_GLOW[podiumIdx],
                        } as React.CSSProperties}
                      >
                        <div className="lb-podium-rank">{MEDAL_LABELS[podiumIdx]}</div>
                        <div className="lb-podium-name">{entry.player_name}</div>
                        <div className="lb-podium-score">{entry.score.toLocaleString()}</div>
                        <div className="lb-podium-wave">Wave {entry.wave_reached}</div>
                      </div>
                    )
                  })}
                </div>
              )}

              {entries.length > 3 && (
                <div className="lb-table">
                  <div className="lb-table-head">
                    <span>#</span>
                    <span>Player</span>
                    <span>Score</span>
                    <span>Wave</span>
                  </div>
                  {entries.slice(3).map((entry, i) => (
                    <div key={entry.id} className="lb-row">
                      <span className="lb-row-rank">{i + 4}</span>
                      <span className="lb-row-name">{entry.player_name}</span>
                      <span className="lb-row-score">{entry.score.toLocaleString()}</span>
                      <span className="lb-row-wave">{entry.wave_reached}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
