import { useState, useCallback } from 'react'
import type { TowerType } from '../types'

interface DamageNumber {
  id: number
  position: [number, number, number]
  damage: number
  color: string
  createdAt: number
  duration: number
}

const MAX_DAMAGE_NUMBERS = 20
let dmgId = 0

const TOWER_DAMAGE_COLORS: Record<TowerType, string> = {
  arrow: '#FFFFFF',
  cannon: '#FF9800',
  frost: '#4FC3F7',
  sniper: '#FF5252',
  tesla: '#FFD54F',
}

export type { DamageNumber }

export function useDamageNumbers() {
  const [numbers, setNumbers] = useState<DamageNumber[]>([])

  const addDamageNumber = useCallback(
    (position: [number, number, number], damage: number, towerType: TowerType) => {
      const newNum: DamageNumber = {
        id: dmgId++,
        position: [position[0], position[1] + 1, position[2]],
        damage: Math.round(damage),
        color: TOWER_DAMAGE_COLORS[towerType] || '#FFFFFF',
        createdAt: performance.now(),
        duration: 1000,
      }
      setNumbers((prev) => [...prev, newNum].slice(-MAX_DAMAGE_NUMBERS))
    },
    []
  )

  return { numbers, setNumbers, addDamageNumber }
}
