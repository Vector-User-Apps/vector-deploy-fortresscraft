import { useState, useCallback, useEffect } from 'react'

const FORTRESS_FACTS = [
  'The Great Wall of China spans over 13,000 miles — its mortar was partially made with sticky rice, giving it extraordinary durability.',
  'Edinburgh Castle sits atop an extinct volcano that last erupted 350 million years ago, making it one of the oldest geological fortress sites on Earth.',
  'The Krak des Chevaliers in Syria had a 60-foot-wide moat and could garrison 2,000 troops — Saladin himself failed to capture it by siege.',
  'Japanese castle walls use a technique called "battered" construction — the curved stone bases can flex during earthquakes without collapsing.',
  'The fortress of Masada in Israel sits 1,300 feet above the Dead Sea. Roman engineers built a massive siege ramp that still exists today.',
  'Medieval castle spiral staircases almost always wind clockwise going up — this gave right-handed defenders a sword-arm advantage over attackers.',
  'The Maginot Line contained underground railways, hospitals, and air-conditioned living quarters for thousands of soldiers.',
  'Château de Coucy in France had a keep 180 feet tall with walls 25 feet thick — the largest in medieval Europe until it was demolished in 1917.',
  'The fortress city of Dubrovnik has walls up to 20 feet thick and survived a 15-month Ottoman siege in 1991-92 during the Croatian War.',
  'Himeji Castle in Japan has maze-like paths, hidden rooms, and openings in walls designed to pour boiling oil on invaders — it has never been conquered.',
  'The Tower of London has served as a royal palace, prison, zoo, armory, mint, and jewel house over its 950-year history.',
  'Neuschwanstein Castle in Bavaria inspired Disneyland\'s Sleeping Beauty Castle — yet it was only lived in for 172 days before King Ludwig II died.',
]

const WIDGET_STYLES = `
  .ff-widget {
    width: 260px;
    margin-top: 1.6rem;
    perspective: 600px;
  }

  .ff-card-wrapper {
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .ff-card-wrapper.ff-flipping {
    transform: rotateY(90deg);
  }

  .ff-card {
    border: 1px solid rgba(200,150,62,0.18);
    background: rgba(200,150,62,0.03);
    padding: 1rem 1rem 0.7rem;
    position: relative;
    overflow: hidden;
  }

  .ff-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(200,150,62,0.35), transparent);
  }

  .ff-header {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    margin-bottom: 0.65rem;
  }

  .ff-icon {
    width: 14px;
    height: 14px;
    border: 1px solid rgba(200,150,62,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.5rem;
    flex-shrink: 0;
  }

  .ff-label {
    font-family: 'Lora', serif;
    font-size: 0.5rem;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: rgba(200,150,62,0.55);
  }

  .ff-text {
    font-family: 'Lora', serif;
    font-size: 0.6rem;
    line-height: 1.7;
    color: rgba(232,223,200,0.55);
    margin-bottom: 0.75rem;
  }

  .ff-divider {
    height: 1px;
    background: rgba(200,150,62,0.1);
    margin-bottom: 0.55rem;
  }

  .ff-btn {
    width: 100%;
    background: transparent;
    border: 1px solid rgba(200,150,62,0.12);
    color: rgba(232,223,200,0.3);
    font-family: 'Lora', serif;
    font-size: 0.48rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    padding: 0.45rem 0;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
  }
  .ff-btn:hover {
    border-color: rgba(200,150,62,0.35);
    color: rgba(232,223,200,0.7);
  }

  .ff-enter {
    animation: ff-slidein 0.5s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes ff-slidein {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`

function getRandomIndex(exclude: number, max: number): number {
  if (max <= 1) return 0
  let next = exclude
  while (next === exclude) {
    next = Math.floor(Math.random() * max)
  }
  return next
}

export function FortressFact() {
  const [factIndex, setFactIndex] = useState(() =>
    Math.floor(Math.random() * FORTRESS_FACTS.length)
  )
  const [flipping, setFlipping] = useState(false)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 100)
    return () => clearTimeout(t)
  }, [])

  const shuffle = useCallback(() => {
    if (flipping) return
    setFlipping(true)
    setTimeout(() => {
      setFactIndex((prev) => getRandomIndex(prev, FORTRESS_FACTS.length))
      setFlipping(false)
    }, 250)
  }, [flipping])

  if (!entered) return null

  return (
    <>
      <style>{WIDGET_STYLES}</style>
      <div className="ff-widget ff-enter" data-testid="fortress-fact">
        <div className={`ff-card-wrapper${flipping ? ' ff-flipping' : ''}`}>
          <div className="ff-card">
            <div className="ff-header">
              <div className="ff-icon">📜</div>
              <span className="ff-label">Scroll of Lore</span>
            </div>
            <div className="ff-text">{FORTRESS_FACTS[factIndex]}</div>
            <div className="ff-divider" />
            <button className="ff-btn" onClick={shuffle} data-testid="fortress-fact-shuffle">
              ↻ Unroll New Scroll
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
