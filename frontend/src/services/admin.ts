import { api } from '@/services/api'

export interface AdminUser {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  picture: string
  is_active: boolean
  created_at: string
  best_score: number
  best_wave: number
  games_played: number
}

export async function checkAdminAccess(): Promise<boolean> {
  const res = await api.get<{ is_admin: boolean }>('/api/admin/check-access/')
  return res.data.is_admin
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const res = await api.get<{ results: AdminUser[] }>('/api/admin/users/?page_size=200')
  return res.data.results
}
