import { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { checkAdminAccess, getAdminUsers } from '@/services/admin'
import type { AdminUser } from '@/services/admin'

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');

  .cmd {
    min-height: 100vh;
    background: var(--color-bg);
    color: var(--color-fg);
    font-family: 'Lora', serif;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow-x: hidden;
  }

  .cmd-stripe {
    position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 100;
    background: linear-gradient(90deg, #2A1E0A, var(--primary-color), #2A1E0A);
    box-shadow: 0 0 18px rgba(200,150,62,0.35);
  }

  .cmd-glow {
    position: fixed; inset: 0; pointer-events: none;
    background: radial-gradient(ellipse 80% 40% at 50% 0%, rgba(200,150,62,0.05) 0%, transparent 70%);
  }

  .cmd-body {
    position: relative; z-index: 10;
    max-width: 960px;
    width: 100%;
    margin: 0 auto;
    padding: 2rem 1.5rem 3rem;
    animation: cmd-fadein 0.65s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes cmd-fadein {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .cmd-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    padding-top: 1rem;
  }

  .cmd-back {
    background: transparent;
    border: 1px solid rgba(200,150,62,0.22);
    color: var(--primary-color);
    font-family: 'Lora', serif;
    font-size: 1rem;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    flex-shrink: 0;
  }
  .cmd-back:hover {
    border-color: rgba(200,150,62,0.55);
    background: rgba(200,150,62,0.06);
  }

  .cmd-titles {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .cmd-title {
    font-family: 'Cinzel', serif;
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--primary-color);
    text-shadow: 0 0 14px rgba(200,150,62,0.45);
    margin: 0;
    line-height: 1.2;
  }

  .cmd-subtitle {
    font-family: 'Lora', serif;
    font-size: 0.55rem;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: var(--color-muted);
    margin: 0;
  }

  .cmd-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    margin-bottom: 2rem;
  }
  @media (max-width: 560px) {
    .cmd-stats {
      grid-template-columns: 1fr;
    }
  }

  .cmd-stat {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    padding: 1rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .cmd-stat-label {
    font-size: 0.5rem;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: var(--color-muted);
  }

  .cmd-stat-value {
    font-family: 'Cinzel', serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-color);
    text-shadow: 0 0 10px rgba(200,150,62,0.2);
  }

  .cmd-table-wrap {
    overflow-x: auto;
    border: 1px solid var(--color-border);
    background: var(--color-surface);
  }

  .cmd-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 640px;
  }

  .cmd-table th {
    font-size: 0.5rem;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: var(--color-muted);
    font-weight: 500;
    text-align: left;
    padding: 0.85rem 1rem;
    border-bottom: 1px solid var(--color-border);
    white-space: nowrap;
  }

  .cmd-table td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid rgba(26,40,24,0.5);
    vertical-align: middle;
    font-size: 0.85rem;
  }

  .cmd-table tr:last-child td {
    border-bottom: none;
  }

  .cmd-table tbody tr {
    transition: background 0.12s;
  }
  .cmd-table tbody tr:hover {
    background: rgba(200,150,62,0.04);
  }

  .cmd-warrior {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }

  .cmd-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid rgba(200,150,62,0.25);
    object-fit: cover;
    flex-shrink: 0;
  }

  .cmd-avatar-fallback {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid rgba(200,150,62,0.2);
    background: rgba(200,150,62,0.06);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    flex-shrink: 0;
  }

  .cmd-warrior-name {
    color: var(--color-fg);
    font-weight: 500;
    line-height: 1.3;
  }

  .cmd-warrior-email {
    font-size: 0.72rem;
    color: var(--color-muted);
    line-height: 1.3;
  }

  .cmd-rank {
    font-family: 'Cinzel', serif;
    font-size: 0.75rem;
    letter-spacing: 0.06em;
    color: var(--color-fg);
  }
  .cmd-rank-gold { color: #D4A24C; }
  .cmd-rank-silver { color: #9DB492; }
  .cmd-rank-bronze { color: #8B6F4E; }

  .cmd-muted {
    color: var(--color-muted);
    font-size: 0.8rem;
  }

  .cmd-score {
    font-family: 'Cinzel', serif;
    font-size: 0.85rem;
    color: var(--primary-color);
  }

  .cmd-loading {
    min-height: 100vh;
    background: var(--color-bg);
    color: var(--color-fg);
    font-family: 'Lora', serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .cmd-loading-text {
    font-size: 0.55rem;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: rgba(232,223,200,0.4);
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .cmd-loading-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--primary-color);
    box-shadow: 0 0 8px var(--primary-color);
    animation: cmd-pulse 2s ease-in-out infinite;
  }
  @keyframes cmd-pulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 8px var(--primary-color); }
    50% { opacity: 0.4; box-shadow: 0 0 16px var(--primary-color); }
  }

  .cmd-denied {
    min-height: 100vh;
    background: var(--color-bg);
    color: var(--color-fg);
    font-family: 'Lora', serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 0.75rem;
    padding: 2rem;
  }

  .cmd-denied-icon {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }

  .cmd-denied-title {
    font-family: 'Cinzel', serif;
    font-size: 1.4rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: var(--primary-color);
    text-shadow: 0 0 14px rgba(200,150,62,0.4);
  }

  .cmd-denied-text {
    font-size: 0.8rem;
    color: var(--color-muted);
    max-width: 340px;
    line-height: 1.6;
  }

  .cmd-denied-back {
    margin-top: 1rem;
    background: transparent;
    border: 1px solid rgba(200,150,62,0.3);
    color: var(--primary-color);
    font-family: 'Lora', serif;
    font-size: 0.6rem;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    padding: 0.7rem 2rem;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
  }
  .cmd-denied-back:hover {
    border-color: rgba(200,150,62,0.6);
    background: rgba(200,150,62,0.06);
  }
`

function getRankLabel(index: number): { label: string; className: string } {
  if (index === 0) return { label: 'Champion', className: 'cmd-rank cmd-rank-gold' }
  if (index === 1) return { label: 'Knight Commander', className: 'cmd-rank cmd-rank-silver' }
  if (index === 2) return { label: 'Knight Captain', className: 'cmd-rank cmd-rank-bronze' }
  if (index < 10) return { label: 'Knight', className: 'cmd-rank' }
  if (index < 25) return { label: 'Squire', className: 'cmd-rank' }
  return { label: 'Recruit', className: 'cmd-rank' }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[date.getMonth()]} ${date.getFullYear()}`
}

function formatNumber(n: number): string {
  return n.toLocaleString()
}

export function AdminPage() {
  const navigate = useNavigate()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loadingAccess, setLoadingAccess] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    if (authLoading || !isAuthenticated) return

    let cancelled = false
    setLoadingAccess(true)

    checkAdminAccess()
      .then((hasAccess) => {
        if (cancelled) return
        setIsAdmin(hasAccess)
        setLoadingAccess(false)
        if (hasAccess) {
          setLoadingUsers(true)
          getAdminUsers()
            .then((data) => {
              if (!cancelled) {
                setUsers(data)
                setLoadingUsers(false)
              }
            })
            .catch(() => {
              if (!cancelled) setLoadingUsers(false)
            })
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsAdmin(false)
          setLoadingAccess(false)
        }
      })

    return () => { cancelled = true }
  }, [authLoading, isAuthenticated])

  if (authLoading) return null
  if (!isAuthenticated) return <Navigate to="/" replace />

  if (loadingAccess || (isAdmin && loadingUsers)) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="cmd-loading" data-testid="admin.loading">
          <div className="cmd-loading-text">
            <span className="cmd-loading-dot" />
            Gathering intelligence...
          </div>
        </div>
      </>
    )
  }

  if (!isAdmin) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="cmd-denied" data-testid="admin.denied">
          <div className="cmd-stripe" />
          <div className="cmd-denied-icon">{'\u{1F6E1}\uFE0F'}</div>
          <div className="cmd-denied-title">RESTRICTED AREA</div>
          <div className="cmd-denied-text">
            Your rank does not grant access to the Command Center
          </div>
          <button className="cmd-denied-back" onClick={() => navigate('/play')}>
            Return to Camp
          </button>
        </div>
      </>
    )
  }

  const sortedUsers = [...users].sort((a, b) => b.best_score - a.best_score)
  const highestScore = sortedUsers.length > 0 ? sortedUsers[0].best_score : 0
  const mostWaves = sortedUsers.length > 0
    ? Math.max(...sortedUsers.map((u) => u.best_wave))
    : 0

  return (
    <>
      <style>{STYLES}</style>
      <div className="cmd" data-testid="admin.page">
        <div className="cmd-stripe" />
        <div className="cmd-glow" />

        <div className="cmd-body">
          <div className="cmd-header">
            <button
              className="cmd-back"
              onClick={() => navigate('/play')}
              aria-label="Back to menu"
            >
              {'\u2190'}
            </button>
            <div className="cmd-titles">
              <h1 className="cmd-title">COMMAND CENTER</h1>
              <p className="cmd-subtitle">Royal Intelligence Division</p>
            </div>
          </div>

          <div className="cmd-stats">
            <div className="cmd-stat">
              <span className="cmd-stat-label">Total Warriors</span>
              <span className="cmd-stat-value">{formatNumber(sortedUsers.length)}</span>
            </div>
            <div className="cmd-stat">
              <span className="cmd-stat-label">Highest Score</span>
              <span className="cmd-stat-value">{formatNumber(highestScore)}</span>
            </div>
            <div className="cmd-stat">
              <span className="cmd-stat-label">Most Waves Reached</span>
              <span className="cmd-stat-value">{formatNumber(mostWaves)}</span>
            </div>
          </div>

          <div className="cmd-table-wrap">
            <table className="cmd-table">
              <thead>
                <tr>
                  <th>Warrior</th>
                  <th>Rank</th>
                  <th>Joined</th>
                  <th>Best Score</th>
                  <th>Waves</th>
                  <th>Games Played</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((user, index) => {
                  const rank = getRankLabel(index)
                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="cmd-warrior">
                          {user.picture ? (
                            <img
                              className="cmd-avatar"
                              src={user.picture}
                              alt={user.full_name}
                            />
                          ) : (
                            <div className="cmd-avatar-fallback">{'\u{1F6E1}\uFE0F'}</div>
                          )}
                          <div>
                            <div className="cmd-warrior-name">{user.full_name}</div>
                            <div className="cmd-warrior-email">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={rank.className}>{rank.label}</span>
                      </td>
                      <td>
                        <span className="cmd-muted">{formatDate(user.created_at)}</span>
                      </td>
                      <td>
                        <span className="cmd-score">{formatNumber(user.best_score)}</span>
                      </td>
                      <td>
                        <span className="cmd-muted">{user.best_wave}</span>
                      </td>
                      <td>
                        <span className="cmd-muted">{user.games_played}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
