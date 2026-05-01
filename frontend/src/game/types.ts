export type TowerType = 'arrow' | 'cannon' | 'frost' | 'sniper' | 'tesla'

export interface TowerConfig {
  type: TowerType
  name: string
  description: string
  cost: number
  maxLevel: number
  levels: TowerLevelConfig[]
  color: string
  accentColor: string
}

export interface TowerLevelConfig {
  damage: number
  range: number
  fireRate: number // shots per second
  splashRadius?: number // cannon only
  chainCount?: number // tesla only
  slowFactor?: number // frost only
  upgradeCost: number | null // null = max level
}

export interface PlacedTower {
  id: string
  type: TowerType
  level: number
  gridX: number
  gridZ: number
  lastFireTime: number
  targetId: string | null
}

export type EnemyType = 'grunt' | 'runner' | 'tank' | 'healer' | 'boss'

export interface EnemyConfig {
  type: EnemyType
  name: string
  baseHp: number
  speed: number // units per second
  reward: number // gold on kill
  liveCost: number // lives lost when reaching base
  color: string
  scale: number
}

export interface ActiveEnemy {
  id: string
  type: EnemyType
  hp: number
  maxHp: number
  speed: number
  pathProgress: number // 0-1 along the path
  slowTimer: number
  alive: boolean
  deathTime: number | null
}

export interface Projectile {
  id: string
  towerId: string
  towerType: TowerType
  targetId: string
  startPos: [number, number, number]
  endPos: [number, number, number]
  progress: number // 0-1
  damage: number
  splashRadius?: number
  chainCount?: number
  slowFactor?: number
}

export interface WaveDefinition {
  waveNumber: number
  groups: WaveGroup[]
}

export interface WaveGroup {
  enemyType: EnemyType
  count: number
  spawnInterval: number // seconds between each spawn
  delayAfterPrevGroup: number // seconds after previous group finishes spawning
}

export type GamePhase = 'menu' | 'playing' | 'between_waves' | 'paused' | 'gameover'
export type GameSpeed = 1 | 2 | 3

export interface GameState {
  // Resources
  gold: number
  lives: number
  score: number

  // Wave
  wave: number
  phase: GamePhase
  speed: GameSpeed

  // Entities
  towers: PlacedTower[]
  enemies: ActiveEnemy[]
  projectiles: Projectile[]

  // UI state
  selectedTowerType: TowerType | null
  selectedTowerId: string | null
  enemiesKilled: number

  // Wave spawning
  currentWave: WaveDefinition | null
  spawnQueue: { enemyType: EnemyType; spawnAt: number }[]
  waveStartTime: number
}
