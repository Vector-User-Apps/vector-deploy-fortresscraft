import { useRef, useEffect, useCallback } from 'react'
import { useGameStore } from '../state'
import {
  PATH_WAYPOINTS,
  GRID_COLS,
  GRID_ROWS,
  GRID_SIZE,
  GRID_OFFSET_X,
  GRID_OFFSET_Z,
  getPositionOnPath,
  TOWER_CONFIGS,
} from '../constants'

// Map world bounds
const WORLD_MIN_X = GRID_OFFSET_X - 1          // -13
const WORLD_MAX_X = GRID_OFFSET_X + GRID_COLS * GRID_SIZE + 1 // 15
const WORLD_MIN_Z = GRID_OFFSET_Z - 1          // -9
const WORLD_MAX_Z = GRID_OFFSET_Z + GRID_ROWS * GRID_SIZE + 1 // 11
const WORLD_W = WORLD_MAX_X - WORLD_MIN_X
const WORLD_H = WORLD_MAX_Z - WORLD_MIN_Z

const CANVAS_W = 180
const CANVAS_H = Math.round(CANVAS_W * (WORLD_H / WORLD_W))

// Tower type → minimap dot color (medieval theme)
const TOWER_COLORS: Record<string, string> = {
  arrow: '#6B8E23',
  cannon: '#CD853F',
  frost: '#87CEEB',
  sniper: '#9370DB',
  tesla: '#DAA520',
}

const ENEMY_COLORS: Record<string, string> = {
  grunt: '#66AA66',
  runner: '#FFDD44',
  tank: '#888888',
  healer: '#FF88DD',
  boss: '#FF2020',
}

function worldToMinimap(wx: number, wz: number): [number, number] {
  const nx = (wx - WORLD_MIN_X) / WORLD_W
  const ny = (wz - WORLD_MIN_Z) / WORLD_H
  return [nx * CANVAS_W, ny * CANVAS_H]
}

export function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const scanAngleRef = useRef(0)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const state = useGameStore.getState()
    const { towers, enemies } = state

    // Clear
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)

    // Background — forest dark
    ctx.fillStyle = 'rgba(15, 26, 14, 0.85)'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

    // Grid area — dark forest green
    const [gx1, gy1] = worldToMinimap(GRID_OFFSET_X, GRID_OFFSET_Z)
    const [gx2, gy2] = worldToMinimap(
      GRID_OFFSET_X + GRID_COLS * GRID_SIZE,
      GRID_OFFSET_Z + GRID_ROWS * GRID_SIZE
    )
    ctx.fillStyle = 'rgba(20, 34, 18, 0.5)'
    ctx.fillRect(gx1, gy1, gx2 - gx1, gy2 - gy1)

    // Border — golden
    ctx.strokeStyle = 'rgba(200, 150, 62, 0.15)'
    ctx.lineWidth = 1
    ctx.strokeRect(gx1, gy1, gx2 - gx1, gy2 - gy1)

    // Path — warm gold
    ctx.beginPath()
    ctx.strokeStyle = 'rgba(200, 150, 62, 0.4)'
    ctx.lineWidth = 3
    PATH_WAYPOINTS.forEach(([wx, , wz], i) => {
      const [px, py] = worldToMinimap(wx, wz)
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    })
    ctx.stroke()

    // Path glow
    ctx.beginPath()
    ctx.strokeStyle = 'rgba(200, 150, 62, 0.15)'
    ctx.lineWidth = 6
    PATH_WAYPOINTS.forEach(([wx, , wz], i) => {
      const [px, py] = worldToMinimap(wx, wz)
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    })
    ctx.stroke()

    // Start marker
    const [sx, sy] = worldToMinimap(PATH_WAYPOINTS[0][0], PATH_WAYPOINTS[0][2])
    ctx.fillStyle = '#4ADE80'
    ctx.beginPath()
    ctx.arc(sx, sy, 3, 0, Math.PI * 2)
    ctx.fill()

    // End marker
    const last = PATH_WAYPOINTS[PATH_WAYPOINTS.length - 1]
    const [ex, ey] = worldToMinimap(last[0], last[2])
    ctx.fillStyle = '#EF4444'
    ctx.beginPath()
    ctx.arc(ex, ey, 3, 0, Math.PI * 2)
    ctx.fill()

    // Towers
    towers.forEach((tower) => {
      const wx = GRID_OFFSET_X + tower.gridX * GRID_SIZE + GRID_SIZE / 2
      const wz = GRID_OFFSET_Z + tower.gridZ * GRID_SIZE + GRID_SIZE / 2
      const [tx, ty] = worldToMinimap(wx, wz)
      const color = TOWER_COLORS[tower.type] || '#FFFFFF'

      // Range ring (subtle)
      const config = TOWER_CONFIGS[tower.type]
      if (config) {
        const range = config.levels[tower.level - 1].range
        const rangePixels = (range / WORLD_W) * CANVAS_W
        ctx.beginPath()
        ctx.strokeStyle = color.replace(')', ', 0.12)').replace('rgb', 'rgba').replace('#', '')
        // Convert hex to rgba for range circle
        ctx.globalAlpha = 0.12
        ctx.strokeStyle = color
        ctx.lineWidth = 0.5
        ctx.arc(tx, ty, rangePixels, 0, Math.PI * 2)
        ctx.stroke()
        ctx.globalAlpha = 1
      }

      // Tower dot
      ctx.fillStyle = color
      ctx.fillRect(tx - 2, ty - 2, 4, 4)
    })

    // Enemies
    enemies.forEach((enemy) => {
      if (!enemy.alive) return
      const [wx, , wz] = getPositionOnPath(enemy.pathProgress)
      const [ex2, ey2] = worldToMinimap(wx, wz)
      const color = ENEMY_COLORS[enemy.type] || '#FF0000'

      // Enemy dot
      const size = enemy.type === 'boss' ? 3.5 : enemy.type === 'tank' ? 2.5 : 2
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(ex2, ey2, size, 0, Math.PI * 2)
      ctx.fill()
    })

    // Scan line sweep (radar feel) — golden tint
    scanAngleRef.current += 0.02
    const cx = CANVAS_W / 2
    const cy = CANVAS_H / 2
    const scanRadius = Math.max(CANVAS_W, CANVAS_H)
    const angle = scanAngleRef.current
    const grad = ctx.createConicGradient(angle, cx, cy)
    grad.addColorStop(0, 'rgba(200, 150, 62, 0.08)')
    grad.addColorStop(0.08, 'rgba(200, 150, 62, 0.0)')
    grad.addColorStop(1, 'rgba(200, 150, 62, 0.0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

    // Scan leading edge line
    const lineEndX = cx + Math.cos(angle) * scanRadius
    const lineEndY = cy + Math.sin(angle) * scanRadius
    ctx.beginPath()
    ctx.strokeStyle = 'rgba(200, 150, 62, 0.2)'
    ctx.lineWidth = 0.5
    ctx.moveTo(cx, cy)
    ctx.lineTo(lineEndX, lineEndY)
    ctx.stroke()

    // Outer frame — golden
    ctx.strokeStyle = 'rgba(200, 150, 62, 0.6)'
    ctx.lineWidth = 1
    ctx.strokeRect(0.5, 0.5, CANVAS_W - 1, CANVAS_H - 1)

    animRef.current = requestAnimationFrame(draw)
  }, [])

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [draw])

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        zIndex: 30,
        overflow: 'hidden',
        border: '1px solid rgba(200,150,62,0.2)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), 0 0 15px rgba(200,150,62,0.08)',
        background: 'rgba(15,26,14,0.92)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Label */}
      <div
        style={{
          padding: '3px 8px',
          fontSize: 10,
          fontWeight: 600,
          color: '#C8963E',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          borderBottom: '1px solid rgba(200,150,62,0.2)',
          fontFamily: "'Lora', serif",
          textShadow: '0 0 8px rgba(200,150,62,0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#4ADE80',
            display: 'inline-block',
            boxShadow: '0 0 4px #4ADE80',
          }}
        />
        REALM MAP
      </div>
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        style={{ display: 'block' }}
      />
      {/* Legend */}
      <div
        style={{
          padding: '3px 8px',
          display: 'flex',
          gap: 8,
          fontSize: 9,
          color: 'rgba(232,223,200,0.35)',
          fontFamily: "'Lora', serif",
          borderTop: '1px solid rgba(200,150,62,0.15)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <span style={{ width: 5, height: 5, background: '#6B8E23', display: 'inline-block' }} />
          Towers
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#66AA66', display: 'inline-block' }} />
          Enemies
        </span>
      </div>
    </div>
  )
}
