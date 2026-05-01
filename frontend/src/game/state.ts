import { create } from 'zustand'
import { useTowerAnimStore } from './components/TowerPlacementEffect'
import type {
  GameState,
  GamePhase,
  GameSpeed,
  TowerType,
  PlacedTower,
  ActiveEnemy,
  Projectile,
  EnemyType,
} from './types'
import {
  STARTING_GOLD,
  STARTING_LIVES,
  TOWER_CONFIGS,
  ENEMY_CONFIGS,
  generateWave,
  waveHpScale,
} from './constants'

let nextId = 1
function uid(): string {
  return `e${nextId++}`
}

interface GameActions {
  // Tower actions
  placeTower: (type: TowerType, gridX: number, gridZ: number) => void
  upgradeTower: (towerId: string) => void
  sellTower: (towerId: string) => void
  selectTowerType: (type: TowerType | null) => void
  selectTower: (towerId: string | null) => void

  // Enemy actions
  spawnEnemy: (type: EnemyType, waveNumber: number) => void
  damageEnemy: (enemyId: string, damage: number) => void
  killEnemy: (enemyId: string) => void
  removeEnemy: (enemyId: string) => void
  slowEnemy: (enemyId: string, factor: number, duration: number) => void

  // Projectile actions
  addProjectile: (proj: Omit<Projectile, 'id' | 'progress'>) => void
  removeProjectile: (projectileId: string) => void

  // Game flow
  startWave: () => void
  endWave: () => void
  loseLife: (amount: number) => void
  addGold: (amount: number) => void
  addScore: (amount: number) => void
  setSpeed: (speed: GameSpeed) => void
  setPhase: (phase: GamePhase) => void
  pause: () => void
  resume: () => void
  reset: () => void

  // Bulk update for game loop
  updateEnemies: (enemies: ActiveEnemy[]) => void
  updateProjectiles: (projectiles: Projectile[]) => void
  updateTower: (towerId: string, updates: Partial<PlacedTower>) => void
  setSpawnQueue: (queue: GameState['spawnQueue']) => void
}

const initialState: GameState = {
  gold: STARTING_GOLD,
  lives: STARTING_LIVES,
  score: 0,
  wave: 0,
  phase: 'menu',
  speed: 1,
  towers: [],
  enemies: [],
  projectiles: [],
  selectedTowerType: null,
  selectedTowerId: null,
  enemiesKilled: 0,
  currentWave: null,
  spawnQueue: [],
  waveStartTime: 0,
}

export const useGameStore = create<GameState & GameActions>()((set, get) => ({
  ...initialState,

  placeTower: (type, gridX, gridZ) => {
    const config = TOWER_CONFIGS[type]
    if (!config) return
    const state = get()
    if (state.gold < config.cost) return
    // Check if tile is occupied
    if (state.towers.some((t) => t.gridX === gridX && t.gridZ === gridZ)) return

    const tower: PlacedTower = {
      id: uid(),
      type,
      level: 0,
      gridX,
      gridZ,
      lastFireTime: 0,
      targetId: null,
    }
    set({
      towers: [...state.towers, tower],
      gold: state.gold - config.cost,
      selectedTowerType: null,
      selectedTowerId: tower.id,
    })
    useTowerAnimStore.getState().addAnimation(tower.id, 'place')
  },

  upgradeTower: (towerId) => {
    const state = get()
    const tower = state.towers.find((t) => t.id === towerId)
    if (!tower) return
    const config = TOWER_CONFIGS[tower.type]
    if (!config) return
    const levelConfig = config.levels[tower.level]
    if (!levelConfig.upgradeCost) return // max level
    if (state.gold < levelConfig.upgradeCost) return

    set({
      towers: state.towers.map((t) =>
        t.id === towerId ? { ...t, level: t.level + 1 } : t
      ),
      gold: state.gold - levelConfig.upgradeCost,
    })
  },

  sellTower: (towerId) => {
    const state = get()
    const tower = state.towers.find((t) => t.id === towerId)
    if (!tower) return
    const config = TOWER_CONFIGS[tower.type]
    if (!config) return
    // Refund 50% of total invested
    let totalCost = config.cost
    for (let i = 0; i < tower.level; i++) {
      totalCost += config.levels[i].upgradeCost || 0
    }
    const refund = Math.floor(totalCost * 0.5)

    // Trigger sell animation
    useTowerAnimStore.getState().addAnimation(towerId, 'sell')

    // Delay actual removal for animation
    setTimeout(() => {
      set((s) => ({
        towers: s.towers.filter((t) => t.id !== towerId),
        selectedTowerId: s.selectedTowerId === towerId ? null : s.selectedTowerId,
      }))
    }, 400)

    // Give gold immediately
    set({
      gold: state.gold + refund,
      selectedTowerId: null,
    })
  },

  selectTowerType: (type) => set({ selectedTowerType: type, selectedTowerId: null }),
  selectTower: (towerId) => set({ selectedTowerId: towerId, selectedTowerType: null }),

  spawnEnemy: (type, waveNumber) => {
    const config = ENEMY_CONFIGS[type]
    if (!config) return
    const hpScale = waveHpScale(waveNumber)
    const enemy: ActiveEnemy = {
      id: uid(),
      type,
      hp: Math.floor(config.baseHp * hpScale),
      maxHp: Math.floor(config.baseHp * hpScale),
      speed: config.speed,
      pathProgress: 0,
      slowTimer: 0,
      alive: true,
      deathTime: null,
    }
    set((state) => ({ enemies: [...state.enemies, enemy] }))
  },

  damageEnemy: (enemyId, damage) => {
    set((state) => ({
      enemies: state.enemies.map((e) =>
        e.id === enemyId ? { ...e, hp: Math.max(0, e.hp - damage) } : e
      ),
    }))
  },

  killEnemy: (enemyId) => {
    const state = get()
    const enemy = state.enemies.find((e) => e.id === enemyId)
    if (!enemy) return
    const config = ENEMY_CONFIGS[enemy.type]
    if (!config) return

    set({
      enemies: state.enemies.map((e) =>
        e.id === enemyId ? { ...e, alive: false, deathTime: performance.now() } : e
      ),
      gold: state.gold + config.reward,
      score: state.score + config.reward * 2,
      enemiesKilled: state.enemiesKilled + 1,
    })
  },

  removeEnemy: (enemyId) => {
    set((state) => ({
      enemies: state.enemies.filter((e) => e.id !== enemyId),
    }))
  },

  slowEnemy: (enemyId, factor, duration) => {
    set((state) => ({
      enemies: state.enemies.map((e) =>
        e.id === enemyId
          ? { ...e, speed: ENEMY_CONFIGS[e.type].speed * factor, slowTimer: duration }
          : e
      ),
    }))
  },

  addProjectile: (proj) => {
    const projectile: Projectile = { ...proj, id: uid(), progress: 0 }
    set((state) => ({ projectiles: [...state.projectiles, projectile] }))
  },

  removeProjectile: (projectileId) => {
    set((state) => ({
      projectiles: state.projectiles.filter((p) => p.id !== projectileId),
    }))
  },

  startWave: () => {
    const state = get()
    const nextWave = state.wave + 1
    const waveDef = generateWave(nextWave)

    // Build spawn queue with absolute timestamps
    const queue: GameState['spawnQueue'] = []
    let time = 0
    for (const group of waveDef.groups) {
      time += group.delayAfterPrevGroup
      for (let i = 0; i < group.count; i++) {
        queue.push({ enemyType: group.enemyType, spawnAt: time })
        time += group.spawnInterval
      }
    }

    set({
      wave: nextWave,
      phase: 'playing',
      currentWave: waveDef,
      spawnQueue: queue,
      waveStartTime: performance.now() / 1000,
    })
  },

  endWave: () => {
    const state = get()
    set({
      phase: 'between_waves',
      currentWave: null,
      spawnQueue: [],
      score: state.score + state.wave * 50,
    })
  },

  loseLife: (amount) => {
    const state = get()
    const newLives = Math.max(0, state.lives - amount)
    set({ lives: newLives })
    if (newLives <= 0) {
      set({ phase: 'gameover' })
    }
  },

  addGold: (amount) => set((state) => ({ gold: state.gold + amount })),
  addScore: (amount) => set((state) => ({ score: state.score + amount })),
  setSpeed: (speed) => set({ speed }),
  setPhase: (phase) => set({ phase }),

  pause: () => {
    const state = get()
    if (state.phase === 'playing') set({ phase: 'paused' })
  },

  resume: () => {
    const state = get()
    if (state.phase === 'paused') set({ phase: 'playing' })
  },

  reset: () => {
    nextId = 1
    set({ ...initialState })
  },

  updateEnemies: (enemies) => set({ enemies }),
  updateProjectiles: (projectiles) => set({ projectiles }),
  updateTower: (towerId, updates) => {
    set((state) => ({
      towers: state.towers.map((t) => (t.id === towerId ? { ...t, ...updates } : t)),
    }))
  },
  setSpawnQueue: (queue) => set({ spawnQueue: queue }),
}))
