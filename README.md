# PROJ-202-Interactive-Media-Project
# 🎮 Enigma

> Browser-based 2D side-scrolling platformer · Built with Phaser.js 3  
> Saskatchewan Polytechnic · Interactive Media Project · 2026

---

##  Play

**[▶ Play Enigma](https://melyha.github.io/PROJ-202-Interactive-Media-Project/)**
.
---

## Controls
 
| Key | Action |
|---|---|
| ← → / A D | Move left / right |
| Space / W / ↑ | Jump |
| J | Attack |
| K | Kick |
| G | Toggle debug hitboxes |
| Space | Retry after game over |
 
---

## About
 
Enigma is an original browser-based 2D side-scrolling platformer featuring:
 
- A female adventurer protagonist with full spritesheet animations
- A purple companion character that follows the player and charges energy from coin collection
- Custom level editor (`editor.html`) for painting tile-based levels visually
- Parallax multi-layer background system
- Interactive tile mechanics — collectibles, hazards, ladders, doors, interactive blocks
- Fully functional HUD with lives, coins, gems, keys, and companion energy bar

---

## Gameplay Mechanics
 
### Player
- Smooth movement with coyote time (150ms grace window after leaving platform edge)
- Idle, run, jump, fall, attack, kick, hurt, and fallDown animations
- 3-heart health system with visual half-heart and empty-heart states
- Invincibility frames after taking damage (1500ms)
- Last-life warning: blinking heart + red screen vignette
- Death sequence: fallDown animation, screen shake, desaturation, GAME OVER overlay
### Companion
- Purple character that floats and follows the player via smooth lerp
- Switches between idle (flying) and front (resting) states
- Gentle sine-wave bob animation while floating
- 3-heart health bar in HUD (visual)
- Energy bar charged by collecting coins — pulses when fully charged
### Tiles & Interactions
 
| Tile Type | Behaviour |
|---|---|
| **Terrain** | Solid platform — walk and jump on |
| **Blocks** | Solid platform — hittable from below |
| `block_coin_active` | Hit from below → 1 coin → converts to empty |
| `block_strong_coin_active` | Hit from below → 12 coin burst → converts to empty |
| `block_exclamation_active` | Hit from below → +1 life → converts to empty |
| `block_strong_exclamation_active` | Hit from below → 2s shield → converts to empty |
| `block_yellow` | Hit from below → 60% coin, 40% empty → converts |
| **Hazards** | Contact → lose 1 heart (spikes, lava, saw, bomb) |
| **Water** | Contact → lose 1 heart |
| **Ladder** | Press ↑ to climb |
| **Door** | Collect all keys first, then exit level |
| **Coins** | Collect → coinCount++ + companion energy charge |
| **Gems** | Collect → gemCount++ |
| **Keys** | Collect to unlock door exit |
| **Decorations / Flags / Torches** | Visual backdrop only — no collision |
 
### HUD
- ❤️ Main character lives (hud_heart / hud_heart_half / hud_heart_empty)
- 🟣 Companion lives (hud_player_purple icon + 3 hearts)
- Coin count with coin icon
- Gem count with gem icon
- Key count (collected / total) with key icon
- Companion energy bar (purple, pulses when full)

---


## Stack

| Tool | Role |
|---|---|
| **Phaser.js 3.60** | Game engine — physics, input, rendering, animations |
| **Plain HTML + JavaScript** | No bundler, no framework |
| **Kenney New Platformer Pack** | Tiles, characters, collectibles, HUD assets (CC0) |
| **GitHub Pages** | Free static hosting |
| **Custom Level Editor** | `editor.html` — browser-based tile painter |

---

## Development Status

| Phase | Focus | Status |
|---|---|---|
| 🔧 Phase 1 | Setup, Phaser boot, first sprite on screen | ✅ Complete |
| ⚙️ Phase 2 | Physics, movement, gym level, tilemap loading | ✅ Complete |
| 🔁 Phase 3 | Core gameplay — tiles, HUD, companion, death sequence | 🟡 In Progress |
| ✨ Phase 4 | Polish — title screen, game over, particles, parallax | ⬜ Upcoming |
| 🚀 Phase 5 | Ship — final deployment, README, portfolio entry | ⬜ Upcoming |


---

## Asset Credits
 
- **Kenney New Platformer Pack** — [kenney.nl](https://kenney.nl/assets/new-platformer-pack) · CC0 License
- **Press Start 2P** — Google Fonts · Open Font License