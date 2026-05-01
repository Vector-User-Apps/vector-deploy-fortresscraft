import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { ActiveEnemy } from '../types'
import { ENEMY_CONFIGS, getPositionOnPath } from '../constants'

// Grunt: Stocky orc-like warrior with helmet, body armor, and club
function GruntModel({ color, scale: s }: { color: string; scale: number }) {
  return (
    <group>
      {/* Legs */}
      <mesh castShadow position={[-s * 0.2, -s * 0.3, 0]}>
        <cylinderGeometry args={[s * 0.18, s * 0.15, s * 0.6, 6]} />
        <meshStandardMaterial color="#5C4033" roughness={0.8} />
      </mesh>
      <mesh castShadow position={[s * 0.2, -s * 0.3, 0]}>
        <cylinderGeometry args={[s * 0.18, s * 0.15, s * 0.6, 6]} />
        <meshStandardMaterial color="#5C4033" roughness={0.8} />
      </mesh>
      {/* Body - armored torso */}
      <mesh castShadow position={[0, s * 0.2, 0]}>
        <boxGeometry args={[s * 0.8, s * 0.7, s * 0.55]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Shoulder pads */}
      <mesh castShadow position={[-s * 0.55, s * 0.35, 0]}>
        <sphereGeometry args={[s * 0.22, 7, 5]} />
        <meshStandardMaterial color="#888" roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh castShadow position={[s * 0.55, s * 0.35, 0]}>
        <sphereGeometry args={[s * 0.22, 7, 5]} />
        <meshStandardMaterial color="#888" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Head */}
      <mesh castShadow position={[0, s * 0.75, 0]}>
        <sphereGeometry args={[s * 0.3, 8, 7]} />
        <meshStandardMaterial color="#8B7355" roughness={0.7} />
      </mesh>
      {/* Helmet */}
      <mesh castShadow position={[0, s * 0.93, 0]}>
        <cylinderGeometry args={[s * 0.28, s * 0.32, s * 0.25, 8]} />
        <meshStandardMaterial color="#555" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Helmet spike */}
      <mesh castShadow position={[0, s * 1.1, 0]}>
        <coneGeometry args={[s * 0.06, s * 0.22, 5]} />
        <meshStandardMaterial color="#AAA" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Glowing eyes */}
      <mesh position={[-s * 0.1, s * 0.78, s * 0.28]}>
        <sphereGeometry args={[s * 0.06, 6, 5]} />
        <meshStandardMaterial color="#FF4400" emissive="#FF2200" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[s * 0.1, s * 0.78, s * 0.28]}>
        <sphereGeometry args={[s * 0.06, 6, 5]} />
        <meshStandardMaterial color="#FF4400" emissive="#FF2200" emissiveIntensity={1.5} />
      </mesh>
      {/* Club arm */}
      <mesh castShadow position={[s * 0.55, s * 0.1, 0]} rotation={[0, 0, -0.4]}>
        <cylinderGeometry args={[s * 0.08, s * 0.07, s * 0.7, 6]} />
        <meshStandardMaterial color="#6B3A2A" roughness={0.9} />
      </mesh>
      {/* Club head */}
      <mesh castShadow position={[s * 0.78, -s * 0.15, 0]}>
        <sphereGeometry args={[s * 0.2, 7, 6]} />
        <meshStandardMaterial color="#5A5A5A" roughness={0.5} metalness={0.4} />
      </mesh>
    </group>
  )
}

// Runner: Agile scout with lean body, long legs, scarf, and daggers
function RunnerModel({ color, scale: s }: { color: string; scale: number }) {
  return (
    <group>
      {/* Long lean legs */}
      <mesh castShadow position={[-s * 0.15, -s * 0.55, 0]}>
        <cylinderGeometry args={[s * 0.1, s * 0.08, s * 0.9, 6]} />
        <meshStandardMaterial color="#2D3748" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[s * 0.15, -s * 0.55, 0]}>
        <cylinderGeometry args={[s * 0.1, s * 0.08, s * 0.9, 6]} />
        <meshStandardMaterial color="#2D3748" roughness={0.7} />
      </mesh>
      {/* Slim torso */}
      <mesh castShadow position={[0, s * 0.15, 0]}>
        <boxGeometry args={[s * 0.5, s * 0.65, s * 0.35]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Hood/head */}
      <mesh castShadow position={[0, s * 0.65, 0]}>
        <sphereGeometry args={[s * 0.25, 8, 7]} />
        <meshStandardMaterial color="#1A202C" roughness={0.8} />
      </mesh>
      {/* Hood point */}
      <mesh castShadow position={[0, s * 0.95, 0]}>
        <coneGeometry args={[s * 0.2, s * 0.35, 6]} />
        <meshStandardMaterial color="#1A202C" roughness={0.8} />
      </mesh>
      {/* Glowing eyes - single visor stripe */}
      <mesh position={[0, s * 0.65, s * 0.24]}>
        <boxGeometry args={[s * 0.3, s * 0.06, s * 0.04]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
      {/* Scarf trailing */}
      <mesh castShadow position={[0, s * 0.45, -s * 0.25]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[s * 0.08, s * 0.5, s * 0.06]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* Dagger left */}
      <mesh castShadow position={[-s * 0.38, s * 0.1, s * 0.15]} rotation={[0.5, 0, -0.3]}>
        <boxGeometry args={[s * 0.05, s * 0.45, s * 0.04]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Dagger right */}
      <mesh castShadow position={[s * 0.38, s * 0.1, s * 0.15]} rotation={[0.5, 0, 0.3]}>
        <boxGeometry args={[s * 0.05, s * 0.45, s * 0.04]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}

// Tank: Hulking armored juggernaut with shield and massive build
function TankModel({ color, scale: s }: { color: string; scale: number }) {
  return (
    <group>
      {/* Thick stumpy legs */}
      <mesh castShadow position={[-s * 0.3, -s * 0.45, 0]}>
        <cylinderGeometry args={[s * 0.28, s * 0.25, s * 0.7, 7]} />
        <meshStandardMaterial color="#374151" roughness={0.6} metalness={0.5} />
      </mesh>
      <mesh castShadow position={[s * 0.3, -s * 0.45, 0]}>
        <cylinderGeometry args={[s * 0.28, s * 0.25, s * 0.7, 7]} />
        <meshStandardMaterial color="#374151" roughness={0.6} metalness={0.5} />
      </mesh>
      {/* Massive armored torso */}
      <mesh castShadow position={[0, s * 0.35, 0]}>
        <boxGeometry args={[s * 1.1, s * 0.95, s * 0.75]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Chest plate rivets */}
      {[-0.3, 0.3].map((x) => [-0.1, 0.15].map((y) => (
        <mesh key={`${x}${y}`} position={[s * x, s * (0.35 + y), s * 0.38]}>
          <sphereGeometry args={[s * 0.05, 5, 4]} />
          <meshStandardMaterial color="#AAA" metalness={0.9} roughness={0.1} />
        </mesh>
      )))}
      {/* Massive pauldrons */}
      <mesh castShadow position={[-s * 0.75, s * 0.6, 0]}>
        <boxGeometry args={[s * 0.45, s * 0.35, s * 0.55]} />
        <meshStandardMaterial color="#555" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh castShadow position={[s * 0.75, s * 0.6, 0]}>
        <boxGeometry args={[s * 0.45, s * 0.35, s * 0.55]} />
        <meshStandardMaterial color="#555" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Barrel-shaped head with full visor */}
      <mesh castShadow position={[0, s * 1.0, 0]}>
        <cylinderGeometry args={[s * 0.32, s * 0.38, s * 0.45, 8]} />
        <meshStandardMaterial color="#444" roughness={0.3} metalness={0.9} />
      </mesh>
      {/* Visor slit */}
      <mesh position={[0, s * 1.0, s * 0.35]}>
        <boxGeometry args={[s * 0.45, s * 0.07, s * 0.05]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} />
      </mesh>
      {/* Shield on left arm */}
      <mesh castShadow position={[-s * 1.05, s * 0.3, s * 0.1]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[s * 0.08, s * 0.7, s * 0.55]} />
        <meshStandardMaterial color="#666" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Shield emblem */}
      <mesh position={[-s * 1.1, s * 0.3, s * 0.35]}>
        <octahedronGeometry args={[s * 0.1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
      </mesh>
    </group>
  )
}

// Healer: Ethereal mystic with flowing robes, staff, and healing orbs
function HealerModel({ color, scale: s }: { color: string; scale: number }) {
  return (
    <group>
      {/* Flowing robe base - wide at bottom */}
      <mesh castShadow position={[0, -s * 0.2, 0]}>
        <coneGeometry args={[s * 0.55, s * 0.9, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} transparent opacity={0.9} />
      </mesh>
      {/* Inner robe glow */}
      <mesh position={[0, -s * 0.25, 0]}>
        <coneGeometry args={[s * 0.38, s * 0.75, 8]} />
        <meshStandardMaterial color="#A7F3D0" emissive="#10B981" emissiveIntensity={0.4} transparent opacity={0.6} />
      </mesh>
      {/* Slim torso */}
      <mesh castShadow position={[0, s * 0.3, 0]}>
        <cylinderGeometry args={[s * 0.22, s * 0.28, s * 0.5, 7]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Hooded head */}
      <mesh castShadow position={[0, s * 0.72, 0]}>
        <sphereGeometry args={[s * 0.28, 9, 8]} />
        <meshStandardMaterial color="#1A4A3A" roughness={0.8} />
      </mesh>
      {/* Glowing eyes */}
      <mesh position={[-s * 0.1, s * 0.74, s * 0.24]}>
        <sphereGeometry args={[s * 0.055, 6, 5]} />
        <meshStandardMaterial color="#6EE7B7" emissive="#10B981" emissiveIntensity={3} />
      </mesh>
      <mesh position={[s * 0.1, s * 0.74, s * 0.24]}>
        <sphereGeometry args={[s * 0.055, 6, 5]} />
        <meshStandardMaterial color="#6EE7B7" emissive="#10B981" emissiveIntensity={3} />
      </mesh>
      {/* Halo ring */}
      <mesh position={[0, s * 1.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[s * 0.3, s * 0.04, 8, 20]} />
        <meshStandardMaterial color="#6EE7B7" emissive="#10B981" emissiveIntensity={2} />
      </mesh>
      {/* Staff */}
      <mesh castShadow position={[s * 0.45, s * 0.3, 0]} rotation={[0, 0, 0.15]}>
        <cylinderGeometry args={[s * 0.05, s * 0.05, s * 1.4, 6]} />
        <meshStandardMaterial color="#4A7C59" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Staff orb */}
      <mesh position={[s * 0.5, s * 1.05, 0]}>
        <sphereGeometry args={[s * 0.18, 10, 9]} />
        <meshStandardMaterial color="#A7F3D0" emissive="#10B981" emissiveIntensity={2} transparent opacity={0.85} />
      </mesh>
      {/* Floating healing orbs */}
      <mesh position={[-s * 0.5, s * 0.6, s * 0.2]}>
        <sphereGeometry args={[s * 0.1, 7, 6]} />
        <meshStandardMaterial color="#6EE7B7" emissive="#10B981" emissiveIntensity={2.5} transparent opacity={0.8} />
      </mesh>
      <mesh position={[-s * 0.3, s * 0.9, -s * 0.3]}>
        <sphereGeometry args={[s * 0.08, 7, 6]} />
        <meshStandardMaterial color="#6EE7B7" emissive="#10B981" emissiveIntensity={2.5} transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

// Boss: Massive demon lord with horns, wings, armored body, and fiery energy
function BossModel({ color, scale: s }: { color: string; scale: number }) {
  return (
    <group>
      {/* Massive legs with clawed feet */}
      <mesh castShadow position={[-s * 0.4, -s * 0.6, 0]}>
        <cylinderGeometry args={[s * 0.32, s * 0.28, s * 0.85, 7]} />
        <meshStandardMaterial color="#1A0A0A" roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh castShadow position={[s * 0.4, -s * 0.6, 0]}>
        <cylinderGeometry args={[s * 0.32, s * 0.28, s * 0.85, 7]} />
        <meshStandardMaterial color="#1A0A0A" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* Claw toes */}
      {[-0.55, -0.25, 0.15].map((x, i) => (
        <mesh key={`left-${i}`} castShadow position={[s * (x - 0.4), -s * 1.0, s * 0.2]}>
          <coneGeometry args={[s * 0.07, s * 0.22, 4]} rotation-x={Math.PI} />
          <meshStandardMaterial color="#333" metalness={0.7} roughness={0.2} />
        </mesh>
      ))}
      {[0.25, 0.55, 0.85].map((x, i) => (
        <mesh key={`right-${i}`} castShadow position={[s * (x - 0.1), -s * 1.0, s * 0.2]}>
          <coneGeometry args={[s * 0.07, s * 0.22, 4]} />
          <meshStandardMaterial color="#333" metalness={0.7} roughness={0.2} />
        </mesh>
      ))}
      {/* Massive torso */}
      <mesh castShadow position={[0, s * 0.4, 0]}>
        <boxGeometry args={[s * 1.3, s * 1.1, s * 0.85]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} emissive={color} emissiveIntensity={0.15} />
      </mesh>
      {/* Glowing chest core */}
      <mesh position={[0, s * 0.45, s * 0.44]}>
        <sphereGeometry args={[s * 0.25, 10, 9]} />
        <meshStandardMaterial color="#FF6600" emissive="#FF3300" emissiveIntensity={3} transparent opacity={0.9} />
      </mesh>
      {/* Chest armor plates */}
      <mesh castShadow position={[-s * 0.35, s * 0.55, s * 0.42]}>
        <boxGeometry args={[s * 0.35, s * 0.45, s * 0.08]} />
        <meshStandardMaterial color="#333" roughness={0.3} metalness={0.9} />
      </mesh>
      <mesh castShadow position={[s * 0.35, s * 0.55, s * 0.42]}>
        <boxGeometry args={[s * 0.35, s * 0.45, s * 0.08]} />
        <meshStandardMaterial color="#333" roughness={0.3} metalness={0.9} />
      </mesh>
      {/* Huge pauldrons with spikes */}
      <mesh castShadow position={[-s * 0.9, s * 0.65, 0]}>
        <sphereGeometry args={[s * 0.38, 8, 7]} />
        <meshStandardMaterial color="#222" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh castShadow position={[s * 0.9, s * 0.65, 0]}>
        <sphereGeometry args={[s * 0.38, 8, 7]} />
        <meshStandardMaterial color="#222" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Shoulder spikes */}
      {[-1, 0, 1].map((i) => (
        <mesh key={`left-spike-${i}`} castShadow position={[-s * 0.9 + s * i * 0.15, s * 1.05, s * i * 0.1]}>
          <coneGeometry args={[s * 0.07, s * 0.3, 4]} />
          <meshStandardMaterial color="#AA2200" emissive="#FF2200" emissiveIntensity={0.5} />
        </mesh>
      ))}
      {[-1, 0, 1].map((i) => (
        <mesh key={`right-spike-${i}`} castShadow position={[s * 0.9 + s * i * 0.15, s * 1.05, s * i * 0.1]}>
          <coneGeometry args={[s * 0.07, s * 0.3, 4]} />
          <meshStandardMaterial color="#AA2200" emissive="#FF2200" emissiveIntensity={0.5} />
        </mesh>
      ))}
      {/* Head */}
      <mesh castShadow position={[0, s * 1.25, 0]}>
        <boxGeometry args={[s * 0.65, s * 0.6, s * 0.6]} />
        <meshStandardMaterial color="#1A0A0A" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Jaw */}
      <mesh castShadow position={[0, s * 1.0, s * 0.15]}>
        <boxGeometry args={[s * 0.5, s * 0.2, s * 0.45]} />
        <meshStandardMaterial color="#111" roughness={0.5} />
      </mesh>
      {/* Large glowing eyes */}
      <mesh position={[-s * 0.18, s * 1.3, s * 0.31]}>
        <sphereGeometry args={[s * 0.1, 8, 7]} />
        <meshStandardMaterial color="#FF6600" emissive="#FF3300" emissiveIntensity={4} />
      </mesh>
      <mesh position={[s * 0.18, s * 1.3, s * 0.31]}>
        <sphereGeometry args={[s * 0.1, 8, 7]} />
        <meshStandardMaterial color="#FF6600" emissive="#FF3300" emissiveIntensity={4} />
      </mesh>
      {/* Curved horns */}
      <mesh castShadow position={[-s * 0.22, s * 1.65, 0]} rotation={[0.4, 0, -0.6]}>
        <coneGeometry args={[s * 0.1, s * 0.6, 5]} />
        <meshStandardMaterial color="#8B0000" roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh castShadow position={[s * 0.22, s * 1.65, 0]} rotation={[0.4, 0, 0.6]}>
        <coneGeometry args={[s * 0.1, s * 0.6, 5]} />
        <meshStandardMaterial color="#8B0000" roughness={0.4} metalness={0.4} />
      </mesh>
      {/* Wings - left */}
      <mesh castShadow position={[-s * 1.0, s * 0.7, -s * 0.3]} rotation={[0.2, 0.4, 0.3]}>
        <boxGeometry args={[s * 0.8, s * 0.06, s * 0.65]} />
        <meshStandardMaterial color="#3D0000" roughness={0.8} transparent opacity={0.85} />
      </mesh>
      <mesh castShadow position={[-s * 1.5, s * 0.4, -s * 0.1]} rotation={[0.1, 0.5, 0.5]}>
        <boxGeometry args={[s * 0.6, s * 0.05, s * 0.5]} />
        <meshStandardMaterial color="#3D0000" roughness={0.8} transparent opacity={0.75} />
      </mesh>
      {/* Wings - right */}
      <mesh castShadow position={[s * 1.0, s * 0.7, -s * 0.3]} rotation={[0.2, -0.4, -0.3]}>
        <boxGeometry args={[s * 0.8, s * 0.06, s * 0.65]} />
        <meshStandardMaterial color="#3D0000" roughness={0.8} transparent opacity={0.85} />
      </mesh>
      <mesh castShadow position={[s * 1.5, s * 0.4, -s * 0.1]} rotation={[0.1, -0.5, -0.5]}>
        <boxGeometry args={[s * 0.6, s * 0.05, s * 0.5]} />
        <meshStandardMaterial color="#3D0000" roughness={0.8} transparent opacity={0.75} />
      </mesh>
      {/* Energy ring at base */}
      <mesh position={[0, -s * 1.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[s * 0.7, s * 0.07, 8, 24]} />
        <meshStandardMaterial color="#FF4400" emissive="#FF2200" emissiveIntensity={2.5} />
      </mesh>
    </group>
  )
}

function EnemyModel({ type, color, scale }: { type: string; color: string; scale: number }) {
  switch (type) {
    case 'runner':
      return <RunnerModel color={color} scale={scale} />
    case 'tank':
      return <TankModel color={color} scale={scale} />
    case 'healer':
      return <HealerModel color={color} scale={scale} />
    case 'boss':
      return <BossModel color={color} scale={scale} />
    default: // grunt
      return <GruntModel color={color} scale={scale} />
  }
}

export function Enemy({ enemy }: { enemy: ActiveEnemy }) {
  const groupRef = useRef<THREE.Group>(null)
  const config = ENEMY_CONFIGS[enemy.type]
  const pos = getPositionOnPath(enemy.pathProgress)
  const hpPercent = enemy.hp / enemy.maxHp
  const isDying = !enemy.alive && enemy.deathTime !== null

  useFrame(() => {
    if (!groupRef.current) return
    if (isDying) {
      const elapsed = (performance.now() - (enemy.deathTime || 0)) / 1000
      const s = Math.max(0, 1 - elapsed * 3)
      groupRef.current.scale.setScalar(s)
      return
    }
    groupRef.current.position.set(pos[0], pos[1] + config.scale, pos[2])
  })

  if (isDying) {
    const elapsed = (performance.now() - (enemy.deathTime || 0)) / 1000
    if (elapsed > 0.5) return null
  }

  return (
    <group ref={groupRef} position={[pos[0], pos[1] + config.scale, pos[2]]}>
      <EnemyModel type={enemy.type} color={config.color} scale={config.scale} />
      {/* Health bar */}
      {enemy.alive && (
        <Html position={[0, config.scale + 0.5, 0]} center sprite>
          <div
            style={{
              width: '40px',
              height: '4px',
              background: '#1F2937',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${hpPercent * 100}%`,
                height: '100%',
                background:
                  hpPercent > 0.6 ? '#4ADE80' : hpPercent > 0.3 ? '#FACC15' : '#EF4444',
                transition: 'width 0.1s',
              }}
            />
          </div>
        </Html>
      )}
      {/* Slow indicator */}
      {enemy.slowTimer > 0 && enemy.alive && (
        <mesh position={[0, -config.scale * 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.4, 16]} />
          <meshBasicMaterial color="#60A5FA" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  )
}
