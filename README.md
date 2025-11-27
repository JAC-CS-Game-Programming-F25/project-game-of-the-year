# Final Project

-   [ ] Read the [project requirements](https://vikramsinghmtl.github.io/420-5P6-Game-Programming/project/requirements).
-   [ ] Replace the sample proposal below with the one for your game idea.
-   [ ] Get the proposal greenlit by Vik.
-   [ ] Place any assets in `assets/` and remember to update `src/config.json`.
-   [ ] Decide on a height and width inside `src/globals.js`. The height and width will most likely be determined based on the size of the assets you find.
-   [ ] Start building the individual components of your game, constantly referring to the proposal you wrote to keep yourself on track.
-   [ ] Good luck, you got this!

---

# Game Proposal – Echoes of the Fallen Star

## ✒️ Description

**Working Title:** Echoes of the Fallen Star

**Platform:** HTML5 Canvas (provided engine / framework)

**Genre:** Top-down action RPG with dark fantasy themes and character progression.

**Core fantasy:**

You were once a legendary warrior. During your final battle, you were struck by a forbidden ritual that ripped your spirit from your body. Your soul didn't pass on - it mutated into a Shadow Form, a drifting, broken, half-forgotten being. Your goal: reclaim your humanity by defeating the guardians who were once your allies, now corrupted by the same ritual that stole your body.

**Core loop:**

Explore zones → Fight enemies → Collect essences → Use essences to upgrade ATK or HP → Fight stronger enemies → Defeat corrupted guardians → Eventually defeat everyone

Simple, focused, and doable.

**Scope for this project (v1):**

For this course, I will implement a compact first chapter of this game:

-   Few combat zones (Temple entrance, corridors, boss chambers)
-   1 boss (Temple Guardian final boss)
-   3–4 enemy types (Shadow Bat swarms, Spirit Boxer enforcers, Temple Guardian boss)
-   Simple progression: Essences → Upgrade ATK or HP

**Nice to have plans (not in unless you think my project is too small):**

-   Multi-zone progression
-   Inventory/equipment systems
-   Complex stat allocation
-   XP/leveling/gold/shop systems
-   More enemy types and deeper story

## 🕹️ Gameplay

The player controls the Shadow Creature (their corrupted spirit form) using keyboard input (WASD for movement, Space for attacking). The Shadow Creature floats instead of walking . Players explore temple zones, encountering various enemies that spawn and chase. Combat is real-time and action-oriented, with the player able to perform basic attacks and dodge.

As enemies are defeated, they drop:

-   **Essences** – consumed to permanently increase ATK or HP

The progression system is simple: collect essences from defeated enemies, then use them to upgrade either your Attack or Health. That's it. No XP, no leveling, no gold, no shops, no equipment. Just essences → upgrade ATK or HP.

Combat involves:

-   Melee attacks
-   Dodge (quick sidestep) for invincibility frames
-   Enemy AI that patrols, chases, and attacks
-   Boss fights with telegraphed attacks and multiple phases

The game is played with keyboard controls. Players can pause the game at any time, and the game auto-saves when returning to the hub or defeating bosses.

**Story & Cutscenes:**

The game features story cutscenes that deliver the narrative between gameplay segments. Cutscenes use:

-   Static background images (full screen) to set the scene
-   Text panel at the bottom displaying dialogue
-   Character names (optional) and dialogue text
-   Space/Enter to advance dialogue
-   ESC to skip (optional)

Cutscenes appear at:

-   Game start (intro cutscene explaining the backstory)
-   Mid-game story moments (when reaching key locations or defeating certain enemies)
-   Victory (ending cutscene after defeating the final boss)

### Direction Handling for Enemies

**Player (Shadow Creature):** Has full 8-directional sprites (N, NE, E, SE, S, SW, W, NW) - perfect for top-down gameplay.

**Enemies without 8 directions:**

-   **Temple Guardian & Spirit Boxer:** These enemies use sprite flipping (horizontal mirror) to face left/right. They automatically face the player's direction using angle calculation:
    -   Calculate angle from enemy to player
    -   If angle is in left half (180° to 360°), flip sprite horizontally
    -   If angle is in right half (0° to 180°), use normal sprite
    -   This creates the illusion of facing the player without needing 8-directional sprites
-   **Shadow Bat:** As a flying enemy, it doesn't need directional sprites. The bat animations work from any angle, and the sprite can be rotated slightly to face movement direction if needed.

This approach allows all enemies to feel responsive and face the player appropriately while working within the sprite limitations.

## 📃 Requirements (Rough Draft)

### Core Systems

-   State machine architecture for game states and entity behaviors
-   Entity system with inheritance hierarchy (GameObject → Entity → Player/Enemy/etc.)
-   Collision detection for player, enemies, pickups, and environment
-   Save/load system using localStorage
-   Win/loss conditions and scoring system

### Game Entities

-   Player character with movement, attack, and dodge mechanics
-   Multiple enemy types with AI behaviors
-   Essence pickups
-   Environmental objects and obstacles

### Visuals & Audio

-   Sprite-based graphics with animations
-   Background music and sound effects
-   UI elements and HUD

### 🤖 State Diagrams

> [!note]
> Remember that you'll need diagrams for not only game states but entity states as well.

#### Global Game State Machine

![Global Game State Machine](./assets/images/Global%20GameStateMachine.png)

The **Global Game State Machine** manages high-level game flow and satisfies the rubric requirement for "state machine to control the state of the game globally."

**Key States:**

-   **TitleScreenState**: Initial menu with "New Game", "Continue", and score display
-   **InstructionsState**: Shows game controls, gameplay mechanics, and objectives - accessible from title screen
-   **CutsceneState**: Story cutscenes with static backgrounds and dialogue panels (intro, mid-game, ending)
-   **PlayState**: Main gameplay - handles map rendering, entity updates, collision detection, map transitions
-   **PauseState**: Overlay menu for pausing, upgrades, saving, and quitting
-   **UpgradeState**: Essence upgrade interface (overlay)
-   **GameOverState**: Triggered when player HP reaches 0, shows retry/quit options
-   **VictoryState**: Triggered when all objectives complete, shows play again/quit options

**Transitions:** States transition based on player actions (Enter key, ESC, button clicks), game events (HP <= 0, all enemies defeated), and story triggers. Map transitions within PlayState use fade tweens for smooth transitions between zones.

---

#### Player State Machine (Shadow Creature)

![Player State Machine](./assets/images/PlayerStateMachine_ShadowCreature.png)

The **Player State Machine** controls the Shadow Creature's behavior and satisfies the rubric requirement for "state machine per game entity."

**States:**

-   **IDLE**: Default state when standing still - player can attack (Space), dodge, or start moving. Uses idle animation (8 directions).
-   **MOVING**: Player is moving with WASD input - uses idle animation (8 directions) since the player floats. Can transition to ATTACKING, DODGING, or return to IDLE when movement stops.
-   **ATTACKING**: Player performs melee attack - attack animation plays, hitbox active, movement disabled. Returns to IDLE when animation completes.
-   **DODGING**: Quick sidestep with invincibility frames - uses dodge animation. Returns to IDLE when animation completes.
-   **HIT**: Brief state when taking damage - invincibility frames active, visual feedback (flash red). Returns to IDLE when invincibility expires, or transitions to DYING if HP <= 0.
-   **DYING**: Death animation plays - triggers GameOverState when complete.

**Transitions:**

-   **IDLE** → **MOVING** when movement input is pressed
-   **IDLE** → **ATTACKING** when Space is pressed
-   **IDLE** → **DODGING** when dodge key is pressed
-   **MOVING** → **IDLE** when movement input stops
-   **MOVING** → **ATTACKING** when Space is pressed (can attack while moving)
-   **MOVING** → **DODGING** when dodge key is pressed
-   **ATTACKING** → **IDLE** when attack animation completes
-   **ATTACKING** → **HIT** if interrupted by damage
-   **DODGING** → **IDLE** when dodge animation completes
-   **DODGING** → **HIT** if interrupted by damage
-   **HIT** → **IDLE** when invincibility timer expires
-   **HIT** → **DYING** if HP <= 0
-   Any state → **DYING** if HP <= 0

The player floats (no walk animation), so both IDLE and MOVING states use the idle animation, with the direction based on movement input.

---

#### Base Enemy State Machine

![Base Enemy State Machine](./assets/images/BaseEnemyStateMachine.png)

The **Base Enemy State Machine** provides the foundation for all enemy AI behaviors. Each enemy type extends this with specific variations.

**States:**

-   **IDLE**: Enemy stands still - uses idle animation (if available). Transitions to CHASE/PATROL when player detected.
-   **PATROL**: Enemy moves along patrol path - uses walk/run animation. Used by Temple Guardian and Spirit Boxer.
-   **CHASE**: Enemy moves toward player - uses walk/run/fly animation depending on enemy type. AI calculates path.
-   **ATTACK**: Enemy performs attack animation - attack hitbox active during specific frames. Movement may continue or stop.
-   **HIT**: Enemy takes damage - brief stun/flash. Transitions back to CHASE/IDLE or DYING if HP <= 0.
-   **DYING**: Death animation plays - enemy removed from game when complete. May drop essence pickup.

**Transitions:** States change based on player detection range, attack range, damage taken, and HP thresholds. Each enemy type overrides specific behaviors (e.g., Shadow Bat doesn't patrol, flies directly to player).

---

#### Shadow Bat State Machine

![Shadow Bat State Machine](./assets/images/BatStateMachine.png)

The **Shadow Bat** uses a simplified state machine optimized for swarm enemy behavior.

**States:**

-   **IDLE**: Uses idle animation - brief pause before flying.
-   **FLY**: Uses fly animation - chases player directly (no patrol). Fast movement.
-   **BITE**: Uses bite animation - attack state. Fast transitions.
-   **HIT**: Uses hit animation - brief stun.
-   **DYING**: Uses death animation - removed when complete.

**Key Differences:** No patrol state (flies directly to player), faster state transitions, simpler AI focused on swarm behavior. The bat doesn't need directional sprites since it's a flying enemy.

---

#### Spirit Boxer State Machine

![Spirit Boxer State Machine](./assets/images/SpiritBoxerStateMachine.png)

The **Spirit Boxer** uses a combo-based attack system with multiple attack states.

**States:**

-   **IDLE**: Uses idle animation - standing ready.
-   **CHASE**: Uses run animation - moves toward player quickly.
-   **ATTACK1**: First attack in combo chain - uses attack1 animation (6 frames).
-   **ATTACK2**: Second attack in combo chain - uses attack2 animation (13 frames, longest).
-   **ATTACK3**: Third attack in combo chain - uses attack3 animation (10 frames).
-   **HIT**: Uses damaged animation - brief stun.
-   **DYING**: Uses death animation - removed when complete.

**Key Features:** Can chain attacks (ATTACK1 → ATTACK2 → ATTACK3) if player is close. **CHASE** uses run animation for fast movement. May have a **CHARGE** state using run animation with increased speed.

---

#### Temple Guardian State Machine

![Temple Guardian State Machine](./assets/images/TempleGuardianStateMachine.png)

The **Temple Guardian** (boss) uses the most complex state machine with multiple attack types and phase-based behavior.

**States:**

-   **IDLE**: Standing ready - may have idle animation.
-   **PATROL**: Uses walk animation - moves along patrol path before detecting player.
-   **CHASE**: Uses walk animation - moves toward player (heavy, deliberate movement).
-   **ATTACK1**: Uses attack1 animation - light attack with VFX.
-   **ATTACK2**: Uses attack2 animation - heavier attack with VFX.
-   **SPECIAL**: Uses special animation - telegraphed boss attack with VFX. High damage.
-   **HIT**: Uses hit animation - brief stun when taking damage.
-   **DYING**: Uses death animation - removed when complete.

**Key Features:** Multiple attack types (ATTACK1, ATTACK2, SPECIAL) for varied boss behavior. May have phases (HP thresholds trigger different behaviors). **PATROL/CHASE** uses walk animation for heavy, deliberate movement. **SPECIAL** attacks are telegraphed for player reaction time.

### 🗺️ Class Diagram

![Class Diagram](./assets/images/ClassDiagram.png)

The class diagram illustrates the inheritance hierarchy: GameObject (base) → Entity (adds health, hitbox, movement) → Player/Enemy/Pickup/Projectile/EnvironmentalObject. The EnemyFactory pattern is shown, along with the StateMachine and Animation systems.

### 🧵 Wireframes

> [!note]
> Your wireframes don't have to be super polished. They can even be black/white and hand drawn. I'm just looking for a rough idea about what you're visualizing.

![Main Menu](./assets/images/Main-Menu.png)

-   _New Game_ will start a fresh playthrough, resetting all progress.
-   _Continue_ will load the saved game state from localStorage.
-   _Best Echo Score_ will be displayed prominently on the title screen.

The title screen will feature the game's title in a stylized sci-fi font, with a dark, atmospheric background suggesting the alien planet setting.

![Game Board](./assets/images/Game-Board.png)

The gameplay screen will feature:

-   Top-left HUD showing player HP bar
-   Player character in the center, controlled via WASD movement
-   Enemies spawning and patrolling the zone
-   Essence pickups appearing on the ground when enemies die
-   Environment objects (rocks, wreckage) providing collision and visual interest
-   Pause menu accessible via ESC key

A simple upgrade screen (accessible from pause or between zones) will allow players to:

-   Use collected essences to upgrade ATK or HP
-   View current stats

### 🎨 Assets

We used [app.diagrams.net](https://app.diagrams.net/) to create the wireframes. Wireframes are the equivalent to the skeleton of a web app since they are used to describe the functionality of the product and the users experience.

The visual style will be dark and atmospheric, with a dark fantasy/horror aesthetic. The game draws inspiration from top-down action RPGs like _Enter the Gungeon_, _Hades_, and _Risk of Rain_, focusing on clear visual feedback for combat and readable UI elements. The mood is somber and emotional, reflecting the story of a lost warrior trying to reclaim their humanity.

#### 🖼️ Images

Sprites will be created or sourced for:

-   **Player:** Shadow Creature (8 directions: idle, attack, death animations)
-   **Enemies:**
    -   Shadow Bat (swarm enemy - idle, fly, bite, hit, death)
    -   Spirit Boxer (combat enforcer - idle, attack combo chain, run, damaged, death)
    -   Temple Guardian (mini-boss - walk, attack 1, attack 2, special, hit, death)
-   Pickups: essence orbs
-   Environment: terrain tiles, temple structures, dark atmospheric elements
-   UI elements: HP bar, buttons, simple upgrade interface
-   Cutscenes: static background images for story scenes, text panel UI for dialogue

**Note:** The Shadow Creature (player) is the only sprite with full 8-directional support. Other enemies use sprite flipping and angle-based facing to work in a top-down view.

#### 👥 Character Design & Lore

**Player: Shadow Creature**

-   **Lore:** Your corrupted spirit form - once a legendary warrior, now a drifting shadow
-   **Visual:** Messy, smoky silhouette with glowing eye (last memory)
-   **Movement:** Floating, unpredictable (fits the broken spirit theme)
-   **Abilities:** 8-directional movement, basic attacks, dodge
-   **Role:** The player character

**Shadow Bat (Swarm Enemy)**

-   **Lore:** Failed souls who tried to reclaim their bodies but lost themselves completely
-   **Visual:** Small, flying creature
-   **Movement:** Swarms, screeches, acts as common enemy
-   **Combat:** Fast, dies quickly, attacks in groups
-   **Role:** Common enemy type

**Spirit Boxer (Combat Enforcer)**

-   **Lore:** Manifestation of your lost physical strength
-   **Visual:** Humanoid fighter
-   **Movement:** Combo punches, charge dash, ground slam
-   **Combat:** Medium difficulty, combo-based attacks
-   **Role:** Mid-tier enemy/boss

**Temple Guardian (Mini-Boss #1)**

-   **Lore:** Once your comrade - a knight who swore to protect your body after the ritual. Went insane trying to protect something that no longer exists
-   **Visual:** Rigid, armored, ancient mystical
-   **Movement:** Heavy, deliberate, slow sweeping sword strikes
-   **Combat:** High damage, telegraphed attacks, first major boss
-   **Role:** First big boss encounter

#### ✏️ Fonts

The game will use two distinct fonts:

-   **Title/Headings:** A stylized sci-fi or alien-themed font for the game title, "VICTORY", "GAME OVER", and major UI headings. Examples:

    -   [Orbitron](https://fonts.google.com/specimen/Orbitron) (Google Fonts)
    -   [Exo 2](https://fonts.google.com/specimen/Exo+2) (Google Fonts)
    -   Custom pixel/retro sci-fi fonts from [dafont.com](https://www.dafont.com/)

-   **Body/HUD:** A clean, readable sans-serif font for in-game HUD, menus, tooltips, and dialog. Examples:
    -   [Roboto](https://fonts.google.com/specimen/Roboto) (Google Fonts)
    -   [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts)

#### 🔊 Sounds

All sounds will be sourced from free sound libraries with appropriate licensing:

**Background Music:**

-   Ambient, atmospheric track for Title/Hub area
-   Tension-building track for Crash Site zone
-   Intense, boss-fight music for Core Echo encounter

**Sound Effects:**

-   Player attack (melee swing)
-   Enemy hit/death sounds
-   Player hurt/low HP warning
-   Essence pickup collection
-   Menu click/confirm/back
-   Dodge sound
-   Boss attack telegraphs
-   Cutscene text advance sound (optional)

Potential sources:

-   [freesound.org](https://freesound.org/) (with appropriate Creative Commons licensing)
-   [OpenGameArt.org](https://opengameart.org/) audio section
-   [Incompetech](https://incompetech.com/music/) for background music (Kevin MacLeod)

### 📚 References

-   Top-down action RPG design patterns and game feel
-   State machine architecture for game development
-   HTML5 Canvas game development best practices
-   LocalStorage API for game save/load functionality
