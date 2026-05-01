/**
 * Auth State Hook
 *
 * DO NOT MODIFY THIS FILE - It is a protected boilerplate file.
 *
 * Provides authentication state and actions for the UGA frontend.
 * Points to Vector's hosted login page which handles all auth methods.
 *
 * Auth state is managed via HttpOnly cookies (not localStorage).
 * The hook checks auth status by calling /api/accounts/me/ since
 * HttpOnly cookies cannot be read from JavaScript.
 *
 * Retries transient failures (network errors, 5xx) to avoid false
 * logouts when the backend restarts during code edits (VEC-433).
 *
 * Usage:
 *   const { isAuthenticated, user, logout, loginUrl, signupUrl } = useAuth()
 */

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/services/api'

interface AuthUser {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  picture: string
}

const AUTH_PROXY_URL = import.meta.env.VITE_AUTH_PROXY_URL || ''
const APP_ID = import.meta.env.VITE_APP_ID || ''
const APP_VERSION_ID = import.meta.env.VITE_APP_VERSION_ID || ''

const AUTH_CHECK_MAX_RETRIES = 3
const AUTH_CHECK_RETRY_DELAY_MS = 1500

function buildAuthUrl(mode: 'login' | 'signup'): string {
  const redirectUri = `${window.location.origin}/auth/callback`
  const params = new URLSearchParams({
    app_id: APP_ID,
    app_version_id: APP_VERSION_ID,
    redirect_uri: redirectUri,
    mode,
  })
  return `${AUTH_PROXY_URL}/login?${params}`
}

/**
 * Check if an error is transient (backend restarting, network blip)
 * vs. authoritative (401 = auth truly expired).
 */
function isTransientError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const status = (error as { response?: { status?: number } }).response?.status
    if (status !== undefined) {
      return status >= 500 // 5xx = server error, likely restarting
    }
  }
  return true // No response at all = network error = transient
}

/**
 * Fetch current user with retry for transient failures.
 * Retries on network errors and 5xx (backend restarting during code edits).
 * Does NOT retry on 401 (auth genuinely expired after refresh attempt).
 */
async function fetchCurrentUser(): Promise<AuthUser | null> {
  for (let attempt = 0; attempt <= AUTH_CHECK_MAX_RETRIES; attempt++) {
    try {
      const res = await api.get<AuthUser>('/api/accounts/me/')
      return res.data
    } catch (error) {
      if (!isTransientError(error) || attempt === AUTH_CHECK_MAX_RETRIES) {
        return null
      }
      await new Promise((r) => setTimeout(r, AUTH_CHECK_RETRY_DELAY_MS))
    }
  }
  return null
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [_authVersion, setAuthVersion] = useState(0)

  // Listen for auth_complete messages from popup windows (iframe auth flow)
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.type === 'auth_complete') {
        setAuthVersion((v) => v + 1)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  // Check auth state via server — cannot read HttpOnly cookies from JS
  // Retries transient failures to survive backend restarts (VEC-433)
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchCurrentUser().then((result) => {
      if (!cancelled) {
        setUser(result)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [])

  const isAuthenticated = user !== null

  const logout = useCallback(() => {
    api.post('/api/accounts/logout/').finally(() => {
      setUser(null)
      window.location.href = '/'
    })
  }, [])

  const loginUrl = buildAuthUrl('login')
  const signupUrl = buildAuthUrl('signup')

  return { isAuthenticated, user, loading, logout, loginUrl, signupUrl }
}

export default useAuth
