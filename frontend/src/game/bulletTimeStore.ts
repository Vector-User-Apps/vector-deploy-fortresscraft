import { create } from 'zustand'

const DURATION = 3 // seconds of slow-mo
const COOLDOWN = 30 // seconds before next use
const SLOW_FACTOR = 0.25 // 25% speed during bullet time

interface BulletTimeState {
  active: boolean
  remaining: number // seconds left of active slow-mo
  cooldown: number // seconds left of cooldown (0 = ready)
  activate: () => void
  tick: (delta: number) => void
  reset: () => void
}

export const useBulletTimeStore = create<BulletTimeState>()((set, get) => ({
  active: false,
  remaining: 0,
  cooldown: 0,

  activate: () => {
    const state = get()
    if (state.active || state.cooldown > 0) return
    set({ active: true, remaining: DURATION })
  },

  tick: (delta: number) => {
    const state = get()

    if (state.active) {
      const newRemaining = state.remaining - delta
      if (newRemaining <= 0) {
        set({ active: false, remaining: 0, cooldown: COOLDOWN })
      } else {
        set({ remaining: newRemaining })
      }
    } else if (state.cooldown > 0) {
      set({ cooldown: Math.max(0, state.cooldown - delta) })
    }
  },

  reset: () => set({ active: false, remaining: 0, cooldown: 0 }),
}))

export { DURATION, COOLDOWN, SLOW_FACTOR }
