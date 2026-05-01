import { useState } from 'react'
import { useFrame } from '@react-three/fiber'
import type { TowerType, EnemyType } from '../types'

interface Particle {
  id: number
  position: [number, number, number]
  velocity: [number, number, number]
  color: string
  life: number
  maxLife: number
  size: number
  kind: 'sphere' | 'ring'
}

let particleId = 0

const DEATH_COLORS: Record<string, string[]> = {
  arrow: ['#8B6914', '#6B8E23', '#D2B48C', '#8B6F4E'],
  cannon: ['#CD853F', '#FF6600', '#8B4513', '#D2691E'],
  frost: ['#87CEEB', '#B0E0E6', '#FFFFFF', '#ADD8E6'],
  sniper: ['#9370DB', '#6A0DAD', '#DDA0DD', '#BA55D3'],
  tesla: ['#DAA520', '#8B6F4E', '#ADFF2F', '#BDB76B'],
}
const BOSS_COLORS = ['#8B0000', '#D4A24C', '#DAA520', '#2E8B57', '#6B8E23', '#9370DB', '#CD853F']

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function useParticleSystem() {
  const [particles, setParticles] = useState<Particle[]>([])

  const emit = (
    position: [number, number, number],
    towerType: TowerType | null,
    enemyType: EnemyType
  ) => {
    const isBoss = enemyType === 'boss'
    const tt = towerType || 'arrow'
    const colors = isBoss ? BOSS_COLORS : (DEATH_COLORS[tt] || DEATH_COLORS.arrow)

    let count: number
    let velScale: number
    let lifeBase: number
    let sizeBase: number

    switch (tt) {
      case 'arrow':
        count = 6; velScale = 2; lifeBase = 0.4; sizeBase = 0.05; break
      case 'cannon':
        count = 15; velScale = 5; lifeBase = 0.6; sizeBase = 0.08; break
      case 'frost':
        count = 10; velScale = 3; lifeBase = 0.8; sizeBase = 0.06; break
      case 'sniper':
        count = 4; velScale = 2; lifeBase = 0.2; sizeBase = 0.07; break
      case 'tesla':
        count = 12; velScale = 4; lifeBase = 0.5; sizeBase = 0.05; break
      default:
        count = 8; velScale = 3; lifeBase = 0.5; sizeBase = 0.06; break
    }

    if (isBoss) {
      count *= 3
      velScale *= 2
      lifeBase *= 1.5
      sizeBase = 0.12
    }

    const newParticles: Particle[] = []
    for (let i = 0; i < count; i++) {
      const life = lifeBase + Math.random() * lifeBase * 0.5
      newParticles.push({
        id: particleId++,
        position: [
          position[0] + (Math.random() - 0.5) * 0.3,
          position[1] + (Math.random() - 0.5) * 0.3,
          position[2] + (Math.random() - 0.5) * 0.3,
        ],
        velocity: [
          (Math.random() - 0.5) * velScale,
          Math.random() * velScale * 0.8 + 1,
          (Math.random() - 0.5) * velScale,
        ],
        color: pick(colors),
        life,
        maxLife: life,
        size: sizeBase + Math.random() * sizeBase * 0.5,
        kind: 'sphere',
      })
    }

    // Cannon shockwave ring
    if (tt === 'cannon' || isBoss) {
      newParticles.push({
        id: particleId++,
        position: [position[0], position[1] + 0.1, position[2]],
        velocity: [0, 0, 0],
        color: isBoss ? '#FF1493' : '#FF6B00',
        life: isBoss ? 0.6 : 0.4,
        maxLife: isBoss ? 0.6 : 0.4,
        size: isBoss ? 0.5 : 0.3,
        kind: 'ring',
      })
    }

    setParticles((prev) => [...prev, ...newParticles].slice(-200))
  }

  return { particles, emit, setParticles }
}

export function ParticleSystem({
  particles,
  setParticles,
}: {
  particles: Particle[]
  setParticles: React.Dispatch<React.SetStateAction<Particle[]>>
}) {
  useFrame((_, delta) => {
    if (particles.length === 0) return
    setParticles((prev) =>
      prev
        .map((p) => ({
          ...p,
          position: p.kind === 'ring' ? p.position : [
            p.position[0] + p.velocity[0] * delta,
            p.position[1] + p.velocity[1] * delta - 4 * delta,
            p.position[2] + p.velocity[2] * delta,
          ] as [number, number, number],
          life: p.life - delta,
        }))
        .filter((p) => p.life > 0)
    )
  })

  return (
    <group>
      {particles.map((p) => {
        const t = p.life / p.maxLife
        if (p.kind === 'ring') {
          const progress = 1 - t
          const innerR = progress * 1.5 * (p.size / 0.3)
          const outerR = innerR + 0.15
          return (
            <mesh key={p.id} position={p.position} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[innerR, outerR, 24]} />
              <meshBasicMaterial color={p.color} transparent opacity={t * 0.7} />
            </mesh>
          )
        }
        return (
          <mesh key={p.id} position={p.position}>
            <sphereGeometry args={[p.size * t, 4, 4]} />
            <meshBasicMaterial color={p.color} transparent opacity={t} />
          </mesh>
        )
      })}
    </group>
  )
}
