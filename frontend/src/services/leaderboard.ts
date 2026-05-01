import { api } from '@/services/api'

export interface LeaderboardEntry {
  id: string
  player_name: string
  score: number
  wave_reached: number
  enemies_killed: number
  submitted_at: string
}

export interface ScoreSubmission {
  player_name: string
  score: number
  wave_reached: number
  enemies_killed: number
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const response = await api.get<LeaderboardEntry[]>('/api/v1/leaderboard/')
  return response.data
}

export async function submitScore(data: ScoreSubmission): Promise<LeaderboardEntry> {
  const response = await api.post<LeaderboardEntry>('/api/v1/leaderboard/submit/', data)
  return response.data
}
