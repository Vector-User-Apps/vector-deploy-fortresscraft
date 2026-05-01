import { create } from 'zustand'

interface ShakeState {
  intensity: number
  decay: number
  triggerShake: (intensity: number, decay?: number) => void
}

export const useShakeStore = create<ShakeState>()((set) => ({
  intensity: 0,
  decay: 0.92,
  triggerShake: (intensity: number, decay = 0.92) => set({ intensity, decay }),
}))
