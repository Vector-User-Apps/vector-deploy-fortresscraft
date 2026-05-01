import type { PlacedTower, ActiveEnemy, Projectile } from '../types'
import { TOWER_CONFIGS, gridToWorld, getPositionOnPath } from '../constants'

export interface FireResult {
  towerId: string
  projectile: Omit<Projectile, 'id' | 'progress'>
}

export function runTargeting(
  towers: PlacedTower[],
  enemies: ActiveEnemy[],
  currentTime: number,
  gameSpeed: number
): FireResult[] {
  const results: FireResult[] = []
  const aliveEnemies = enemies.filter((e) => e.alive)

  for (const tower of towers) {
    const config = TOWER_CONFIGS[tower.type]
    if (!config) continue
    const levelConfig = config.levels[tower.level]
    const fireInterval = 1 / levelConfig.fireRate
    const timeSinceLastFire = (currentTime - tower.lastFireTime) / 1000

    if (timeSinceLastFire < fireInterval / gameSpeed) continue

    const towerPos = gridToWorld(tower.gridX, tower.gridZ)
    towerPos[1] = 1 // tower firing height

    // Find nearest enemy in range
    let bestEnemy: ActiveEnemy | null = null
    let bestDist = Infinity

    for (const enemy of aliveEnemies) {
      const enemyPos = getPositionOnPath(enemy.pathProgress)
      const dx = enemyPos[0] - towerPos[0]
      const dz = enemyPos[2] - towerPos[2]
      const dist = Math.sqrt(dx * dx + dz * dz)

      if (dist <= levelConfig.range && dist < bestDist) {
        bestDist = dist
        bestEnemy = enemy
      }
    }

    if (bestEnemy) {
      const enemyPos = getPositionOnPath(bestEnemy.pathProgress)

      results.push({
        towerId: tower.id,
        projectile: {
          towerId: tower.id,
          towerType: tower.type,
          targetId: bestEnemy.id,
          startPos: [...towerPos],
          endPos: [...enemyPos],
          damage: levelConfig.damage,
          splashRadius: levelConfig.splashRadius,
          chainCount: levelConfig.chainCount,
          slowFactor: levelConfig.slowFactor,
        },
      })
    }
  }

  return results
}
