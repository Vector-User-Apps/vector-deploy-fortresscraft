import type { EnemyType, WaveDefinition } from '../types'
import { generateWave } from '../constants'

export function getWaveDefinition(waveNumber: number): WaveDefinition {
  return generateWave(waveNumber)
}

export function getNextWavePreview(waveNumber: number): { type: EnemyType; count: number }[] {
  const wave = generateWave(waveNumber)
  const counts = new Map<EnemyType, number>()
  for (const group of wave.groups) {
    counts.set(group.enemyType, (counts.get(group.enemyType) || 0) + group.count)
  }
  return Array.from(counts.entries()).map(([type, count]) => ({ type, count }))
}
