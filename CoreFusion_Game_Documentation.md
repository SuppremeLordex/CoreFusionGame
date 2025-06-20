# Core Fusion: Elemental Orbs

An original HTML5 Canvas game inspired by Suika Game. Developed using **Cursor AI**, this project blends light physics, merging mechanics, and an elemental theme to create a fresh gameplay experience.

---

## 🎮 Game Concept
"Core Fusion" revolves around **elemental orbs** falling into a container. When two orbs of the same type collide, they fuse into a stronger elemental form. The player's goal is to continuously merge orbs and ultimately create the legendary **Primal Core**. The game ends when the orbs stack too high.

---

## 🧱 Core Mechanics
- Objects fall under gravity
- Two of the same orb type merge on collision
- Merged orb becomes the next tier
- Game over when orbs overflow container
- Bonus system for chained merges

---

## 📦 Orb Tiers
| Tier | Element Name  |
|------|----------------|
| 1    | Spark          |
| 2    | Flame          |
| 3    | Ember          |
| 4    | Fireball       |
| 5    | Blaze          |
| 6    | Inferno        |
| 7    | Core Fragment  |
| 8    | Primal Core    |

---

## 🗂️ Folder Structure
```
/core-fusion/
├── index.html
├── style.css
├── game.js
├── assets/
│   ├── orbs/
│   │   ├── spark.png
│   │   ├── flame.png
│   │   └── ...
│   └── background.png
├── sounds/
│   └── merge.wav
└── README.md
```

---

## 🧠 Development Phases & Cursor AI Prompts

### 🔹 Phase 1: Project Setup
**Objective:** Initialize folder structure and boilerplate files

**Tasks:**
- Create project folder
- Create `index.html`, `style.css`, `game.js`
- Create asset folders: `/assets/orbs/` and `/sounds/`
- Add HTML5 Canvas element

**Cursor Prompt:**
```
Create a new HTML5 Canvas game project called "Core Fusion".
Generate the base folder structure:
- index.html
- style.css
- game.js
- assets/orbs/
- sounds/
Add a canvas in the HTML and link the JS and CSS.
```

---

### 🔹 Phase 2: Game Loop & Canvas Setup
**Objective:** Create render loop, draw background, prepare game logic base

**Tasks:**
- Implement a game loop using `requestAnimationFrame`
- Load and draw background image
- Draw the container (bowl) on canvas

**Cursor Prompt:**
```
In game.js:
- Create a game loop using requestAnimationFrame
- Draw a background image (assets/background.png)
- Draw a static bowl/container area at the bottom of the canvas
```

---

### 🔹 Phase 3: Orb Spawning & Gravity
**Objective:** Drop random orbs from the top with gravity

**Tasks:**
- Create Orb class with image, type, position, velocity
- Spawn orbs one-by-one from top center
- Apply gravity to falling orbs

**Cursor Prompt:**
```
Implement a class called Orb with properties:
- type (spark, flame, etc.)
- position (x, y), velocity (vy), radius, image
Add gravity to the orbs and spawn one at a time from the top center.
```

---

### 🔹 Phase 4: Collision Detection & Merging
**Objective:** Merge two same-type orbs

**Tasks:**
- Implement circle collision detection
- On collision, destroy two orbs and spawn next-tier orb
- Play sound effect on successful merge

**Cursor Prompt:**
```
Add collision detection for overlapping orbs.
If two orbs of the same type collide:
- Remove both
- Spawn a new orb at the collision point of the next tier
- Play merge sound (sounds/merge.wav)
```

---

### 🔹 Phase 5: Game Over Condition
**Objective:** End game when stack reaches top

**Tasks:**
- Track y-position of all orbs
- If any orb reaches top threshold, stop game
- Display “Game Over” on canvas

**Cursor Prompt:**
```
Check if any orb's y-position is too close to the top of the canvas.
If so:
- Stop the game loop
- Show "Game Over" text on the screen
```

---

### 🔹 Phase 6: Asset Generation with Cursor AI
**Objective:** Use Cursor AI to generate orb sprites

**Tasks:**
- Create 128x128 glowing orb sprites for each tier
- Save with transparent background
- Place in `/assets/orbs/` with proper filenames

**Cursor Prompt (for each orb):**
```
Generate a 128x128 transparent PNG of a glowing elemental orb named "[Spark/Flame/.../Primal Core]".
Style: high contrast, glowing magic core, soft particle edges
Background: transparent
```

---

### 🔹 Phase 7: Combo Bonus Mechanic
**Objective:** Add scoring for multiple merges in a single drop

**Tasks:**
- Add combo detection logic
- Show floating score multiplier
- Add score counter

**Cursor Prompt:**
```
Track combo chains.
If multiple merges happen from one orb drop, show a bonus score popup.
Increment score with bonus multipliers.
```

---

### 🔹 Phase 8: Polishing
**Objective:** Add sound effects, animations, UI polish

**Tasks:**
- Add CSS and canvas styling
- Add animations when merging
- Show score counter and restart button
- Add merge and game-over sounds

**Cursor Prompt:**
```
- Add merge sound to play on successful merge
- Add visual glow animation when orbs merge
- Add UI: score counter, restart button
- Style using CSS and Canvas text
```

---

## 🚀 Optional Future Expansions
- Leaderboards
- Daily challenge mode
- Mobile touch controls
- New orb elements/themes (ice, wind, dark, etc.)
- Particle effects or shaders

---

## 📌 Final Note
This project is designed to be:
- Easy and fast to develop
- Highly original in concept
- Fully playable in a browser using Cursor AI and HTML5 Canvas

Let me know when you're ready to begin the first phase!
