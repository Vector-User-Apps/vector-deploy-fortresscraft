import type { TowerConfig, EnemyConfig, WaveDefinition, WaveGroup } from './types'

// ── Map Path Waypoints ──
// The winding path enemies follow, defined as [x, y, z] coordinates
export const PATH_WAYPOINTS: [number, number, number][] = [
  [-12, 0.05, -7],  // Entry: top-left gate
  [-4,  0.05, -7],  // Right along northern wall
  [-4,  0.05, -3],  // Turn south into outer ring
  [-8,  0.05, -3],  // West through outer ring
  [-8,  0.05,  3],  // South through western corridor
  [-4,  0.05,  3],  // East into southern zone
  [-4,  0.05,  7],  // South to bottom wall
  [ 4,  0.05,  7],  // East along southern wall
  [ 4,  0.05,  3],  // North into inner zone
  [ 8,  0.05,  3],  // East into eastern corridor
  [ 8,  0.05, -3],  // North through eastern corridor
  [ 4,  0.05, -3],  // West — inner loop
  [ 4,  0.05, -7],  // North back to top
  [12,  0.05, -7],  // East to exit gate
  [12,  0.05,  7],  // South — final boss corridor
]

// ── Grid Configuration ──
export const GRID_SIZE = 2 // each tile is 2x2 units
export const GRID_COLS = 13 // -12 to 12 → 13 columns
export const GRID_ROWS = 9 // -8 to 8 → 9 rows
export const GRID_OFFSET_X = -12
export const GRID_OFFSET_Z = -8

// Valid tower placement positions (grid coordinates)
// Excludes tiles that overlap with the path
function generateValidTiles(): [number, number][] {
  const tiles: [number, number][] = []
  for (let col = 0; col < GRID_COLS; col++) {
    for (let row = 0; row < GRID_ROWS; row++) {
      const worldX = GRID_OFFSET_X + col * GRID_SIZE + GRID_SIZE / 2
      const worldZ = GRID_OFFSET_Z + row * GRID_SIZE + GRID_SIZE / 2
      if (!isOnPath(worldX, worldZ)) {
        tiles.push([col, row])
      }
    }
  }
  return tiles
}

function isOnPath(x: number, z: number): boolean {
  const margin = 1.2
  for (let i = 0; i < PATH_WAYPOINTS.length - 1; i++) {
    const [ax, , az] = PATH_WAYPOINTS[i]
    const [bx, , bz] = PATH_WAYPOINTS[i + 1]
    // Check if point is near the line segment
    const dx = bx - ax
    const dz = bz - az
    const len = Math.sqrt(dx * dx + dz * dz)
    if (len === 0) continue
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (len * len)))
    const projX = ax + t * dx
    const projZ = az + t * dz
    const dist = Math.sqrt((x - projX) ** 2 + (z - projZ) ** 2)
    if (dist < margin) return true
  }
  return false
}

export const VALID_TILES = generateValidTiles()

// ── Starting Resources ──
export const STARTING_GOLD = 150
export const STARTING_LIVES = 20

// ── Tower Configurations ──
export const TOWER_CONFIGS: Record<string, TowerConfig> = {
  arrow: {
    type: 'arrow',
    name: 'Ranger Tower',
    description: 'Swift elven archers raining arrows from the treetops.',
    cost: 50,
    maxLevel: 3,
    color: '#6B8E23',
    accentColor: '#556B2F',
    levels: [
      { damage: 10, range: 5, fireRate: 2, upgradeCost: 40 },
      { damage: 18, range: 5.5, fireRate: 2.5, upgradeCost: 80 },
      { damage: 30, range: 6, fireRate: 3, upgradeCost: null },
    ],
  },
  cannon: {
    type: 'cannon',
    name: 'Catapult',
    description: 'Hurls flaming boulders that shatter on impact.',
    cost: 80,
    maxLevel: 3,
    color: '#CD853F',
    accentColor: '#A0522D',
    levels: [
      { damage: 25, range: 4, fireRate: 0.8, splashRadius: 2, upgradeCost: 60 },
      { damage: 45, range: 4.5, fireRate: 1, splashRadius: 2.5, upgradeCost: 120 },
      { damage: 70, range: 5, fireRate: 1.2, splashRadius: 3, upgradeCost: null },
    ],
  },
  frost: {
    type: 'frost',
    name: 'Ice Mage Tower',
    description: 'Ancient sorcerer who freezes foes with winter magic.',
    cost: 60,
    maxLevel: 3,
    color: '#87CEEB',
    accentColor: '#4682B4',
    levels: [
      { damage: 5, range: 4.5, fireRate: 1.5, slowFactor: 0.5, upgradeCost: 50 },
      { damage: 8, range: 5, fireRate: 1.8, slowFactor: 0.4, upgradeCost: 100 },
      { damage: 12, range: 5.5, fireRate: 2, slowFactor: 0.3, upgradeCost: null },
    ],
  },
  sniper: {
    type: 'sniper',
    name: 'Wizard Tower',
    description: 'A powerful mage casting devastating arcane bolts from afar.',
    cost: 100,
    maxLevel: 3,
    color: '#9370DB',
    accentColor: '#6A0DAD',
    levels: [
      { damage: 50, range: 8, fireRate: 0.5, upgradeCost: 80 },
      { damage: 90, range: 9, fireRate: 0.6, upgradeCost: 160 },
      { damage: 150, range: 10, fireRate: 0.7, upgradeCost: null },
    ],
  },
  tesla: {
    type: 'tesla',
    name: 'Druid Tower',
    description: 'Nature magic arcs between foes like lightning through ancient oaks.',
    cost: 120,
    maxLevel: 3,
    color: '#DAA520',
    accentColor: '#B8860B',
    levels: [
      { damage: 15, range: 5, fireRate: 1.2, chainCount: 2, upgradeCost: 100 },
      { damage: 25, range: 5.5, fireRate: 1.5, chainCount: 3, upgradeCost: 200 },
      { damage: 40, range: 6, fireRate: 1.8, chainCount: 4, upgradeCost: null },
    ],
  },
}

// ── Enemy Configurations ──
export const ENEMY_CONFIGS: Record<string, EnemyConfig> = {
  grunt: {
    type: 'grunt',
    name: 'Goblin',
    baseHp: 50,
    speed: 2,
    reward: 10,
    liveCost: 1,
    color: '#4A7A3D',
    scale: 0.4,
  },
  runner: {
    type: 'runner',
    name: 'Wolf',
    baseHp: 30,
    speed: 4,
    reward: 8,
    liveCost: 1,
    color: '#8B7355',
    scale: 0.3,
  },
  tank: {
    type: 'tank',
    name: 'Troll',
    baseHp: 200,
    speed: 1,
    reward: 25,
    liveCost: 3,
    color: '#5A6B5A',
    scale: 0.6,
  },
  healer: {
    type: 'healer',
    name: 'Shaman',
    baseHp: 60,
    speed: 1.8,
    reward: 15,
    liveCost: 1,
    color: '#2E8B57',
    scale: 0.4,
  },
  boss: {
    type: 'boss',
    name: 'Dragon',
    baseHp: 500,
    speed: 0.8,
    reward: 100,
    liveCost: 10,
    color: '#8B0000',
    scale: 0.8,
  },
}

// ── Wave Generation ──
export function generateWave(waveNumber: number): WaveDefinition {
  const groups: WaveGroup[] = []

  if (waveNumber % 10 === 0) {
    // Boss wave
    groups.push({
      enemyType: 'grunt',
      count: 5 + waveNumber,
      spawnInterval: 0.4,
      delayAfterPrevGroup: 0,
    })
    groups.push({
      enemyType: 'boss',
      count: Math.floor(waveNumber / 10),
      spawnInterval: 3,
      delayAfterPrevGroup: 2,
    })
  } else if (waveNumber <= 3) {
    groups.push({
      enemyType: 'grunt',
      count: 5 + waveNumber * 2,
      spawnInterval: 0.8,
      delayAfterPrevGroup: 0,
    })
  } else if (waveNumber <= 6) {
    groups.push({
      enemyType: 'grunt',
      count: 6 + waveNumber,
      spawnInterval: 0.6,
      delayAfterPrevGroup: 0,
    })
    groups.push({
      enemyType: 'runner',
      count: 3 + waveNumber,
      spawnInterval: 0.4,
      delayAfterPrevGroup: 1,
    })
  } else {
    groups.push({
      enemyType: 'grunt',
      count: 8 + waveNumber,
      spawnInterval: 0.5,
      delayAfterPrevGroup: 0,
    })
    if (waveNumber >= 5) {
      groups.push({
        enemyType: 'runner',
        count: 4 + Math.floor(waveNumber / 2),
        spawnInterval: 0.3,
        delayAfterPrevGroup: 1,
      })
    }
    if (waveNumber >= 7) {
      groups.push({
        enemyType: 'tank',
        count: 1 + Math.floor(waveNumber / 4),
        spawnInterval: 1.5,
        delayAfterPrevGroup: 2,
      })
    }
    if (waveNumber >= 9) {
      groups.push({
        enemyType: 'healer',
        count: 2 + Math.floor(waveNumber / 5),
        spawnInterval: 0.8,
        delayAfterPrevGroup: 1,
      })
    }
  }

  return { waveNumber, groups }
}

// HP scale factor for a given wave
export function waveHpScale(waveNumber: number): number {
  return 1 + (waveNumber - 1) * 0.15
}

// ── Path Utilities ──
export function getPathLength(): number {
  let total = 0
  for (let i = 0; i < PATH_WAYPOINTS.length - 1; i++) {
    const [ax, , az] = PATH_WAYPOINTS[i]
    const [bx, , bz] = PATH_WAYPOINTS[i + 1]
    total += Math.sqrt((bx - ax) ** 2 + (bz - az) ** 2)
  }
  return total
}

export function getPositionOnPath(progress: number): [number, number, number] {
  const totalLen = getPathLength()
  let targetDist = progress * totalLen
  for (let i = 0; i < PATH_WAYPOINTS.length - 1; i++) {
    const [ax, ay, az] = PATH_WAYPOINTS[i]
    const [bx, , bz] = PATH_WAYPOINTS[i + 1]
    const segLen = Math.sqrt((bx - ax) ** 2 + (bz - az) ** 2)
    if (targetDist <= segLen) {
      const t = segLen > 0 ? targetDist / segLen : 0
      return [ax + (bx - ax) * t, ay, az + (bz - az) * t]
    }
    targetDist -= segLen
  }
  return PATH_WAYPOINTS[PATH_WAYPOINTS.length - 1]
}

export function gridToWorld(gridX: number, gridZ: number): [number, number, number] {
  return [
    GRID_OFFSET_X + gridX * GRID_SIZE + GRID_SIZE / 2,
    0,
    GRID_OFFSET_Z + gridZ * GRID_SIZE + GRID_SIZE / 2,
  ]
}
