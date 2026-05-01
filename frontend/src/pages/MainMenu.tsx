import { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useGameStore } from '@/game/state'
import { useAuth } from '@/hooks/useAuth'
import { checkAdminAccess } from '@/services/admin'
import { FortressFact } from '@/components/FortressFact'
import { FortressStatus } from '@/components/FortressStatus'
import { VictoryConfetti } from '@/components/VictoryConfetti'
import { ThreatRadar } from '@/components/ThreatRadar'

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');

  .mm {
    min-height: 100vh;
    background: #0F1A0E;
    color: #E8DFC8;
    font-family: 'Lora', serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  /* Subtle warm bar */
  .mm-stripe {
    position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 100;
    background: linear-gradient(90deg, #2A1E0A, #C8963E, #2A1E0A);
    box-shadow: 0 0 18px rgba(200,150,62,0.35);
  }

  /* Center radial glow */
  .mm-glow {
    position: absolute; inset: 0; pointer-events: none;
    background: radial-gradient(ellipse 65% 50% at 50% 50%, rgba(200,150,62,0.07) 0%, transparent 70%);
  }

  /* Sign-out — top right */
  .mm-signout {
    position: fixed; top: 10px; right: 16px; z-index: 200;
    background: transparent;
    border: 1px solid rgba(200,150,62,0.22);
    color: rgba(232,223,200,0.4);
    font-family: 'Lora', serif;
    font-size: 0.55rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    padding: 5px 12px;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
  }
  .mm-signout:hover {
    border-color: rgba(200,150,62,0.55);
    color: rgba(232,223,200,0.85);
  }

  /* Body fade-in */
  .mm-body {
    position: relative; z-index: 10;
    display: flex; flex-direction: column; align-items: center;
    text-align: center;
    padding: 0 1.5rem;
    animation: mm-fadein 0.65s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes mm-fadein {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Logo / game title */
  .mm-logo {
    display: flex; align-items: center; gap: 0.55rem;
    margin-bottom: 2.75rem;
  }
  .mm-logo-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #C8963E;
    box-shadow: 0 0 8px #C8963E, 0 0 18px rgba(200,150,62,0.35);
    animation: mm-pulse 2.5s ease-in-out infinite;
  }
  @keyframes mm-pulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 8px #C8963E, 0 0 18px rgba(200,150,62,0.35); }
    50% { opacity: 0.6; box-shadow: 0 0 14px #D4A24C, 0 0 28px rgba(200,150,62,0.5); }
  }
  .mm-logo-text {
    font-family: 'Cinzel', serif;
    font-size: 0.9rem;
    letter-spacing: 0.12em;
    color: #C8963E;
    text-shadow: 0 0 14px rgba(200,150,62,0.45);
  }
  /* The "CRAFT" gentle glow */
  .mm-logo-craft {
    animation: mm-craft-glow 4s ease-in-out infinite;
  }
  @keyframes mm-craft-glow {
    0%, 100% {
      text-shadow: 0 0 14px rgba(200,150,62,0.45);
    }
    50% {
      text-shadow: 0 0 22px rgba(200,150,62,0.8),
                   0 0 40px rgba(200,150,62,0.35);
    }
  }

  /* Avatar */
  .mm-avatar-img {
    width: 52px; height: 52px; border-radius: 50%;
    border: 1px solid rgba(200,150,62,0.38);
    box-shadow: 0 0 16px rgba(200,150,62,0.15);
    margin-bottom: 0.9rem;
    object-fit: cover;
  }
  .mm-avatar-fallback {
    width: 52px; height: 52px; border-radius: 50%;
    border: 1px solid rgba(200,150,62,0.35);
    background: rgba(200,150,62,0.06);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.3rem;
    margin-bottom: 0.9rem;
  }

  /* Greeting */
  .mm-greeting-label {
    font-size: 0.55rem;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: rgba(232,223,200,0.38);
    margin-bottom: 0.2rem;
  }
  .mm-greeting-name {
    font-family: 'Cinzel', serif;
    font-size: 1.6rem;
    color: #E8DFC8;
    letter-spacing: 0.04em;
    text-shadow: 0 0 20px rgba(200,150,62,0.2);
    margin-bottom: 2.5rem;
  }

  /* Button group */
  .mm-btns {
    display: flex; flex-direction: column; gap: 0.55rem;
    width: 260px;
  }

  /* Primary — PLAY */
  .mm-btn-play {
    position: relative;
    width: 100%;
    background: #C8963E;
    color: #0F1A0E;
    border: none;
    font-family: 'Cinzel', serif;
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 0.95rem 0;
    cursor: pointer;
    overflow: hidden;
    border-radius: 2px;
    box-shadow:
      0 0 0 1px rgba(200,150,62,0.5),
      0 0 24px rgba(200,150,62,0.28),
      0 0 60px rgba(200,150,62,0.08);
    transition: transform 0.1s, box-shadow 0.2s;
  }
  .mm-btn-play::before {
    content: '';
    position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
    animation: mm-shine 3.5s ease-in-out infinite 2s;
  }
  @keyframes mm-shine {
    0%   { left: -100%; }
    100% { left: 200%; }
  }
  .mm-btn-play:hover {
    transform: translateY(-2px);
    box-shadow:
      0 0 0 1px rgba(200,150,62,0.8),
      0 0 40px rgba(200,150,62,0.45),
      0 0 100px rgba(200,150,62,0.15);
  }
  .mm-btn-play:active { transform: translateY(0); }

  /* Secondary */
  .mm-btn-sec {
    width: 100%;
    background: transparent;
    color: rgba(232,223,200,0.6);
    border: 1px solid rgba(200,150,62,0.22);
    font-family: 'Lora', serif;
    font-size: 0.62rem;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    padding: 0.7rem 0;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s, background 0.15s;
  }
  .mm-btn-sec:hover {
    border-color: rgba(200,150,62,0.5);
    color: rgba(232,223,200,0.95);
    background: rgba(200,150,62,0.04);
  }

  /* Ghost */
  .mm-btn-ghost {
    width: 100%;
    background: transparent;
    color: rgba(232,223,200,0.28);
    border: 1px solid rgba(200,150,62,0.1);
    font-family: 'Lora', serif;
    font-size: 0.6rem;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    padding: 0.65rem 0;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
  }
  .mm-btn-ghost:hover {
    border-color: rgba(200,150,62,0.28);
    color: rgba(232,223,200,0.65);
  }

  /* Status line */
  .mm-status {
    margin-top: 2.75rem;
    font-size: 0.48rem;
    letter-spacing: 0.45em;
    text-transform: uppercase;
    color: rgba(232,223,200,0.18);
    display: flex; align-items: center; gap: 0.5rem;
  }
  .mm-status-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: #C8963E;
    box-shadow: 0 0 6px #C8963E;
    flex-shrink: 0;
    animation: mm-pulse 2.5s ease-in-out infinite;
  }

  /* Version */
  .mm-version {
    position: fixed; bottom: 14px; right: 18px;
    font-size: 0.48rem; letter-spacing: 0.22em;
    color: rgba(232,223,200,0.14);
    pointer-events: none; user-select: none;
  }
`

export function MainMenu() {
  const navigate = useNavigate()
  const reset = useGameStore((s) => s.reset)
  const { user, logout, isAuthenticated, loading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (loading || !isAuthenticated) return
    let cancelled = false
    checkAdminAccess()
      .then((v) => { if (!cancelled) setIsAdmin(v) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [loading, isAuthenticated])

  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/" replace />

  const handlePlay = () => {
    reset()
    navigate('/play/game')
  }

  const displayName = user?.first_name || user?.full_name?.split(' ')[0] || 'Lord'

  return (
    <>
      <style>{STYLES}</style>
      <div className="mm" data-testid="main-menu">
        <div className="mm-stripe" />
        <div className="mm-glow" />

        <button className="mm-signout" onClick={logout}>Sign Out</button>

        <div className="mm-body">
          {/* Logo */}
          <div className="mm-logo">
            <div className="mm-logo-dot" />
            <span className="mm-logo-text">
              FORTRESS <span className="mm-logo-craft">CRAFT</span>
            </span>
          </div>

          {/* Avatar */}
          {user?.picture ? (
            <img className="mm-avatar-img" src={user.picture} alt={displayName} />
          ) : (
            <div className="mm-avatar-fallback">🛡️</div>
          )}

          {/* Greeting */}
          <div className="mm-greeting-label">Welcome back</div>
          <div className="mm-greeting-name">{displayName.toUpperCase()}</div>

          {/* Buttons */}
          <div className="mm-btns">
            <button
              className="mm-btn-play"
              data-testid="menu.play-button"
              onClick={handlePlay}
            >
              ⚔ March Forth
            </button>

            <button
              className="mm-btn-sec"
              data-testid="menu.achievements-button"
              onClick={() => navigate('/play/achievements')}
            >
              🎖️ Hall of Valor
            </button>

            <button
              className="mm-btn-sec"
              data-testid="menu.armory-button"
              onClick={() => navigate('/play/armory')}
            >
              🏹 War Arsenal
            </button>

            <button
              className="mm-btn-sec"
              data-testid="menu.forecast-button"
              onClick={() => navigate('/play/forecast')}
            >
              📡 Scout Report
            </button>

            <button
              className="mm-btn-sec"
              data-testid="menu.leaderboard-button"
              onClick={() => navigate('/leaderboard')}
            >
              Leaderboard
            </button>

            <button
              className="mm-btn-ghost"
              data-testid="menu.howtoplay-button"
              onClick={() => navigate('/how-to-play')}
            >
              How to Play
            </button>

            <button
              className="mm-btn-ghost"
              data-testid="menu.settings-button"
              onClick={() => navigate('/settings')}
            >
              Settings
            </button>

            {isAdmin && (
              <button
                className="mm-btn-ghost"
                data-testid="menu.admin-button"
                onClick={() => navigate('/admin')}
              >
                ⚙ Command Center
              </button>
            )}
          </div>

          {/* Confetti Cannon */}
          <VictoryConfetti />

          {/* Fortress Status Widget */}
          <FortressStatus />

          {/* Threat Radar */}
          <ThreatRadar />

          {/* Fortress Fact */}
          <FortressFact />

          {/* Status */}
          <div className="mm-status">
            <span className="mm-status-dot" />
            The Kingdom Awaits · Your Sword is Ready
          </div>
        </div>

        <div className="mm-version">v1.1.0</div>
      </div>
    </>
  )
}
