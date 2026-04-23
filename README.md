# PROJ-202-Interactive-Media-Project

# 🎮 Enigma

> Browser-based 2D side-scrolling platformer · Built with Phaser.js 3  
> Saskatchewan Polytechnic · Interactive Media Project · 2026

---

## Play

**[▶ Play Enigma](https://melyha.github.io/PROJ-202-Interactive-Media-Project/)**
.

---

## Controls

| Key           | Action                                    |
| ------------- | ----------------------------------------- |
| ← → / A D     | Move Maevea left / right                  |
| Space / W / ↑ | Jump                                      |
| Z             | Attack                                    |
| X             | Kick                                      |
| TAB           | Switch control between Maevea ↔ Sable     |
| H             | Toggle How To Play panel                  |
| I             | Toggle notification panel                 |
| F1            | Toggle debug overlay                      |
| G             | Toggle physics hitboxes (debug mode only) |
| M             | View Celestial Atlas map (win screen)     |
| ESC           | Close overlays / skip intro cards         |
| Space         | Retry after game over / advance intro     |

---

## About

Enigma is an original browser-based 2D side-scrolling platformer featuring:

- A female adventurer protagonist with full spritesheet animations
- A purple companion character that follows the player and charges energy from coin collection
- Dual-character switching system — TAB to swap control between Maevea and Sable
- Map fragment collection mechanic — Sable retrieves keys to unlock the Celestial Atlas
- Patrol enemies with stomp and attack interactions
- Parallax multi-layer background system
- Interactive tile mechanics — collectibles, hazards, ladders, doors, interactive blocks
- Fully functional HUD with lives, coins, gems, keys, and companion energy bar
- Notification system (! button) for companion and map fragment events
- Custom level editor (`editor.html`) for painting tile-based levels visually

---

## Scenes

| Scene          | Description                                                |
| -------------- | ---------------------------------------------------------- |
| **TitleScene** | Game title, controls reference, tips, start prompt         |
| **IntroScene** | Narrative card sequence — four cards with scroll animation |
| **GameScene**  | Main gameplay — Level 1: The Golden Garden                 |

---

## Gameplay Mechanics

### Maevea — Protagonist

- Smooth movement with coyote time (150ms grace window)
- Idle, run, jump, fall, attack, kick, hurt, fallDown animations
- 3-heart health system with half-heart and empty-heart states
- Invincibility frames after damage (1500ms flash)
- Last-life warning: blinking heart + red screen vignette
- Death sequence: fallDown animation, screen shake, overlay, GAME OVER
- Attack (Z) and kick (X) locked by attackLock flag — simultaneous input bug fixed

### Sable — Companion

- Dark moth companion that floats and follows Maevea via smooth lerp
- Switches between idle and front-facing states based on player movement
- Gentle sine-wave bob while floating
- **3-heart health system** — Sable has her own lives. If Sable dies, it's game over.
- **Sable is damaged by:** lava, fireball, fly enemies
- **Energy star system:** collect 15 coins → press Y to convert → Sable gains 1 star (max 3)
- **TAB switches control** to Sable — WASD/arrows then move Sable directly
- Sable can collect gems and keys while being controlled
- Camera follows whoever is currently being controlled
- Companion world bounds clamping — cannot fly off screen
- Energy depletes over time (one star per 3 minutes) — collect more coins to recharge

### Enemies

| Enemy                 | Behaviour                                              |
| --------------------- | ------------------------------------------------------ |
| **Frog**              | Ground patrol, leaping bounce animation, stomp to kill |
| **Fly** (coming soon) | Aerial patrol, alerts when player/Sable nearby         |

- Player can stomp enemies from above (bounces player upward)
- Z (attack) or X (kick) also defeats enemies
- Enemy kills award +1 coin

### Tiles & Interactions

| Tile                              | Behaviour                                             |
| --------------------------------- | ----------------------------------------------------- |
| **Terrain / Brick**               | Solid platform                                        |
| `block_coin_active`               | Hit from below → 1 coin → converts to empty           |
| `block_strong_coin_active`        | Hit from below → 12 coin burst → converts to empty    |
| `block_exclamation_active`        | Hit from below → +1 life → converts to empty          |
| `block_strong_exclamation_active` | Hit from below → 2s shield → converts to empty        |
| `block_yellow`                    | Hit from below → 60% coin, 40% empty                  |
| **Hazards**                       | Lava, spikes, saw, fireball → lose 1 heart            |
| **Water**                         | Contact → lose 1 heart                                |
| **Ladder**                        | Press ↑ or W to climb                                 |
| **Door**                          | Requires all keys + map fragment to exit              |
| **Lock**                          | Walk near → unlock prompt appears                     |
| **Coins**                         | Collect → coinCount++ and companion energy charge     |
| **Gems**                          | Collect → gemCount++ (Sable can also collect)         |
| **Keys**                          | Collect (Sable must retrieve) → unlocks exit sequence |
| **Decorations**                   | Visual backdrop only — no collision                   |

### Coin → Companion Energy Flow

1. Collect 15 coins → popup appears automatically
2. Press **Y** to convert or **ESC** to defer (stores in notification)
3. Sable gains 1 energy star (max 3 stars)
4. Second popup confirms Sable is ready
5. Press **TAB** to switch control to Sable
6. Notification button (!) turns grey when no pending actions

 
## Win Screen & Celestial Atlas
 
On level completion:
 
- White flash transition → "FRAGMENT FOUND!" win screen
- Maevea and Sable portrait icons float gently
- Narrative text: "Sable glows. Maevea keeps moving. The Atlas stirs awake."
- **[ PLAY AGAIN ]** restarts the level
- **[ VIEW MAP ]** or press **M** opens the full-screen Celestial Atlas
- Celestial Atlas shows all six biomes with dashed travel paths
- Press **ESC** or click ✕ to close the atlas

### Level Exit Sequence

1. Sable must collect the key
2. Maevea walks near the lock tile → unlock prompt
3. Press Y → map fragment popup appears
4. Press Y → exit unlocks
5. Walk through the door → win screen

---



## HUD

| Element                    | Description                                                     |
| -------------------------- | --------------------------------------------------------------- |
| MAEVEA row                 | Character head icon + 3 hearts                                  |
| SABLE row                  | Companion icon + 3 hearts                                       |
| Stars                      | 1–3 companion energy stars (gold = charged, dim = empty)        |
| Coin icon                  | Current coin count                                              |
| Gem icon                   | Current gem count                                               |
| Key icon                   | Keys collected / total                                          |
| **?** button (red)         | Opens How To Play panel (also H key)                            |
| **!** button (orange/grey) | Notification panel — pending companion/map actions (also I key) |


## Sound System
 
Enigma uses a shared `SoundManager` class (`src/managers/SoundManager.js`) that persists across scenes.
 
| Sound file                    | Trigger                                                        |
| ----------------------------- | -------------------------------------------------------------- |
| `bitwave-background.ogg`      | Background music loop during gameplay                          |
| `when-it-rains-background.ogg`| Background music during title and intro screens               |
| `sfx_coin.ogg`                | Collecting a coin                                              |
| `sfx_gem.ogg`                 | Collecting a gem                                               |
| `sfx_hurt.ogg`                | Maevea or Sable taking damage                                  |
| `sfx_disappear.ogg`           | Character or companion death / game over trigger               |
| `sfx_bump.ogg`                | Enemy defeated                                                 |
| `sfx_throw.ogg`               | Attack (Z) or kick (X)                                         |
| `sfx_jump.ogg`                | Jump                                                           |
| `sfx_sparkle.ogg`             | Key collected, lockbox unlocked, map fragment found, door exit |
 
The **⚙ gear button** appears top-right on the title screen, game screen, and win screen. Clicking it opens a panel with independent Music and SFX on/off toggles. Sound state persists across scene transitions via a shared global instance.

---

## Notification System

The **!** button in the top-right corner queues game notifications:

- Turns **orange** when there is a pending action
- Turns **grey** when all actions are resolved
- Notifications in order: Companion ready → Map fragment found
- Each notification popup: press **Y** to accept, **ESC** to close

---

## Parallax Background System

Five layered background bands with independent scroll factors:

| Layer               | Asset                                | Scroll Factor |
| ------------------- | ------------------------------------ | ------------- |
| Sky base            | bg_2_solid_sky                       | 0 (fixed)     |
| Clouds              | bg_1_clouds                          | 0.05          |
| Fade hills / trees  | bg_3_fade_trees + bg_3b_fade_hills   | 0.25          |
| Color hills / trees | bg_4_color_trees + bg_4b_color_hills | 0.45          |
| Ground strip        | bg_5_solid_grass                     | 0.5           |

---

## Narrative — Level 1: The Golden Garden

_Palette: rose gold · coral sunset · warm amber · soft lavender sky_

Maevea wakes up in the Golden Garden. Sable arrives. The world is warm and almost peaceful. The frogs here are small and bouncy and annoying in the way things are when they don't know they're in your way. The first map fragment is hidden past the pond paths they guard.

Sable glows. Maevea follows.

**Enemies:** Frogs (patrol)  
**Collectibles:** Coins, gems, map fragment  
**Weapon:** Sword


**Intro card illustrations generated using Nano Banana (AI image generation).**  
**Celestial Atlas world map and dialogue box assets designed in Figma.**


---

## Stack

| Tool                           | Role                                                  |
| ------------------------------ | ----------------------------------------------------- |
| **Phaser.js 3.60**             | Game engine — physics, input, rendering, animations   |
| **Plain HTML + JavaScript**    | No bundler, no framework                              |
| **Kenney New Platformer Pack** | Tiles, characters, collectibles, HUD assets (CC0)     |
| **GitHub Pages**               | Free static hosting                                   |
| **Custom Level Editor**        | `editor.html` — browser-based tile painter            |
| **Figma**                      | UI design, colour palette, map design, sky background |

---

## Development Status

| Phase      | Focus                                                 | Status         |
| ---------- | ----------------------------------------------------- | -------------- |
| 🔧 Phase 1 | Setup, Phaser boot, first sprite on screen            | ✅ Complete    |
| ⚙️ Phase 2 | Physics, movement, tilemap loading                    | ✅ Complete    |
| 🔁 Phase 3 | Core gameplay — tiles, HUD, companion, death, enemies | ✅ Complete    |
| ✨ Phase 4 | Polish — title, intro, parallax, notifications, UX    | ✅ Complete    |
| 🚀 Phase 5 | Ship — deployment, README, showcase                   | 🟡 In Progress |

---

## Asset Credits

- **Kenney New Platformer Pack** — [kenney.nl](https://kenney.nl/assets/new-platformer-pack) · CC0
- **Kenney Background Pack** — [kenney.nl](https://kenney.nl) · CC0
- **Press Start 2P** — Google Fonts · OFL
- **Noto Sans Symbols** — Google Fonts · OFL
- **Cinzel** — Google Fonts · OFL
- **Noto Sans Symbols 2** — Google Fonts · OFL
- **Intro card illustrations** — AI generated using Nano Banana
- **Celestial Atlas map, dialogue boxes, UI** — Designed in Figma by me
- **Background music** — `bitwave-background.ogg`, `when-it-rains-background.ogg`


---

_"She doesn't know where she's going. She knows she can't stop."_  
— Maevea, The Wanderer
