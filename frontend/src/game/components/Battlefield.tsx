import { useCallback } from 'react'
import { GameScene } from './GameScene'
import { KillStreakOverlay } from './KillStreak'
import { useKillStreak } from './useKillStreak'
import { GameMap } from './Map'
import { CameraController } from './CameraController'
import { Tower } from './Tower'
import { Enemy } from './Enemy'
import { ProjectileVisual } from './Projectile'
import { GameLoop } from './GameLoop'
import { ParticleSystem, useParticleSystem } from './Effects'
import { DamageNumbers, useDamageNumbers } from './DamageNumbers'
import { useGameStore } from '../state'
import type { TowerType, EnemyType } from '../types'

export function Battlefield({
  onGoldAwarded,
}: {
  onGoldAwarded?: () => void
}) {
  const towers = useGameStore((s) => s.towers)
  const enemies = useGameStore((s) => s.enemies)
  const projectiles = useGameStore((s) => s.projectiles)
  const selectTower = useGameStore((s) => s.selectTower)
  const { particles, emit, setParticles } = useParticleSystem()
  const { numbers, setNumbers, addDamageNumber } = useDamageNumbers()
  const { announcement, combo, recordKill, getCurrentCombo } = useKillStreak()

  const handleEnemyKilled = useCallback(
    (pos: [number, number, number], _color: string, towerType: TowerType, enemyType: EnemyType) => {
      emit(pos, towerType, enemyType)
      recordKill()
      onGoldAwarded?.()
    },
    [emit, recordKill, onGoldAwarded]
  )

  const handleDamageDealt = useCallback(
    (pos: [number, number, number], damage: number, towerType: TowerType) => {
      addDamageNumber(pos, damage, towerType)
    },
    [addDamageNumber]
  )

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <GameScene>
        <CameraController />
        <GameMap />

        {/* Towers */}
        {towers.map((tower) => (
          <Tower key={tower.id} tower={tower} />
        ))}

        {/* Enemies */}
        {enemies.map((enemy) => (
          <Enemy key={enemy.id} enemy={enemy} />
        ))}

        {/* Projectiles */}
        {projectiles.map((proj) => (
          <ProjectileVisual key={proj.id} projectile={proj} />
        ))}

        {/* Particles */}
        <ParticleSystem particles={particles} setParticles={setParticles} />

        {/* Damage Numbers */}
        <DamageNumbers numbers={numbers} setNumbers={setNumbers} />

        {/* Game Loop */}
        <GameLoop onEnemyKilled={handleEnemyKilled} onDamageDealt={handleDamageDealt} getComboCount={getCurrentCombo} />

        {/* Click on nothing to deselect */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.1, 0]}
          onClick={() => selectTower(null)}
          visible={false}
        >
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial />
        </mesh>
      </GameScene>
      <KillStreakOverlay announcement={announcement} combo={combo} />
    </div>
  )
}
