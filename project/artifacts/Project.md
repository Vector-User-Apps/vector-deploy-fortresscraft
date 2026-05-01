# 3D Tower Defense Game

## What This Is
A browser-based 3D tower defense game where players strategically place and upgrade defensive towers to stop waves of enemies from reaching their base. Features a global leaderboard so players can compete for the highest scores. Built as a web app playable on desktop browsers with no download required.

## Core Value
Satisfying, strategic tower defense gameplay with smooth 3D visuals that runs entirely in the browser. The game loop — plan, place, survive, optimize — must feel tight and rewarding.

## Target Users
Casual-to-mid-core gamers who enjoy strategy and tower defense games. They want a quick, engaging game they can play in their browser during breaks. The leaderboard gives competitive players a reason to replay and optimize their strategy.

## Context
Tower defense is a proven, beloved game genre. A polished browser-based 3D version with a leaderboard creates a sticky, shareable experience. No installs, no friction — just a URL.

## Key Features

### 3D Game World
- Isometric/perspective 3D view of the battlefield using Three.js
- A single well-designed map with a winding enemy path from spawn to base
- Smooth camera controls: zoom in/out, rotate around the battlefield
- Visual grid overlay for tower placement zones (tiles adjacent to the path)
- Atmospheric lighting and ground textures for visual polish

### Tower System (5 Tower Types)
1. **Arrow Tower** — Fast single-target damage, cheap, good all-rounder
2. **Cannon Tower** — Slow fire rate, area-of-effect splash damage, good vs groups
3. **Frost Tower** — Slows enemies in range, low damage but high utility
4. **Sniper Tower** — Very long range, high single-target damage, slow fire rate
5. **Tesla Tower** — Chain lightning that hits multiple enemies, expensive but powerful

Each tower has:
- 3 upgrade levels (increases range, damage, and/or fire rate)
- Distinct 3D model appearance per level
- Visual attack animations (projectiles, beams, effects)
- Range indicator shown on hover/selection

### Enemy System
- Multiple enemy types with distinct appearances:
  - **Grunt** — Basic, slow, low HP
  - **Runner** — Fast, low HP
  - **Tank** — Slow, very high HP, armored
  - **Healer** — Moves with groups, periodically heals nearby enemies
  - **Boss** — Appears at milestone waves, massive HP, special abilities
- Enemies follow a fixed path from spawn point to the player's base
- Health bars displayed above each enemy
- Death animations and effects

### Wave System
- Enemies come in waves of increasing difficulty
- Each wave has a defined composition (mix of enemy types)
- Short break between waves for tower placement/upgrades
- Wave counter and upcoming wave preview
- Difficulty scales with wave number: more enemies, tougher types, faster spawns
- Endless mode — waves keep coming until the player loses

### Economy & Resources
- Start with a base amount of gold (e.g., 100)
- Earn gold by killing enemies (varies by enemy type)
- Spend gold to place new towers or upgrade existing ones
- Bonus gold for completing waves without losing lives
- Sell towers for partial refund (50% of total investment)

### Player Base / Lives
- Player starts with 20 lives
- Each enemy that reaches the end of the path costs 1 life (bosses cost more)
- Game over when lives reach 0
- Lives displayed prominently in UI

### HUD & UI
- Top bar: current wave number, gold, lives, score
- Tower selection panel: shows available towers with cost and description
- Selected tower info panel: shows stats, upgrade cost, sell option
- Wave start button (player controls when next wave begins)
- Speed controls: 1x, 2x, 3x game speed
- Pause menu with restart option

### Scoring System
- Points earned per enemy killed (based on type and wave number)
- Bonus multiplier for consecutive waves without losing lives
- Final score displayed on game over screen
- Score = base kill points × wave multiplier × life bonus

### Global Leaderboard
- Players enter a name/alias after game over (no account required)
- Top 100 scores displayed on leaderboard page
- Shows: rank, player name, score, wave reached, date
- Leaderboard accessible from main menu
- Anti-cheat: scores validated server-side based on game state

### Game Flow Screens
- **Main Menu**: Play, Leaderboard, How to Play
- **How to Play**: Brief tutorial/guide explaining tower types and mechanics
- **Game Screen**: The main 3D battlefield with HUD
- **Game Over**: Final stats, score, option to submit to leaderboard, play again
- **Leaderboard**: Global rankings table

## User Flows

### Primary Flow: Play a Game
1. Player lands on main menu
2. Clicks "Play" to start a new game
3. 3D battlefield loads with starting gold
4. Player places towers on valid grid positions by selecting from tower panel and clicking on the map
5. Player clicks "Start Wave" to begin
6. Enemies spawn and follow the path; towers auto-attack enemies in range
7. Player earns gold from kills, places/upgrades towers between and during waves
8. Waves get progressively harder
9. Game ends when lives reach 0
10. Game over screen shows final score, wave reached, enemies killed
11. Player enters name and submits score to leaderboard
12. Option to play again or return to menu

### Secondary Flow: View Leaderboard
1. From main menu, click "Leaderboard"
2. See top 100 scores with player names, scores, waves reached
3. Return to main menu

### Secondary Flow: Learn How to Play
1. From main menu, click "How to Play"
2. See guide explaining each tower type, enemy types, and game mechanics
3. Return to main menu

### In-Game Tower Management
1. Click a tower type from the selection panel
2. Valid placement tiles highlight on the map
3. Click a valid tile to place the tower (gold deducted)
4. Click an existing tower to select it
5. See tower stats, upgrade cost, and sell option
6. Click upgrade to level up (if affordable) or sell to remove

## Data & Integrations

### Client-Side Game State
- All game logic runs client-side: enemy movement, tower targeting, projectile physics, wave management, gold economy
- Game state includes: tower positions/levels, enemy positions/HP, current wave, gold, lives, score

### Server-Side (Backend)
- Leaderboard storage: player name, score, wave reached, enemies killed, date
- Score submission endpoint with basic validation
- Leaderboard retrieval endpoint (top 100)

### 3D Assets
- Towers and enemies rendered as stylized 3D geometry (programmatic Three.js meshes — boxes, cylinders, spheres composed into recognizable shapes)
- No external 3D model files needed — all geometry built in code
- Particle effects for attacks, explosions, and enemy deaths

## Architecture
This app needs a backend (Django + DRF API) for the global leaderboard. The game itself runs entirely client-side using Three.js for 3D rendering and game logic. The backend provides:
- REST API endpoint for submitting scores
- REST API endpoint for retrieving leaderboard
- Basic score validation to prevent trivially fake submissions

The frontend is a React app with Three.js (via React Three Fiber) handling the 3D game rendering, with standard React components for menus, HUD, and leaderboard display.
