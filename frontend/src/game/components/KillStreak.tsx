import { getGoldMultiplier } from '../comboMultiplier'

const COMBO_COLORS = [
  '#E8DFC8',   // 1-2  parchment
  '#E8DFC8',
  '#D4A24C',   // 3-4  gold
  '#D4A24C',
  '#C8963E',   // 5-9  deep gold
  '#C8963E',
  '#C8963E',
  '#C8963E',
  '#C8963E',
  '#FF1744',   // 10-19 red
]

function getComboColor(count: number): string {
  if (count >= 20) return '#D500F9'
  if (count >= 10) return '#FF1744'
  return COMBO_COLORS[Math.min(count, COMBO_COLORS.length - 1)] ?? '#E8DFC8'
}

interface StreakAnnouncementDisplay {
  text: string
  color: string
  size: string
}

export function KillStreakOverlay({ announcement, combo }: { announcement: StreakAnnouncementDisplay | null; combo: number }) {
  return (
    <>
      {/* Persistent combo counter */}
      {combo >= 2 && (
        <div
          key={`combo-${combo}`}
          style={{
            position: 'absolute',
            top: '14%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 999,
            pointerEvents: 'none',
            animation: 'comboBump 0.2s ease-out',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                fontWeight: 700,
                fontFamily: "'Cinzel', serif",
                textTransform: 'uppercase',
                letterSpacing: '3px',
                color: getComboColor(combo),
                opacity: 0.7,
                textShadow: `0 0 10px ${getComboColor(combo)}40`,
              }}
            >
              COMBO
            </div>
            <div
              style={{
                fontSize: `${Math.min(28 + combo * 2, 72)}px`,
                fontWeight: 900,
                fontFamily: "'Cinzel', serif",
                color: getComboColor(combo),
                textShadow: `0 0 20px ${getComboColor(combo)}80, 0 0 40px ${getComboColor(combo)}40, 0 0 60px ${getComboColor(combo)}20, 0 2px 4px rgba(0,0,0,0.9)`,
                lineHeight: 1,
                letterSpacing: '2px',
                userSelect: 'none',
              }}
            >
              x{combo}
            </div>
            {getGoldMultiplier(combo) > 1 && (
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  fontFamily: "'Lora', serif",
                  color: '#D4A24C',
                  textShadow: '0 0 8px rgba(212,162,76,0.5), 0 1px 2px rgba(0,0,0,0.8)',
                  letterSpacing: '1px',
                  marginTop: '2px',
                }}
              >
                {getGoldMultiplier(combo)}x GOLD
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tier announcement (Triple Kill, Rampage, etc.) */}
      {announcement && (
        <div
          key={announcement.text + Date.now()}
          style={{
            position: 'absolute',
            top: '30%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            pointerEvents: 'none',
            animation: 'streakPop 1.5s ease-out forwards',
          }}
        >
          <div
            style={{
              color: announcement.color,
              fontSize: announcement.size,
              fontWeight: 900,
              fontFamily: "'Cinzel', serif",
              textTransform: 'uppercase',
              textShadow: `0 0 20px ${announcement.color}80, 0 0 40px ${announcement.color}40, 0 0 80px ${announcement.color}20, 0 2px 4px rgba(0,0,0,0.8)`,
              letterSpacing: '2px',
              whiteSpace: 'nowrap',
              userSelect: 'none',
            }}
          >
            {announcement.text}
          </div>
        </div>
      )}

      <style>{`
        @keyframes streakPop {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
          }
          15% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.15);
          }
          25% {
            transform: translate(-50%, -50%) scale(1.0);
          }
          70% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.0);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.0) translateY(-20px);
          }
        }
        @keyframes comboBump {
          0% {
            transform: translate(-50%, -50%) scale(1.3);
          }
          100% {
            transform: translate(-50%, -50%) scale(1.0);
          }
        }
      `}</style>
    </>
  )
}
