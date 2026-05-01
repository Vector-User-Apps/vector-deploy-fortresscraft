import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGameStore } from '@/game/state'
import { submitScore } from '@/services/leaderboard'
import { recordGame } from '@/services/achievements'

export function GameOver() {
  const navigate = useNavigate()
  const score = useGameStore((s) => s.score)
  const wave = useGameStore((s) => s.wave)
  const enemiesKilled = useGameStore((s) => s.enemiesKilled)
  const reset = useGameStore((s) => s.reset)

  // Record stats for achievements (once per mount)
  const recorded = useRef(false)
  useEffect(() => {
    if (!recorded.current) {
      recorded.current = true
      recordGame(score, wave, enemiesKilled)
    }
  }, [score, wave, enemiesKilled])
  const [playerName, setPlayerName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!playerName.trim()) return
    setSubmitting(true)
    setError('')
    try {
      await submitScore({
        player_name: playerName.trim(),
        score,
        wave_reached: wave,
        enemies_killed: enemiesKilled,
      })
      setSubmitted(true)
    } catch {
      setError('Failed to submit score. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePlayAgain = () => {
    reset()
    navigate('/play/game', { replace: true })
  }

  return (
    <div
      data-testid="game-over"
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        background: 'var(--color-bg)',
        fontFamily: 'var(--font-body)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center w-full max-w-sm"
      >
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-weight-bold)',
            fontSize: 'var(--font-size-3xl)',
            color: 'var(--palette-red-400)',
            marginBottom: '8px',
          }}
        >
          The Kingdom Has Fallen
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px' }}>
          The dark creatures have breached the castle walls!
        </p>

        {/* Stats */}
        <div
          className="grid grid-cols-3 gap-3 mb-8 p-4 rounded"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <StatBox label="Score" value={score.toLocaleString()} color="var(--palette-yellow-400)" />
          <StatBox label="Wave" value={String(wave)} color="var(--color-accent)" />
          <StatBox label="Slain" value={String(enemiesKilled)} color="var(--palette-green-400)" />
        </div>

        {/* Submit Score */}
        {!submitted ? (
          <div className="mb-6">
            <input
              data-testid="game-over.name-input"
              type="text"
              placeholder="Inscribe thy name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={50}
              className="w-full mb-3 px-4 py-3 rounded"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-fg)',
                fontSize: 'var(--font-size-base)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
            />
            <button
              data-testid="game-over.submit-button"
              onClick={handleSubmit}
              disabled={submitting || !playerName.trim()}
              className="w-full py-3 rounded transition-all"
              style={{
                background:
                  playerName.trim() ? 'var(--color-accent)' : 'var(--palette-dark-400)',
                color: '#fff',
                border: 'none',
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-bold)',
                cursor: playerName.trim() ? 'pointer' : 'not-allowed',
                borderRadius: 'var(--radius-md)',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Inscribing...' : 'Submit to the Chronicle'}
            </button>
            {error && (
              <p style={{ color: 'var(--palette-red-400)', fontSize: 'var(--font-size-sm)', marginTop: '8px' }}>
                {error}
              </p>
            )}
          </div>
        ) : (
          <div
            className="mb-6 py-3 rounded"
            style={{
              background: 'rgba(92, 173, 106, 0.1)',
              border: '1px solid rgba(92, 173, 106, 0.3)',
              color: 'var(--palette-green-400)',
              fontSize: 'var(--font-size-sm)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            Thy deeds have been recorded in the Chronicle!
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            data-testid="game-over.play-again"
            onClick={handlePlayAgain}
            className="w-full py-3 rounded transition-all"
            style={{
              background: 'var(--color-accent)',
              color: '#fff',
              border: 'none',
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-weight-medium)',
              cursor: 'pointer',
              borderRadius: 'var(--radius-md)',
            }}
          >
            Defend Again
          </button>
          <button
            onClick={() => navigate('/play')}
            className="w-full py-3 rounded transition-all"
            style={{
              background: 'transparent',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
              fontSize: 'var(--font-size-base)',
              cursor: 'pointer',
              borderRadius: 'var(--radius-md)',
            }}
          >
            Return to Castle
          </button>
          {submitted && (
            <button
              onClick={() => navigate('/leaderboard')}
              className="w-full py-3 rounded transition-all"
              style={{
                background: 'transparent',
                color: 'var(--color-accent)',
                border: '1px solid var(--color-border)',
                fontSize: 'var(--font-size-base)',
                cursor: 'pointer',
                borderRadius: 'var(--radius-md)',
              }}
            >
              View the Hall of Heroes
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center">
      <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color }}>
        {value}
      </div>
      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
        {label}
      </div>
    </div>
  )
}
