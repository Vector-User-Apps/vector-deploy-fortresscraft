import { useState, useCallback } from 'react'

export interface GoldCoin {
  id: number
  startX: number
  startY: number
  x: number
  y: number
  startTime: number
  duration: number
  delay: number
}

let coinId = 0

export function useGoldSparkle() {
  const [coins, setCoins] = useState<GoldCoin[]>([])

  const spawnCoins = useCallback((screenX: number, screenY: number, count: number = 4) => {
    const now = performance.now()
    const newCoins: GoldCoin[] = []
    for (let i = 0; i < count; i++) {
      newCoins.push({
        id: coinId++,
        startX: screenX + (Math.random() - 0.5) * 40,
        startY: screenY + (Math.random() - 0.5) * 40,
        x: screenX + (Math.random() - 0.5) * 40,
        y: screenY + (Math.random() - 0.5) * 40,
        startTime: now,
        duration: 600 + Math.random() * 300,
        delay: i * 50,
      })
    }
    setCoins((prev) => [...prev, ...newCoins].slice(-30))
  }, [])

  return { coins, setCoins, spawnCoins }
}
