# Plan: Redesign FortressCraft Landing Page

Generated: 2026-04-02
Source: User Edit Request

## Overview
Complete redesign of `LandingPage.tsx` to transform it from a minimal single-screen layout into a full marketing page with a cinematic hero, feature cards, tower showcase, leaderboard preview, and a bottom CTA — all with dark neon game aesthetics.

## Tasks

### Task 1: [task-01] Redesign LandingPage.tsx
**Description:** Replace the body of `LandingPage.tsx` with a full, multi-section landing page. Keep the existing auth logic (loading spinner, authenticated redirect to `/play`, `useAuth` hook) and the existing navbar structure but restyle it. Add the following sections in order:

1. **Navbar** — Keep existing structure; update brand name display to `Fortress<span>Craft</span>` with accent color. Keep Leaderboard nav link and `LoginButton`.

2. **Hero section** — Full-viewport dark background (`#0a0a0f`). Use CSS `@keyframes` defined in a `<style>` tag inside the component (or a `useEffect` that injects a `<style>` element) for:
   - Floating glowing orbs (large blurred `radial-gradient` divs with `animate-pulse`-style keyframe or slow float animation)
   - A subtle grid/scanline overlay using a CSS `repeating-linear-gradient` background
   - Headline: "BUILD. DEFEND. CONQUER." in large uppercase bold serif (`--font-heading`), with the middle word in accent color or a neon glow text-shadow
   - Subheadline: "A 3D tower defense game. Place towers. Survive endless waves. Dominate the leaderboard."
   - A big glowing "Play Now" CTA button: large, with `box-shadow` glow using the accent color, pulse animation on hover. Use `<SignupButton>` restyled, or `<LoginButton>` if the user might already have an account. Route to `/play`.
   - A secondary "View Leaderboard" text-link below the CTA.

3. **Feature highlights section** — Section with heading "WHY FORTRESSCRAFT?" and a 2×2 (mobile: 1-col, tablet+: 2-col, desktop: 4-col) grid of dark cards. Each card has:
   - A large emoji or lucide-react icon
   - Bold uppercase title
   - Short description
   - Dark card bg (`var(--color-surface)`) with a colored glow border on hover (`box-shadow` inset + border)
   - Cards: "5 Unique Towers" (⚔️/Swords icon), "Endless Waves" (🌊/Waves), "Global Leaderboard" (🏆/Trophy), "Strategic Depth" (🧠/Brain or ♟️)

4. **Tower showcase section** — Section with heading "CHOOSE YOUR ARSENAL". Horizontal scrollable row (or responsive grid) of 5 tower cards, one per tower type. Each card:
   - Colored icon/badge dot (large circle) matching tower's theme color
   - Tower name in bold
   - Short ability description
   - Gold cost badge
   - Tower colors: Arrow=`var(--color-success)` (amber/green), Cannon=`var(--color-warning)` (orange/yellow), Frost=`var(--color-info)` (blue), Sniper=`var(--color-error)` (red), Tesla=`var(--color-accent)` (purple)
   - Card has a subtle colored border glow matching the tower's color using `box-shadow`

5. **Leaderboard preview section** — Section with heading "GLOBAL LEADERBOARD". Fetch real scores with `getLeaderboard()` from `@/services/leaderboard` (show top 5; on error/loading show 5 placeholder rows). Styled as a dark scoreboard table with:
   - Rank column with `#1` having a gold glow, `#2` silver, `#3` bronze
   - Player name, score, wave columns
   - Subtle row hover state
   - A "View Full Leaderboard" link below
   - Use `useEffect` + `useState` to fetch on mount

6. **Final CTA section** — Dark gradient section at the bottom with:
   - Tagline: "No download. No signup required. Just play."
   - Large glowing "Play Now" button (same as hero CTA)
   - Small text noting it's free

7. **Footer** — Keep existing footer structure.

**CSS animations to add** (via injected `<style>` tag or Tailwind `animate-` utilities + `keyframes` in the JSX style tag):
- `@keyframes float` — slow up/down for orb blobs (8–12s infinite)
- `@keyframes pulse-glow` — CTA button glow breathing effect
- `@keyframes shimmer` — subtle shimmer on `#1` leaderboard row

**Design tokens to use:**
- Backgrounds: `#0a0a0f` (hero), `var(--color-bg)`, `var(--color-surface)`, `var(--color-surface-alt)`
- Text glow: `text-shadow: 0 0 20px var(--color-accent)` for headings
- Card glow: `box-shadow: 0 0 0 1px var(--color-border), 0 0 24px rgba(124,131,251,0.1)`
- Tower card glow: `box-shadow: 0 0 0 1px <tower-color>33, 0 0 20px <tower-color>22`

**Context:** `/home/user/frontend/src/pages/LandingPage.tsx`, `/home/user/frontend/src/styles/tokens.css`, `/home/user/frontend/src/services/leaderboard.ts`, `/home/user/frontend/src/components/auth/LoginButton.tsx`, `/home/user/frontend/src/components/auth/SignupButton.tsx`
**Creates:** None
**Modifies:** `/home/user/frontend/src/pages/LandingPage.tsx`
**Depends on:** None
**Verification:** Landing page renders with all 5 sections visible; hero headline and CTA button display; tower showcase shows all 5 towers with correct colors; leaderboard section shows at least a loading/placeholder state; "Play Now" button navigates to `/play`; page is responsive at 375px (stacked), 768px, and 1280px widths.

## Summary
- Total tasks: 1
- Files created: 0
- Files modified: 1 (`frontend/src/pages/LandingPage.tsx`)
- Estimated complexity: medium
