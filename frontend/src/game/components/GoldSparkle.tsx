import { useEffect, useRef } from 'react'
import type { GoldCoin } from './useGoldSparkle'

export { useGoldSparkle } from './useGoldSparkle'

export function GoldSparkleOverlay({
  coins,
  setCoins,
}: {
  coins: GoldCoin[]
  setCoins: React.Dispatch<React.SetStateAction<GoldCoin[]>>
}) {
  const animRef = useRef<number>(0)

  useEffect(() => {
    if (coins.length === 0) return

    const targetX = window.innerWidth - 100
    const targetY = 24

    const animate = () => {
      const now = performance.now()
      setCoins((prev) => {
        const updated: GoldCoin[] = []
        for (const c of prev) {
          const elapsed = now - c.startTime - c.delay
          if (elapsed < 0) {
            updated.push(c)
            continue
          }
          const t = Math.min(1, elapsed / c.duration)
          if (t >= 1) continue // remove
          const eased = t * t // ease-in for acceleration toward target
          const arcY = c.startY - Math.sin(t * Math.PI) * 80
          const x = c.startX + (targetX - c.startX) * eased
          const y = arcY + (targetY - arcY) * eased
          updated.push({ ...c, x, y })
        }
        return updated
      })
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [setCoins, coins.length]) // eslint-disable-line

  if (coins.length === 0) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      {coins.map((c) => {
        const elapsed = performance.now() - c.startTime - c.delay
        if (elapsed < 0) return null
        const t = Math.min(1, elapsed / c.duration)
        const opacity = 1 - t * t
        return (
          <div
            key={c.id}
            style={{
              position: 'absolute',
              left: c.x - 5,
              top: c.y - 5,
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #FFD700, #FACC15, #F59E0B)',
              boxShadow: '0 0 6px #FFD700',
              opacity,
              transform: `scale(${0.6 + (1 - t) * 0.4})`,
              pointerEvents: 'none',
            }}
          />
        )
      })}
    </div>
  )
}
