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

**Genre:** Top-down action RPG / "MMO-style grinder" with eerie exploration and character builds.

**Core fantasy:**

The player is a lone survivor who crash-lands on a mysterious alien planet. By fighting creatures, collecting loot, and absorbing monster essences, they grow stronger and shape their build (Strength/Dexterity/Insight/Affinity). The planet's sentient "Echo" watches and reacts. The long-term goal is to progress through increasingly dangerous zones, defeat the Echo at the planet's core, and "finish a run" with a chosen playstyle.

**Core loop:**

Explore a zone → Fight enemies → Gain XP + loot + essences → Upgrade stats, gear, skills → Unlock the next area → Eventually fight the final boss.

This lets me build a highly replayable grinder while still integrating story, builds, and a clear win condition.

**Scope for this project (v1):**

For this course, I will implement a compact first chapter of this game:

-   1 main combat zone (Crash Site) + 1 small hub area
-   1 mini-boss + 1 final boss for this "chapter"
-   3–4 enemy types
-   A small set of weapons/armor/essences (not a full loot system)
-   A simple skill/talent system (a few nodes, not full trees)

Future zones, more enemies, deeper story, and New Game+ are planned as extensions, not required for this project.

## 🕹️ Gameplay

The player controls their character using keyboard input (WASD for movement, mouse for aiming/attacking). They explore the Crash Site zone, encountering various enemies that spawn and chase the player. Combat is real-time and action-oriented, with the player able to perform basic attacks, dodge rolls, and eventually unlock abilities.

As enemies are defeated, they drop:

-   **Gold** – currency for upgrades
-   **Essences** – consumed to permanently increase stats
-   **Equipment** – weapons, armor, and trinkets that modify combat effectiveness

The player can return to the hub area to:

-   Upgrade stats using essences
-   Purchase/equip new gear
-   Save progress
-   Access the next zone (once unlocked)

The game features a progression system where defeating enemies grants XP, and leveling up allows the player to allocate points to Strength, Dexterity, Insight, or Vitality. Different builds (e.g., high Strength for melee, high Dexterity for ranged/crit builds) create varied playstyles.

Combat involves:

-   Melee or ranged attacks (depending on equipped weapon)
-   Dodge rolling for invincibility frames
-   Enemy AI that patrols, chases, and attacks
-   Boss fights with telegraphed attacks and multiple phases

The game is played with keyboard and mouse controls. Players can pause the game at any time, and the game auto-saves when returning to the hub or defeating bosses.

## 📃 Requirements

### 1. High-Level Architecture & Design Patterns

1. The system shall use a global state machine for game states (TitleScreen, Play, Pause, GameOver, Victory).
2. The system shall use per-entity state machines for enemies (IDLE, PATROL, CHASE, ATTACK, DYING) and player (NORMAL, ATTACKING, ROLLING).
3. The system shall implement an inheritance hierarchy: GameObject → Entity → Player/Enemy/Pickup/Projectile.
4. The system shall use polymorphism in the main game loop to update and render all entities.
5. The system shall use an EnemyFactory to spawn enemies based on type and level parameters.
6. The system shall use enums for GameStateName, EnemyType, Rarity, Direction, DamageType, and StatType (no magic numbers/strings).

### 2. Game Entities & Collision

7. The system shall implement Player, Enemy (with subtypes), Pickup, Projectile, and EnvironmentalObject entities.
8. The system shall detect collision between player and environment (walls, obstacles).
9. The system shall detect collision between player and enemies (contact damage, attack hitboxes).
10. The system shall detect collision between player and pickups (auto-collection).
11. The system shall detect collision between player attacks and enemies (damage application).
12. The system shall detect collision between projectiles and enemies/environment (impact handling).

### 3. Persistence

13. The system shall save player data (level, XP, stats, HP, equipped items) to localStorage.
14. The system shall save game progress (boss defeat flags, zone unlocks) to localStorage.
15. The system shall auto-save when returning to hub or defeating bosses.
16. The system shall provide "New Game" and "Continue" options on the title screen.
17. The system shall load saved state when selecting "Continue".

### 4. Win/Loss Conditions & Scoring

18. The system shall transition to GameOverState when player HP reaches 0.
19. The system shall display stats summary (time survived, enemies defeated, Echo Score) in GameOverState.
20. The system shall transition to VictoryState when the Core Echo boss is defeated.
21. The system shall track Echo Score based on enemies killed, bosses defeated, and rare items obtained.
22. The system shall save and display best Echo Score on the title screen.

### 5. Visuals & Audio

23. The system shall use sprite sheets for player, enemies, pickups, and environment.
24. The system shall implement animations using Animation.js for player (idle, walk, attack, roll) and enemies (idle, move, attack, death).
25. The system shall use tweens for screen transitions, camera shake, HP bar interpolation, and floating damage numbers.
26. The system shall include background music for Title/Hub, Crash Site zone, and boss fight.
27. The system shall include sound effects for player attack, enemy hit/death, player hurt, pickup collection, and menu interactions.
28. The system shall use at least two fonts: a stylized sci-fi font for titles and a clean readable font for HUD/menus.

### 🤖 State Diagram

> [!note]
> Remember that you'll need diagrams for not only game states but entity states as well.

![State Diagram](./assets/images/StateDiagram.png)

The state diagram shows the global game state machine with transitions between TitleScreen, Play, Pause, GameOver, and Victory states. Additionally, entity-level state machines are shown for Player (NORMAL, ATTACKING, ROLLING) and Enemy (IDLE, PATROL, CHASE, ATTACK, DYING).

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

-   Top-left HUD showing player HP bar, XP bar, current level, and Echo Score
-   Player character in the center, controlled via WASD movement
-   Enemies spawning and patrolling the zone
-   Pickups (gold, essences, items) appearing on the ground when enemies die
-   Environment objects (rocks, wreckage) providing collision and visual interest
-   Mini-map or zone indicator showing current area
-   Pause menu accessible via ESC key

The hub area will have:

-   Stat upgrade interface (allocate points to Strength/Dexterity/Insight/Vitality)
-   Equipment/inventory screen
-   Zone selection (Crash Site unlocked initially)
-   Save point indicator

### 🎨 Assets

We used [app.diagrams.net](https://app.diagrams.net/) to create the wireframes. Wireframes are the equivalent to the skeleton of a web app since they are used to describe the functionality of the product and the users experience.

The visual style will be dark and atmospheric, with a sci-fi/alien aesthetic. The game draws inspiration from top-down action RPGs like _Enter the Gungeon_, _Hades_, and _Risk of Rain_, focusing on clear visual feedback for combat and readable UI elements.

#### 🖼️ Images

Sprites will be created or sourced for:

-   Player character (idle, walk, attack, roll animations)
-   Enemy types: Gloomling, Scrap Hound, Mini-Boss, Core Echo Boss
-   Pickups: gold coins, essence orbs, equipment items
-   Environment: terrain tiles, rocks, crashed ship wreckage
-   UI elements: HP/XP bars, buttons, icons

Potential sources:

-   Custom pixel art sprites
-   Free sprite resources from [OpenGameArt.org](https://opengameart.org/)
-   Sci-fi asset packs with appropriate licensing

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

-   Player attack (melee swing or ranged shot)
-   Enemy hit/death sounds
-   Player hurt/low HP warning
-   Pickup collection (coin, essence, item)
-   Menu click/confirm/back
-   Dodge roll sound
-   Boss attack telegraphs

Potential sources:

-   [freesound.org](https://freesound.org/) (with appropriate Creative Commons licensing)
-   [OpenGameArt.org](https://opengameart.org/) audio section
-   [Incompetech](https://incompetech.com/music/) for background music (Kevin MacLeod)

### 📚 References

-   Top-down action RPG design patterns and game feel
-   State machine architecture for game development
-   HTML5 Canvas game development best practices
-   LocalStorage API for game save/load functionality
