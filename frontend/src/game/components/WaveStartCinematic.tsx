import { useState, useEffect } from 'react'
import { useGameStore } from '../state'

export function WaveStartCinematic() {
  const wave = useGameStore((s) => s.wave)
  const phase = useGameStore((s) => s.phase)
  const [show, setShow] = useState(false)
  const [animClass, setAnimClass] = useState('')
  const [prevWave, setPrevWave] = useState(0)

  const isBossWave = wave > 0 && wave % 10 === 0

  useEffect(() => {
    if (wave > prevWave && wave > 0 && phase === 'playing') {
      setPrevWave(wave)
      setShow(true)
      setAnimClass('wave-cinematic-enter')

      const t1 = setTimeout(() => setAnimClass('wave-cinematic-active'), 100)
      const t2 = setTimeout(() => setAnimClass('wave-cinematic-exit'), 1500)
      const t3 = setTimeout(() => { setShow(false); setAnimClass('') }, 2000)

      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
    }
  }, [wave, phase, prevWave])

  if (!show) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 60,
      }}
    >
      <style>{`
        .wave-cinematic-enter .wave-number {
          transform: scale(3);
          opacity: 0;
        }
        .wave-cinematic-active .wave-number {
          transform: scale(1);
          opacity: 1;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease-out;
        }
        .wave-cinematic-exit .wave-number {
          transform: scale(0.8);
          opacity: 0;
          transition: transform 0.4s ease-in, opacity 0.4s ease-in;
        }
        .wave-cinematic-enter .wave-subtitle {
          opacity: 0;
          transform: translateY(20px);
        }
        .wave-cinematic-active .wave-subtitle {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.3s ease-out 0.3s, transform 0.3s ease-out 0.3s;
        }
        .wave-cinematic-exit .wave-subtitle {
          opacity: 0;
          transition: opacity 0.3s ease-in;
        }
        @keyframes bossGlow {
          0%, 100% { text-shadow: 0 0 20px #FF0000, 0 0 40px #FF4444; }
          50% { text-shadow: 0 0 30px #FF0000, 0 0 60px #FF4444, 0 0 80px #FF0000; }
        }
        .boss-text {
          animation: bossGlow 0.5s ease-in-out infinite;
        }
      `}</style>
      <div className={animClass}>
        <div
          className="wave-number"
          style={{
            fontSize: '72px',
            fontWeight: 900,
            color: isBossWave ? '#FF4444' : '#E8DFC8',
            textShadow: isBossWave
              ? '0 0 20px #FF0000, 0 0 40px #FF4444'
              : '0 0 20px rgba(200,150,62,0.5), 0 4px 8px rgba(0,0,0,0.8)',
            fontFamily: "'Cinzel', serif",
            letterSpacing: '0.05em',
            textAlign: 'center',
          }}
        >
          WAVE {wave}
        </div>
        <div
          className={`wave-subtitle ${isBossWave ? 'boss-text' : ''}`}
          style={{
            fontSize: isBossWave ? '28px' : '18px',
            fontWeight: 700,
            color: isBossWave ? '#FF6666' : 'rgba(232,223,200,0.7)',
            marginTop: '8px',
            textAlign: 'center',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontFamily: "'Cinzel', serif",
          }}
        >
          {isBossWave ? 'BOSS INCOMING!' : `${wave > 6 ? 'Enemies grow stronger...' : 'Prepare your defenses!'}`}
        </div>
      </div>
      {/* Darkened backdrop */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%)',
          zIndex: -1,
        }}
      />
    </div>
  )
}
