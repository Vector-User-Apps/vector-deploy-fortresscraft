import { useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../state'
import { useShakeStore } from '../shakeStore'
import { useBulletTimeStore, SLOW_FACTOR } from '../bulletTimeStore'
import { updateEnemyMovement } from '../systems/movement'
import { runTargeting } from '../systems/targeting'
import { ENEMY_CONFIGS, getPositionOnPath } from '../constants'
import { getGoldMultiplier } from '../comboMultiplier'
import type { TowerType, EnemyType } from '../types'

const PROJECTILE_SPEED = 8 // units per second of progress (0 to 1)

interface GameLoopProps {
  onEnemyKilled?: (pos: [number, number, number], color: string, towerType: TowerType, enemyType: EnemyType) => void
  onDamageDealt?: (pos: [number, number, number], damage: number, towerType: TowerType) => void
  getComboCount?: () => number
}

export function GameLoop({ onEnemyKilled, onDamageDealt, getComboCount }: GameLoopProps) {
  const tick = useCallback(
    (_: unknown, delta: number) => {
      const state = useGameStore.getState()
      if (state.phase !== 'playing') return

      // Tick bullet time (uses real delta, not game-speed-adjusted)
      const btStore = useBulletTimeStore.getState()
      btStore.tick(delta)

      // Apply bullet time slow factor on top of player-selected speed
      const gameSpeed = state.speed * (btStore.active ? SLOW_FACTOR : 1)
      const now = performance.now() / 1000

      // 1. Spawn enemies from queue
      if (state.spawnQueue.length > 0) {
        const elapsed = now - state.waveStartTime
        const toSpawn = state.spawnQueue.filter((s) => s.spawnAt <= elapsed * gameSpeed)
        const remaining = state.spawnQueue.filter((s) => s.spawnAt > elapsed * gameSpeed)

        for (const spawn of toSpawn) {
          state.spawnEnemy(spawn.enemyType, state.wave)
        }
        if (toSpawn.length > 0) {
          state.setSpawnQueue(remaining)
        }
      }

      // Re-get state after spawning
      const currentState = useGameStore.getState()

      // 2. Move enemies
      const { updated: movedEnemies, reachedBase } = updateEnemyMovement(
        currentState.enemies,
        delta,
        gameSpeed
      )

      // Handle enemies reaching base
      for (const enemy of reachedBase) {
        const config = ENEMY_CONFIGS[enemy.type]
        if (config) {
          currentState.loseLife(config.liveCost)
        }
      }

      // Filter out enemies that reached the base
      const aliveEnemies = movedEnemies.filter(
        (e) => !reachedBase.some((rb) => rb.id === e.id)
      )

      // 3. Tower targeting
      const fireResults = runTargeting(
        currentState.towers,
        aliveEnemies.filter((e) => e.alive),
        performance.now(),
        gameSpeed
      )

      for (const result of fireResults) {
        currentState.updateTower(result.towerId, { lastFireTime: performance.now() })
        currentState.addProjectile(result.projectile)
        if (result.projectile.towerType === 'cannon') {
          useShakeStore.getState().triggerShake(0.15)
        }
      }

      // 4. Move projectiles and check hits
      const projState = useGameStore.getState()
      const updatedProjectiles = projState.projectiles
        .map((p) => ({
          ...p,
          progress: p.progress + delta * PROJECTILE_SPEED * gameSpeed,
        }))
        .filter((p) => p.progress < 1)

      // Apply damage for projectiles that reached target
      const hitProjectiles = projState.projectiles.filter(
        (p) => p.progress + delta * PROJECTILE_SPEED * gameSpeed >= 1
      )

      let enemiesAfterDamage = [...aliveEnemies]
      const killerTowerTypes = new Map<string, TowerType>()

      for (const proj of hitProjectiles) {
        if (proj.splashRadius) {
          // Splash damage
          const targetEnemy = enemiesAfterDamage.find((e) => e.id === proj.targetId)
          if (targetEnemy) {
            const targetPos = getPositionOnPath(targetEnemy.pathProgress)
            enemiesAfterDamage = enemiesAfterDamage.map((e) => {
              if (!e.alive) return e
              const ePos = getPositionOnPath(e.pathProgress)
              const dx = ePos[0] - targetPos[0]
              const dz = ePos[2] - targetPos[2]
              const dist = Math.sqrt(dx * dx + dz * dz)
              if (dist <= proj.splashRadius!) {
                const dmgFactor = dist < proj.splashRadius! * 0.5 ? 1 : 0.5
                const newHp = Math.max(0, e.hp - proj.damage * dmgFactor)
                if (newHp <= 0 && e.alive && !killerTowerTypes.has(e.id)) {
                  killerTowerTypes.set(e.id, proj.towerType)
                }
                return { ...e, hp: newHp }
              }
              return e
            })
            if (onDamageDealt) {
              onDamageDealt(targetPos as [number, number, number], proj.damage, proj.towerType)
            }
          }
        } else {
          // Single target damage
          enemiesAfterDamage = enemiesAfterDamage.map((e) => {
            if (e.id === proj.targetId) {
              const newHp = Math.max(0, e.hp - proj.damage)
              if (newHp <= 0 && e.alive && !killerTowerTypes.has(e.id)) {
                killerTowerTypes.set(e.id, proj.towerType)
              }
              return { ...e, hp: newHp }
            }
            return e
          })
          if (onDamageDealt) {
            const target = aliveEnemies.find((e) => e.id === proj.targetId)
            if (target) {
              const pos = getPositionOnPath(target.pathProgress)
              onDamageDealt(pos, proj.damage, proj.towerType)
            }
          }
        }

        // Apply slow
        if (proj.slowFactor) {
          const target = enemiesAfterDamage.find((e) => e.id === proj.targetId)
          if (target?.alive) {
            const config = ENEMY_CONFIGS[target.type]
            enemiesAfterDamage = enemiesAfterDamage.map((e) =>
              e.id === proj.targetId
                ? { ...e, speed: config.speed * proj.slowFactor!, slowTimer: 2 }
                : e
            )
          }
        }
      }

      // 5. Check for killed enemies
      enemiesAfterDamage = enemiesAfterDamage.map((e) => {
        if (e.hp <= 0 && e.alive) {
          const config = ENEMY_CONFIGS[e.type]
          if (config) {
            // Fire kill callback first so recordKill() updates combo count
            if (onEnemyKilled) {
              const pos = getPositionOnPath(e.pathProgress)
              const killerType = killerTowerTypes.get(e.id) || 'arrow'
              onEnemyKilled(pos, config.color, killerType, e.type)
            }

            // Apply combo gold multiplier (recordKill already incremented the count)
            const comboCount = getComboCount?.() ?? 0
            const multiplier = getGoldMultiplier(comboCount)
            const goldReward = Math.floor(config.reward * multiplier)
            useGameStore.getState().addGold(goldReward)
            useGameStore.getState().addScore(goldReward * 2)

            // Screen shake — scales with combo
            if (e.type === 'boss') {
              useShakeStore.getState().triggerShake(0.8, 0.88)
            } else if (comboCount >= 10) {
              useShakeStore.getState().triggerShake(0.45, 0.9)
            } else if (comboCount >= 5) {
              useShakeStore.getState().triggerShake(0.3)
            } else {
              useShakeStore.getState().triggerShake(0.2)
            }
          }
          return {
            ...e,
            alive: false,
            deathTime: performance.now(),
          }
        }
        return e
      })

      // Count killed this frame
      const killedThisFrame = enemiesAfterDamage.filter(
        (e) => !e.alive && e.deathTime !== null && performance.now() - e.deathTime < 50
      ).length

      if (killedThisFrame > 0) {
        const store = useGameStore.getState()
        useGameStore.setState({ enemiesKilled: store.enemiesKilled + killedThisFrame })
      }

      // Remove dead enemies after animation
      const finalEnemies = enemiesAfterDamage.filter((e) => {
        if (!e.alive && e.deathTime) {
          return performance.now() - e.deathTime < 500 // 0.5s death animation
        }
        return true
      })

      // 6. Update state
      useGameStore.setState({
        enemies: finalEnemies,
        projectiles: updatedProjectiles,
      })

      // 7. Check wave complete
      const latestState = useGameStore.getState()
      if (
        latestState.spawnQueue.length === 0 &&
        latestState.enemies.filter((e) => e.alive).length === 0 &&
        latestState.enemies.length === 0
      ) {
        latestState.endWave()
      }
    },
    [onEnemyKilled, onDamageDealt, getComboCount]
  )

  useFrame(tick)

  return null
}
