import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { PlacedTower } from '../types'
import { TOWER_CONFIGS, gridToWorld } from '../constants'
import { useGameStore } from '../state'
import { useTowerAnimStore } from './TowerPlacementEffect'

/* ------------------------------------------------------------------ */
/*  ARROW TOWER — Medieval stone watchtower                           */
/* ------------------------------------------------------------------ */
function ArrowTowerModel({ level, color }: { level: number; color: string }) {
  const flagRef = useRef<THREE.Mesh>(null)
  const lanternRef = useRef<THREE.Mesh>(null)
  const baseGlowRef = useRef<THREE.Mesh>(null)
  const height = 1.82 + level * 0.52
  const baseRadius = 0.455 + level * 0.039

  useFrame((state, delta) => {
    if (flagRef.current) {
      flagRef.current.rotation.y += delta * 2
    }
    if (lanternRef.current) {
      const pulse = 1.2 + Math.sin(state.clock.elapsedTime * 3.5) * 0.5
      ;(lanternRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse
    }
    if (baseGlowRef.current) {
      const glow = 0.4 + Math.sin(state.clock.elapsedTime * 1.8) * 0.15
      ;(baseGlowRef.current.material as THREE.MeshStandardMaterial).opacity = glow
    }
  })

  const crenCount = 8
  const crenellations = useMemo(() => {
    const items = []
    for (let i = 0; i < crenCount; i++) {
      const angle = (i / crenCount) * Math.PI * 2
      const r = baseRadius + 0.104
      items.push({
        x: Math.cos(angle) * r,
        z: Math.sin(angle) * r,
        angle,
      })
    }
    return items
  }, [baseRadius])

  return (
    <group>
      {/* Golden emissive ground ring */}
      <mesh ref={baseGlowRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.7, 32]} />
        <meshStandardMaterial
          color="#FFB020"
          emissive="#FFB020"
          emissiveIntensity={1.0}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Stone base — wider bottom */}
      <mesh position={[0, 0.195, 0]} castShadow>
        <cylinderGeometry args={[baseRadius + 0.13, baseRadius + 0.26, 0.39, 12]} />
        <meshStandardMaterial color="#A09080" roughness={0.8} metalness={0.05} />
      </mesh>

      {/* Golden amber base trim ring */}
      <mesh position={[0, 0.01, 0]}>
        <torusGeometry args={[baseRadius + 0.22, 0.025, 8, 16]} />
        <meshStandardMaterial color="#FFB020" emissive="#FFB020" emissiveIntensity={1.5} />
      </mesh>

      {/* Main cylindrical tower body */}
      <mesh position={[0, height / 2 + 0.39, 0]} castShadow>
        <cylinderGeometry args={[baseRadius, baseRadius + 0.065, height, 12]} />
        <meshStandardMaterial color="#A09080" roughness={0.8} metalness={0.05} />
      </mesh>

      {/* Stone texture bands with golden trim */}
      {[0.4, 0.7, 1.0].map((y, i) => (
        <mesh key={`band-${i}`} position={[0, y * height * 0.6 + 0.39, 0]} castShadow>
          <cylinderGeometry args={[baseRadius + 0.026, baseRadius + 0.026, 0.052, 12]} />
          <meshStandardMaterial color="#FFB020" emissive="#FFB020" emissiveIntensity={1.5} metalness={0.1} roughness={0.5} />
        </mesh>
      ))}

      {/* Wooden platform at top */}
      <mesh position={[0, height + 0.364, 0]} castShadow>
        <cylinderGeometry args={[baseRadius + 0.195, baseRadius + 0.156, 0.078, 12]} />
        <meshStandardMaterial color="#92400E" roughness={0.75} metalness={0.1} />
      </mesh>

      {/* Crenellations (battlements) */}
      {crenellations.map((c, i) => (
        <mesh key={`cren-${i}`} position={[c.x, height + 0.52, c.z]} castShadow>
          <boxGeometry args={[0.104, 0.195, 0.104]} />
          <meshStandardMaterial color="#A09080" roughness={0.8} />
        </mesh>
      ))}

      {/* Glowing amber lantern at top */}
      <mesh ref={lanternRef} position={[0, height + 0.52, 0]}>
        <octahedronGeometry args={[0.1 + level * 0.025]} />
        <meshStandardMaterial
          color="#FFD060"
          emissive="#FFB020"
          emissiveIntensity={1.5}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Crossbow / ballista */}
      <group position={[0, height + 0.455, 0]}>
        {/* Bow arms */}
        <mesh position={[0, 0.065, 0]}>
          <boxGeometry args={[0.65, 0.052, 0.052]} />
          <meshStandardMaterial color="#78350F" roughness={0.7} metalness={0.1} />
        </mesh>
        {/* Golden metallic highlights on bow tips */}
        <mesh position={[0.32, 0.065, 0]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#FFB020" emissive="#FFB020" emissiveIntensity={0.8} metalness={0.7} roughness={0.2} />
        </mesh>
        <mesh position={[-0.32, 0.065, 0]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#FFB020" emissive="#FFB020" emissiveIntensity={0.8} metalness={0.7} roughness={0.2} />
        </mesh>
        {/* Bolt rail */}
        <mesh position={[0, 0.065, 0.156]} rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.052, 0.39, 0.039]} />
          <meshStandardMaterial color="#44403C" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Bolt */}
        <mesh position={[0, 0.078, 0.325]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.013, 0.0195, 0.26, 6]} />
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} emissive="#FFB020" emissiveIntensity={0.4} />
        </mesh>
      </group>

      {/* Level 2+: second crossbow & flag */}
      {level >= 2 && (
        <>
          <group position={[0, height + 0.455, 0]} rotation={[0, Math.PI, 0]}>
            <mesh position={[0, 0.065, 0]}>
              <boxGeometry args={[0.585, 0.052, 0.052]} />
              <meshStandardMaterial color="#78350F" roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.065, 0.156]} rotation={[Math.PI / 2, 0, 0]}>
              <boxGeometry args={[0.052, 0.364, 0.039]} />
              <meshStandardMaterial color="#44403C" metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
          {/* Flag pole */}
          <mesh position={[0, height + 0.845, 0]}>
            <cylinderGeometry args={[0.0156, 0.0156, 0.65, 6]} />
            <meshStandardMaterial color="#FFB020" emissive="#FFB020" emissiveIntensity={0.6} metalness={0.7} />
          </mesh>
          {/* Flag */}
          <mesh ref={flagRef} position={[0.104, height + 1.04, 0]}>
            <boxGeometry args={[0.195, 0.13, 0.013]} />
            <meshStandardMaterial color="#DC2626" roughness={0.6} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}

      {/* Level 3: glowing golden banner with emissive material */}
      {level >= 3 && (
        <>
          <mesh position={[0, 0.78, 0]}>
            <torusGeometry args={[baseRadius + 0.078, 0.039, 8, 16]} />
            <meshStandardMaterial color="#FFB020" emissive="#FFB020" emissiveIntensity={1.5} metalness={0.3} roughness={0.4} />
          </mesh>
          <mesh position={[0, height * 0.5 + 0.39, 0]}>
            <torusGeometry args={[baseRadius + 0.078, 0.039, 8, 16]} />
            <meshStandardMaterial color="#FFB020" emissive="#FFB020" emissiveIntensity={1.5} metalness={0.3} roughness={0.4} />
          </mesh>
          {/* Glowing banner drop */}
          <mesh position={[baseRadius + 0.15, height * 0.65 + 0.39, 0]}>
            <boxGeometry args={[0.04, 0.35, 0.2]} />
            <meshStandardMaterial color="#FFB020" emissive="#FFB020" emissiveIntensity={1.2} transparent opacity={0.85} />
          </mesh>
          <pointLight position={[0, height * 0.5, 0]} color="#FFB020" intensity={0.8} distance={3} />
        </>
      )}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  CANNON TOWER — Fortified gun emplacement                          */
/* ------------------------------------------------------------------ */
function CannonTowerModel({ level, color }: { level: number; color: string }) {
  const barrelRef = useRef<THREE.Group>(null)
  const barrelGlowRef = useRef<THREE.Mesh>(null)
  const baseGlowRef = useRef<THREE.Mesh>(null)
  const size = 0.585 + level * 0.104
  const barrelLen = 0.78 + level * 0.195

  useFrame((state, delta) => {
    if (barrelRef.current) {
      barrelRef.current.rotation.y += delta * 0.3
    }
    if (barrelGlowRef.current) {
      const pulse = 1.5 + Math.sin(state.clock.elapsedTime * 4.5) * 0.7
      ;(barrelGlowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse
    }
    if (baseGlowRef.current) {
      const glow = 0.4 + Math.sin(state.clock.elapsedTime * 1.6) * 0.15
      ;(baseGlowRef.current.material as THREE.MeshStandardMaterial).opacity = glow
    }
  })

  const ventCount = 6
  const vents = useMemo(() => {
    const items = []
    for (let i = 0; i < ventCount; i++) {
      const angle = (i / ventCount) * Math.PI * 2
      const r = size + 0.18
      items.push({ x: Math.cos(angle) * r, z: Math.sin(angle) * r, angle })
    }
    return items
  }, [size])

  const sandbagCount = 10
  const sandbags = useMemo(() => {
    const items = []
    for (let i = 0; i < sandbagCount; i++) {
      const angle = (i / sandbagCount) * Math.PI * 2
      const r = size + 0.26
      items.push({ x: Math.cos(angle) * r, z: Math.sin(angle) * r, angle })
    }
    return items
  }, [size])

  return (
    <group>
      {/* Warm amber emissive ground ring */}
      <mesh ref={baseGlowRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.85, 32]} />
        <meshStandardMaterial
          color="#CD853F"
          emissive="#CD853F"
          emissiveIntensity={1.0}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Octagonal wood+stone base */}
      <mesh position={[0, 0.325, 0]} castShadow>
        <cylinderGeometry args={[size + 0.195, size + 0.325, 0.65, 8]} />
        <meshStandardMaterial color="#8B6F4E" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Iron band slits around base */}
      {vents.map((v, i) => (
        <mesh key={`vent-${i}`} position={[v.x * 0.88, 0.35, v.z * 0.88]} rotation={[0, v.angle + Math.PI / 2, 0]} castShadow>
          <boxGeometry args={[0.025, 0.22, 0.055]} />
          <meshStandardMaterial color="#4A4A4A" emissive="#CD853F" emissiveIntensity={0.8} transparent opacity={0.9} />
        </mesh>
      ))}

      {/* Second tier — iron-banded wood */}
      <mesh position={[0, 0.78, 0]} castShadow>
        <cylinderGeometry args={[size + 0.065, size + 0.195, 0.26, 8]} />
        <meshStandardMaterial color="#4A4A4A" roughness={0.5} metalness={0.7} />
      </mesh>

      {/* Iron accent ring on second tier */}
      <mesh position={[0, 0.655, 0]}>
        <torusGeometry args={[size + 0.2, 0.022, 8, 16]} />
        <meshStandardMaterial color="#4A4A4A" emissive="#CD853F" emissiveIntensity={0.8} />
      </mesh>

      {/* Sandbag ring */}
      {sandbags.map((s, i) => (
        <mesh key={`sandbag-${i}`} position={[s.x, 0.715, s.z]} rotation={[0, s.angle, 0]} castShadow>
          <boxGeometry args={[0.156, 0.104, 0.078]} />
          <meshStandardMaterial color="#92400E" roughness={0.9} />
        </mesh>
      ))}

      {/* Pivot mount — iron */}
      <mesh position={[0, 1.04, 0]} castShadow>
        <cylinderGeometry args={[0.156, 0.195, 0.195, 8]} />
        <meshStandardMaterial color="#4A4A4A" metalness={0.7} roughness={0.35} />
      </mesh>

      {/* Rotating cannon assembly */}
      <group ref={barrelRef} position={[0, 1.17, 0]}>
        {/* Cannon barrel */}
        <mesh position={[barrelLen / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.078 + level * 0.026, 0.13 + level * 0.026, barrelLen, 12]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Muzzle ring — iron */}
        <mesh position={[barrelLen + 0.026, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.104 + level * 0.026, 0.026, 8, 12]} />
          <meshStandardMaterial color="#4A4A4A" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Persistent warm glow at barrel tip */}
        <mesh ref={barrelGlowRef} position={[barrelLen + 0.06, 0, 0]}>
          <sphereGeometry args={[0.055 + level * 0.013, 10, 10]} />
          <meshStandardMaterial
            color="#CD853F"
            emissive="#CD853F"
            emissiveIntensity={2.0}
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* Level 3: dual cannons, both glow at tips */}
        {level >= 3 && (
          <>
            <mesh position={[barrelLen / 2, 0.156, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.065, 0.104, barrelLen * 0.9, 12]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[barrelLen + 0.026, 0.156, 0]}>
              <sphereGeometry args={[0.05, 10, 10]} />
              <meshStandardMaterial color="#CD853F" emissive="#CD853F" emissiveIntensity={2.0} transparent opacity={0.85} />
            </mesh>
          </>
        )}
      </group>

      {/* Stone ammo crates at base */}
      <mesh position={[size + 0.13, 0.156, 0]} castShadow>
        <boxGeometry args={[0.156, 0.13, 0.104]} />
        <meshStandardMaterial color="#8B6F4E" roughness={0.8} metalness={0.1} />
      </mesh>
      <mesh position={[-size - 0.065, 0.156, 0.13]} castShadow>
        <boxGeometry args={[0.13, 0.104, 0.13]} />
        <meshStandardMaterial color="#8B6F4E" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Level 2+: iron reinforcement band */}
      {level >= 2 && (
        <mesh position={[0, 0.455, 0]}>
          <torusGeometry args={[size + 0.234, 0.039, 8, 8]} />
          <meshStandardMaterial color="#4A4A4A" emissive="#CD853F" emissiveIntensity={0.6} metalness={0.6} roughness={0.4} />
        </mesh>
      )}

      {/* Level 3: iron armor shell + glowing seams */}
      {level >= 3 && (
        <>
          <mesh position={[0, 0.325, 0]}>
            <cylinderGeometry args={[size + 0.364, size + 0.364, 0.65, 8]} />
            <meshStandardMaterial color="#4A4A4A" metalness={0.7} roughness={0.3} transparent opacity={0.55} />
          </mesh>
          {/* Glowing seam lines */}
          {[0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].map((angle, i) => (
            <mesh key={`crack-${i}`} position={[Math.cos(angle) * (size + 0.37), 0.35, Math.sin(angle) * (size + 0.37)]} rotation={[0, angle, 0]}>
              <boxGeometry args={[0.018, 0.3, 0.055]} />
              <meshStandardMaterial color="#CD853F" emissive="#CD853F" emissiveIntensity={2.0} transparent opacity={0.8} />
            </mesh>
          ))}
          <pointLight position={[0, 0.9, 0]} color="#CD853F" intensity={1.2} distance={3} />
        </>
      )}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  FROST TOWER — Ice crystal spire                                   */
/* ------------------------------------------------------------------ */
function FrostTowerModel({ level, color }: { level: number; color: string }) {
  const orbitRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const auraRef = useRef<THREE.Mesh>(null)
  const baseGlowRef = useRef<THREE.Mesh>(null)
  const height = 1.56 + level * 0.52
  const glowIntensity = 1.2 + level * 0.4

  const particleCount = 6 + level * 2
  const particles = useMemo(() => {
    const items = []
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2
      const r = 0.2 + Math.random() * 0.3
      items.push({
        x: Math.cos(angle) * r,
        z: Math.sin(angle) * r,
        baseY: 0.3 + Math.random() * 0.5,
        speed: 0.8 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
      })
    }
    return items
  }, [particleCount])

  const particleRefs = useRef<(THREE.Mesh | null)[]>([])

  useFrame((state, delta) => {
    if (orbitRef.current) {
      orbitRef.current.rotation.y += delta * 1.2
    }
    if (coreRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1
      coreRef.current.scale.set(s, s, s)
    }
    if (auraRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 2.2) * 0.12
      auraRef.current.scale.set(s, s, s)
      ;(auraRef.current.material as THREE.MeshStandardMaterial).opacity = 0.08 + Math.sin(state.clock.elapsedTime * 2.2) * 0.06
    }
    if (baseGlowRef.current) {
      const glow = 0.45 + Math.sin(state.clock.elapsedTime * 1.5) * 0.18
      ;(baseGlowRef.current.material as THREE.MeshStandardMaterial).opacity = glow
    }
    particleRefs.current.forEach((mesh, i) => {
      if (mesh && particles[i]) {
        const p = particles[i]
        mesh.position.y = p.baseY + Math.sin(state.clock.elapsedTime * p.speed + p.phase) * 0.25
      }
    })
  })

  const shardCount = 3 + level * 2
  const orbitShards = useMemo(() => {
    const items = []
    for (let i = 0; i < shardCount; i++) {
      const angle = (i / shardCount) * Math.PI * 2
      const r = 0.52 + level * 0.104
      const yOff = 0.78 + Math.sin(angle * 2) * 0.39
      items.push({ angle, r, yOff, scale: 0.078 + Math.random() * 0.065 })
    }
    return items
  }, [shardCount, level])

  return (
    <group>
      {/* Bright cyan emissive ground ring */}
      <mesh ref={baseGlowRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.85, 32]} />
        <meshStandardMaterial
          color="#40B0FF"
          emissive="#40B0FF"
          emissiveIntensity={1.0}
          transparent
          opacity={0.45}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Hexagonal ice base */}
      <mesh position={[0, 0.156, 0]} castShadow>
        <cylinderGeometry args={[0.585, 0.715, 0.325, 6]} />
        <meshStandardMaterial
          color="#80D0FF"
          roughness={0.1}
          metalness={0.15}
          transparent
          opacity={0.8}
          emissive="#40B0FF"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Base emissive ring detail */}
      <mesh position={[0, 0.026, 0]}>
        <cylinderGeometry args={[0.754, 0.78, 0.052, 6]} />
        <meshStandardMaterial color="#40B0FF" emissive="#40B0FF" emissiveIntensity={1.5} transparent opacity={0.7} />
      </mesh>

      {/* Main crystal spire — tall tapering shape */}
      <mesh position={[0, height / 2 + 0.325, 0]} castShadow>
        <cylinderGeometry args={[0.065, 0.325, height, 6]} />
        <meshStandardMaterial
          color={color}
          roughness={0.08}
          metalness={0.2}
          transparent
          opacity={0.85}
          emissive="#40B0FF"
          emissiveIntensity={1.0}
        />
      </mesh>

      {/* Secondary crystal shards around main spire */}
      {[-0.195, 0.195].map((x, i) => (
        <mesh
          key={`shard-${i}`}
          position={[x, height * 0.35 + 0.26, i === 0 ? 0.13 : -0.13]}
          rotation={[i * 0.2, 0, i === 0 ? 0.15 : -0.15]}
          castShadow
        >
          <cylinderGeometry args={[0.026, 0.156, height * 0.55, 6]} />
          <meshStandardMaterial
            color="#80D0FF"
            roughness={0.08}
            transparent
            opacity={0.75}
            emissive="#40B0FF"
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}

      {/* Angled crystal formations at base */}
      {[0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3].map((a, i) => (
        <mesh
          key={`formation-${i}`}
          position={[Math.cos(a) * 0.39, 0.455, Math.sin(a) * 0.39]}
          rotation={[Math.sin(a) * 0.4, a, Math.cos(a) * 0.4]}
          castShadow
        >
          <octahedronGeometry args={[0.104 + level * 0.0195]} />
          <meshStandardMaterial
            color="#80D0FF"
            roughness={0.08}
            transparent
            opacity={0.75}
            emissive="#40B0FF"
            emissiveIntensity={1.0}
          />
        </mesh>
      ))}

      {/* Glowing emissive core */}
      <mesh ref={coreRef} position={[0, height * 0.5 + 0.325, 0]}>
        <sphereGeometry args={[0.104 + level * 0.039, 14, 14]} />
        <meshStandardMaterial
          color="#80D0FF"
          emissive="#40B0FF"
          emissiveIntensity={glowIntensity}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Pulsing blue aura sphere */}
      <mesh ref={auraRef} position={[0, height * 0.5 + 0.325, 0]}>
        <sphereGeometry args={[0.28 + level * 0.065, 16, 16]} />
        <meshStandardMaterial
          color="#40B0FF"
          emissive="#40B0FF"
          emissiveIntensity={1.5}
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Floating frost particles */}
      {particles.map((p, i) => (
        <mesh
          key={`particle-${i}`}
          ref={(el) => { particleRefs.current[i] = el }}
          position={[p.x, p.baseY, p.z]}
        >
          <sphereGeometry args={[0.018 + level * 0.006, 6, 6]} />
          <meshStandardMaterial
            color="#C0E8FF"
            emissive="#40B0FF"
            emissiveIntensity={1.2}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}

      {/* Floating/orbiting crystal shards */}
      <group ref={orbitRef} position={[0, height * 0.5, 0]}>
        {orbitShards.map((s, i) => (
          <mesh
            key={`orbit-${i}`}
            position={[
              Math.cos(s.angle) * s.r,
              s.yOff,
              Math.sin(s.angle) * s.r,
            ]}
            rotation={[s.angle, s.angle * 0.5, 0]}
          >
            <octahedronGeometry args={[s.scale]} />
            <meshStandardMaterial
              color="#80D0FF"
              emissive="#40B0FF"
              emissiveIntensity={1.0 + level * 0.2}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))}
      </group>

      {/* Level 3: beacon crown — massive crystal + point light */}
      {level >= 3 && (
        <>
          <mesh position={[0, height + 0.195, 0]} castShadow>
            <octahedronGeometry args={[0.26]} />
            <meshStandardMaterial
              color="#C0EEFF"
              emissive="#40B0FF"
              emissiveIntensity={2.5}
              transparent
              opacity={0.9}
            />
          </mesh>
          <pointLight position={[0, height * 0.5 + 0.325, 0]} color="#40B0FF" intensity={3} distance={5} />
        </>
      )}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  SNIPER TOWER — Tall modern/sci-fi watchtower                      */
/* ------------------------------------------------------------------ */
function SniperTowerModel({ level, color: _color }: { level: number; color: string }) {
  const laserRef = useRef<THREE.Mesh>(null)
  const scopeGlintRef = useRef<THREE.Mesh>(null)
  const baseGlowRef = useRef<THREE.Mesh>(null)
  const height = 2.5 + level * 0.55
  const bodyRadius = 0.16 + level * 0.03

  useFrame((state) => {
    if (laserRef.current) {
      const pulse = 0.7 + Math.sin(state.clock.elapsedTime * 4) * 0.3
      ;(laserRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse
    }
    if (scopeGlintRef.current) {
      const glint = 2.0 + Math.sin(state.clock.elapsedTime * 2.5) * 1.0
      ;(scopeGlintRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = glint
    }
    if (baseGlowRef.current) {
      const glow = 0.4 + Math.sin(state.clock.elapsedTime * 1.5) * 0.15
      ;(baseGlowRef.current.material as THREE.MeshStandardMaterial).opacity = glow
    }
  })

  const railingCount = 8
  const railings = useMemo(() => {
    const items = []
    for (let i = 0; i < railingCount; i++) {
      const angle = (i / railingCount) * Math.PI * 2
      const r = bodyRadius + 0.22
      items.push({ x: Math.cos(angle) * r, z: Math.sin(angle) * r })
    }
    return items
  }, [bodyRadius])

  const laserLength = 3.5 + level * 1.0
  const barrelEnd = bodyRadius + 0.65 + level * 0.1

  return (
    <group>
      {/* Base platform glow ring — mystical purple */}
      <mesh ref={baseGlowRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.65, 32]} />
        <meshStandardMaterial
          color="#9370DB"
          emissive="#9370DB"
          emissiveIntensity={1.0}
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Base pad — stone */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.48, 0.1, 10]} />
        <meshStandardMaterial color="#7A7A70" metalness={0.2} roughness={0.8} />
      </mesh>

      {/* Base accent ring — purple trim */}
      <mesh position={[0, 0.01, 0]}>
        <torusGeometry args={[0.46, 0.02, 8, 16]} />
        <meshStandardMaterial color="#9370DB" emissive="#9370DB" emissiveIntensity={1.5} />
      </mesh>

      {/* Support struts — stone */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((a, i) => (
        <mesh
          key={`strut-${i}`}
          position={[Math.cos(a) * 0.22, 0.45, Math.sin(a) * 0.22]}
          castShadow
        >
          <boxGeometry args={[0.04, 0.7, 0.04]} />
          <meshStandardMaterial color="#7A7A70" metalness={0.2} roughness={0.8} />
        </mesh>
      ))}

      {/* Slim cylindrical body — stone tower */}
      <mesh position={[0, height / 2 + 0.1, 0]} castShadow>
        <cylinderGeometry args={[bodyRadius, bodyRadius + 0.05, height, 10]} />
        <meshStandardMaterial color="#7A7A70" metalness={0.2} roughness={0.8} />
      </mesh>

      {/* Body accent rings — purple emissive trim */}
      {[0.25, 0.5, 0.75].map((frac, i) => (
        <mesh key={`ring-${i}`} position={[0, frac * height + 0.1, 0]}>
          <torusGeometry args={[bodyRadius + 0.03, 0.018, 8, 12]} />
          <meshStandardMaterial
            color="#9370DB"
            emissive="#9370DB"
            emissiveIntensity={2.0}
          />
        </mesh>
      ))}

      {/* Observation deck platform — stone */}
      <mesh position={[0, height + 0.08, 0]} castShadow>
        <cylinderGeometry args={[bodyRadius + 0.25, bodyRadius + 0.2, 0.07, 10]} />
        <meshStandardMaterial color="#7A7A70" metalness={0.2} roughness={0.8} />
      </mesh>

      {/* Railings */}
      {railings.map((r, i) => (
        <group key={`railing-${i}`}>
          <mesh position={[r.x, height + 0.22, r.z]}>
            <boxGeometry args={[0.018, 0.22, 0.018]} />
            <meshStandardMaterial color="#7A7A70" metalness={0.3} roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Railing top ring */}
      <mesh position={[0, height + 0.32, 0]}>
        <torusGeometry args={[bodyRadius + 0.22, 0.014, 6, railingCount]} />
        <meshStandardMaterial color="#7A7A70" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Wizard staff/wand — dark wood */}
      <mesh position={[bodyRadius + 0.4, height + 0.18, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.018, 0.03, 0.65 + level * 0.1, 8]} />
        <meshStandardMaterial color="#4A3520" metalness={0.1} roughness={0.8} />
      </mesh>

      {/* Staff support */}
      <mesh position={[bodyRadius + 0.1, height + 0.14, 0]}>
        <boxGeometry args={[0.07, 0.07, 0.07]} />
        <meshStandardMaterial color="#7A7A70" metalness={0.2} roughness={0.8} />
      </mesh>

      {/* Persistent arcane beam — extends to max range */}
      <mesh
        ref={laserRef}
        position={[barrelEnd + laserLength / 2, height + 0.18, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.005, 0.005, laserLength, 4]} />
        <meshStandardMaterial
          color="#9370DB"
          emissive="#9370DB"
          emissiveIntensity={2.0}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Crystal scope — always visible */}
      <mesh position={[bodyRadius + 0.18, height + 0.26, 0]}>
        <cylinderGeometry args={[0.035, 0.025, 0.14, 8]} />
        <meshStandardMaterial color="#4A3520" metalness={0.1} roughness={0.7} />
      </mesh>

      {/* Scope glint — pulsing purple sphere */}
      <mesh ref={scopeGlintRef} position={[bodyRadius + 0.18, height + 0.34, 0]}>
        <sphereGeometry args={[0.025, 10, 10]} />
        <meshStandardMaterial
          color="#DDA0DD"
          emissive="#9370DB"
          emissiveIntensity={2.0}
        />
      </mesh>

      {/* Level 2+: enhanced scope & stabilizer */}
      {level >= 2 && (
        <>
          {/* Stabilizer fins — stone */}
          {[0.05, -0.05].map((z, i) => (
            <mesh key={`fin-${i}`} position={[bodyRadius + 0.3, height + 0.18, z]}>
              <boxGeometry args={[0.15, 0.02, 0.01]} />
              <meshStandardMaterial color="#7A7A70" metalness={0.2} roughness={0.8} />
            </mesh>
          ))}
        </>
      )}

      {/* Level 3: crystal dish, armored top, point light */}
      {level >= 3 && (
        <>
          {/* Crystal focusing dish */}
          <mesh position={[0, height + 0.45, 0]} rotation={[Math.PI / 6, 0, 0]}>
            <cylinderGeometry args={[0.0, 0.18, 0.1, 12]} />
            <meshStandardMaterial color="#7A7A70" metalness={0.2} roughness={0.8} />
          </mesh>
          {/* Arcane light — purple emissive */}
          <mesh position={[0, height + 0.4, 0]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial
              color="#9370DB"
              emissive="#9370DB"
              emissiveIntensity={2.5}
            />
          </mesh>
          <pointLight position={[0, height * 0.5, 0]} color="#9370DB" intensity={1.0} distance={3} />
        </>
      )}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  TESLA TOWER — Tesla coil-inspired structure                       */
/* ------------------------------------------------------------------ */
function TeslaTowerModel({ level, color: _color }: { level: number; color: string }) {
  const arcGroupRef = useRef<THREE.Group>(null)
  const topSphereRef = useRef<THREE.Mesh>(null)
  const baseGlowRef = useRef<THREE.Mesh>(null)
  const height = 1.69 + level * 0.455
  const glowIntensity = 1.5 + level * 0.5

  const sparkCount = 6 + level * 3
  const sparkRefs = useRef<(THREE.Mesh | null)[]>([])
  const sparks = useMemo(() => {
    const items = []
    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const r = 0.1 + Math.random() * 0.25
      items.push({
        x: Math.cos(angle) * r,
        z: Math.sin(angle) * r,
        y: height + 0.15 + Math.random() * 0.3,
      })
    }
    return items
  }, [sparkCount, height])

  // Generate random arc segments
  const arcs = useMemo(() => {
    const arcList = []
    const arcCount = 2 + level * 2
    for (let i = 0; i < arcCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const startY = 0.39 + Math.random() * height * 0.6
      const endAngle = angle + (Math.random() - 0.5) * 1.5
      const endY = startY + (Math.random() - 0.5) * 0.4
      const startR = 0.195
      const endR = 0.455 + Math.random() * 0.26
      arcList.push({
        start: new THREE.Vector3(Math.cos(angle) * startR, startY, Math.sin(angle) * startR),
        end: new THREE.Vector3(Math.cos(endAngle) * endR, endY, Math.sin(endAngle) * endR),
      })
    }
    return arcList
  }, [level, height])

  useFrame((state) => {
    if (arcGroupRef.current) {
      arcGroupRef.current.children.forEach((child) => {
        child.visible = Math.random() > 0.3
      })
    }
    if (topSphereRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.08
      topSphereRef.current.scale.set(s, s, s)
    }
    if (baseGlowRef.current) {
      const glow = 0.4 + Math.sin(state.clock.elapsedTime * 1.7) * 0.15
      ;(baseGlowRef.current.material as THREE.MeshStandardMaterial).opacity = glow
    }
    // Randomly toggle spark visibility
    sparkRefs.current.forEach((mesh) => {
      if (mesh) {
        mesh.visible = Math.random() > 0.55
      }
    })
  })

  const coilRingCount = 4 + level
  const coilRings = useMemo(() => {
    const rings = []
    for (let i = 0; i < coilRingCount; i++) {
      const t = (i + 1) / (coilRingCount + 1)
      const y = t * height + 0.13
      const radius = 0.286 - t * 0.104
      rings.push({ y, radius })
    }
    return rings
  }, [coilRingCount, height])

  return (
    <group>
      {/* Golden emissive ground ring — nature magic */}
      <mesh ref={baseGlowRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.75, 32]} />
        <meshStandardMaterial
          color="#DAA520"
          emissive="#DAA520"
          emissiveIntensity={1.0}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Wide natural wood base */}
      <mesh position={[0, 0.13, 0]} castShadow>
        <cylinderGeometry args={[0.52, 0.65, 0.26, 12]} />
        <meshStandardMaterial color="#8B6F4E" metalness={0.1} roughness={0.85} />
      </mesh>

      {/* Base detail ring — golden emissive */}
      <mesh position={[0, 0.065, 0]}>
        <torusGeometry args={[0.624, 0.039, 8, 16]} />
        <meshStandardMaterial color="#DAA520" emissive="#DAA520" emissiveIntensity={2.0} metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Base vine ring (large torus) — wood with golden glow */}
      <mesh position={[0, 0.325, 0]}>
        <torusGeometry args={[0.455, 0.052, 8, 16]} />
        <meshStandardMaterial color="#5A7A3D" emissive="#DAA520" emissiveIntensity={0.6} metalness={0.1} roughness={0.8} />
      </mesh>

      {/* Central wood pillar */}
      <mesh position={[0, height / 2 + 0.26, 0]} castShadow>
        <cylinderGeometry args={[0.104, 0.182, height, 8]} />
        <meshStandardMaterial color="#8B6F4E" metalness={0.1} roughness={0.85} />
      </mesh>

      {/* Vine/leaf rings up the pillar — green with golden glow */}
      {coilRings.map((ring, i) => (
        <mesh key={`coil-${i}`} position={[0, ring.y, 0]}>
          <torusGeometry args={[ring.radius, 0.026, 8, 16]} />
          <meshStandardMaterial
            color="#5A7A3D"
            metalness={0.1}
            roughness={0.8}
            emissive="#DAA520"
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}

      {/* Top sphere — golden nature glow */}
      <mesh ref={topSphereRef} position={[0, height + 0.325, 0]} castShadow>
        <sphereGeometry args={[0.195 + level * 0.052, 16, 16]} />
        <meshStandardMaterial
          color="#ADFF2F"
          emissive="#DAA520"
          emissiveIntensity={glowIntensity}
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>

      {/* Top toroid ring — wood with golden emissive */}
      <mesh position={[0, height + 0.26, 0]}>
        <torusGeometry args={[0.26 + level * 0.052, 0.039, 8, 16]} />
        <meshStandardMaterial
          color="#8B6F4E"
          emissive="#DAA520"
          emissiveIntensity={glowIntensity * 0.6}
          metalness={0.1}
          roughness={0.7}
        />
      </mesh>

      {/* Nature spark particles around top */}
      {sparks.map((sp, i) => (
        <mesh
          key={`spark-${i}`}
          ref={(el) => { sparkRefs.current[i] = el }}
          position={[sp.x, sp.y, sp.z]}
        >
          <sphereGeometry args={[0.018, 5, 5]} />
          <meshStandardMaterial
            color="#ADFF2F"
            emissive="#DAA520"
            emissiveIntensity={2.5}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}

      {/* Nature lightning arcs — golden */}
      <group ref={arcGroupRef} position={[0, 0, 0]}>
        {arcs.map((arc, i) => {
          const dir = new THREE.Vector3().subVectors(arc.end, arc.start)
          const len = dir.length()
          const mid = new THREE.Vector3().addVectors(arc.start, arc.end).multiplyScalar(0.5)
          const quat = new THREE.Quaternion()
          quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize())
          return (
            <mesh key={`arc-${i}`} position={[mid.x, mid.y, mid.z]} quaternion={quat}>
              <cylinderGeometry args={[0.0052, 0.0052, len, 4]} />
              <meshStandardMaterial
                color="#DAA520"
                emissive="#DAA520"
                emissiveIntensity={2.5}
                transparent
                opacity={0.75}
              />
            </mesh>
          )
        })}
      </group>

      {/* Level 2: secondary branch — wood */}
      {level >= 2 && (
        <>
          <mesh position={[0.26, height * 0.5, 0.195]} castShadow>
            <cylinderGeometry args={[0.052, 0.078, height * 0.5, 6]} />
            <meshStandardMaterial color="#8B6F4E" metalness={0.1} roughness={0.85} />
          </mesh>
          <mesh position={[0.26, height * 0.75 + 0.065, 0.195]}>
            <sphereGeometry args={[0.091, 10, 10]} />
            <meshStandardMaterial
              color="#ADFF2F"
              emissive="#DAA520"
              emissiveIntensity={glowIntensity * 0.7}
              metalness={0.2}
              roughness={0.3}
            />
          </mesh>
        </>
      )}

      {/* Level 3: multiple nature orbs, golden point light */}
      {level >= 3 && (
        <>
          <mesh position={[-0.26, height * 0.5, -0.195]} castShadow>
            <cylinderGeometry args={[0.052, 0.078, height * 0.5, 6]} />
            <meshStandardMaterial color="#8B6F4E" metalness={0.1} roughness={0.85} />
          </mesh>
          <mesh position={[-0.26, height * 0.75 + 0.065, -0.195]}>
            <sphereGeometry args={[0.091, 10, 10]} />
            <meshStandardMaterial
              color="#ADFF2F"
              emissive="#DAA520"
              emissiveIntensity={glowIntensity * 0.7}
              metalness={0.2}
              roughness={0.3}
            />
          </mesh>
          {/* Big vine toroid — wood with golden glow */}
          <mesh position={[0, height + 0.325, 0]}>
            <torusGeometry args={[0.416, 0.052, 8, 20]} />
            <meshStandardMaterial
              color="#5A7A3D"
              emissive="#DAA520"
              emissiveIntensity={1.8}
              metalness={0.1}
              roughness={0.7}
            />
          </mesh>
          <pointLight position={[0, height + 0.325, 0]} color="#DAA520" intensity={2.5} distance={5} />
        </>
      )}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  TOWER REGISTRY & MAIN COMPONENT                                   */
/* ------------------------------------------------------------------ */
const TOWER_MODELS: Record<string, React.FC<{ level: number; color: string }>> = {
  arrow: ArrowTowerModel,
  cannon: CannonTowerModel,
  frost: FrostTowerModel,
  sniper: SniperTowerModel,
  tesla: TeslaTowerModel,
}

export function Tower({ tower }: { tower: PlacedTower }) {
  const groupRef = useRef<THREE.Group>(null)
  const selectTower = useGameStore((s) => s.selectTower)
  const selectedTowerId = useGameStore((s) => s.selectedTowerId)
  const config = TOWER_CONFIGS[tower.type]
  const isSelected = selectedTowerId === tower.id
  const [wx, , wz] = gridToWorld(tower.gridX, tower.gridZ)

  const TowerModel = TOWER_MODELS[tower.type]

  // Tower placement animation
  useFrame(() => {
    if (groupRef.current) {
      const yOffset = useTowerAnimStore.getState().getYOffset(tower.id)
      groupRef.current.position.y = yOffset
    }
  })

  return (
    <group
      ref={groupRef}
      position={[wx, 0, wz]}
      onClick={(e) => {
        e.stopPropagation()
        selectTower(tower.id)
      }}
    >
      <TowerModel level={tower.level} color={config.color} />
      {/* Range circle when selected */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry
            args={[
              config.levels[tower.level].range - 0.05,
              config.levels[tower.level].range,
              64,
            ]}
          />
          <meshBasicMaterial color="#D4A24C" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  )
}
