/**
 * Auth Callback Page
 *
 * DO NOT MODIFY THIS FILE - It is a protected boilerplate file.
 *
 * Handles the redirect from Vector's auth proxy after authentication
 * (Google OAuth, magic link, etc.). Receives a JWT token via query
 * parameter, exchanges it for a local session cookie, and redirects
 * to the app.
 *
 * Also notifies the parent frame (Vector app builder) of the token
 * via postMessage so that sessions can be restored when the sandbox
 * is replaced (VEC-433).
 *
 * Route: /auth/callback?token=<jwt>
 */

import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '@/services/api'
import { Spinner } from '@/components/ui'

export function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setError('No authentication token received.')
      return
    }

    // Strip token from URL to prevent leakage via Referer headers and browser history
    window.history.replaceState(null, '', window.location.pathname)

    // Notify parent frame (Vector app builder) of the auth token so it can
    // re-authenticate when the sandbox is replaced (VEC-433). The token is
    // already exposed via URL params, so postMessage doesn't increase attack
    // surface. We use '*' because the parent origin differs from the sandbox.
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'uga_auth_token', token }, '*')
    }

    api
      .post('/api/accounts/auth/token', { token })
      .then(() => {
        // Auth cookie is set automatically by the browser via Set-Cookie header.

        // If opened as a popup (e.g. from iframe auth flow), notify parent and close.
        if (window.opener) {
          window.opener.postMessage({ type: 'auth_complete' }, window.location.origin)
          window.close()
          return
        }

        navigate('/', { replace: true })
      })
      .catch(() => {
        setError('Authentication failed. Please try again.')
      })
  }, [searchParams, navigate])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-red-600">Authentication Error</h1>
          <p className="mt-2 text-gray-600">{error}</p>
          <a href="/" className="mt-4 inline-block text-blue-600 hover:underline">
            Go back
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Spinner />
        <p className="mt-4 text-gray-600">Signing you in...</p>
      </div>
    </div>
  )
}

export default AuthCallback
