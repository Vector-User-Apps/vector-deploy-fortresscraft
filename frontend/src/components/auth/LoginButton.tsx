/**
 * Login Button
 *
 * DO NOT MODIFY THE HANDLE IN THIS FILE  - You may only modify the appearance of the button.
 *
 * Redirects the user to Vector's hosted login page where they can
 * choose from available sign-in methods (Google, magic link, etc.).
 * After authentication, the user is redirected back to /auth/callback
 * with a JWT token.
 *
 * Usage:
 *   <LoginButton />
 *   <LoginButton label="Sign in" />
 */

const AUTH_PROXY_URL = import.meta.env.VITE_AUTH_PROXY_URL || ''
const APP_ID = import.meta.env.VITE_APP_ID || ''
const APP_VERSION_ID = import.meta.env.VITE_APP_VERSION_ID || ''

interface LoginButtonProps {
  label?: string
  className?: string
}

export function LoginButton({
  label = 'Sign in',
  className = '',
}: LoginButtonProps) {
  const handleLogin = () => {
    const redirectUri = `${window.location.origin}/auth/callback`
    const params = new URLSearchParams({
      app_id: APP_ID,
      app_version_id: APP_VERSION_ID,
      redirect_uri: redirectUri,
    })
    const loginUrl = `${AUTH_PROXY_URL}/login?${params}`
    window.parent.postMessage(
      {
        type: 'VECTOR_NAV_UPDATE',
        data: {path: '/auth/login'},
      },
      '*'
    )
    window.location.href = loginUrl
  }

  return (
    <button
      onClick={handleLogin}
      className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium shadow-sm focus:outline-none ${className}`}
      style={{
        background: '#C8963E',
        color: '#0F1A0E',
        border: '1px solid #D4A24C',
        fontFamily: "'Cinzel', serif",
        letterSpacing: '0.08em',
        borderRadius: '2px',
        transition: 'background 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#D4A24C'
        e.currentTarget.style.boxShadow = '0 0 12px rgba(200,150,62,0.4)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#C8963E'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {label}
    </button>
  )
}

export default LoginButton
