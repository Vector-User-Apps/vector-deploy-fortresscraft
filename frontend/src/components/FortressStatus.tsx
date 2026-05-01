import { useState, useEffect, useRef } from 'react'

const STYLES = `
  .fs-widget {
    width: 260px;
    margin-top: 1.5rem;
    border: 1px solid rgba(200,150,62,0.18);
    background: rgba(200,150,62,0.02);
    position: relative;
    overflow: hidden;
  }

  /* Corner accents */
  .fs-widget::before,
  .fs-widget::after {
    content: '';
    position: absolute;
    width: 8px;
    height: 8px;
    border-color: rgba(200,150,62,0.5);
    border-style: solid;
    pointer-events: none;
  }
  .fs-widget::before {
    top: -1px; left: -1px;
    border-width: 1px 0 0 1px;
  }
  .fs-widget::after {
    bottom: -1px; right: -1px;
    border-width: 0 1px 1px 0;
  }

  /* Header bar */
  .fs-header {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.45rem 0.65rem;
    border-bottom: 1px solid rgba(200,150,62,0.12);
    background: rgba(200,150,62,0.04);
  }
  .fs-header-dot {
    width: 4px; height: 4px;
    border-radius: 50%;
    background: #C8963E;
    box-shadow: 0 0 6px rgba(200,150,62,0.6);
    animation: fs-pulse 2s ease infinite;
  }
  @keyframes fs-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  .fs-header-label {
    font-family: 'Lora', serif;
    font-size: 0.5rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: rgba(200,150,62,0.65);
  }
  .fs-header-time {
    margin-left: auto;
    font-family: 'Lora', serif;
    font-size: 0.45rem;
    letter-spacing: 0.15em;
    color: rgba(232,223,200,0.2);
  }

  /* Stat rows */
  .fs-stats {
    padding: 0.55rem 0.65rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .fs-stat {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
  .fs-stat-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .fs-stat-icon {
    font-size: 0.6rem;
    width: 1rem;
    text-align: center;
    filter: saturate(0.6);
  }
  .fs-stat-name {
    font-family: 'Lora', serif;
    font-size: 0.5rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(232,223,200,0.4);
    flex: 1;
    margin-left: 0.35rem;
  }
  .fs-stat-val {
    font-family: 'Lora', serif;
    font-size: 0.55rem;
    letter-spacing: 0.08em;
    color: rgba(232,223,200,0.7);
    min-width: 2.5rem;
    text-align: right;
  }

  /* Bar track + fill */
  .fs-bar {
    height: 3px;
    background: rgba(200,150,62,0.08);
    border-radius: 0;
    overflow: hidden;
    position: relative;
  }
  .fs-bar-fill {
    height: 100%;
    transition: width 1.2s cubic-bezier(0.16,1,0.3,1);
    position: relative;
  }
  .fs-bar-fill.green  { background: #5CAD6A; box-shadow: 0 0 6px rgba(92,173,106,0.4); }
  .fs-bar-fill.yellow { background: #D4A24C; box-shadow: 0 0 6px rgba(212,162,76,0.4); }
  .fs-bar-fill.orange { background: #C8963E; box-shadow: 0 0 6px rgba(200,150,62,0.4); }
  .fs-bar-fill.red    { background: #C44B3F; box-shadow: 0 0 6px rgba(196,75,63,0.4); }

  /* Scan line effect across widget */
  .fs-scan {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(200,150,62,0.25), transparent);
    animation: fs-scanmove 3s linear infinite;
    pointer-events: none;
    z-index: 2;
  }
  @keyframes fs-scanmove {
    0%   { top: 0; opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }

  /* Threat level badge */
  .fs-threat {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    padding: 0.35rem 0.65rem;
    border-top: 1px solid rgba(200,150,62,0.1);
    background: rgba(200,150,62,0.02);
  }
  .fs-threat-label {
    font-family: 'Lora', serif;
    font-size: 0.42rem;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: rgba(232,223,200,0.22);
  }
  .fs-threat-level {
    font-family: 'Lora', serif;
    font-size: 0.42rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    padding: 0.1rem 0.4rem;
    border: 1px solid;
    animation: fs-threat-blink 3s ease infinite;
  }
  .fs-threat-level.low    { color: #5CAD6A; border-color: rgba(92,173,106,0.3); }
  .fs-threat-level.medium { color: #D4A24C; border-color: rgba(212,162,76,0.3); }
  .fs-threat-level.high   { color: #C44B3F; border-color: rgba(196,75,63,0.3); }
  @keyframes fs-threat-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  /* Entry animation */
  .fs-enter {
    animation: fs-fadein 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s both;
  }
  @keyframes fs-fadein {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`

interface StatDef {
  icon: string
  name: string
  value: number
  max: number
  unit: string
}

function getBarColor(pct: number): string {
  if (pct >= 75) return 'green'
  if (pct >= 50) return 'yellow'
  if (pct >= 25) return 'orange'
  return 'red'
}

function getThreat(stats: StatDef[]): { level: string; cls: string } {
  const avgPct = stats.reduce((sum, s) => sum + (s.value / s.max) * 100, 0) / stats.length
  if (avgPct >= 70) return { level: 'Peaceful', cls: 'low' }
  if (avgPct >= 45) return { level: 'Besieged', cls: 'medium' }
  return { level: 'Under Siege', cls: 'high' }
}

export function FortressStatus() {
  const [stats, setStats] = useState<StatDef[]>([
    { icon: '🏰', name: 'Keep HP', value: 0, max: 100, unit: '%' },
    { icon: '🧱', name: 'Stone Walls', value: 0, max: 100, unit: '%' },
    { icon: '⚔', name: 'Garrison', value: 0, max: 48, unit: '' },
    { icon: '✨', name: 'Mana Pool', value: 0, max: 500, unit: '' },
  ])
  const [time, setTime] = useState('')
  const initialized = useRef(false)

  // Animate in random values on mount
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    const timer = setTimeout(() => {
      setStats([
        { icon: '🏰', name: 'Keep HP', value: 72 + Math.floor(Math.random() * 20), max: 100, unit: '%' },
        { icon: '🧱', name: 'Stone Walls', value: 55 + Math.floor(Math.random() * 35), max: 100, unit: '%' },
        { icon: '⚔', name: 'Garrison', value: 28 + Math.floor(Math.random() * 18), max: 48, unit: '' },
        { icon: '✨', name: 'Mana Pool', value: 200 + Math.floor(Math.random() * 250), max: 500, unit: '' },
      ])
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  // Live clock
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(
        now.getHours().toString().padStart(2, '0') + ':' +
        now.getMinutes().toString().padStart(2, '0') + ':' +
        now.getSeconds().toString().padStart(2, '0')
      )
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // Subtle drift every 4s
  useEffect(() => {
    const id = setInterval(() => {
      setStats(prev =>
        prev.map(s => {
          const drift = Math.floor(Math.random() * 5) - 2
          const next = Math.max(1, Math.min(s.max, s.value + drift))
          return { ...s, value: next }
        })
      )
    }, 4000)
    return () => clearInterval(id)
  }, [])

  const threat = getThreat(stats)

  return (
    <>
      <style>{STYLES}</style>
      <div className="fs-widget fs-enter" data-testid="fortress-status">
        <div className="fs-scan" />

        <div className="fs-header">
          <div className="fs-header-dot" />
          <span className="fs-header-label">Castle Status</span>
          <span className="fs-header-time">{time}</span>
        </div>

        <div className="fs-stats">
          {stats.map(s => {
            const pct = Math.round((s.value / s.max) * 100)
            return (
              <div className="fs-stat" key={s.name}>
                <div className="fs-stat-row">
                  <span className="fs-stat-icon">{s.icon}</span>
                  <span className="fs-stat-name">{s.name}</span>
                  <span className="fs-stat-val">
                    {s.value}{s.unit}{s.unit !== '%' ? ` / ${s.max}` : ''}
                  </span>
                </div>
                <div className="fs-bar">
                  <div
                    className={`fs-bar-fill ${getBarColor(pct)}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="fs-threat">
          <span className="fs-threat-label">Threat Level</span>
          <span className={`fs-threat-level ${threat.cls}`}>{threat.level}</span>
        </div>
      </div>
    </>
  )
}
