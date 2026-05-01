import { useEffect, useState, useRef, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { LoginButton } from '@/components/auth/LoginButton'
import { SignupButton } from '@/components/auth/SignupButton'
import { getLeaderboard, type LeaderboardEntry } from '@/services/leaderboard'


const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --fire: #C8963E;
    --fire2: #D4A24C;
    --gold: #D4A24C;
    --bg: #0F1A0E;
    --bg2: #142212;
    --text: #E8DFC8;
    --muted: rgba(232,223,200,0.45);
    --border: rgba(200,150,62,0.2);
    --danger: #A43D31;
  }

  html { scroll-behavior: smooth; }

  .ld {
    background: var(--bg);
    color: var(--text);
    font-family: 'Lora', serif;
    overflow-x: hidden;
    cursor: default;
  }

  /* ── SUBTLE FOG EFFECT ── */
  .ld::before {
    content: '';
    position: fixed; inset: 0; pointer-events: none; z-index: 998;
    opacity: 0.035;
    background:
      radial-gradient(ellipse 80% 60% at 20% 80%, rgba(200,150,62,0.15), transparent 60%),
      radial-gradient(ellipse 60% 80% at 80% 20%, rgba(200,150,62,0.1), transparent 50%),
      radial-gradient(ellipse 100% 100% at 50% 50%, rgba(232,223,200,0.05), transparent 70%);
    animation: fog-drift 12s ease-in-out infinite alternate;
  }
  @keyframes fog-drift {
    0%  { opacity: 0.03; transform: translateX(0); }
    50% { opacity: 0.05; }
    100%{ opacity: 0.03; transform: translateX(10px); }
  }

  /* ── STONE BANNER TOP BAR ── */
  .ld-stripe {
    position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 300;
    background: linear-gradient(90deg, #2A1E0A, #C8963E, #2A1E0A);
    box-shadow: 0 0 12px rgba(200,150,62,0.35);
  }

  /* ── NAV ── */
  .ld-nav {
    position: fixed; top: 3px; left: 0; right: 0; z-index: 200;
    height: 52px;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 2rem;
    background: rgba(15,26,14,0.94);
    border-bottom: 1px solid var(--border);
    backdrop-filter: blur(16px);
  }
  .ld-nav::after {
    content: '';
    position: absolute; bottom: -2px; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(200,150,62,0.4), transparent);
    animation: nav-scan 4s ease-in-out infinite;
  }
  @keyframes nav-scan {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.8; }
  }
  .ld-nav-logo {
    font-family: 'Cinzel', serif;
    font-size: 1.1rem;
    color: var(--fire);
    letter-spacing: 0.1em;
    text-shadow: 0 0 15px rgba(200,150,62,0.5), 0 0 30px rgba(200,150,62,0.2);
    display: flex; align-items: center; gap: 0.6rem;
  }
  .ld-nav-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--fire);
    box-shadow: 0 0 8px var(--fire), 0 0 16px rgba(200,150,62,0.4);
    animation: glow-pulse 2.5s ease infinite;
  }
  .ld-nav-links { display: flex; gap: 1.5rem; align-items: center; }
  .ld-nav-link {
    font-family: 'Cinzel', serif;
    font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--muted); cursor: pointer;
    transition: color 0.15s, text-shadow 0.15s;
    background: none; border: none; font-family: 'Cinzel', serif;
    padding: 0.25rem 0;
    position: relative;
  }
  .ld-nav-link::after {
    content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 1px;
    background: var(--fire);
    transition: width 0.2s;
  }
  .ld-nav-link:hover { color: var(--fire); text-shadow: 0 0 10px rgba(200,150,62,0.5); }
  .ld-nav-link:hover::after { width: 100%; }
  @media (max-width: 600px) { .ld-nav-links { display: none; } }

  /* ── HERO ── */
  .ld-hero {
    position: relative; min-height: 100vh;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 80px 1.5rem 3rem;
    text-align: center; overflow: hidden;
  }

  /* Core glow — warm golden torchlight */
  .ld-hero-bg {
    position: absolute; inset: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 80% 60% at 50% 50%, rgba(200,150,62,0.10) 0%, transparent 65%),
      radial-gradient(ellipse 40% 40% at 50% 50%, rgba(212,162,76,0.06) 0%, transparent 55%);
    animation: torch-flicker 5s ease-in-out infinite;
  }
  @keyframes torch-flicker {
    0%, 100% { opacity: 1; }
    30% { opacity: 0.85; }
    50% { opacity: 0.65; }
    70% { opacity: 0.9; }
  }
  .ld-hero-vignette {
    position: absolute; inset: 0; pointer-events: none;
    background: radial-gradient(ellipse at center, transparent 25%, rgba(15,26,14,0.95) 100%);
  }

  /* Horizontal mystical glow line sweeping down */
  .ld-scan-line {
    position: absolute; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(200,150,62,0.3) 20%, rgba(212,162,76,0.6) 50%, rgba(200,150,62,0.3) 80%, transparent 100%);
    pointer-events: none;
    animation: scan-sweep 8s linear infinite;
    box-shadow: 0 0 12px rgba(200,150,62,0.35);
  }
  @keyframes scan-sweep {
    0%  { top: 55px; opacity: 0; }
    5%  { opacity: 0.7; }
    95% { opacity: 0.3; }
    100% { top: 100vh; opacity: 0; }
  }

  /* Firefly particles */
  .ld-particles { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
  .ld-ember {
    position: absolute;
    border-radius: 50%;
    animation: firefly-drift linear infinite;
  }
  @keyframes firefly-drift {
    0%   { transform: translate(0, 0) scale(1); opacity: 0; }
    8%   { opacity: 0.8; }
    50%  { opacity: 0.4; }
    85%  { opacity: 0.6; }
    100% { transform: translate(var(--ex), var(--ey)) scale(0.3); opacity: 0; }
  }

  /* ── ALERT BADGE ── */
  .ld-alert-badge {
    display: inline-flex; align-items: center; gap: 0.75rem;
    padding: 0.45rem 1.25rem;
    border: 1px solid rgba(200,150,62,0.3);
    background: rgba(200,150,62,0.06);
    margin-bottom: 2rem;
    animation: fade-up 0.4s ease both 0.1s;
    position: relative;
    overflow: hidden;
    border-radius: 2px;
  }
  .ld-alert-badge::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(200,150,62,0.06), transparent);
    animation: badge-shimmer 3s ease-in-out infinite;
  }
  @keyframes badge-shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .ld-alert-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--fire);
    box-shadow: 0 0 8px var(--fire), 0 0 16px rgba(200,150,62,0.4);
    animation: glow-pulse 2.5s ease infinite;
  }
  @keyframes glow-pulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 8px var(--fire), 0 0 16px rgba(200,150,62,0.4); }
    50% { opacity: 0.5; box-shadow: 0 0 4px var(--fire); }
  }
  .ld-alert-text {
    font-family: 'Cinzel', serif;
    font-size: 0.58rem; letter-spacing: 0.3em; text-transform: uppercase;
    color: rgba(200,150,62,0.8);
  }
  .ld-alert-count {
    font-family: 'Cinzel', serif;
    font-size: 0.65rem;
    color: var(--fire);
    letter-spacing: 0.15em;
  }

  /* ── MYSTICAL RINGS ── */
  .ld-rings {
    position: absolute; inset: 0; pointer-events: none; overflow: hidden;
    display: flex; align-items: center; justify-content: center;
  }
  .ld-ring {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(200,150,62,0.10);
    animation: ring-expand linear infinite;
  }
  @keyframes ring-expand {
    0%   { width: 80px; height: 80px; opacity: 0.5; border-color: rgba(200,150,62,0.25); }
    100% { width: 200vmax; height: 200vmax; opacity: 0; border-color: rgba(200,150,62,0); }
  }

  /* ── FLOATING GOLD NUMBERS ── */
  .ld-floats { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
  .ld-float-num {
    position: absolute;
    font-family: 'Cinzel', serif;
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    animation: float-up 2.5s ease-out forwards;
    white-space: nowrap;
  }
  .ld-float-num.gold { color: var(--gold); text-shadow: 0 0 8px rgba(212,162,76,0.5); }
  .ld-float-num.kill { color: var(--danger); text-shadow: 0 0 8px rgba(164,61,49,0.5); }
  .ld-float-num.wave { color: rgba(232,223,200,0.8); text-shadow: 0 0 8px rgba(200,150,62,0.3); }
  @keyframes float-up {
    0%   { transform: translateY(0) scale(0.5); opacity: 0; }
    15%  { transform: translateY(-10px) scale(1.2); opacity: 1; }
    80%  { opacity: 0.7; }
    100% { transform: translateY(-80px) scale(0.8); opacity: 0; }
  }

  /* ── HERO TITLE ── */
  .ld-title-wrap {
    position: relative;
    margin-bottom: 1.5rem;
    overflow: hidden;
  }
  .ld-title {
    font-family: 'Cinzel', serif;
    font-weight: 700;
    font-size: clamp(4rem, 14vw, 10rem);
    line-height: 0.85;
    letter-spacing: 0.06em;
    color: #E8DFC8;
    text-shadow: 0 0 40px rgba(200,150,62,0.35), 0 0 80px rgba(200,150,62,0.15);
    display: block;
    animation: title-slide-down 0.8s cubic-bezier(0.16,1,0.3,1) both 0.2s;
  }
  @keyframes title-slide-down {
    from { opacity: 0; transform: translateY(-60px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .ld-title-fire {
    font-family: 'Cinzel', serif;
    font-weight: 700;
    font-size: clamp(4rem, 14vw, 10rem);
    line-height: 0.85;
    color: var(--fire);
    text-shadow:
      0 0 20px rgba(200,150,62,0.8),
      0 0 50px rgba(200,150,62,0.4),
      0 0 100px rgba(200,150,62,0.2);
    animation: title-slide-up 0.8s cubic-bezier(0.16,1,0.3,1) both 0.35s, title-breathe 4s ease-in-out infinite;
    display: block;
  }
  @keyframes title-slide-up {
    from { opacity: 0; transform: translateY(60px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes title-breathe {
    0%, 100% { text-shadow: 0 0 20px rgba(200,150,62,0.8), 0 0 50px rgba(200,150,62,0.4), 0 0 100px rgba(200,150,62,0.2); }
    50% { text-shadow: 0 0 30px rgba(200,150,62,1), 0 0 80px rgba(200,150,62,0.6), 0 0 160px rgba(200,150,62,0.3); }
  }

  /* Decorative lines flanking the title */
  .ld-title-deco {
    position: absolute; top: 50%; left: 0; right: 0;
    display: flex; align-items: center; gap: 1rem;
    pointer-events: none;
    opacity: 0.15;
  }
  .ld-title-deco-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, var(--fire)); }
  .ld-title-deco-line.r { background: linear-gradient(270deg, transparent, var(--fire)); }

  /* ── TYPING SUBTITLE ── */
  .ld-sub-wrap {
    font-family: 'Lora', serif;
    font-size: 0.85rem; letter-spacing: 0.12em;
    color: var(--muted); max-width: 520px;
    margin: 0 auto 2.5rem;
    animation: fade-up 0.5s ease both 0.5s;
    min-height: 1.4em;
    font-style: italic;
  }
  .ld-cursor {
    display: inline-block; width: 2px; height: 1em;
    background: var(--fire);
    margin-left: 2px;
    vertical-align: text-bottom;
    animation: cursor-blink 0.8s step-end infinite;
  }
  @keyframes cursor-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  /* ── CTA BUTTONS ── */
  .ld-cta-row {
    display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;
    animation: fade-up 0.5s ease both 0.65s;
    margin-bottom: 3rem;
  }

  .ld-deploy-btn {
    position: relative;
    background: linear-gradient(180deg, #D4A24C, #A07830);
    color: #1A0E04;
    border-radius: 3px;
    font-family: 'Cinzel', serif;
    font-weight: 700;
    letter-spacing: 0.12em;
    font-size: 0.82rem;
    padding: 0.8rem 2.25rem;
    border: 1px solid rgba(212,162,76,0.6);
    box-shadow:
      0 0 0 1px rgba(200,150,62,0.4),
      0 0 20px rgba(200,150,62,0.25),
      inset 0 1px 0 rgba(255,255,255,0.15);
    text-transform: uppercase;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.2s;
  }
  .ld-deploy-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 0 2px rgba(200,150,62,0.7), 0 0 35px rgba(200,150,62,0.4);
  }

  /* ── STATS BAR ── */
  .ld-stats-bar {
    display: flex; border: 1px solid var(--border);
    animation: fade-up 0.5s ease both 0.8s;
    overflow: hidden;
    background: rgba(200,150,62,0.03);
  }
  .ld-stat {
    padding: 0.9rem 1.8rem; border-right: 1px solid var(--border);
    text-align: center;
    position: relative;
    overflow: hidden;
    transition: background 0.2s;
  }
  .ld-stat:hover { background: rgba(200,150,62,0.06); }
  .ld-stat:last-child { border-right: none; }
  .ld-stat-n {
    font-family: 'Cinzel', serif; font-weight: 700; font-size: 1.7rem;
    color: var(--fire);
    text-shadow: 0 0 12px rgba(200,150,62,0.5);
    line-height: 1;
    display: block;
  }
  .ld-stat-l {
    font-family: 'Lora', serif;
    font-size: 0.5rem; letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--muted); margin-top: 0.25rem;
    display: block;
  }
  @media (max-width: 500px) { .ld-stats-bar { flex-wrap: wrap; } .ld-stat { flex: 1 1 50%; } }

  /* ── SCROLL HINT ── */
  .ld-scroll-hint {
    position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%);
    display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
    animation: fade-up 0.5s ease both 1.2s;
    opacity: 0.45;
  }
  .ld-scroll-text { font-family: 'Cinzel', serif; font-size: 0.5rem; letter-spacing: 0.3em; text-transform: uppercase; }
  .ld-scroll-chevrons {
    display: flex; flex-direction: column; gap: 2px;
  }
  .ld-chevron {
    width: 10px; height: 6px;
    border-bottom: 1px solid var(--fire);
    border-right: 1px solid var(--fire);
    transform: rotate(45deg);
    animation: chevron-fall 1.5s ease-in-out infinite;
  }
  .ld-chevron:nth-child(2) { animation-delay: 0.25s; opacity: 0.6; }
  .ld-chevron:nth-child(3) { animation-delay: 0.5s; opacity: 0.3; }
  @keyframes chevron-fall {
    0%, 100% { transform: rotate(45deg) translateY(0); opacity: 1; }
    50% { transform: rotate(45deg) translateY(3px); opacity: 0.5; }
  }

  /* ── MARQUEE ── */
  .ld-marquee-wrap {
    position: relative; overflow: hidden;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    background: rgba(200,150,62,0.04);
    padding: 0.8rem 0;
  }
  .ld-marquee-wrap::before,
  .ld-marquee-wrap::after {
    content: '';
    position: absolute; top: 0; bottom: 0; width: 80px; z-index: 1;
    pointer-events: none;
  }
  .ld-marquee-wrap::before { left: 0; background: linear-gradient(90deg, var(--bg), transparent); }
  .ld-marquee-wrap::after { right: 0; background: linear-gradient(270deg, var(--bg), transparent); }
  .ld-marquee { display: flex; white-space: nowrap; animation: marquee 25s linear infinite; }
  .ld-marquee-track { display: flex; }
  .ld-marquee-item {
    display: inline-flex; align-items: center; gap: 0.75rem;
    padding: 0 2rem;
    font-family: 'Cinzel', serif;
    font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase;
    color: rgba(200,150,62,0.7);
  }
  .ld-marquee-sep { color: rgba(200,150,62,0.35); font-size: 0.5rem; }
  @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

  /* ── SECTION shared ── */
  .ld-section {
    padding: 5rem 2rem;
    max-width: 1100px; margin: 0 auto;
  }
  .ld-sec-label {
    font-family: 'Cinzel', serif;
    font-size: 0.55rem; letter-spacing: 0.4em; text-transform: uppercase;
    color: var(--fire); margin-bottom: 0.6rem; opacity: 0.85;
    display: flex; align-items: center; gap: 0.5rem;
  }
  .ld-sec-label::before {
    content: ''; width: 20px; height: 1px; background: var(--fire); opacity: 0.6;
  }
  .ld-sec-title {
    font-family: 'Cinzel', serif;
    font-weight: 700;
    font-size: clamp(2rem, 4.5vw, 3.2rem);
    color: #E8DFC8;
    text-shadow: 0 0 25px rgba(200,150,62,0.2);
    margin-bottom: 0.75rem;
  }
  .ld-sec-desc {
    font-family: 'Lora', serif;
    font-size: 0.82rem; letter-spacing: 0.04em; line-height: 1.75;
    color: var(--muted); max-width: 520px; margin-bottom: 3rem;
  }

  /* ── TOWERS ── */
  .ld-towers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1px;
    background: var(--border);
    border: 1px solid var(--border);
  }
  .ld-tower-card {
    background: var(--bg2);
    padding: 2rem 1.5rem;
    position: relative; overflow: hidden;
    transition: background 0.25s, transform 0.2s;
    cursor: default;
  }
  .ld-tower-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: var(--card-color, var(--fire));
    box-shadow: 0 0 12px var(--card-color, var(--fire)), 0 0 24px rgba(200,150,62,0.15);
  }
  .ld-tower-card::after {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse at top center, rgba(200,150,62,0.05), transparent 70%);
    opacity: 0; transition: opacity 0.25s;
  }
  .ld-tower-card:hover { background: rgba(200,150,62,0.06); }
  .ld-tower-card:hover::after { opacity: 1; }
  .ld-tower-icon { font-size: 2.2rem; margin-bottom: 0.8rem; display: block; filter: drop-shadow(0 0 6px rgba(200,150,62,0.3)); }
  .ld-tower-tag {
    font-family: 'Cinzel', serif;
    font-size: 0.48rem; letter-spacing: 0.25em; text-transform: uppercase;
    padding: 0.15rem 0.5rem; border: 1px solid;
    display: inline-block; margin-bottom: 0.6rem;
  }
  .ld-tower-name {
    font-family: 'Cinzel', serif; font-weight: 700; font-size: 1.15rem;
    color: #E8DFC8; display: block; margin-bottom: 0.4rem;
  }
  .ld-tower-cost {
    font-size: 0.65rem; color: var(--gold); letter-spacing: 0.15em;
    margin-bottom: 0.5rem; display: block;
    text-shadow: 0 0 8px rgba(212,162,76,0.3);
  }
  .ld-tower-desc { font-family: 'Lora', serif; font-size: 0.7rem; line-height: 1.55; color: var(--muted); }

  /* ── ENEMIES ── */
  .ld-enemies-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
    gap: 1rem;
  }
  .ld-enemy-card {
    border: 1px solid var(--border);
    background: rgba(200,150,62,0.03);
    padding: 1.75rem 1rem; text-align: center;
    transition: border-color 0.2s, background 0.2s, transform 0.2s;
    position: relative;
    overflow: hidden;
  }
  .ld-enemy-card:hover {
    border-color: rgba(200,150,62,0.45);
    background: rgba(200,150,62,0.07);
    transform: translateY(-2px);
  }
  .ld-enemy-card:hover .ld-enemy-icon { animation: enemy-shake 0.4s ease; }
  @keyframes enemy-shake {
    0%, 100% { transform: translate(0,0); }
    25% { transform: translate(-3px, 1px); }
    50% { transform: translate(3px, -1px); }
    75% { transform: translate(-1px, 2px); }
  }
  .ld-enemy-icon { font-size: 2.6rem; display: block; margin-bottom: 0.8rem; transition: transform 0.2s; }
  .ld-enemy-name {
    font-family: 'Cinzel', serif; font-weight: 700; font-size: 0.95rem;
    color: #E8DFC8; display: block; margin-bottom: 0.4rem;
  }
  .ld-enemy-desc { font-family: 'Lora', serif; font-size: 0.65rem; line-height: 1.55; color: var(--muted); }
  .ld-enemy-threat {
    position: absolute; top: 0.6rem; right: 0.6rem;
    font-family: 'Cinzel', serif;
    font-size: 0.44rem; letter-spacing: 0.25em; text-transform: uppercase;
    padding: 0.15rem 0.4rem;
    border: 1px solid;
  }
  .ld-enemy-threat.LOW { color: rgba(212,162,76,0.7); border-color: rgba(212,162,76,0.3); }
  .ld-enemy-threat.MED { color: rgba(200,150,62,0.8); border-color: rgba(200,150,62,0.3); }
  .ld-enemy-threat.HIGH { color: rgba(180,100,50,0.9); border-color: rgba(180,100,50,0.4); }
  .ld-enemy-threat.EXTREME {
    color: var(--danger); border-color: rgba(164,61,49,0.5);
  }

  /* ── HOW TO PLAY ── */
  .ld-how-wrap { position: relative; background: var(--bg2); border: 1px solid var(--border); overflow: hidden; }
  .ld-how-steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
  .ld-step {
    padding: 2.75rem 2rem;
    border-right: 1px solid var(--border);
    position: relative; overflow: hidden;
    transition: background 0.2s;
  }
  .ld-step:hover { background: rgba(200,150,62,0.04); }
  .ld-step:last-child { border-right: none; }
  @media (max-width: 720px) { .ld-step { border-right: none; border-bottom: 1px solid var(--border); } .ld-step:last-child { border-bottom: none; } }
  .ld-step-num {
    font-family: 'Cinzel', serif; font-weight: 700; font-size: 5rem;
    color: rgba(200,150,62,0.06); line-height: 1;
    position: absolute; top: 0.75rem; right: 1.25rem;
    user-select: none;
  }
  .ld-step-icon { font-size: 1.9rem; display: block; margin-bottom: 1rem; filter: drop-shadow(0 0 6px rgba(200,150,62,0.25)); }
  .ld-step-title {
    font-family: 'Cinzel', serif; font-weight: 700; font-size: 1rem;
    color: #E8DFC8; margin-bottom: 0.5rem;
  }
  .ld-step-desc { font-family: 'Lora', serif; font-size: 0.72rem; line-height: 1.65; color: var(--muted); }

  /* ── LEADERBOARD ── */
  .ld-lb-wrap {
    display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: start;
  }
  @media (max-width: 760px) { .ld-lb-wrap { grid-template-columns: 1fr; } }
  .ld-lb-table { border: 1px solid var(--border); overflow: hidden; }
  .ld-lb-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.8rem 1rem;
    border-bottom: 1px solid rgba(200,150,62,0.07);
    transition: background 0.15s;
    position: relative;
  }
  .ld-lb-row:last-child { border-bottom: none; }
  .ld-lb-row:hover { background: rgba(200,150,62,0.06); }
  .ld-lb-row.top3::before {
    content: '';
    position: absolute; left: 0; top: 0; bottom: 0; width: 2px;
    background: var(--row-accent, var(--fire));
    box-shadow: 0 0 8px var(--row-accent, var(--fire));
  }
  .ld-lb-rank {
    font-family: 'Cinzel', serif; font-weight: 700; font-size: 0.78rem;
    width: 2.25rem; text-align: center;
  }
  .ld-lb-name { font-family: 'Lora', serif; flex: 1; padding: 0 0.75rem; font-size: 0.82rem; color: rgba(232,223,200,0.65); letter-spacing: 0.05em; }
  .ld-lb-score {
    font-family: 'Cinzel', serif; font-weight: 700; font-size: 0.88rem;
    color: var(--fire); text-shadow: 0 0 10px rgba(200,150,62,0.4);
  }
  .ld-lb-empty {
    font-family: 'Lora', serif;
    padding: 2.5rem; text-align: center;
    font-size: 0.75rem; letter-spacing: 0.15em;
    color: var(--muted);
    font-style: italic;
  }
  .ld-lb-right {
    border: 1px solid var(--border); padding: 2rem;
    background: rgba(200,150,62,0.03);
    display: flex; flex-direction: column; gap: 1.25rem;
    position: relative; overflow: hidden;
  }
  .ld-lb-right::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, var(--fire), transparent);
    opacity: 0.5;
  }
  .ld-lb-feat-title {
    font-family: 'Cinzel', serif; font-weight: 700; font-size: 1.4rem;
    color: #E8DFC8; line-height: 1.2;
  }
  .ld-lb-feat-desc { font-family: 'Lora', serif; font-size: 0.75rem; line-height: 1.65; color: var(--muted); }
  .ld-lb-feat-stat { display: flex; align-items: baseline; gap: 0.5rem; }
  .ld-lb-feat-n {
    font-family: 'Cinzel', serif; font-weight: 700; font-size: 2.75rem;
    color: var(--fire);
    text-shadow: 0 0 20px rgba(200,150,62,0.4);
    line-height: 1;
  }
  .ld-lb-feat-l { font-family: 'Lora', serif; font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); }

  /* ── BOTTOM CTA ── */
  .ld-cta-section {
    position: relative; overflow: hidden;
    padding: 6rem 2rem;
    text-align: center;
    background: var(--bg2);
    border-top: 1px solid var(--border);
  }
  .ld-cta-glow {
    position: absolute; inset: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 70% 100% at 50% 100%, rgba(200,150,62,0.10) 0%, transparent 70%),
      radial-gradient(ellipse 40% 60% at 50% 100%, rgba(212,162,76,0.04) 0%, transparent 60%);
  }
  .ld-cta-pretitle {
    font-family: 'Cinzel', serif;
    font-size: 0.6rem; letter-spacing: 0.4em; text-transform: uppercase;
    color: var(--fire); margin-bottom: 1rem; opacity: 0.85;
  }
  .ld-cta-title {
    font-family: 'Cinzel', serif;
    font-weight: 700;
    font-size: clamp(2.2rem, 6vw, 4.5rem);
    color: #E8DFC8;
    text-shadow: 0 0 30px rgba(200,150,62,0.25), 0 0 60px rgba(200,150,62,0.08);
    margin-bottom: 1rem; position: relative;
  }
  .ld-cta-sub { font-family: 'Lora', serif; font-size: 0.78rem; letter-spacing: 0.12em; color: var(--muted); margin-bottom: 2.5rem; }
  .ld-cta-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; position: relative; }

  /* ── BATTLE STATS BAR ── */
  .battle-stats-bar {
    display: flex;
    justify-content: center;
    gap: 2.5rem;
    padding: 1.2rem 2rem;
    background: linear-gradient(90deg, rgba(200,150,62,0.05) 0%, rgba(42,30,10,0.12) 50%, rgba(200,150,62,0.05) 100%);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    flex-wrap: wrap;
  }
  .battle-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    min-width: 100px;
  }
  .battle-stat-value {
    font-family: 'Cinzel', serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--fire);
    text-shadow: 0 0 10px rgba(200,150,62,0.4);
    letter-spacing: 0.04em;
  }
  .battle-stat-label {
    font-family: 'Lora', serif;
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: rgba(232,223,200,0.3);
  }
  @keyframes count-up-glow {
    0% { opacity: 0; transform: translateY(8px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .battle-stat { animation: count-up-glow 0.6s ease forwards; }
  .battle-stat:nth-child(2) { animation-delay: 0.15s; }
  .battle-stat:nth-child(3) { animation-delay: 0.3s; }

  /* ── FOOTER ── */
  .ld-footer {
    padding: 1.5rem 2rem;
    border-top: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 0.75rem;
  }
  .ld-footer-logo {
    font-family: 'Cinzel', serif; font-weight: 700; font-size: 0.85rem;
    color: rgba(200,150,62,0.45); letter-spacing: 0.1em;
  }
  .ld-footer-copy { font-family: 'Lora', serif; font-size: 0.6rem; letter-spacing: 0.15em; color: rgba(232,223,200,0.18); }

  /* ── Section divider ── */
  .ld-divider {
    display: flex; align-items: center; gap: 1rem;
    margin-bottom: 3rem;
  }
  .ld-divider-line { flex: 1; height: 1px; background: var(--border); }
  .ld-divider-icon { font-size: 0.7rem; color: rgba(200,150,62,0.35); }

  /* ── HERO CONTENT ── */
  .ld-hero-parallax {
    position: relative;
    z-index: 2;
  }

  /* ── LIVE BATTLE LOG ── */
  .ld-battlelog {
    padding: 2.5rem 1.5rem;
    display: flex; flex-direction: column; align-items: center;
  }
  .ld-battlelog-title {
    font-family: 'Cinzel', serif;
    font-size: 0.6rem; letter-spacing: 0.3em; text-transform: uppercase;
    color: var(--fire); opacity: 0.7; margin-bottom: 1rem;
  }
  .ld-battlelog-feed {
    width: 100%; max-width: 520px;
    background: rgba(10,15,8,0.7);
    border: 1px solid rgba(200,150,62,0.12);
    border-radius: 4px;
    padding: 0.75rem 1rem;
    font-family: 'Lora', serif;
    font-size: 0.65rem;
    line-height: 1.7;
    color: var(--muted);
    max-height: 160px;
    overflow: hidden;
    position: relative;
  }
  .ld-battlelog-feed::after {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 40px;
    background: linear-gradient(transparent, rgba(10,15,8,0.9));
    pointer-events: none;
  }
  .ld-log-line {
    animation: log-fade-in 0.4s ease-out;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ld-log-ts { color: rgba(232,223,200,0.2); margin-right: 0.5rem; }
  .ld-log-event-kill { color: #c07070; }
  .ld-log-event-build { color: #6b9e5b; }
  .ld-log-event-wave { color: var(--fire); font-weight: bold; }
  .ld-log-event-score { color: var(--gold); }
  .ld-log-event-boss { color: #9b7ec0; font-weight: bold; }
  @keyframes log-fade-in {
    from { opacity: 0; transform: translateX(-10px); }
    to { opacity: 1; transform: translateX(0); }
  }

  /* ── LIVE STATS WIDGET ── */
  .ld-stats {
    display: flex; justify-content: center; gap: 2rem;
    padding: 3rem 1.5rem;
    position: relative;
  }
  .ld-stat-card {
    flex: 0 1 220px;
    background: rgba(200,150,62,0.04);
    border: 1px solid rgba(200,150,62,0.15);
    border-radius: 4px;
    padding: 1.5rem 1.25rem;
    text-align: center;
    position: relative;
    overflow: hidden;
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .ld-stat-card:hover {
    border-color: rgba(200,150,62,0.4);
    box-shadow: 0 0 25px rgba(200,150,62,0.08), inset 0 0 25px rgba(200,150,62,0.02);
  }
  .ld-stat-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, var(--fire), transparent);
    opacity: 0.5;
  }
  .ld-stat-label {
    font-family: 'Cinzel', serif;
    font-size: 0.55rem; letter-spacing: 0.25em; text-transform: uppercase;
    color: var(--muted); margin-bottom: 0.5rem;
  }
  .ld-stat-value {
    font-family: 'Cinzel', serif; font-weight: 700;
    font-size: 2rem; color: var(--fire);
    text-shadow: 0 0 15px rgba(200,150,62,0.4);
    line-height: 1;
  }
  .ld-stat-sub {
    font-family: 'Lora', serif;
    font-size: 0.6rem; color: var(--muted); margin-top: 0.4rem;
    letter-spacing: 0.1em;
  }
  .ld-stats-title {
    text-align: center; padding-top: 2rem;
    font-family: 'Cinzel', serif;
    font-size: 0.6rem; letter-spacing: 0.3em; text-transform: uppercase;
    color: var(--fire); opacity: 0.7;
  }
  @keyframes count-up {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .ld-stat-value { animation: count-up 0.6s ease-out forwards; }
  @media (max-width: 600px) {
    .ld-stats { flex-direction: column; align-items: center; gap: 1rem; }
    .ld-stat-card { flex: 0 1 100%; width: 100%; max-width: 280px; }
  }

  /* ── SECTION GLOW DIVIDERS ── */
  .ld-section-glow {
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(200,150,62,0.3) 25%, rgba(212,162,76,0.5) 50%, rgba(200,150,62,0.3) 75%, transparent 100%);
    opacity: 0.6;
  }

  /* ── Shared animations ── */
  @keyframes fade-up {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── CREATURE MARCH strip ── */
  .ld-march-strip {
    position: relative; height: 52px; overflow: hidden;
    border-top: 1px solid rgba(200,150,62,0.15);
    border-bottom: 1px solid rgba(200,150,62,0.15);
    background: linear-gradient(90deg, var(--bg), rgba(200,150,62,0.04) 50%, var(--bg));
  }
  .ld-march-strip::before {
    content: 'CREATURE HORDE APPROACHES';
    position: absolute; left: 50%; top: 2px; transform: translateX(-50%);
    font-family: 'Cinzel', serif;
    font-size: 0.4rem; letter-spacing: 0.45em; text-transform: uppercase;
    color: rgba(200,150,62,0.2); white-space: nowrap; pointer-events: none;
  }
  .ld-march-unit {
    position: absolute; top: 50%; transform: translateY(-50%);
    display: flex; flex-direction: column; align-items: center; gap: 1px;
    animation: march linear infinite;
  }
  .ld-march-emoji {
    font-size: 1.5rem;
    filter: drop-shadow(0 0 4px rgba(200,150,62,0.2));
  }
  .ld-march-hp {
    width: 20px; height: 2px; background: rgba(200,150,62,0.15); border-radius: 1px; overflow: hidden;
  }
  .ld-march-hp-fill {
    height: 100%; border-radius: 1px;
    background: linear-gradient(90deg, #22c55e, #86efac);
    box-shadow: 0 0 4px rgba(34,197,94,0.5);
  }
  @keyframes march {
    from { left: 108%; }
    to   { left: -10%; }
  }

  /* ── WAVE BREACH ALERT ── */
  .ld-wave-alert {
    position: fixed; top: 70px; right: -320px; z-index: 500;
    background: rgba(120,30,20,0.08);
    border: 1px solid rgba(164,61,49,0.5);
    border-right: none;
    padding: 1rem 1.5rem;
    width: 280px;
    transition: right 0.45s cubic-bezier(0.16,1,0.3,1);
    box-shadow: -12px 0 40px rgba(164,61,49,0.12), inset 0 0 25px rgba(164,61,49,0.03);
    border-radius: 2px 0 0 2px;
  }
  .ld-wave-alert.active { right: 0; }
  .ld-wave-alert::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(164,61,49,0.7), transparent);
    opacity: 0.7;
  }
  .ld-wave-alert-tag {
    font-family: 'Cinzel', serif;
    font-size: 0.46rem; letter-spacing: 0.4em; text-transform: uppercase;
    color: rgba(164,61,49,0.6); margin-bottom: 0.35rem;
  }
  .ld-wave-alert-title {
    font-family: 'Cinzel', serif;
    font-weight: 700;
    font-size: 1.5rem;
    color: var(--danger);
    text-shadow: 0 0 15px rgba(164,61,49,0.5);
    line-height: 1; margin-bottom: 0.3rem;
  }
  .ld-wave-alert-sub {
    font-family: 'Lora', serif;
    font-size: 0.52rem; letter-spacing: 0.18em;
    color: rgba(164,61,49,0.5);
  }
  .ld-wave-alert-bar {
    margin-top: 0.75rem; height: 2px;
    background: rgba(164,61,49,0.1);
    position: relative; overflow: hidden;
  }
  .ld-wave-alert-fill {
    position: absolute; top: 0; left: 0; height: 100%; width: 100%;
    background: var(--danger);
    box-shadow: 0 0 6px var(--danger);
    animation: alert-drain 3.8s linear forwards;
  }
  @keyframes alert-drain { from { width: 100%; } to { width: 0%; } }

  /* ── THREAT LEVEL BAR ── */
  .ld-threat-wrap {
    margin-top: 0.85rem;
    border: 1px solid rgba(200,150,62,0.15);
    padding: 0.6rem 1.25rem;
    background: rgba(200,150,62,0.02);
    animation: fade-up 0.5s ease both 1s;
  }
  .ld-threat-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 0.45rem;
  }
  .ld-threat-label {
    font-family: 'Cinzel', serif;
    font-size: 0.47rem; letter-spacing: 0.35em; text-transform: uppercase;
    color: var(--muted);
  }
  .ld-threat-pct {
    font-family: 'Cinzel', serif;
    font-weight: 700;
    font-size: 0.68rem;
    transition: color 0.5s;
  }
  .ld-threat-track {
    width: 100%; height: 3px;
    background: rgba(200,150,62,0.06);
    position: relative; overflow: hidden;
  }
  .ld-threat-fill {
    height: 100%;
    transition: width 0.7s ease, background 0.5s;
    box-shadow: 0 0 8px currentColor;
  }
  .ld-threat-segments {
    position: absolute; inset: 0; display: flex; pointer-events: none;
  }
  .ld-threat-seg { flex: 1; border-right: 1px solid rgba(0,0,0,0.35); }
  .ld-threat-seg:last-child { border-right: none; }
`

const TOWERS = [
  { name: 'Ranger Tower', cost: 50, icon: '🏹', color: '#8B9E4B', tag: 'SWIFT ARROWS', desc: 'Keen-eyed rangers loose arrows with deadly precision. Their relentless volleys thin the horde before it reaches the gates.' },
  { name: 'Catapult', cost: 120, icon: '💣', color: '#C8963E', tag: 'SIEGE DAMAGE', desc: 'Mighty catapults hurl boulders that shatter upon impact, crushing all foes within the blast.' },
  { name: 'Ice Mage Tower', cost: 100, icon: '❄️', color: '#7BA5C4', tag: 'FROST MAGIC', desc: 'Ancient mages channel winter itself, freezing enemies in their tracks with arcane frost.' },
  { name: 'Wizard Tower', cost: 150, icon: '🔮', color: '#9B7EC0', tag: 'ARCANE POWER', desc: 'High sorcerers unleash devastating spells from afar. A single bolt can fell the mightiest beast.' },
  { name: 'Druid Tower', cost: 200, icon: '🌿', color: '#6B9E5B', tag: 'NATURE\'S WRATH', desc: 'Ancient druids command the forest itself — vines ensnare and lightning strikes all who trespass.' },
]

const ENEMIES = [
  { icon: '👺', name: 'Goblin', desc: 'Wretched creatures of the deep woods. Small and cowardly alone, deadly in numbers.', threat: 'LOW' },
  { icon: '🐺', name: 'Wolf', desc: 'Swift as shadow, silent as death. The pack strikes before you hear their howl.', threat: 'MED' },
  { icon: '🪨', name: 'Troll', desc: 'Mountain-born brutes with hides like stone. Slow, but nigh unstoppable once roused.', threat: 'HIGH' },
  { icon: '✨', name: 'Shaman', desc: 'Dark sorcerers who mend and empower their kin. Slay them first, or face an endless horde.', threat: 'HIGH' },
  { icon: '🐉', name: 'Dragon', desc: 'The ancient terror. Fire and fury incarnate. All towers must stand or the kingdom falls.', threat: 'EXTREME' },
]

const MARQUEE_ITEMS = ['5 TOWER TYPES', '3 ENCHANTMENT LEVELS', 'ENDLESS WAVES', 'HALL OF LEGENDS', 'REALM DEFENSE', 'STRATEGIC MASTERY', 'FREE TO PLAY', 'NO DOWNLOAD REQUIRED', '5 CREATURE CLASSES', 'DRAGON SIEGES', 'GOLD TREASURY', 'SPEED CONTROLS', 'KILL STREAKS', 'BATTLE HONORS']

const RANK_COLORS: [string, string][] = [['#FFD700', '#FFD700'], ['#C0C0C0', '#C0C0C0'], ['#CD7F32', '#CD7F32']]

const MARCH_UNITS = [
  { icon: '👺', hp: 100, color: '#22c55e' },
  { icon: '👺', hp: 80,  color: '#22c55e' },
  { icon: '🐺', hp: 55,  color: '#eab308' },
  { icon: '👺', hp: 90,  color: '#22c55e' },
  { icon: '🪨', hp: 100, color: '#3b82f6' },
  { icon: '👺', hp: 60,  color: '#22c55e' },
  { icon: '🐺', hp: 40,  color: '#f97316' },
  { icon: '✨', hp: 75,  color: '#a855f7' },
  { icon: '👺', hp: 100, color: '#22c55e' },
  { icon: '👺', hp: 20,  color: '#ef4444' },
  { icon: '🐉', hp: 100, color: '#dc2626' },
  { icon: '👺', hp: 70,  color: '#22c55e' },
  { icon: '🐺', hp: 50,  color: '#eab308' },
  { icon: '🪨', hp: 100, color: '#3b82f6' },
]

const RINGS = [0, 1, 2, 3]

const EMBERS = Array.from({ length: 20 }, (_, idx) => ({
  id: idx,
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  size: `${2 + Math.random() * 3}px`,
  color: ['#C8963E', '#D4A24C', '#A07830', '#E8DFC8'][idx % 4],
  ex: `${(Math.random() - 0.5) * 160}px`,
  ey: `${-(30 + Math.random() * 100)}px`,
  duration: `${4 + Math.random() * 5}s`,
  delay: `${Math.random() * 6}s`,
}))

const FLOAT_EVENTS = [
  { label: '+75 GOLD', type: 'gold', left: '15%', delay: 0 },
  { label: 'SLAIN x3', type: 'kill', left: '25%', delay: 1.5 },
  { label: '+120 GOLD', type: 'gold', left: '72%', delay: 0.7 },
  { label: 'SLAIN x7', type: 'kill', left: '60%', delay: 2.8 },
  { label: 'WAVE 8', type: 'wave', left: '40%', delay: 3.5 },
  { label: '+50 GOLD', type: 'gold', left: '82%', delay: 2.1 },
  { label: 'SLAIN x12', type: 'kill', left: '10%', delay: 4.2 },
  { label: '+200 GOLD', type: 'gold', left: '50%', delay: 5.0 },
]

const FULL_SUBTITLE = 'Raise towers. Enchant defenses. Rule every wave. Glory awaits, brave hero.'

export function LandingPage() {
  const { isAuthenticated, loading } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [typedText, setTypedText] = useState('')
  const [typingDone, setTypingDone] = useState(false)
  const [battleStats, setBattleStats] = useState<{ total_players: number; average_score: number | null; total_entries: number } | null>(null)
  const [waveAlert, setWaveAlert] = useState(false)
  const [waveNum, setWaveNum] = useState(7)
  const [killCount, setKillCount] = useState(1247841)
  const [threatLevel, setThreatLevel] = useState(0)
  const [battleLog, setBattleLog] = useState<{ id: number; ts: string; text: string; type: string }[]>([])
  const logIdRef = useRef(0)

  const towersRef = useRef<HTMLDivElement>(null)
  const enemiesRef = useRef<HTMLDivElement>(null)
  const lbRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getLeaderboard()
      .then((data) => setLeaderboard(data.slice(0, 7)))
      .catch(() => setLeaderboard([]))
  }, [])

  useEffect(() => {
    fetch('/api/stats/')
      .then(r => r.json())
      .then(d => setBattleStats(d))
      .catch(() => {})
  }, [])

  // Typing effect
  useEffect(() => {
    if (loading || isAuthenticated) return
    let idx = 0
    const delay = setTimeout(() => {
      const tick = () => {
        idx++
        setTypedText(FULL_SUBTITLE.slice(0, idx))
        if (idx < FULL_SUBTITLE.length) {
          setTimeout(tick, 38 + Math.random() * 30)
        } else {
          setTypingDone(true)
        }
      }
      tick()
    }, 800)
    return () => clearTimeout(delay)
  }, [loading, isAuthenticated])

  // Wave breach alerts
  useEffect(() => {
    const trigger = () => {
      setWaveNum(n => n + Math.floor(Math.random() * 4) + 1)
      setWaveAlert(true)
      setThreatLevel(0)
      setTimeout(() => setWaveAlert(false), 4000)
    }
    const initial = setTimeout(trigger, 3200)
    const id = setInterval(trigger, 9500)
    return () => { clearTimeout(initial); clearInterval(id) }
  }, [])

  // Global kill counter tick
  useEffect(() => {
    const id = setInterval(() => {
      setKillCount(n => n + Math.floor(Math.random() * 6) + 1)
    }, 180)
    return () => clearInterval(id)
  }, [])

  // Threat level creep — resets when wave fires
  useEffect(() => {
    const id = setInterval(() => {
      setThreatLevel(n => Math.min(100, n + 1.15))
    }, 90)
    return () => clearInterval(id)
  }, [])

  // Live battle log feed
  useEffect(() => {
    const players = ['SirGalahad', 'LadyOfTheLake', 'Thornwall', 'Ironhelm', 'Shadowfen', 'Stormhold', 'Ashwood', 'Ravencrest', 'Nighthollow', 'Goldleaf']
    const towers = ['Ranger', 'Catapult', 'Ice Mage', 'Druid', 'Wizard']
    const enemies = ['Goblin', 'Dire Wolf', 'Cave Troll', 'Dark Shaman', 'Warg Pack']
    const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]
    const events = [
      () => ({ text: `${pick(players)} felled a ${pick(enemies)} with the ${pick(towers)} Tower`, type: 'kill' }),
      () => ({ text: `${pick(players)} erected a Tier ${Math.floor(Math.random() * 3) + 1} ${pick(towers)} Tower`, type: 'build' }),
      () => ({ text: `WAVE ${Math.floor(Math.random() * 40) + 10} — ${pick(enemies)} horde sighted at the treeline`, type: 'wave' }),
      () => ({ text: `${pick(players)} earned ${(Math.floor(Math.random() * 90) + 10) * 100} glory!`, type: 'score' }),
      () => ({ text: `DRAGON SIGHTED: Ancient wyrm approaches from the ${pick(['north', 'east', 'south', 'west'])}!`, type: 'boss' }),
    ]
    const addEntry = () => {
      const ev = pick(events)()
      const now = new Date()
      const ts = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      logIdRef.current += 1
      setBattleLog(prev => [{ id: logIdRef.current, ts, ...ev }, ...prev].slice(0, 20))
    }
    // Seed a few entries quickly
    for (let i = 0; i < 4; i++) setTimeout(addEntry, i * 200)
    const id = setInterval(addEntry, 2500 + Math.random() * 1500)
    return () => clearInterval(id)
  }, [])

  const scrollTo = useCallback((ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0F1A0E', color: '#C8963E', fontFamily: "'Cinzel', serif", letterSpacing: '0.2em', fontSize: '0.8rem', gap: '1rem' }}>
        <div style={{ width: '120px', height: '1px', background: 'linear-gradient(90deg, transparent, #C8963E, transparent)', boxShadow: '0 0 12px rgba(200,150,62,0.5)' }} />
        SUMMONING THE KINGDOM...
        <div style={{ width: '60px', height: '1px', background: 'rgba(200,150,62,0.3)' }} />
      </div>
    )
  }

  if (isAuthenticated) return <Navigate to="/play" replace />

  return (
    <>
      <style>{STYLES}</style>

      {/* WAVE BREACH ALERT — fixed overlay */}
      <div className={`ld-wave-alert${waveAlert ? ' active' : ''}`}>
        <div className="ld-wave-alert-tag">Breach Detected</div>
        <div className="ld-wave-alert-title">WAVE {waveNum}</div>
        <div className="ld-wave-alert-sub">All towers: defend the realm!</div>
        {waveAlert && (
          <div className="ld-wave-alert-bar">
            <div className="ld-wave-alert-fill" key={waveNum} />
          </div>
        )}
      </div>

      <div className="ld">
        <div className="ld-stripe" />

        {/* NAV */}
        <nav className="ld-nav">
          <div className="ld-nav-logo">
            <div className="ld-nav-dot" />
            FORTRESS CRAFT
          </div>
          <div className="ld-nav-links">
            <button className="ld-nav-link" onClick={() => scrollTo(towersRef)}>Arsenal</button>
            <button className="ld-nav-link" onClick={() => scrollTo(enemiesRef)}>Bestiary</button>
            <button className="ld-nav-link" onClick={() => scrollTo(lbRef)}>Legends</button>
            <LoginButton
              label="Sign In"
              className="!bg-transparent !border !border-[rgba(200,150,62,0.35)] !text-[rgba(232,223,200,0.7)] !rounded-sm !text-xs !tracking-widest !uppercase !px-4 !py-1.5 hover:!border-[rgba(200,150,62,0.7)] hover:!text-[rgba(232,223,200,1)] hover:!shadow-[0_0_12px_rgba(200,150,62,0.25)] !transition-all !font-['Cinzel']"
            />
          </div>
        </nav>

        {/* HERO */}
        <section className="ld-hero">
          <div className="ld-hero-bg" />

          {/* Mystical rings */}
          <div className="ld-rings">
            {RINGS.map((i) => (
              <div
                key={i}
                className="ld-ring"
                style={{ animationDuration: '6s', animationDelay: `${i * 1.5}s` }}
              />
            ))}
          </div>

          <div className="ld-hero-vignette" />
          <div className="ld-scan-line" />

          {/* Floating gold numbers */}
          <div className="ld-floats">
            {FLOAT_EVENTS.map((f, i) => (
              <div
                key={i}
                className={`ld-float-num ${f.type}`}
                style={{
                  left: f.left,
                  bottom: '25%',
                  animationDelay: `${f.delay}s`,
                  animationDuration: '2.5s',
                  animationIterationCount: 'infinite',
                }}
              >{f.label}</div>
            ))}
          </div>

          {/* Firefly particles */}
          <div className="ld-particles">
            {EMBERS.map((e) => (
              <div
                key={e.id}
                className="ld-ember"
                style={{
                  top: e.top, left: e.left,
                  width: e.size, height: e.size,
                  background: e.color,
                  boxShadow: `0 0 ${parseFloat(e.size) * 3}px ${e.color}`,
                  '--ex': e.ex, '--ey': e.ey,
                  animationDuration: e.duration,
                  animationDelay: e.delay,
                } as React.CSSProperties}
              />
            ))}
          </div>

          <div className="ld-hero-parallax">
            {/* Alert badge */}
            <div className="ld-alert-badge">
              <span className="ld-alert-dot" />
              <span className="ld-alert-text">The Kingdom Stands Watch</span>
              <span className="ld-alert-count">ENDLESS SIEGE</span>
            </div>

            {/* Title */}
            <div className="ld-title-wrap">
              <span className="ld-title">FORTRESS</span>
              <span style={{ fontFamily: "'Lora', serif", fontSize: '0.65rem', letterSpacing: '0.12em', color: 'var(--gold)', opacity: 0.6, marginTop: '-4px', display: 'block', textAlign: 'center', fontStyle: 'italic' }}>Est. Age of Legends — The Realm Endures</span>
              <span style={{ position: 'relative', display: 'block' }}>
                <span className="ld-title-fire">CRAFT</span>
              </span>
            </div>

            {/* Typing subtitle */}
            <div className="ld-sub-wrap">
              {typedText}
              {!typingDone && <span className="ld-cursor" />}
            </div>

            {/* CTAs */}
            <div className="ld-cta-row">
              <SignupButton
                label="March Forth — Free to Play"
                className="ld-deploy-btn"
              />
              <LoginButton
                label="Sign In"
                className="!bg-transparent !border !border-[rgba(200,150,62,0.35)] !text-[rgba(232,223,200,0.7)] !rounded-sm !text-xs !tracking-widest !uppercase !px-6 !py-3 hover:!border-[rgba(200,150,62,0.6)] hover:!text-[rgba(232,223,200,1)] !transition-all !font-['Cinzel']"
              />
            </div>

            {/* Stats */}
            <div className="ld-stats-bar">
              <div className="ld-stat">
                <span className="ld-stat-n">5</span>
                <span className="ld-stat-l">Tower Types</span>
              </div>
              <div className="ld-stat">
                <span className="ld-stat-n">&infin;</span>
                <span className="ld-stat-l">Waves</span>
              </div>
              <div className="ld-stat">
                <span className="ld-stat-n">3&times;</span>
                <span className="ld-stat-l">Enchantments</span>
              </div>
              <div className="ld-stat">
                <span className="ld-stat-n">GBL</span>
                <span className="ld-stat-l">Hall of Legends</span>
              </div>
              <div className="ld-stat">
                <span className="ld-stat-n" style={{ color: 'var(--gold)', textShadow: '0 0 12px rgba(212,162,76,0.5)', fontSize: '1.1rem' }}>
                  {(killCount / 1000000).toFixed(2)}M
                </span>
                <span className="ld-stat-l">Foes Vanquished</span>
              </div>
            </div>

            {/* Threat level bar */}
            <div className="ld-threat-wrap">
              <div className="ld-threat-header">
                <span className="ld-threat-label">Threat Level</span>
                <span
                  className="ld-threat-pct"
                  style={{ color: threatLevel > 80 ? 'var(--danger)' : threatLevel > 55 ? 'var(--fire)' : 'var(--gold)' }}
                >
                  {Math.round(threatLevel)}%
                </span>
              </div>
              <div className="ld-threat-track">
                <div
                  className="ld-threat-fill"
                  style={{
                    width: `${threatLevel}%`,
                    background: threatLevel > 80 ? 'var(--danger)' : threatLevel > 55 ? 'var(--fire)' : 'var(--gold)',
                    color: threatLevel > 80 ? 'var(--danger)' : threatLevel > 55 ? 'var(--fire)' : 'var(--gold)',
                  }}
                />
                <div className="ld-threat-segments">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="ld-threat-seg" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="ld-scroll-hint">
            <span className="ld-scroll-text">Scroll</span>
            <div className="ld-scroll-chevrons">
              <div className="ld-chevron" />
              <div className="ld-chevron" />
              <div className="ld-chevron" />
            </div>
          </div>
        </section>

        {/* CREATURE MARCH STRIP */}
        <div className="ld-march-strip">
          {MARCH_UNITS.map((u, i) => (
            <div
              key={i}
              className="ld-march-unit"
              style={{
                animationDuration: `${7 + (i % 5) * 1.8}s`,
                animationDelay: `${-(i * 1.6)}s`,
              }}
            >
              <span className="ld-march-emoji">{u.icon}</span>
              <div className="ld-march-hp">
                <div className="ld-march-hp-fill" style={{ width: `${u.hp}%`, background: `linear-gradient(90deg, ${u.color}, ${u.color}aa)` }} />
              </div>
            </div>
          ))}
        </div>

        {/* MARQUEE */}
        <div className="ld-marquee-wrap">
          <div className="ld-marquee">
            <div className="ld-marquee-track">
              {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
                <span key={i} className="ld-marquee-item">
                  {item}
                  <span className="ld-marquee-sep">&#9830;</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* BATTLE STATS */}
        {battleStats && (
          <div className="battle-stats-bar">
            <div className="battle-stat">
              <span className="battle-stat-value">{battleStats.total_players.toLocaleString()}</span>
              <span className="battle-stat-label">Heroes</span>
            </div>
            <div className="battle-stat">
              <span className="battle-stat-value">{battleStats.total_entries.toLocaleString()}</span>
              <span className="battle-stat-label">Battles Won</span>
            </div>
            <div className="battle-stat">
              <span className="battle-stat-value">{battleStats.average_score != null ? Math.round(battleStats.average_score).toLocaleString() : '—'}</span>
              <span className="battle-stat-label">Avg Glory</span>
            </div>
          </div>
        )}

        {/* GLOW DIVIDER */}
        <div className="ld-section-glow" />

        {/* TOWERS */}
        <div ref={towersRef}>
          <div className="ld-section">
            <div className="ld-sec-label">Arsenal</div>
            <h2 className="ld-sec-title">Tower Roster</h2>
            <p className="ld-sec-desc">Five mighty defenses forged by the greatest builders of the realm. Each bears unique power and purpose. Choose wisely — no two threats are alike.</p>
            <div className="ld-towers-grid">
              {TOWERS.map((t) => (
                <div key={t.name} className="ld-tower-card" style={{ '--card-color': t.color } as React.CSSProperties}>
                  <span className="ld-tower-icon">{t.icon}</span>
                  <span className="ld-tower-tag" style={{ color: t.color, borderColor: t.color }}>{t.tag}</span>
                  <span className="ld-tower-name">{t.name}</span>
                  <span className="ld-tower-cost">{t.cost} GOLD</span>
                  <p className="ld-tower-desc">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ENEMIES */}
        <div ref={enemiesRef} style={{ borderTop: '1px solid var(--border)' }}>
          <div className="ld-section">
            <div className="ld-sec-label">Bestiary</div>
            <h2 className="ld-sec-title">Creatures of the Wild</h2>
            <p className="ld-sec-desc">Know thy enemy. Five dread creatures stalk the dark forest, each demanding a different defense. Underestimate them at your peril.</p>
            <div className="ld-enemies-grid">
              {ENEMIES.map((e) => (
                <div key={e.name} className="ld-enemy-card">
                  <span className={`ld-enemy-threat ${e.threat}`}>{e.threat}</span>
                  <span className="ld-enemy-icon">{e.icon}</span>
                  <span className="ld-enemy-name">{e.name}</span>
                  <p className="ld-enemy-desc">{e.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* GLOW DIVIDER */}
        <div className="ld-section-glow" />

        {/* HOW TO PLAY */}
        <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg2)' }}>
          <div className="ld-section">
            <div className="ld-sec-label">The Codex</div>
            <h2 className="ld-sec-title">How to Play</h2>
            <p className="ld-sec-desc">Three sacred tenets of defense. Master them and the kingdom shall stand. Fail even one and the walls crumble to dust.</p>
            <div className="ld-how-wrap">
              <div className="ld-how-steps">
                <div className="ld-step">
                  <span className="ld-step-num">01</span>
                  <span className="ld-step-icon">🏰</span>
                  <div className="ld-step-title">Raise Your Defenses</div>
                  <p className="ld-step-desc">Place towers along the path to halt the advancing horde. Spend wisely — you begin with 200 gold and every stone counts.</p>
                </div>
                <div className="ld-step">
                  <span className="ld-step-num">02</span>
                  <span className="ld-step-icon">⬆️</span>
                  <div className="ld-step-title">Enchant &amp; Fortify</div>
                  <p className="ld-step-desc">Earn gold for each creature slain. Reinvest in enchantments — three tiers of power per tower. Adapt as darker beasts emerge.</p>
                </div>
                <div className="ld-step">
                  <span className="ld-step-num">03</span>
                  <span className="ld-step-icon">⚔️</span>
                  <div className="ld-step-title">Withstand the Siege</div>
                  <p className="ld-step-desc">Any creature that breaches your walls costs a life. Lose all 20 and the kingdom falls. Earn your place in the Hall of Legends.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LEADERBOARD */}
        <div ref={lbRef} style={{ borderTop: '1px solid var(--border)' }}>
          <div className="ld-section">
            <div className="ld-sec-label">Chronicles</div>
            <h2 className="ld-sec-title">Hall of Legends</h2>
            <p className="ld-sec-desc">The greatest heroes of the realm, ranked by valor and glory. Can you claim a place among them?</p>
            <div className="ld-lb-wrap">
              <div>
                <div className="ld-lb-table">
                  {leaderboard.length > 0 ? leaderboard.map((entry, i) => (
                    <div
                      className={`ld-lb-row${i < 3 ? ' top3' : ''}`}
                      key={entry.id}
                      style={{ '--row-accent': RANK_COLORS[i]?.[0] ?? 'var(--fire)' } as React.CSSProperties}
                    >
                      <span className="ld-lb-rank" style={{ color: RANK_COLORS[i]?.[0] ?? 'rgba(200,150,62,0.4)' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="ld-lb-name">{entry.player_name}</span>
                      <span className="ld-lb-score">{entry.score.toLocaleString()}</span>
                    </div>
                  )) : (
                    <div className="ld-lb-empty">No legends yet. Be the first to etch your name.</div>
                  )}
                </div>
              </div>
              <div className="ld-lb-right">
                <div className="ld-lb-feat-title">Claim Your Legacy</div>
                <p className="ld-lb-feat-desc">Every wave you endure earns glory. Every kill, enchantment, and valiant streak magnifies it. The worthy ascend. The rest are forgotten.</p>
                <div className="ld-lb-feat-stat">
                  <span className="ld-lb-feat-n">&infin;</span>
                  <span className="ld-lb-feat-l">Waves to endure</span>
                </div>
                <SignupButton
                  label="Join the Realm"
                  style={{
                    background: 'transparent',
                    color: 'var(--fire)',
                    border: '1px solid rgba(200,150,62,0.4)',
                    borderRadius: '3px',
                    fontFamily: "'Cinzel', serif",
                    letterSpacing: '0.18em',
                    fontSize: '0.7rem',
                    padding: '0.75rem 1.5rem',
                    textTransform: 'uppercase' as const,
                    cursor: 'pointer',
                    boxShadow: '0 0 12px rgba(200,150,62,0.08)',
                    transition: 'all 0.2s',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* GLOW DIVIDER */}
        <div className="ld-section-glow" />

        {/* LIVE BATTLE LOG */}
        <div className="ld-battlelog">
          <div className="ld-battlelog-title">Battlefield Chronicles</div>
          <div className="ld-battlelog-feed">
            {battleLog.map(entry => (
              <div key={entry.id} className="ld-log-line">
                <span className="ld-log-ts">{entry.ts}</span>
                <span className={`ld-log-event-${entry.type}`}>{entry.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ld-section-glow" />

        {/* BOTTOM CTA */}
        <div className="ld-cta-section">
          <div className="ld-cta-glow" />
          <div className="ld-cta-pretitle">A Call to Arms</div>
          <h2 className="ld-cta-title">The Realm Needs You</h2>
          <p className="ld-cta-sub">Free to play &middot; No download &middot; Defend the kingdom in moments</p>
          <div className="ld-cta-btns">
            <SignupButton
              label="March Forth — Free to Play"
              className="ld-deploy-btn"
              style={{
                fontSize: '0.9rem',
                padding: '0.9rem 2.75rem',
              }}
            />
          </div>
        </div>

        {/* FOOTER */}
        <footer className="ld-footer">
          <span className="ld-footer-logo">FORTRESS CRAFT</span>
          <span className="ld-footer-copy">&copy; 2026 — All rights reserved</span>
        </footer>
      </div>
    </>
  )
}
