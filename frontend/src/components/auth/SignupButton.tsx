import React from 'react'

/**
 * Signup Button
 *
 * DO NOT MODIFY THE HANDLE IN THIS FILE  - You may only modify the appearance of the button.
 *
 * Redirects the user to Vector's hosted signup page where they can
 * choose from available sign-up methods (Google, magic link, etc.).
 * After authentication, the user is redirected back to /auth/callback
 * with a JWT token.
 *
 * Usage:
 *   <SignupButton />
 *   <SignupButton label="Get started" />
 */

const AUTH_PROXY_URL = import.meta.env.VITE_AUTH_PROXY_URL || ''
const APP_ID = import.meta.env.VITE_APP_ID || ''
const APP_VERSION_ID = import.meta.env.VITE_APP_VERSION_ID || ''

interface SignupButtonProps {
  label?: string
  className?: string
  style?: React.CSSProperties
  ariaLabel?: string
}

export function SignupButton({
  label = 'Sign up',
  className = '',
  style,
  ariaLabel,
}: SignupButtonProps) {
  const handleSignup = () => {
    const redirectUri = `${window.location.origin}/auth/callback`
    const params = new URLSearchParams({
      app_id: APP_ID,
      app_version_id: APP_VERSION_ID,
      redirect_uri: redirectUri,
      mode: 'signup',
    })
    const signupUrl = `${AUTH_PROXY_URL}/login?${params}`
    window.location.href = signupUrl
  }

  return (
    <button
      onClick={handleSignup}
      className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium shadow-sm focus:outline-none ${className}`}
      style={{
        background: 'transparent',
        color: '#E8DFC8',
        border: '1px solid rgba(200,150,62,0.4)',
        fontFamily: "'Cinzel', serif",
        letterSpacing: '0.08em',
        borderRadius: '2px',
        transition: 'background 0.15s, border-color 0.15s, box-shadow 0.15s',
        ...style,
      }}
      aria-label={ariaLabel}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(200,150,62,0.1)'
        e.currentTarget.style.borderColor = '#C8963E'
        e.currentTarget.style.boxShadow = '0 0 12px rgba(200,150,62,0.2)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.borderColor = 'rgba(200,150,62,0.4)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {label}
    </button>
  )
}

export default SignupButton
