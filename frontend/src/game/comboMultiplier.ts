export function getGoldMultiplier(comboCount: number): number {
  if (comboCount >= 20) return 3.0
  if (comboCount >= 10) return 2.0
  if (comboCount >= 5) return 1.5
  return 1.0
}
