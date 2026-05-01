import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useShakeStore } from '../shakeStore'

export function CameraController() {
  const { camera } = useThree()

  useFrame(() => {
    const store = useShakeStore.getState()
    if (store.intensity > 0.01) {
      const shakeX = (Math.random() - 0.5) * store.intensity
      const shakeY = (Math.random() - 0.5) * store.intensity
      const shakeZ = (Math.random() - 0.5) * store.intensity * 0.5
      camera.position.x += shakeX
      camera.position.y += shakeY
      camera.position.z += shakeZ
      useShakeStore.setState({ intensity: store.intensity * store.decay })
    } else if (store.intensity > 0) {
      useShakeStore.setState({ intensity: 0 })
    }
  })

  return (
    <OrbitControls
      makeDefault
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2.5}
      minDistance={10}
      maxDistance={40}
      enablePan={true}
      panSpeed={0.8}
      target={[0, 0, 0]}
    />
  )
}
