import { useRef, useEffect, useState, useCallback } from 'react'

interface Blip {
  angle: number
  dist: number
  alpha: number
  label: string
}

const THREAT_LABELS = [
  'GOBLIN SCOUT',
  'ORC VANGUARD',
  'SIEGE GOLEM',
  'DARK MAGE',
  'WYVERN',
  'SKELETON HORDE',
  'TROLL BERSERKER',
  'SHADOW WRAITH',
  'FLAME IMP',
  'FROST GIANT',
  'NECROMANCER',
  'BANDIT RAIDER',
]

const STYLES = `
  .tr-widget {
    width: 260px;
    margin-top: 1.4rem;
    perspective: 600px;
  }

  .tr-card {
    border: 1px solid rgba(200,150,62,0.18);
    background: rgba(200,150,62,0.03);
    padding: 0.85rem 1rem 0.7rem;
    position: relative;
    overflow: hidden;
  }

  .tr-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(200,150,62,0.35), transparent);
  }

  .tr-header {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    margin-bottom: 0.6rem;
  }

  .tr-icon {
    width: 14px;
    height: 14px;
    border: 1px solid rgba(200,150,62,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.5rem;
    flex-shrink: 0;
  }

  .tr-label {
    font-family: 'Lora', serif;
    font-size: 0.5rem;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: rgba(200,150,62,0.55);
  }

  .tr-status {
    margin-left: auto;
    font-family: 'Lora', serif;
    font-size: 0.42rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    animation: tr-blink 1.2s step-end infinite;
  }

  .tr-status-clear { color: rgba(92,173,106,0.6); }
  .tr-status-warn  { color: rgba(200,150,62,0.7); }

  @keyframes tr-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  .tr-canvas-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 0.55rem;
  }

  .tr-canvas {
    border-radius: 50%;
    box-shadow: 0 0 12px rgba(200,150,62,0.08), inset 0 0 20px rgba(0,0,0,0.4);
  }

  .tr-threat-log {
    font-family: 'Lora', serif;
    font-size: 0.48rem;
    line-height: 1.55;
    color: rgba(232,223,200,0.35);
    letter-spacing: 0.08em;
    min-height: 2.4rem;
  }

  .tr-threat-line {
    display: flex;
    gap: 0.4rem;
    animation: tr-fadein 0.3s ease-out;
  }

  .tr-threat-time {
    color: rgba(200,150,62,0.3);
    flex-shrink: 0;
  }

  .tr-threat-name {
    color: rgba(200,150,62,0.6);
  }

  .tr-threat-dist {
    margin-left: auto;
    color: rgba(232,223,200,0.25);
    flex-shrink: 0;
  }

  @keyframes tr-fadein {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .tr-divider {
    height: 1px;
    background: rgba(200,150,62,0.1);
    margin-bottom: 0.5rem;
  }

  .tr-enter {
    animation: tr-slidein 0.5s cubic-bezier(0.16,1,0.3,1) both;
    animation-delay: 0.15s;
  }
  @keyframes tr-slidein {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`

const SIZE = 140
const CENTER = SIZE / 2
const RADIUS = 58

function drawRadar(
  ctx: CanvasRenderingContext2D,
  sweepAngle: number,
  blips: Blip[],
) {
  const dpr = window.devicePixelRatio || 1
  ctx.clearRect(0, 0, SIZE * dpr, SIZE * dpr)
  ctx.save()
  ctx.scale(dpr, dpr)

  const cx = CENTER
  const cy = CENTER

  // Background circles
  for (let i = 1; i <= 3; i++) {
    const r = (RADIUS / 3) * i
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(200,150,62,${i === 3 ? 0.15 : 0.08})`
    ctx.lineWidth = 0.5
    ctx.stroke()
  }

  // Crosshairs
  ctx.strokeStyle = 'rgba(200,150,62,0.06)'
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.moveTo(cx - RADIUS, cy)
  ctx.lineTo(cx + RADIUS, cy)
  ctx.moveTo(cx, cy - RADIUS)
  ctx.lineTo(cx, cy + RADIUS)
  ctx.stroke()

  // Sweep trail (gradient arc)
  const trailLength = Math.PI * 0.55
  const gradient = ctx.createConicGradient(sweepAngle - trailLength, cx, cy)
  gradient.addColorStop(0, 'rgba(200,150,62,0)')
  gradient.addColorStop(0.7, 'rgba(200,150,62,0.06)')
  gradient.addColorStop(1, 'rgba(200,150,62,0.18)')

  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.arc(cx, cy, RADIUS, sweepAngle - trailLength, sweepAngle)
  ctx.closePath()
  ctx.fillStyle = gradient
  ctx.fill()

  // Sweep line
  const sx = cx + Math.cos(sweepAngle) * RADIUS
  const sy = cy + Math.sin(sweepAngle) * RADIUS
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(sx, sy)
  ctx.strokeStyle = 'rgba(200,150,62,0.5)'
  ctx.lineWidth = 1
  ctx.stroke()

  // Blips
  for (const blip of blips) {
    const bx = cx + Math.cos(blip.angle) * blip.dist * RADIUS
    const by = cy + Math.sin(blip.angle) * blip.dist * RADIUS
    const a = blip.alpha

    // Glow
    ctx.beginPath()
    ctx.arc(bx, by, 4, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(200,150,62,${a * 0.15})`
    ctx.fill()

    // Dot
    ctx.beginPath()
    ctx.arc(bx, by, 1.5, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(200,150,62,${a * 0.8})`
    ctx.fill()
  }

  // Center dot
  ctx.beginPath()
  ctx.arc(cx, cy, 2, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(200,150,62,0.6)'
  ctx.fill()

  ctx.restore()
}

export function ThreatRadar() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sweepRef = useRef(0)
  const blipsRef = useRef<Blip[]>([])
  const frameRef = useRef(0)
  const [entered, setEntered] = useState(false)
  const [threatLog, setThreatLog] = useState<Array<{ name: string; dist: string; time: string }>>([])
  const [threatCount, setThreatCount] = useState(0)

  const addThreat = useCallback(() => {
    const name = THREAT_LABELS[Math.floor(Math.random() * THREAT_LABELS.length)]
    const dist = (0.2 + Math.random() * 0.7).toFixed(1)
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

    setThreatLog((prev) => [{ name, dist: `${dist}km`, time }, ...prev].slice(0, 3))
    setThreatCount((c) => c + 1)

    // Add blip to radar
    blipsRef.current.push({
      angle: Math.random() * Math.PI * 2,
      dist: 0.25 + Math.random() * 0.7,
      alpha: 1,
      label: name,
    })
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 100)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!entered) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = SIZE * dpr
    canvas.height = SIZE * dpr
    canvas.style.width = `${SIZE}px`
    canvas.style.height = `${SIZE}px`

    let lastThreatTime = 0
    const THREAT_INTERVAL = 3500 + Math.random() * 2000

    const loop = (timestamp: number) => {
      sweepRef.current += 0.02
      if (sweepRef.current > Math.PI * 2) {
        sweepRef.current -= Math.PI * 2
      }

      // Decay blips
      for (let i = blipsRef.current.length - 1; i >= 0; i--) {
        blipsRef.current[i].alpha -= 0.004
        if (blipsRef.current[i].alpha <= 0) {
          blipsRef.current.splice(i, 1)
        }
      }

      // Spawn threats periodically
      if (timestamp - lastThreatTime > THREAT_INTERVAL) {
        lastThreatTime = timestamp
        addThreat()
      }

      drawRadar(ctx, sweepRef.current, blipsRef.current)
      frameRef.current = requestAnimationFrame(loop)
    }

    frameRef.current = requestAnimationFrame(loop)

    return () => cancelAnimationFrame(frameRef.current)
  }, [entered, addThreat])

  if (!entered) return null

  return (
    <>
      <style>{STYLES}</style>
      <div className="tr-widget tr-enter" data-testid="threat-radar">
        <div className="tr-card">
          <div className="tr-header">
            <div className="tr-icon">🔮</div>
            <span className="tr-label">Seer's Vision</span>
            <span className={`tr-status ${threatCount > 0 ? 'tr-status-warn' : 'tr-status-clear'}`}>
              {threatCount > 0 ? `${threatCount} Sightings` : 'Scrying'}
            </span>
          </div>

          <div className="tr-canvas-wrap">
            <canvas ref={canvasRef} className="tr-canvas" />
          </div>

          <div className="tr-divider" />

          <div className="tr-threat-log">
            {threatLog.length === 0 && (
              <span style={{ color: 'rgba(232,223,200,0.2)' }}>Gazing into the mists...</span>
            )}
            {threatLog.map((t, i) => (
              <div className="tr-threat-line" key={`${t.time}-${i}`}>
                <span className="tr-threat-time">{t.time}</span>
                <span className="tr-threat-name">{t.name}</span>
                <span className="tr-threat-dist">{t.dist}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
