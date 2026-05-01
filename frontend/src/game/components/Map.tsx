import { useState, useCallback, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import {
  PATH_WAYPOINTS,
  GRID_SIZE,
  GRID_COLS,
  GRID_ROWS,
  VALID_TILES,
  gridToWorld,
} from '../constants'
import { useGameStore } from '../state'

// Glowing torch at path turns
function Torch({ position }: { position: [number, number, number] }) {
  const lightRef = useRef<THREE.PointLight>(null)
  useFrame(({ clock }) => {
    if (lightRef.current) {
      lightRef.current.intensity = 1.2 + Math.sin(clock.elapsedTime * 4 + position[0]) * 0.4
    }
  })
  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 1.0, 6]} />
        <meshStandardMaterial color="#4A3520" roughness={0.9} />
      </mesh>
      {/* Flame base */}
      <mesh position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.12, 0.1, 0.2, 8]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.8} />
      </mesh>
      {/* Flame glow */}
      <mesh position={[0, 1.22, 0]}>
        <sphereGeometry args={[0.14, 8, 8]} />
        <meshStandardMaterial color="#FF6A00" emissive="#FF4400" emissiveIntensity={2.5} transparent opacity={0.9} />
      </mesh>
      <pointLight ref={lightRef} position={[0, 1.3, 0]} color="#FF8800" intensity={1.2} distance={4} decay={2} />
    </group>
  )
}

// Crystal formation decoration
function Crystal({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.3
    }
  })
  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh position={[0, 0.4, 0]}>
        <coneGeometry args={[0.15, 0.8, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.85} roughness={0.1} metalness={0.3} />
      </mesh>
      <mesh position={[0.18, 0.25, 0.1]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.1, 0.55, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} transparent opacity={0.75} roughness={0.1} />
      </mesh>
      <mesh position={[-0.15, 0.2, -0.08]} rotation={[0, 0, -0.25]}>
        <coneGeometry args={[0.08, 0.45, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} transparent opacity={0.7} roughness={0.1} />
      </mesh>
    </group>
  )
}

// Ancient stone pillar
function Pillar({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.3, 1.6, 8]} />
        <meshStandardMaterial color="#5A5A50" roughness={0.85} metalness={0.1} />
      </mesh>
      {/* Capital */}
      <mesh position={[0, 1.65, 0]}>
        <boxGeometry args={[0.7, 0.15, 0.7]} />
        <meshStandardMaterial color="#4A4A42" roughness={0.9} />
      </mesh>
      {/* Base */}
      <mesh position={[0, 0.07, 0]}>
        <boxGeometry args={[0.6, 0.14, 0.6]} />
        <meshStandardMaterial color="#4A4A42" roughness={0.9} />
      </mesh>
    </group>
  )
}

// Rock cluster
function RockCluster({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.18, 0]} rotation={[0.1, 0.3, 0.1]} castShadow>
        <dodecahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color="#4A4238" roughness={0.95} metalness={0.05} />
      </mesh>
      <mesh position={[0.28, 0.12, 0.1]} rotation={[0.2, 0.8, 0.15]} castShadow>
        <dodecahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color="#3E3830" roughness={0.95} />
      </mesh>
      <mesh position={[-0.22, 0.09, -0.1]} rotation={[-0.1, 1.2, 0.1]} castShadow>
        <dodecahedronGeometry args={[0.15, 0]} />
        <meshStandardMaterial color="#4A4238" roughness={0.95} />
      </mesh>
    </group>
  )
}

// Tree
function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, 1.0, 6]} />
        <meshStandardMaterial color="#3D2B1A" roughness={0.9} />
      </mesh>
      {/* Canopy layers */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <coneGeometry args={[0.55, 0.9, 7]} />
        <meshStandardMaterial color="#1A3A1A" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.75, 0]} castShadow>
        <coneGeometry args={[0.38, 0.7, 7]} />
        <meshStandardMaterial color="#1E4A1E" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.1, 0]} castShadow>
        <coneGeometry args={[0.22, 0.5, 7]} />
        <meshStandardMaterial color="#22542A" roughness={0.8} />
      </mesh>
    </group>
  )
}

// Fortress base / end structure
function FortressBase({ position }: { position: [number, number, number] }) {
  const glowRef = useRef<THREE.PointLight>(null)
  useFrame(({ clock }) => {
    if (glowRef.current) {
      glowRef.current.intensity = 1.5 + Math.sin(clock.elapsedTime * 2) * 0.5
    }
  })
  return (
    <group position={position}>
      {/* Main keep — medieval stone castle */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[1.8, 1.2, 1.8]} />
        <meshStandardMaterial color="#4A4540" roughness={0.85} metalness={0.2} />
      </mesh>
      {/* Battlements */}
      {[[-0.6, 0, -0.6], [0.6, 0, -0.6], [-0.6, 0, 0.6], [0.6, 0, 0.6]].map(([x, , z], i) => (
        <mesh key={i} position={[x, 1.45, z]} castShadow>
          <boxGeometry args={[0.35, 0.45, 0.35]} />
          <meshStandardMaterial color="#5A5550" roughness={0.85} />
        </mesh>
      ))}
      {/* Golden crystal atop keep */}
      <mesh position={[0, 1.85, 0]}>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color="#D4A24C" emissive="#D4A24C" emissiveIntensity={2} transparent opacity={0.9} />
      </mesh>
      <pointLight ref={glowRef} position={[0, 2, 0]} color="#D4A24C" intensity={1.5} distance={5} decay={2} />
    </group>
  )
}

// Entry gate structure
function EntryGate({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Left post — stone gate */}
      <mesh position={[-0.55, 0.7, 0]} castShadow>
        <boxGeometry args={[0.3, 1.4, 0.3]} />
        <meshStandardMaterial color="#5A5A50" roughness={0.85} />
      </mesh>
      {/* Right post */}
      <mesh position={[0.55, 0.7, 0]} castShadow>
        <boxGeometry args={[0.3, 1.4, 0.3]} />
        <meshStandardMaterial color="#5A5A50" roughness={0.85} />
      </mesh>
      {/* Arch */}
      <mesh position={[0, 1.45, 0]}>
        <boxGeometry args={[1.4, 0.25, 0.3]} />
        <meshStandardMaterial color="#4A4A42" roughness={0.85} />
      </mesh>
      {/* Golden gem */}
      <mesh position={[0, 1.65, 0]}>
        <octahedronGeometry args={[0.18, 0]} />
        <meshStandardMaterial color="#D4A24C" emissive="#D4A24C" emissiveIntensity={2} transparent opacity={0.9} />
      </mesh>
      <pointLight position={[0, 1.7, 0]} color="#D4A24C" intensity={1.0} distance={4} decay={2} />
    </group>
  )
}

// Lava crack / glowing ground fissure
function LavaCrack({ position, rotation = 0, length = 2 }: { position: [number, number, number]; rotation?: number; length?: number }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.6 + Math.sin(clock.elapsedTime * 1.5 + position[0]) * 0.3
    }
  })
  return (
    <mesh ref={ref} position={position} rotation={[-Math.PI / 2, 0, rotation]}>
      <planeGeometry args={[0.18, length]} />
      <meshStandardMaterial color="#C8963E" emissive="#D4A24C" emissiveIntensity={0.8} transparent opacity={0.85} />
    </mesh>
  )
}

function PathVisualization() {
  // Torch positions at path corners (waypoints 1..13, skip start/end)
  const torchPositions: [number, number, number][] = PATH_WAYPOINTS.slice(1, -1).map(
    ([x, , z]) => [x, 0, z] as [number, number, number]
  )

  return (
    <group>
      {/* Road segments — dark stone with edge highlight */}
      {PATH_WAYPOINTS.slice(0, -1).map((start, i) => {
        const end = PATH_WAYPOINTS[i + 1]
        const midX = (start[0] + end[0]) / 2
        const midZ = (start[2] + end[2]) / 2
        const dx = end[0] - start[0]
        const dz = end[2] - start[2]
        const len = Math.sqrt(dx * dx + dz * dz)
        const angle = Math.atan2(dx, dz)

        return (
          <group key={`road-${i}`}>
            {/* Main road surface — dirt path */}
            <mesh position={[midX, 0.02, midZ]} rotation={[-Math.PI / 2, 0, angle]} receiveShadow>
              <planeGeometry args={[1.9, len]} />
              <meshStandardMaterial color="#2A2218" roughness={0.95} />
            </mesh>
            {/* Subtle edge lines — worn stone border */}
            <mesh position={[midX, 0.03, midZ]} rotation={[-Math.PI / 2, 0, angle]}>
              <planeGeometry args={[2.1, len]} />
              <meshStandardMaterial color="#4A4238" emissive="#3E3830" emissiveIntensity={0.2} transparent opacity={0.3} />
            </mesh>
          </group>
        )
      })}

      {/* Torches at each corner */}
      {torchPositions.map((pos, i) => (
        <Torch key={`torch-${i}`} position={[pos[0], 0, pos[2]]} />
      ))}

      {/* Start marker — green gate */}
      <EntryGate position={[PATH_WAYPOINTS[0][0] + 1, 0, PATH_WAYPOINTS[0][2]]} />
      <mesh position={[PATH_WAYPOINTS[0][0], 0.08, PATH_WAYPOINTS[0][2]]}>
        <cylinderGeometry args={[0.6, 0.6, 0.16, 16]} />
        <meshStandardMaterial color="#4ADE80" emissive="#4ADE80" emissiveIntensity={0.6} />
      </mesh>

      {/* End marker — fortress base */}
      <FortressBase position={[PATH_WAYPOINTS[PATH_WAYPOINTS.length - 1][0] - 1, 0, PATH_WAYPOINTS[PATH_WAYPOINTS.length - 1][2]]} />
      <mesh position={[PATH_WAYPOINTS[PATH_WAYPOINTS.length - 1][0], 0.08, PATH_WAYPOINTS[PATH_WAYPOINTS.length - 1][2]]}>
        <cylinderGeometry args={[0.6, 0.6, 0.16, 16]} />
        <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={0.6} />
      </mesh>
    </group>
  )
}

function GridTiles() {
  const [hoveredTile, setHoveredTile] = useState<string | null>(null)
  const selectedTowerType = useGameStore((s) => s.selectedTowerType)
  const towers = useGameStore((s) => s.towers)
  const placeTower = useGameStore((s) => s.placeTower)

  const handleClick = useCallback(
    (gridX: number, gridZ: number) => {
      if (selectedTowerType) {
        placeTower(selectedTowerType, gridX, gridZ)
      }
    },
    [selectedTowerType, placeTower]
  )

  if (!selectedTowerType) return null

  return (
    <group>
      {VALID_TILES.map(([col, row]) => {
        const [wx, , wz] = gridToWorld(col, row)
        const key = `${col}-${row}`
        const isOccupied = towers.some((t) => t.gridX === col && t.gridZ === row)
        const isHovered = hoveredTile === key

        return (
          <mesh
            key={key}
            position={[wx, 0.02, wz]}
            rotation={[-Math.PI / 2, 0, 0]}
            onPointerOver={(e: ThreeEvent<PointerEvent>) => {
              e.stopPropagation()
              setHoveredTile(key)
            }}
            onPointerOut={() => setHoveredTile(null)}
            onClick={(e: ThreeEvent<MouseEvent>) => {
              e.stopPropagation()
              if (!isOccupied) handleClick(col, row)
            }}
          >
            <planeGeometry args={[GRID_SIZE * 0.9, GRID_SIZE * 0.9]} />
            <meshStandardMaterial
              color={isOccupied ? '#EF4444' : isHovered ? '#4ADE80' : '#374151'}
              transparent
              opacity={isHovered ? 0.5 : 0.15}
            />
          </mesh>
        )
      })}
    </group>
  )
}

// Environment decorations — trees, rocks, crystals scattered around the map
function EnvironmentDecorations() {
  return (
    <group>
      {/* Corner crystal formations — emerald and amber gems */}
      <Crystal position={[-11, 0, -6.5]} color="#2E8B57" scale={1.2} />
      <Crystal position={[-10, 0, 6.5]} color="#2E8B57" scale={0.9} />
      <Crystal position={[11, 0, 6]} color="#D4A24C" scale={1.1} />
      <Crystal position={[10, 0, -6]} color="#D4A24C" scale={0.8} />

      {/* Trees scattered in open areas */}
      <Tree position={[-10, 0, -5]} scale={0.9} />
      <Tree position={[-9, 0, 4.5]} scale={1.1} />
      <Tree position={[-6, 0, 5.5]} scale={0.85} />
      <Tree position={[0, 0, -5.5]} scale={1.0} />
      <Tree position={[2, 0, 5.5]} scale={0.9} />
      <Tree position={[6, 0, -5.5]} scale={1.05} />
      <Tree position={[10, 0, 0]} scale={0.8} />
      <Tree position={[-2, 0, 0.5]} scale={0.95} />
      <Tree position={[2, 0, -1.5]} scale={0.85} />

      {/* Rock clusters */}
      <RockCluster position={[-10.5, 0, 0.5]} scale={1.2} />
      <RockCluster position={[-7, 0, -6]} scale={0.9} />
      <RockCluster position={[-2, 0, -6]} scale={1.0} />
      <RockCluster position={[1, 0, 0.5]} scale={0.85} />
      <RockCluster position={[6.5, 0, 0.5]} scale={1.1} />
      <RockCluster position={[9.5, 0, -5]} scale={0.9} />
      <RockCluster position={[5, 0, -5.5]} scale={0.8} />
      <RockCluster position={[-6, 0, 0.5]} scale={0.95} />

      {/* Ancient pillars flanking path zones */}
      <Pillar position={[-5.2, 0, -4]} />
      <Pillar position={[-2.8, 0, -4]} />
      <Pillar position={[-5.2, 0, 4]} />
      <Pillar position={[-2.8, 0, 4]} />
      <Pillar position={[3, 0, -4]} />
      <Pillar position={[5, 0, -4]} />
      <Pillar position={[3, 0, 4]} />
      <Pillar position={[5, 0, 4]} />

      {/* Lava cracks at map edges — add danger feel */}
      <LavaCrack position={[-11, 0.01, 2]} length={3} rotation={0} />
      <LavaCrack position={[-11, 0.01, -2]} length={2.5} rotation={0.2} />
      <LavaCrack position={[11, 0.01, 1]} length={3} rotation={0.1} />
      <LavaCrack position={[11, 0.01, -5]} length={2} rotation={-0.15} />
      <LavaCrack position={[0, 0.01, -7.5]} length={2} rotation={Math.PI / 2} />
      <LavaCrack position={[7, 0.01, -7.5]} length={2.5} rotation={Math.PI / 2 + 0.1} />
    </group>
  )
}

// Outer stone wall perimeter
function PerimeterWalls() {
  const wallColor = '#2E2E28'
  const wallMat = { color: wallColor, roughness: 0.9, metalness: 0.05 }
  return (
    <group>
      {/* North wall */}
      <mesh position={[0, 0.3, -9]} castShadow receiveShadow>
        <boxGeometry args={[28, 0.6, 0.5]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>
      {/* South wall */}
      <mesh position={[0, 0.3, 9]} castShadow receiveShadow>
        <boxGeometry args={[28, 0.6, 0.5]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>
      {/* West wall */}
      <mesh position={[-13, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.6, 18.5]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>
      {/* East wall */}
      <mesh position={[13, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.6, 18.5]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>
      {/* Corner watchtowers */}
      {[[-13, -9], [13, -9], [-13, 9], [13, 9]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.6, z]} castShadow>
          <cylinderGeometry args={[0.6, 0.7, 1.2, 8]} />
          <meshStandardMaterial color="#3A3830" roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}

export function GameMap() {
  return (
    <group>
      {/* Ground — multi-layer terrain */}
      {/* Outer dark zone */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[32, 22]} />
        <meshStandardMaterial color="#0F1308" roughness={0.98} />
      </mesh>
      {/* Main play area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[27, 19]} />
        <meshStandardMaterial color="#162014" roughness={0.96} />
      </mesh>
      {/* Center courtyard tint */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[GRID_COLS * GRID_SIZE, GRID_ROWS * GRID_SIZE]} />
        <meshStandardMaterial color="#1C261A" roughness={0.95} transparent opacity={0.6} />
      </mesh>
      {/* Subtle grid lines overlay */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <planeGeometry args={[GRID_COLS * GRID_SIZE, GRID_ROWS * GRID_SIZE]} />
        <meshStandardMaterial color="#2E3C2A" roughness={0.9} transparent opacity={0.12} wireframe />
      </mesh>

      <PerimeterWalls />
      <EnvironmentDecorations />
      <PathVisualization />
      <GridTiles />
    </group>
  )
}
