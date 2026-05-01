import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import type { DamageNumber } from './useDamageNumbers'

export { useDamageNumbers } from './useDamageNumbers'

export function DamageNumbers({
  numbers,
  setNumbers,
}: {
  numbers: DamageNumber[]
  setNumbers: React.Dispatch<React.SetStateAction<DamageNumber[]>>
}) {
  useFrame(() => {
    const now = performance.now()
    setNumbers((prev) => prev.filter((n) => now - n.createdAt < n.duration))
  })

  return (
    <group>
      {numbers.map((num) => {
        const elapsed = performance.now() - num.createdAt
        const progress = Math.min(elapsed / num.duration, 1)
        const opacity = 1 - progress
        const yOffset = progress * 2 // float up 2 units

        return (
          <Html
            key={num.id}
            position={[
              num.position[0],
              num.position[1] + yOffset,
              num.position[2],
            ]}
            center
            style={{ pointerEvents: 'none' }}
          >
            <div
              style={{
                color: num.color,
                fontSize: num.damage >= 50 ? '18px' : '14px',
                fontWeight: 'bold',
                fontFamily: "'Lora', serif",
                textShadow: '0 0 4px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.6)',
                opacity,
                transform: `scale(${0.8 + opacity * 0.4})`,
                whiteSpace: 'nowrap',
                userSelect: 'none',
              }}
            >
              {num.damage}
            </div>
          </Html>
        )
      })}
    </group>
  )
}
