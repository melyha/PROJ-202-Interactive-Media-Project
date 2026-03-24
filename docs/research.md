# 🎮 Enigma — Brainstorming & Research
> **Course:** Interactive Media Project · Saskatchewan Polytechnic · 2026  

---

## 🔍 Section 2 — Research

Two existing interactive media projects were analyzed to understand what makes browser-based games engaging, identify common weaknesses, and determine how Enigma can differentiate itself.

---

###  Project 1 — Hextris
> **URL:** laubersder.github.io/Hextris · **Type:** Browser-based puzzle game · **Tech:** Vanilla JS + Canvas

| Category | Details |
|---|---|
|  **What It Is** | Hextris is an open-source, fast-paced HTML5 puzzle game inspired by Tetris. Players match coloured blocks rotating around a central hexagon. Widely cited as a clean example of browser game design. |
|  **Strength 1** | Instantly playable — no login, no install, loads in seconds. Zero-friction entry is critical for shareability. |
|  **Strength 2** | Core mechanic is simple to understand but hard to master — high skill ceiling keeps players returning. |
|  **Strength 3** | Clean, minimal visual design keeps full attention on gameplay. Open-source code is freely studied and forked. |
|  **Weakness 1** | No progression system — no levels, no story, no unlockables. Nothing to push the player forward beyond score. |
|  **Weakness 2** | Single mechanic gets repetitive quickly with no variety or escalation in gameplay type. |
|  **Weakness 3** | No sound design beyond basic effects; no music to build atmosphere or emotional engagement. |
|  **Differentiation** | Enigma improves on this by offering level-based progression, a narrative hook, enemy interaction, and collectibles — giving players a reason to keep going beyond pure score-chasing. |

---

###  Project 2 — Dangerous Dave (1988, id Software)
> **Type:** 2D Side-Scrolling Platformer · **Platform:** DOS / Browser ports available · **Tech:** Originally C + Assembly
 
| Category | Details |
|---|---|
|  **What It Is** | Dangerous Dave is a classic PC platformer created by John Romero. The player navigates Dave through hazardous levels collecting trophies, avoiding enemies, and reaching the exit door. It is widely considered a foundational example of the side-scrolling platformer genre. |
|  **Strength 1** | Extremely clear, pick-up-and-play design — no tutorial needed. The player understands the goal within seconds of loading. |
|  **Strength 2** | Level design creates natural tension through tight jumps and enemy placement, without ever feeling unfair. Every death teaches the player something. |
|  **Strength 3** | Simple collectible loop (trophies → exit door) gives every screen a clear micro-goal, keeping players focused and motivated. |
|  **Weakness 1** | No narrative or world-building — the levels feel disconnected with no sense of place or story. |
|  **Weakness 2** | Controls are rigid by modern standards — no jump arc variation, no coyote time, no forgiveness mechanics. |
|  **Weakness 3** | Visually dated even by pixel art standards — limited colour palette and sparse backgrounds reduce atmosphere. |
|  **What Enigma Borrows** | The pick-up-and-play simplicity, clear collect-and-exit loop, and retro charm. Enigma adds atmosphere and environmental storytelling that Dangerous Dave lacked. |

---

###  Project 3 — Pac-Man (1980, Namco)
> **Type:** Arcade / Browser-playable ports · **Platform:** Arcade, Web · **Tech:** Various browser implementations in JS Canvas
 
| Category | Details |
|---|---|
|  **What It Is** | Pac-Man is one of the most iconic arcade games ever made. The player navigates a maze collecting dots while avoiding four ghosts with distinct AI behaviours. It established many of the foundational principles of enemy tension, reward loops, and player agency that all modern games still use. |
|  **Strength 1** | The collect loop is deeply satisfying — every dot collected gives instant feedback, and clearing a screen feels like a real accomplishment. |
|  **Strength 2** | Enemy design is brilliant — each ghost has a distinct behaviour pattern, creating tension without the enemies feeling random or unfair. |
|  **Strength 3** | Zero learning curve. The entire rule set is visible on screen. Players of any age or skill level can immediately engage. |
|  **Weakness 1** | No progression in terms of environment — every level is the same maze, just faster. No visual variety or world-building. |
|  **Weakness 2** | Single-mechanic design means there is nothing to discover beyond the core loop — no hidden areas, no story, no surprises after the first few rounds. |
|  **What Enigma Borrows** | The tension that enemies create on every screen, and the satisfying feedback of the collect loop. Enigma applies this to a platformer context — collectibles feel rewarding, and enemies define the danger of each section. |

---

###  Project 4 — Super Mario Bros. / Mario & Luigi (NES era, Nintendo)
> **Type:** 2D Side-Scrolling Platformer · **Platform:** NES / Browser ports available · **Tech:** Browser ports in JS Canvas
 
| Category | Details |
|---|---|
|  **What It Is** | The Mario franchise on NES defined the side-scrolling platformer genre. Mario & Luigi introduced co-operative mechanics and a more character-driven feel. Together they established level pacing, enemy design philosophy, and the physics of momentum-based movement that nearly every 2D platformer since has referenced. |
|  **Strength 1** | Level pacing is masterclass-level — early sections teach mechanics silently through design, with difficulty scaling naturally across worlds. |
|  **Strength 2** | Enemy design philosophy is simple and readable — each enemy type has one clear behaviour, so players learn by encountering them rather than reading instructions. |
|  **Strength 3** | Movement feels inherently satisfying — the acceleration, jump arc, and momentum create a physical joy to simply moving through a level. |
|  **Weakness 1** | Browser fan ports carry legal risk — using Nintendo IP without a license is not portfolio-safe or sustainable. |
|  **Weakness 2** | Many web ports have broken collision, inconsistent physics, or incomplete levels due to imperfect reverse-engineering. |
|  **What Enigma Borrows** | The level structure and pacing model, the readable enemy design approach, and the priority placed on movement feel. Enigma builds an original world using these principles rather than cloning the IP. |

---

 
###  Project 5 — Vibe Coding 2D Games with Phaser.js (2026, YouTube Tutorial)
> **URL:** youtube.com · **Channel:** Chong-U — AI Oriented Dev · **Type:** Browser-based 2D Platformer · **Tech:** Phaser.js + Three.js
 
| Category | Details |
|---|---|
|  **What It Is** | A full tutorial walkthrough (53K+ views, Jan 2026) demonstrating how to build a 2D side-scrolling platformer from scratch in a browser using Phaser.js. The tutorial covers project setup in VS Code, Phaser.js game development, and automated game testing with Playwright. The resulting game features a character, tilemapped forest environment, parallax backgrounds, and smooth platformer physics — directly comparable in scope to Enigma. |
|  **Strength 1** | Demonstrates that a visually polished, fully functional Phaser.js platformer is achievable for a solo developer starting from zero. The end result (visible in the thumbnail) has strong visual production value with layered parallax backgrounds and animated sprites. |
|  **Strength 2** | Covers the exact tech stack Enigma will use — Phaser.js project setup, VS Code workflow, asset integration — making it a directly applicable technical reference. |
|  **Weakness 1** | Tutorial format means the code follows a specific instructional path — the resulting project is a learning artefact, not a fully scoped original game with its own design identity. |
|  **Weakness 2** | Uses Three.js alongside Phaser in some implementations — adding complexity that is unnecessary for Enigma's scope and could introduce dependency overhead. |
|  **What Enigma Borrows** | Technical workflow reference: VS Code setup, Phaser.js project structure, and the validation that this scope is achievable solo in a short timeframe. Enigma differentiates by building an original world, narrative, and design identity rather than following a tutorial path. |


###  Research Summary

| Factor | Dangerous Dave | Pac-Man | Mario & Luigi (NES) | Phaser.js Tutorial | Enigma |
|---|---|---|---|---|---|
| Game Type | 2D Platformer | Arcade Maze | 2D Platformer | 2D Platformer | 2D Platformer |
| Technology | DOS / C | Arcade / JS ports | NES / JS ports | Phaser.js + Three.js | Phaser.js 3 + Vite?? |
| Original IP | Yes | Yes (Namco) | No (Nintendo) | Tutorial reference | Yes (fully original) |
| Level Progression | Yes | Speed scaling only | Yes (8 worlds) | Single demo level | Yes (1-2 levels planned) |
| Narrative / World | None | None | Minimal | None | Yes (mysterious world) |
| Mobile Ready | No | Partial | Partial | No | Stretch goal |
| Atmosphere | Low | Low | Medium | Medium-High | High (core priority) |

---

> 📝 **Key Insight:** All five references validate the core platformer loop but none of them combine strong atmosphere, original world-building, and tight browser-native Phaser.js implementation simultaneously. That gap is exactly where Enigma sits.