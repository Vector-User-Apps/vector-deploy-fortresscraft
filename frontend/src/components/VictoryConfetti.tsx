import { useRef, useCallback, useState, useEffect } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  alpha: number
  decay: number
  rotation: number
  rotationSpeed: number
  shape: 'rect' | 'circle' | 'diamond'
}

const COLORS = [
  '#C8963E',
  '#D4A24C',
  '#E8DFC8',
  '#5CAD6A',
  '#8B5E3C',
  '#7A2E2E',
  '#A67C52',
  '#D4C4A0',
]

const SHAPES: Particle['shape'][] = ['rect', 'circle', 'diamond']

function createParticle(cx: number, cy: number): Particle {
  const angle = Math.random() * Math.PI * 2
  const speed = 2 + Math.random() * 6
  return {
    x: cx,
    y: cy,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 3,
    size: 3 + Math.random() * 5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    alpha: 1,
    decay: 0.012 + Math.random() * 0.012,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.2,
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
  }
}

const STYLES = `
  .vc-canvas {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 1000;
  }

  .vc-btn {
    position: relative;
    width: 260px;
    margin-top: 0.55rem;
    background: transparent;
    border: 1px solid rgba(200,150,62,0.22);
    color: rgba(232,223,200,0.5);
    font-family: 'Lora', serif;
    font-size: 0.58rem;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    padding: 0.65rem 0;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s, background 0.15s, box-shadow 0.2s;
    overflow: hidden;
  }

  .vc-btn:hover {
    border-color: rgba(200,150,62,0.55);
    color: rgba(232,223,200,0.9);
    background: rgba(200,150,62,0.05);
    box-shadow: 0 0 20px rgba(200,150,62,0.1);
  }

  .vc-btn:active {
    transform: scale(0.97);
  }

  .vc-btn.vc-firing {
    border-color: rgba(200,150,62,0.7);
    color: #C8963E;
    background: rgba(200,150,62,0.08);
    box-shadow: 0 0 30px rgba(200,150,62,0.2);
  }

  .vc-btn-flash {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(200,150,62,0.2), transparent);
    transform: translateX(-100%);
  }
  .vc-btn.vc-firing .vc-btn-flash {
    animation: vc-flash 0.4s ease-out;
  }
  @keyframes vc-flash {
    from { transform: translateX(-100%); }
    to   { transform: translateX(100%); }
  }
`

export function VictoryConfetti() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const animFrameRef = useRef<number>(0)
  const [firing, setFiring] = useState(false)

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const particles = particlesRef.current
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.12 // gravity
      p.vx *= 0.99
      p.alpha -= p.decay
      p.rotation += p.rotationSpeed

      if (p.alpha <= 0) {
        particles.splice(i, 1)
        continue
      }

      ctx.save()
      ctx.globalAlpha = p.alpha
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)
      ctx.fillStyle = p.color

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
      } else if (p.shape === 'circle') {
        ctx.beginPath()
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.beginPath()
        ctx.moveTo(0, -p.size / 2)
        ctx.lineTo(p.size / 2, 0)
        ctx.lineTo(0, p.size / 2)
        ctx.lineTo(-p.size / 2, 0)
        ctx.closePath()
        ctx.fill()
      }

      ctx.restore()
    }

    if (particles.length > 0) {
      animFrameRef.current = requestAnimationFrame(animate)
    } else {
      setFiring(false)
    }
  }, [])

  const fire = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Burst from center of viewport
    const cx = window.innerWidth / 2
    const cy = window.innerHeight / 2

    const count = 80 + Math.floor(Math.random() * 40)
    for (let i = 0; i < count; i++) {
      particlesRef.current.push(createParticle(cx, cy))
    }

    setFiring(true)
    cancelAnimationFrame(animFrameRef.current)
    animFrameRef.current = requestAnimationFrame(animate)
  }, [animate])

  useEffect(() => {
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [])

  return (
    <>
      <style>{STYLES}</style>
      <canvas ref={canvasRef} className="vc-canvas" />
      <button
        className={`vc-btn${firing ? ' vc-firing' : ''}`}
        onClick={fire}
        data-testid="victory-confetti-btn"
      >
        <span className="vc-btn-flash" />
        {firing ? '🗡 For the Realm!' : '🏹 Loose the Arrows'}
      </button>
    </>
  )
}
