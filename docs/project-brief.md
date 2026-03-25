# 🎮 Enigma — Project Brief
> **Course:** Interactive Media Project · Saskatchewan Polytechnic · 2026  


---
 
## 01 · Project Title
 
**Enigma**
*Working title — subject to refinement once the storyline is finalized.*
 
---
 
## 02 · Project Type
 
Browser-Based 2D Side-Scrolling Platformer
 
---

## 03 · Project Overview
 
Enigma  is a browser-based 2D side-scrolling platformer built with Phaser.js 3. Players guide a mysterious pixel-art character through atmospheric levels filled with platforms, hazards, collectibles, and enemies.
 
The focus of this project is **depth over breadth** — one polished, complete level with tight controls and a cohesive atmosphere is the goal, rather than multiple rough levels. This is a first-time game development project, and the priority is demonstrating a clear understanding of core game mechanics: physics, collision, enemy behaviour, and win/lose logic — all implemented cleanly and intentionally.
 
The game runs entirely in the browser with no installation required, and will be deployed as a shareable link via GitHub Pages.
 
>  **Scope Philosophy:** A smaller, highly polished project is the target. Breadth (more levels, more enemies, more features) is saved for stretch goals only.

---

## 04 · Purpose & Goals
 
| Goal | Description |
|---|---|
|  **Primary** | Deliver one fully playable, polished browser level with a working character, at least 3 enemy instances, collectibles, and a clear win/lose condition — shareable via URL. |
|  **Learning** | Demonstrate a working understanding of Phaser.js 3: Arcade Physics, tilemap integration, sprite animation, scene management, and GitHub Pages deployment. |
|  **Creative** | Build an original pixel-art world with a cohesive visual identity and atmosphere — proving that strong design matters even at small scope. |
|  **Portfolio** | Produce a GitHub-hosted, documented, playable project with a clean README that can be linked from a professional portfolio. |

---

## 05 · Target Audience
 
| Segment | Description |
|---|---|
|  **Primary** | Casual gamers aged 15–30 who enjoy retro-style browser games. They value instant play (no install) and short-session gameplay of 5–15 minutes per visit. |
|  **Secondary** | Peers, instructors, and recruiters reviewing this as a portfolio piece. Technical reviewers assess code clarity and architecture; creative reviewers assess visual cohesion and game feel. |
|  **Accessibility** | Keyboard-driven controls (arrow keys / WASD) — standard and immediately familiar. No complex button combos required. |

---

## 06 · User Experience & Interactivity

###  Controls
- **Left / Right** — Arrow keys / WASD
- **Jump** — Spacebar or Up arrow
- Controls are displayed on the title screen so no prior knowledge is needed

###  Physics Feel - Phaser Arcade Physic
This project uses **Phaser's built-in Arcade Physics system** — the recommended starting point for 2D platformers. Arcade Physics uses simplified axis-aligned bounding box (AABB) collision, meaning objects are treated as rectangles for collision checks. It does not simulate complex shapes or rotational physics. This makes it fast, predictable, and easy to tune — which is exactly what a first-time platformer build needs.
 
**Why Arcade Physics specifically:**
- Simple and fast — no unnecessary complexity for a 2D game
- Handles gravity, velocity, and collision out of the box
- Well-documented with a large community of examples
- Perfectly suited for tile-based platformer levels
 
**How it will be configured in Enigma:**
 
| Physics Behaviour | How It Works |
|---|---|
| **Gravity** | A constant downward force is applied to the player at all times. When not standing on a platform, the player falls. The gravity value will be tuned during Phase 2 to feel natural, not too floaty, not too heavy. |
| **Jump Arc** | Jumping applies an upward velocity that fights gravity. Holding the jump button longer applies slightly more upward force before gravity takes over, giving the player control over jump height. |
| **Coyote Time** | A small grace period (roughly 100–150ms) after walking off a platform edge where the player can still jump. This is a standard forgiveness mechanic used in nearly every modern platformer to prevent frustrating missed jumps. It will be implemented with a simple timer variable. |
| **Platform Collision** | The tilemap layer is set as a static physics body. The player collides with it using `this.physics.add.collider()`. Platforms the player can jump through from below will use one-way collision. |
 

###  Core Game Loop
 
```
Title Screen → Level Loads → Player Moves Through Level
→ Collect items (score ++) → Avoid / defeat enemies
→ [Lose] Take damage → lives -- → respawn at start
→ [Win] Reach end trigger → Victory screen → option to replay
```

###  Feedback Systems
- **On collect:** Brief particle burst + score counter increments
- **On damage:** Player sprite flashes + brief invincibility frames
- **On death:** Death animation plays → short pause → respawn
- **On win:** Victory screen appears with final score

---

## 07 · Technology & Tools
 
| Tool | Role | Why This Tool |
|---|---|---|
| **Phaser.js 3** | Game engine | Handles rendering, physics, input, audio, tilemaps. Free, browser-native, well-documented. |
| **Phaser Arcade Physics** | Physics system | Simple AABB collision — fast, predictable, ideal for a first 2D platformer. |
| **JavaScript (ES6+)** | Language | No TypeScript overhead. Phaser 3 works natively with JS. |
| **Tiled Map Editor** | Level design | Free tilemap editor. Exports JSON that Phaser reads natively. |
| **itch.io Free Asset Packs** | Art / sprites | Royalty-free pixel art tilesets and character sprites. |
| **AI Asset Generation** *(if time allows)* | Custom art | Tools like Adobe Firefly or similar may be used to generate consistent game-ready pixel assets if the timeline permits. This is exploratory and not a core dependency. |
| **Git + GitHub** | Version control | Source control and project documentation hub. |
| **GitHub Pages** | Deployment | Free static hosting — game accessible via URL with no server needed. |
| **VS Code** | IDE | Primary development environment. |
 
> ❌ **Note on Vite:** Vite is not required for this project. Phaser.js runs directly in the browser without a bundler. 

---

## 08 · Design & Aesthetic Style

###  Visual Direction
16×16 or 32×32 pixel art. Retro colour palette with clear contrast — bright collectibles against darker backgrounds, readable enemies, clean platform edges.

###  Mood & Tone
Mysterious and slightly eerie — the player character is an unnamed figure in an unknown world. Environmental storytelling over explicit narrative. The world feels like something ancient and forgotten.

###  Mood Board & Inspirations
 
>  **Mood Board (Figma):** *[Link:(https://www.figma.com/board/GuK1dchEmsjoJae2mgewdA/Proj202-Moodboard?node-id=0-1&t=Di73vAuLZ5fh9HEb-1)]*
 

###  Inspirations

| Game | What We're Drawing From |
|---|---|
| 🟡 **Pac-Man** | Simple but satisfying collect loop; enemies that define the tension of every screen |
| 🗡️ **Dangerous Dave** | Pixel-art platformer feel; pick-up-and-play simplicity; retro charm without explanation |
| 🍄 **Mario & Luigi (NES era)** | Level structure and pacing; enemy design philosophy; the joy of momentum-based movement |

> 📸 *Screenshots from the above games and colour palette references are in the Figma mood board.*

###  Typography
Pixel-style bitmap font for in-game HUD and UI — e.g. **Press Start 2P** (Google Fonts). Clean, period-appropriate, no modern sans-serifs inside the game world.

###  Visual FX
- Particle effects on collectibles and death
- Screen shake on damage (Phaser camera effect)
- Parallax scrolling background for depth illusion

---

## 09 · Key Features & Functionality

These are the features that **will** be in the final submission. Nothing in this section is tentative.
 
| Feature | Specifics |
|---|---|
|  **1 Complete Level** | One fully designed tilemap level built in Tiled. The level has a defined start point, a clear path, and a reachable end trigger. |
|  **Character Movement** | Left/right movement, jump, gravity — all tuned via Phaser Arcade Physics until the movement feels responsive and satisfying. |
|  **3 Enemy Instances** | Three enemies placed in the level. Each uses simple left-right patrol AI — walks to a platform edge, reverses direction. Contact with an enemy costs the player one life. |
|  **Collectibles** | A set number of collectibles placed through the level. Each collected item increments the score counter on the HUD. |
|  **Win Condition** | Reaching the end-of-level trigger displays a victory screen with the player's final score and a replay button. |
|  **Lose Condition** | Player starts with 3 lives. Each enemy contact or fall costs one life. Losing all 3 lives triggers a game over screen with a replay option. |
|  **HUD** | Score, lives remaining, and level label displayed persistently at the top of the screen. |
|  **Title Screen** | Simple screen with game name, control instructions, and a start button. |
|  **Game Over Screen** | Displays final score and a replay button. |
---

## 10 · Stretch Goals
 
These features are only attempted if the core level is complete and polished with time remaining.
 
| Goal | Description |
|---|---|
|  **Level 2 & 3** | Additional levels with increased difficulty and new platform layouts |
|  **Additional Enemy Types** | A second enemy with different behaviour (e.g. stationary and shoots, or drops from above) |
|  **Sound Design** | Background music loop + SFX for jump, collect, death, win — free assets from freesound.org |
|  **Mobile Touch UI** | On-screen D-pad and jump button for touchscreen play |
|  **Local High Score** | Save top score to localStorage — displayed on title screen |
|  **AI-Generated Assets** | Custom pixel art generated with AI tools for a more unique visual identity |
|  **Storyline Intro** | Brief text or pixel cutscene before Level 1 establishing the world |
|  **Godot Port** | Port core game to Godot for Android APK export and potential Play Store submission |

---

## 11 · Challenges & Feasibility Considerations

| Challenge | Risk Level | Mitigation |
|---|---|---|
|  **Physics Tuning** | Medium | Phaser Arcade Physics is well-documented. Gravity and jump values will be tuned iteratively in Phase 2. Small adjustments have big impact — plan time for this. |
|  **Asset Sourcing** | Low | A free itch.io asset pack will be downloaded on Day 1 before any code is written. Art will not block development. |
|  **Tiled → Phaser Integration** | Medium | Tiled exports JSON that Phaser reads natively. Will follow the official Phaser 3 tilemap tutorial and test one small map before building the full level. |
|  **Scope Creep** | High | The scope is locked to one level. Any new ideas go directly into the stretch goals list, not the active build. |
|  **First-Time Game Dev** | Medium | This is a first Phaser.js project. The backwards planning framework and phased milestones are specifically designed to prevent getting lost. Phase 1 is just getting something on screen. |
---

## 12 · Project Board & Timeline
 
>  **GitHub Project Board:** *[Link: (https://github.com/melyha/PROJ-202-Interactive-Media-Project/issues)]*
 
### Why GitHub Projects?
GitHub has a built-in kanban-style **Projects** tab that lives directly inside the repository — no separate tool needed. Tasks can be linked to commits and issues, keeping code and planning in one place. It is free and already part of the GitHub workflow this project uses.

### Development Phases

> Development follows a **backwards planning framework** — built from the finished game back to Day 1.
 
| Phase | Duration | Milestone | Key Tasks |
|---|---|---|---|
| 🔧 **Phase 1** — Setup & First Pixel | Days 1–4 | A character sprite is visible and moving on screen in the browser | Set up Phaser.js project (no Vite — plain HTML + JS), create GitHub repo, download asset pack from itch.io, deploy blank page to GitHub Pages, load first scene with player sprite |
| ⚙️ **Phase 2** — Physics & Movement | Days 5–9 | Character moves, jumps, and lands on platforms correctly | Configure Phaser Arcade Physics, apply gravity, implement left/right movement + jump, load first Tiled tilemap, set up platform collision, tune physics values until movement feels good |
| 🔁 **Phase 3** — Core Gameplay Loop | Days 10–16 | Full play-through possible from start to win or game over | Add 3 patrol enemies with collision damage, place collectibles + score counter, implement 3-lives system, add win trigger at level end, add death + respawn logic, add basic idle/run/jump animations |
| ✨ **Phase 4** — Polish & UI | Days 17–22 | Game looks and feels complete end-to-end | Build title screen + game over screen, finalize HUD, add particle FX on collect and death, add player damage flash, refine level layout based on playtesting, fix any remaining bugs |
| 🚀 **Phase 5** — Ship & Submit | Days 23–28 | Live URL submitted, repo documented | Final GitHub Pages deployment, README updated with play link and project description, code reviewed and commented, project brief finalized, portfolio entry written |

---

## 13 · Storyline & Narrative
 
>  *Storyline section — 
 
---
 
## Resources & References

- [Phaser.js 3 Documentation](https://phaser.io/phaser3)
- [Phaser 3 — Making Your First Game (Official Tutorial)](https://phaser.io/tutorials/making-your-first-phaser-3-game)
- [Phaser 3 — Arcade Physics Guide](https://newdocs.phaser.io/docs/3.60.0/Phaser.Physics.Arcade)
- [Tiled Map Editor](https://www.mapeditor.org/)
- [itch.io — Free Pixel Art Asset Packs](https://itch.io/game-assets/free/tag-pixel-art)
- [freesound.org — Free Sound Effects](https://freesound.org/)
- [Press Start 2P — Google Fonts](https://fonts.google.com/specimen/Press+Start+2P)
- [GitHub Projects — Project Board Docs](https://docs.github.com/en/issues/planning-and-tracking-with-projects)

---

