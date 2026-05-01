import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import type { Projectile as ProjectileType } from '../types'

/** Wrapper to render a THREE.Line without clashing with SVG <line> typings. */
function ThreeLine({ geometry, color, opacity = 1 }: { geometry: THREE.BufferGeometry; color: string; opacity?: number }) {
  const lineObj = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity })
    return new THREE.Line(geometry, mat)
  }, [geometry, color, opacity])
  return <primitive object={lineObj} />
}

const PROJECTILE_COLORS: Record<string, string> = {
  arrow: '#6B8E23',
  cannon: '#CD853F',
  frost: '#87CEEB',
  sniper: '#9370DB',
  tesla: '#DAA520',
}

function getProjectilePos(p: ProjectileType): [number, number, number] {
  const { startPos, endPos, progress } = p
  const x = startPos[0] + (endPos[0] - startPos[0]) * progress
  const y =
    startPos[1] + (endPos[1] - startPos[1]) * progress + Math.sin(progress * Math.PI) * 0.5
  const z = startPos[2] + (endPos[2] - startPos[2]) * progress
  return [x, y, z]
}

// Arrow projectile: sphere + faint motion trail (3 trailing spheres)
function ArrowProjectile({ projectile }: { projectile: ProjectileType }) {
  const [x, y, z] = getProjectilePos(projectile)
  const trailPositions = useMemo(() => {
    const trails: [number, number, number][] = []
    for (let i = 1; i <= 3; i++) {
      const tp = Math.max(0, projectile.progress - i * 0.04)
      const tx = projectile.startPos[0] + (projectile.endPos[0] - projectile.startPos[0]) * tp
      const ty =
        projectile.startPos[1] +
        (projectile.endPos[1] - projectile.startPos[1]) * tp +
        Math.sin(tp * Math.PI) * 0.5
      const tz = projectile.startPos[2] + (projectile.endPos[2] - projectile.startPos[2]) * tp
      trails.push([tx, ty, tz])
    }
    return trails
  }, [projectile.progress, projectile.startPos, projectile.endPos])

  return (
    <group>
      <mesh position={[x, y, z]}>
        <sphereGeometry args={[0.1, 6, 6]} />
        <meshStandardMaterial color="#6B8E23" emissive="#6B8E23" emissiveIntensity={0.8} />
      </mesh>
      {trailPositions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.06 * (1 - i * 0.25), 4, 4]} />
          <meshBasicMaterial color="#6B8E23" transparent opacity={0.4 - i * 0.12} />
        </mesh>
      ))}
    </group>
  )
}

// Cannon projectile: sphere + smoke trail (multiple small gray spheres behind)
function CannonProjectile({ projectile }: { projectile: ProjectileType }) {
  const [x, y, z] = getProjectilePos(projectile)
  const smokeTrail = useMemo(() => {
    const smokes: { pos: [number, number, number]; opacity: number; size: number }[] = []
    for (let i = 1; i <= 5; i++) {
      const tp = Math.max(0, projectile.progress - i * 0.03)
      const tx = projectile.startPos[0] + (projectile.endPos[0] - projectile.startPos[0]) * tp
      const ty =
        projectile.startPos[1] +
        (projectile.endPos[1] - projectile.startPos[1]) * tp +
        Math.sin(tp * Math.PI) * 0.5 +
        i * 0.05
      const tz = projectile.startPos[2] + (projectile.endPos[2] - projectile.startPos[2]) * tp
      smokes.push({
        pos: [tx, ty, tz],
        opacity: 0.3 - i * 0.05,
        size: 0.06 + i * 0.02,
      })
    }
    return smokes
  }, [projectile.progress, projectile.startPos, projectile.endPos])

  return (
    <group>
      <mesh position={[x, y, z]}>
        <sphereGeometry args={[0.15, 6, 6]} />
        <meshStandardMaterial color="#CD853F" emissive="#CD853F" emissiveIntensity={0.8} />
      </mesh>
      {smokeTrail.map((s, i) => (
        <mesh key={i} position={s.pos}>
          <sphereGeometry args={[s.size, 4, 4]} />
          <meshBasicMaterial color="#888888" transparent opacity={Math.max(0, s.opacity)} />
        </mesh>
      ))}
    </group>
  )
}

// Frost projectile: glowing blue beam connecting tower to target with frost particles along the beam
function FrostProjectile({ projectile }: { projectile: ProjectileType }) {
  const { startPos, endPos } = projectile
  const beamPoints = useMemo(() => {
    const points: THREE.Vector3[] = []
    const steps = 20
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const x = startPos[0] + (endPos[0] - startPos[0]) * t
      const y = startPos[1] + (endPos[1] - startPos[1]) * t + 1.0 * (1 - t) + 0.3 * t
      const z = startPos[2] + (endPos[2] - startPos[2]) * t
      points.push(new THREE.Vector3(x, y, z))
    }
    return points
  }, [startPos, endPos])

  const beamGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(beamPoints)
  }, [beamPoints])

  // Frost particles along beam
  const frostParticles = useMemo(() => {
    const particles: [number, number, number][] = []
    for (let i = 0; i < 4; i++) {
      const t = Math.random()
      const x = startPos[0] + (endPos[0] - startPos[0]) * t + (Math.random() - 0.5) * 0.3
      const y = startPos[1] + (endPos[1] - startPos[1]) * t + 1.0 * (1 - t) + 0.3 * t + (Math.random() - 0.5) * 0.3
      const z = startPos[2] + (endPos[2] - startPos[2]) * t + (Math.random() - 0.5) * 0.3
      particles.push([x, y, z])
    }
    return particles
  }, [startPos, endPos])

  return (
    <group>
      <ThreeLine geometry={beamGeometry} color="#87CEEB" opacity={0.8} />
      {/* Glow beam (wider, more transparent) */}
      <ThreeLine geometry={beamGeometry} color="#B0E0E6" opacity={0.3} />
      {/* Frost sparkle particles along beam */}
      {frostParticles.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.04, 4, 4]} />
          <meshBasicMaterial color="#E0FFFF" transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  )
}

// Tesla projectile: animated lightning arc with jagged line segments
function TeslaProjectile({ projectile }: { projectile: ProjectileType }) {
  const { startPos, endPos } = projectile
  const groupRef = useRef<THREE.Group>(null)

  // Randomize lightning path each frame by using progress as seed trigger
  const lightningPoints = useMemo(() => {
    const points: THREE.Vector3[] = []
    const segments = 12
    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const x = startPos[0] + (endPos[0] - startPos[0]) * t
      const y = startPos[1] + (endPos[1] - startPos[1]) * t + 1.0 * (1 - t) + 0.3 * t
      const z = startPos[2] + (endPos[2] - startPos[2]) * t
      if (i > 0 && i < segments) {
        // Add jitter for lightning effect
        const jitter = 0.3
        points.push(
          new THREE.Vector3(
            x + (Math.random() - 0.5) * jitter,
            y + (Math.random() - 0.5) * jitter,
            z + (Math.random() - 0.5) * jitter
          )
        )
      } else {
        points.push(new THREE.Vector3(x, y, z))
      }
    }
    return points
    // Re-randomize frequently by using floor of progress*50
  }, [startPos, endPos])

  const geom = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(lightningPoints),
    [lightningPoints]
  )

  // Secondary branch
  const branchPoints = useMemo(() => {
    if (lightningPoints.length < 6) return null
    const mid = Math.floor(lightningPoints.length / 2)
    const base = lightningPoints[mid]
    const points = [base]
    for (let i = 1; i <= 3; i++) {
      points.push(
        new THREE.Vector3(
          base.x + (Math.random() - 0.5) * 0.8 * i,
          base.y + (Math.random() - 0.5) * 0.4 * i,
          base.z + (Math.random() - 0.5) * 0.8 * i
        )
      )
    }
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [lightningPoints])

  return (
    <group ref={groupRef}>
      <ThreeLine geometry={geom} color="#DAA520" opacity={0.9} />
      <ThreeLine geometry={geom} color="#FFFACD" opacity={0.4} />
      {branchPoints && (
        <ThreeLine geometry={branchPoints} color="#DAA520" opacity={0.5} />
      )}
    </group>
  )
}

// Sniper projectile: tracer line that flashes bright + muzzle flash at barrel
function SniperProjectile({ projectile }: { projectile: ProjectileType }) {
  const { startPos, progress } = projectile
  const [x, y, z] = getProjectilePos(projectile)

  // Tracer line from start to current position
  const tracerGeom = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(startPos[0], startPos[1] + 1.0, startPos[2]),
      new THREE.Vector3(x, y, z),
    ])
  }, [startPos, x, y, z])

  // Flash intensity - bright at start, fades
  const flashIntensity = Math.max(0, 1 - progress * 3)

  return (
    <group>
      {/* Tracer line */}
      <ThreeLine geometry={tracerGeom} color="#9370DB" opacity={Math.max(0.1, 1 - progress * 2)} />
      {/* Projectile head */}
      <mesh position={[x, y, z]}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshStandardMaterial color="#9370DB" emissive="#9370DB" emissiveIntensity={0.8} />
      </mesh>
      {/* Muzzle flash at barrel */}
      {flashIntensity > 0 && (
        <mesh position={[startPos[0], startPos[1] + 1.2, startPos[2]]}>
          <sphereGeometry args={[0.15 * flashIntensity, 6, 6]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={flashIntensity * 0.8} />
        </mesh>
      )}
    </group>
  )
}

export function ProjectileVisual({ projectile }: { projectile: ProjectileType }) {
  switch (projectile.towerType) {
    case 'arrow':
      return <ArrowProjectile projectile={projectile} />
    case 'cannon':
      return <CannonProjectile projectile={projectile} />
    case 'frost':
      return <FrostProjectile projectile={projectile} />
    case 'tesla':
      return <TeslaProjectile projectile={projectile} />
    case 'sniper':
      return <SniperProjectile projectile={projectile} />
    default: {
      const [x, y, z] = getProjectilePos(projectile)
      const color = PROJECTILE_COLORS[projectile.towerType] || '#FFFFFF'
      return (
        <mesh position={[x, y, z]}>
          <sphereGeometry args={[0.1, 6, 6]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
        </mesh>
      )
    }
  }
}
