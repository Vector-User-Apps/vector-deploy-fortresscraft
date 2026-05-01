import { useState, useCallback, useRef, useEffect } from 'react'

interface StreakAnnouncement {
  text: string
  color: string
  size: string
}

const STREAK_TIERS: { kills: number; text: string; color: string; size: string }[] = [
  { kills: 20, text: 'GODLIKE!', color: '#FF1744', size: '64px' },
  { kills: 10, text: 'Unstoppable!', color: '#FF9100', size: '52px' },
  { kills: 5, text: 'Rampage!', color: '#FFD600', size: '44px' },
  { kills: 3, text: 'Triple Kill!', color: '#FFFFFF', size: '38px' },
]

export type { StreakAnnouncement }

export function useKillStreak() {
  const streakRef = useRef({ count: 0, lastKillTime: 0 })
  const [announcement, setAnnouncement] = useState<StreakAnnouncement | null>(null)
  const [combo, setCombo] = useState(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const comboDecayRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const recordKill = useCallback(() => {
    const now = performance.now()
    const streak = streakRef.current

    if (now - streak.lastKillTime < 2000) {
      streak.count += 1
    } else {
      streak.count = 1
    }
    streak.lastKillTime = now
    setCombo(streak.count)

    // Reset combo after 2s of no kills
    if (comboDecayRef.current) clearTimeout(comboDecayRef.current)
    comboDecayRef.current = setTimeout(() => {
      streakRef.current.count = 0
      setCombo(0)
    }, 2000)

    // Check streak tiers (highest first)
    for (const tier of STREAK_TIERS) {
      if (streak.count >= tier.kills) {
        setAnnouncement({ text: tier.text, color: tier.color, size: tier.size })
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => setAnnouncement(null), 1500)
        break
      }
    }

    return streak.count
  }, [])

  const getCurrentCombo = useCallback(() => streakRef.current.count, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (comboDecayRef.current) clearTimeout(comboDecayRef.current)
    }
  }, [])

  return { announcement, combo, recordKill, getCurrentCombo }
}
