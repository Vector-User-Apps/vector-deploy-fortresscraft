import { create } from 'zustand'

interface TowerAnimation {
  towerId: string
  type: 'place' | 'sell'
  startTime: number
}

interface TowerAnimStore {
  animations: TowerAnimation[]
  addAnimation: (towerId: string, type: 'place' | 'sell') => void
  removeAnimation: (towerId: string) => void
  getYOffset: (towerId: string) => number
}

export const useTowerAnimStore = create<TowerAnimStore>()((set, get) => ({
  animations: [],
  addAnimation: (towerId, type) => {
    set((s) => ({
      animations: [...s.animations.filter((a) => a.towerId !== towerId), { towerId, type, startTime: performance.now() }],
    }))
    // Auto-remove after animation completes
    if (type === 'place') {
      setTimeout(() => {
        set((s) => ({ animations: s.animations.filter((a) => a.towerId !== towerId) }))
      }, 500)
    }
  },
  removeAnimation: (towerId) => {
    set((s) => ({ animations: s.animations.filter((a) => a.towerId !== towerId) }))
  },
  getYOffset: (towerId) => {
    const anim = get().animations.find((a) => a.towerId === towerId)
    if (!anim) return 0
    const elapsed = (performance.now() - anim.startTime) / 1000
    if (anim.type === 'place') {
      // Rise from -2 to 0 over 0.5s with ease-out
      const t = Math.min(1, elapsed / 0.5)
      const eased = 1 - (1 - t) * (1 - t) // ease-out quadratic
      return -2 * (1 - eased)
    }
    if (anim.type === 'sell') {
      // Sink from 0 to -2 over 0.4s
      const t = Math.min(1, elapsed / 0.4)
      return -2 * t * t
    }
    return 0
  },
}))
