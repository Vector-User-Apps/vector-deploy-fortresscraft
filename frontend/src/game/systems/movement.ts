import type { ActiveEnemy } from '../types'
import { getPathLength, ENEMY_CONFIGS } from '../constants'

const pathLength = getPathLength()

export function updateEnemyMovement(
  enemies: ActiveEnemy[],
  deltaTime: number,
  gameSpeed: number
): { updated: ActiveEnemy[]; reachedBase: ActiveEnemy[] } {
  const reachedBase: ActiveEnemy[] = []
  const updated = enemies.map((enemy) => {
    if (!enemy.alive) return enemy

    // Apply slow decay
    let slowTimer = enemy.slowTimer
    let speed = enemy.speed
    if (slowTimer > 0) {
      slowTimer = Math.max(0, slowTimer - deltaTime * gameSpeed)
      if (slowTimer <= 0) {
        speed = ENEMY_CONFIGS[enemy.type].speed
      }
    }

    const moveAmount = (speed * deltaTime * gameSpeed) / pathLength
    const newProgress = enemy.pathProgress + moveAmount

    if (newProgress >= 1) {
      reachedBase.push(enemy)
      return { ...enemy, pathProgress: 1, alive: false, slowTimer }
    }

    return { ...enemy, pathProgress: newProgress, speed, slowTimer }
  })

  return { updated, reachedBase }
}
