/**
 * Achievement system — tracks lifetime best stats in localStorage
 * and determines which medals have been earned.
 */

export interface PlayerStats {
  bestScore: number
  bestWave: number
  totalKills: number
  gamesPlayed: number
  bestKillsInGame: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  tier: 'bronze' | 'silver' | 'gold' | 'legendary'
  check: (stats: PlayerStats) => boolean
  progress: (stats: PlayerStats) => number // 0–1
}

const STORAGE_KEY = 'fortress-craft-stats'

const defaultStats: PlayerStats = {
  bestScore: 0,
  bestWave: 0,
  totalKills: 0,
  gamesPlayed: 0,
  bestKillsInGame: 0,
}

export function getStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...defaultStats }
    return { ...defaultStats, ...JSON.parse(raw) }
  } catch {
    return { ...defaultStats }
  }
}

export function recordGame(score: number, wave: number, kills: number): void {
  const prev = getStats()
  const updated: PlayerStats = {
    bestScore: Math.max(prev.bestScore, score),
    bestWave: Math.max(prev.bestWave, wave),
    totalKills: prev.totalKills + kills,
    gamesPlayed: prev.gamesPlayed + 1,
    bestKillsInGame: Math.max(prev.bestKillsInGame, kills),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export const ACHIEVEMENTS: Achievement[] = [
  // Kill milestones
  {
    id: 'first-blood',
    name: 'First Blood',
    description: 'Eliminate your first enemy',
    icon: '🩸',
    tier: 'bronze',
    check: (s) => s.totalKills >= 1,
    progress: (s) => Math.min(1, s.totalKills / 1),
  },
  {
    id: 'sharpshooter',
    name: 'Sharpshooter',
    description: 'Kill 50 enemies in a single game',
    icon: '🎯',
    tier: 'silver',
    check: (s) => s.bestKillsInGame >= 50,
    progress: (s) => Math.min(1, s.bestKillsInGame / 50),
  },
  {
    id: 'exterminator',
    name: 'Exterminator',
    description: 'Kill 100 enemies in a single game',
    icon: '💀',
    tier: 'gold',
    check: (s) => s.bestKillsInGame >= 100,
    progress: (s) => Math.min(1, s.bestKillsInGame / 100),
  },
  {
    id: 'legend-killer',
    name: 'Legend Killer',
    description: 'Eliminate 500 enemies lifetime',
    icon: '⚔️',
    tier: 'legendary',
    check: (s) => s.totalKills >= 500,
    progress: (s) => Math.min(1, s.totalKills / 500),
  },

  // Wave milestones
  {
    id: 'wave-rider',
    name: 'Wave Rider',
    description: 'Survive to wave 5',
    icon: '🌊',
    tier: 'bronze',
    check: (s) => s.bestWave >= 5,
    progress: (s) => Math.min(1, s.bestWave / 5),
  },
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'Survive to wave 10',
    icon: '🎖️',
    tier: 'silver',
    check: (s) => s.bestWave >= 10,
    progress: (s) => Math.min(1, s.bestWave / 10),
  },
  {
    id: 'warlord',
    name: 'Warlord',
    description: 'Survive to wave 20',
    icon: '👑',
    tier: 'gold',
    check: (s) => s.bestWave >= 20,
    progress: (s) => Math.min(1, s.bestWave / 20),
  },
  {
    id: 'immortal',
    name: 'Immortal',
    description: 'Survive to wave 30',
    icon: '🔱',
    tier: 'legendary',
    check: (s) => s.bestWave >= 30,
    progress: (s) => Math.min(1, s.bestWave / 30),
  },

  // Score milestones
  {
    id: 'score-1k',
    name: 'Apprentice',
    description: 'Score 1,000 points',
    icon: '⭐',
    tier: 'bronze',
    check: (s) => s.bestScore >= 1000,
    progress: (s) => Math.min(1, s.bestScore / 1000),
  },
  {
    id: 'score-5k',
    name: 'Tactician',
    description: 'Score 5,000 points',
    icon: '🏅',
    tier: 'silver',
    check: (s) => s.bestScore >= 5000,
    progress: (s) => Math.min(1, s.bestScore / 5000),
  },
  {
    id: 'score-10k',
    name: 'Grand Marshal',
    description: 'Score 10,000 points',
    icon: '🏆',
    tier: 'gold',
    check: (s) => s.bestScore >= 10000,
    progress: (s) => Math.min(1, s.bestScore / 10000),
  },
  {
    id: 'score-25k',
    name: 'Supreme Commander',
    description: 'Score 25,000 points',
    icon: '💎',
    tier: 'legendary',
    check: (s) => s.bestScore >= 25000,
    progress: (s) => Math.min(1, s.bestScore / 25000),
  },
]
