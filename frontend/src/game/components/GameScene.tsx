import { Canvas } from '@react-three/fiber'
import type { ReactNode } from 'react'

export function GameScene({ children }: { children: ReactNode }) {
  return (
    <Canvas
      camera={{ position: [0, 20, 18], fov: 50, near: 0.1, far: 100 }}
      shadows
      style={{ background: '#0F1A0E' }}
      gl={{ antialias: true }}
    >
      {/* Lighting — warm forest sunlight */}
      <ambientLight intensity={0.25} color="#A09060" />
      <directionalLight
        position={[8, 18, 6]}
        intensity={1.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        color="#FFE4B5"
      />
      {/* Warm torchlight from NW */}
      <pointLight position={[-12, 10, -8]} intensity={0.8} color="#D4A24C" distance={30} decay={2} />
      {/* Golden glow from SE */}
      <pointLight position={[12, 6, 8]} intensity={0.6} color="#C8963E" distance={25} decay={2} />
      {/* Soft warm center fill */}
      <pointLight position={[0, 12, 0]} intensity={0.4} color="#FFE4B5" distance={35} decay={2} />
      <fog attach="fog" args={['#0F1A0E', 28, 55]} />
      {children}
    </Canvas>
  )
}
