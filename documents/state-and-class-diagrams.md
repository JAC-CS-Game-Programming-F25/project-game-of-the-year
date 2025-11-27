# State Diagrams and Class Diagrams - Detailed Specifications

## 🤖 State Diagrams

### Global Game State Machine

The game uses a **StateMachine** to manage high-level game flow. This satisfies the rubric requirement for "state machine to control the state of the game globally."

#### States:

1. **TitleScreenState**

    - Initial state when game loads
    - Displays game title, "New Game", "Continue", and "Best Echo Score"
    - Transitions:
        - `New Game` → **CutsceneState** (intro cutscene) or **PlayState** (skip cutscene)
        - `Continue` → **PlayState** (loads from localStorage)
        - `ESC` → stays in TitleScreenState

2. **CutsceneState**

    - Story cutscenes with static background and text panel
    - Shows background image (static)
    - Displays text panel at bottom with dialogue
    - Transitions:
        - `Space/Enter pressed` → Next dialogue line or next cutscene
        - `Cutscene complete` → **PlayState** (or next cutscene in sequence)
        - `ESC` → Skip to **PlayState** (optional)
    - **Implementation:**
        - Array of cutscene data: `{ background: 'path/to/image', dialogues: ['text1', 'text2', ...] }`
        - Current dialogue index tracks which line is showing
        - Text panel renders at bottom with character name (optional) and dialogue text

3. **PlayState**

    - Main gameplay state
    - Manages map rendering, entity updates, collision detection
    - Transitions:
        - `Player HP <= 0` → **GameOverState**
        - `All enemies defeated + Boss defeated` → **CutsceneState** (victory cutscene) → **VictoryState**
        - `Story trigger reached` → **CutsceneState** (mid-game cutscene) → **PlayState**
        - `ESC` → **PauseState** (pushed onto stack)
        - `Map transition trigger` → **PlayState** (switches to new map)

4. **PauseState**

    - Overlay state (pushed onto state stack)
    - Pauses game logic but keeps rendering
    - Shows pause menu with options:
        - Resume
        - Upgrade Menu (use essences)
        - Save Game
        - Quit to Title
    - Transitions:
        - `Resume` → pops back to **PlayState**
        - `Quit to Title` → **TitleScreenState**
        - `Upgrade Menu` → **UpgradeState** (pushed onto stack)

5. **UpgradeState**

    - Overlay state for essence upgrades
    - Shows current ATK/HP stats
    - Allows spending essences to upgrade
    - Transitions:
        - `Back` → pops back to **PauseState** or **PlayState**

6. **GameOverState**

    - Triggered when player dies
    - Displays "GAME OVER" and final score
    - Shows "Retry" and "Quit to Title" options
    - Transitions:
        - `Retry` → **PlayState** (resets to last save or start)
        - `Quit to Title` → **TitleScreenState**

7. **CutsceneState**

    - Story cutscenes with static background and text panel
    - Shows background image (static, full screen)
    - Displays text panel at bottom (semi-transparent, with border)
    - Text panel contains:
        - Character name (optional, top of panel)
        - Dialogue text (main content)
        - "Press Space to continue" indicator
    - Manages cutscene sequence (array of cutscenes)
    - Transitions:
        - `Space/Enter pressed` → Next dialogue line
        - `All dialogues shown` → Next cutscene in sequence or **PlayState**
        - `ESC` → Skip to **PlayState** (optional)
    - **Implementation Details:**
        ```javascript
        CutsceneState {
            cutscenes: [
                {
                    background: 'path/to/background.png',
                    dialogues: [
                        { speaker: 'Narrator', text: 'You were once a legendary warrior...' },
                        { speaker: 'Narrator', text: 'But the ritual changed everything...' }
                    ]
                },
                // More cutscenes...
            ],
            currentCutsceneIndex: 0,
            currentDialogueIndex: 0
        }
        ```

8. **VictoryState**
    - Triggered when all objectives complete
    - Displays "VICTORY" and final score
    - Shows "Play Again" and "Quit to Title" options
    - Transitions:
        - `Play Again` → **PlayState** (new game)
        - `Quit to Title` → **TitleScreenState**

#### State Transitions Diagram:

```
[Start] → TitleScreenState
    ↓
    ├─ "New Game" → CutsceneState (intro) → PlayState
    └─ "Continue" → PlayState (loads save)

CutsceneState
    ↓
    ├─ Space/Enter → Next dialogue or next cutscene
    ├─ Cutscene complete → PlayState
    └─ ESC → PlayState (skip)

PlayState
    ↓
    ├─ Player HP <= 0 → GameOverState
    ├─ All enemies defeated → VictoryState
    ├─ ESC → PauseState (push)
    └─ Map transition → PlayState (new map)

PauseState (overlay)
    ↓
    ├─ Resume → PlayState (pop)
    ├─ Upgrade Menu → UpgradeState (push)
    ├─ Save Game → (saves, stays in PauseState)
    └─ Quit to Title → TitleScreenState

UpgradeState (overlay)
    ↓
    └─ Back → PauseState/PlayState (pop)

GameOverState
    ↓
    ├─ Retry → PlayState
    └─ Quit to Title → TitleScreenState

CutsceneState
    ↓
    ├─ Space/Enter → Next dialogue
    ├─ All dialogues done → Next cutscene or PlayState
    └─ ESC → PlayState (skip)

VictoryState
    ↓
    ├─ Play Again → PlayState
    └─ Quit to Title → TitleScreenState
```

---

### Entity-Level State Machines

Each game entity has its own state machine. This satisfies the rubric requirement for "state machine per game entity."

#### Player State Machine

**Important:** States should match available animations. The Shadow Creature (player) has:

-   **Idle** (8 directions) - floating idle animation
-   **Attack** (8 directions) - attack animation
-   **Death** - death animation

**Note:** Player floats (no walk/run animation), so movement happens in NORMAL state using idle animation.

**States:**

1. **NORMAL** (uses Idle animation)

    - Default state
    - Player can move (WASD) - movement uses idle animation
    - Player can attack (Space), dodge
    - Transitions:
        - `Space pressed` → **ATTACKING**
        - `Dodge key pressed` → **DODGING**
        - `Taking damage` → **HIT** (brief invincibility)

2. **ATTACKING**

    - Player performs melee attack
    - Attack animation plays
    - Attack hitbox active during specific frames
    - Movement disabled during attack
    - Transitions:
        - `Attack animation complete` → **NORMAL**
        - `Taking damage` → **HIT** (interrupts attack)

3. **DODGING**

    - Quick sidestep movement
    - Invincibility frames active
    - Movement in dodge direction
    - Transitions:
        - `Dodge animation complete` → **NORMAL**
        - `Dodge interrupted by damage` → **HIT**

4. **HIT**

    - Brief state when taking damage
    - Invincibility frames
    - Visual feedback (flash red)
    - Transitions:
        - `Invincibility timer expires` → **NORMAL**
        - `HP <= 0` → **DYING** (triggers GameOverState)

5. **DYING**
    - Death animation plays
    - Player cannot act
    - Transitions:
        - `Death animation complete` → (triggers GameOverState globally)

**Player State Diagram:**

```
[NORMAL]
    ↓
    ├─ Space → [ATTACKING] → (animation done) → [NORMAL]
    ├─ Dodge key → [DODGING] → (animation done) → [NORMAL]
    ├─ Take damage → [HIT] → (i-frames done) → [NORMAL]
    └─ HP <= 0 → [DYING] → (triggers GameOver)
```

---

#### Enemy State Machine (Base - used by all enemies)

**Important:** States should match available animations. Different enemies have different animations:

-   **Temple Guardian:** walk, attack1, attack2, special, hit, death
-   **Spirit Boxer:** idle, run, attack1, attack2, attack3, damaged, death
-   **Shadow Bat:** idle, idle-to-fly, fly, bite, hit, death

**States:**

1. **IDLE**

    - Enemy stands still
    - Uses idle animation (if available)
    - Transitions:
        - `Player detected in range` → **CHASE** or **PATROL** (depending on enemy type)
        - `Patrol timer expires` → **PATROL**

2. **PATROL** (uses Walk/Run animation if available)

    - Enemy moves along patrol path
    - Uses walk animation (Temple Guardian) or run animation (Spirit Boxer)
    - Used by Temple Guardian and Spirit Boxer
    - Transitions:
        - `Player detected` → **CHASE**
        - `Reached patrol point` → **IDLE**
        - `Patrol timer expires` → **IDLE**

3. **CHASE** (uses Walk/Run/Fly animation)

    - Enemy moves toward player
    - Uses walk/run/fly animation depending on enemy type
    - AI calculates path to player
    - Transitions:
        - `Player in attack range` → **ATTACK**
        - `Player out of detection range` → **IDLE** or **PATROL**
        - `Player too far` → **IDLE**

4. **ATTACK**

    - Enemy performs attack animation
    - Attack hitbox active during specific frames
    - Movement may continue (for some enemies) or stop
    - Transitions:
        - `Attack animation complete` → **CHASE** or **IDLE**
        - `Taking damage` → **HIT**

5. **HIT**

    - Enemy takes damage
    - Brief stun/flash
    - Transitions:
        - `Stun timer expires` → **CHASE** or **IDLE**
        - `HP <= 0` → **DYING**

6. **DYING**
    - Death animation plays
    - Enemy cannot act
    - May drop essence pickup
    - Transitions:
        - `Death animation complete` → (entity removed from game)

**Enemy State Diagram:**

```
[IDLE]
    ↓
    ├─ Player detected → [CHASE]
    └─ Patrol timer → [PATROL]

[PATROL]
    ↓
    ├─ Player detected → [CHASE]
    └─ Reached point → [IDLE]

[CHASE]
    ↓
    ├─ Player in range → [ATTACK]
    └─ Player lost → [IDLE] or [PATROL]

[ATTACK]
    ↓
    ├─ Animation done → [CHASE] or [IDLE]
    └─ Take damage → [HIT]

[HIT]
    ↓
    ├─ Stun done → [CHASE] or [IDLE]
    └─ HP <= 0 → [DYING]

[DYING]
    ↓
    └─ Animation done → (removed)
```

---

#### Enemy-Specific State Variations

**Shadow Bat (Swarm Enemy):**

-   Animations: idle, idle-to-fly, fly, bite, hit, death
-   State machine: **IDLE** → **FLY** → **BITE** → **DYING**
-   **IDLE** uses idle animation
-   **FLY** uses fly animation (chasing player)
-   **BITE** uses bite animation (attack)
-   No patrol (flies directly to player)
-   Fast transitions

**Spirit Boxer (Combat Enforcer):**

-   Animations: idle, run, attack1, attack2, attack3, damaged, death
-   Has combo states: **ATTACK1** → **ATTACK2** → **ATTACK3**
-   **CHASE** uses run animation
-   Can chain attacks if player is close
-   **CHARGE** state could use run animation with increased speed

**Temple Guardian (Boss):**

-   Animations: walk, attack1, attack2, special, hit, death
-   More complex: **IDLE** → **PATROL** → **CHASE** → **ATTACK1/ATTACK2/SPECIAL**
-   **PATROL/CHASE** uses walk animation
-   **ATTACK1** uses attack1 animation
-   **ATTACK2** uses attack2 animation
-   **SPECIAL** state uses special animation for telegraphed boss attacks
-   May have phases (HP thresholds trigger different behaviors)

---

### State-to-Animation Mapping Guidelines

**Key Principle:** Each state should use the appropriate animation that exists in the sprite sheets.

**Player (Shadow Creature):**

-   `NORMAL` state → Idle animation (8 directions, based on movement direction)
-   `ATTACKING` state → Attack animation (8 directions)
-   `DYING` state → Death animation

**Enemies:**

-   `IDLE` state → Idle animation (if available, otherwise static)
-   `PATROL/CHASE` state → Walk/Run/Fly animation (matches enemy type)
-   `ATTACK` state → Attack animation(s)
-   `HIT` state → Hit/Damaged animation
-   `DYING` state → Death animation

**Important:** If an enemy doesn't have a walk animation, use idle animation during movement. The state machine controls behavior, while animations provide visual feedback.

---

## 🗺️ Class Diagram

### Inheritance Hierarchy

The class diagram demonstrates **Inheritance & Polymorphism** (4 points) and **Game Entities** (3 points).

#### Base Classes:

**1. GameObject (Abstract Base Class)**

```javascript
GameObject
├─ x, y (position)
├─ width, height (dimensions)
├─ render(context)
└─ update(dt)
```

-   Base class for all game objects
-   Provides basic position and rendering interface
-   Abstract methods: `render()`, `update()`

**2. Entity extends GameObject**

```javascript
Entity extends GameObject
├─ hp, maxHp (health)
├─ hitbox (collision rectangle)
├─ stateMachine (EntityStateMachine)
├─ animation (Animation)
├─ sprite (Sprite)
├─ direction (enum: Direction)
├─ speed (movement speed)
├─ takeDamage(amount)
├─ isAlive()
└─ update(dt)
```

-   Adds health, hitbox, state machine, animation
-   Base for all living entities
-   Handles damage, death, state transitions

**3. Collidable extends GameObject**

```javascript
Collidable extends GameObject
├─ hitbox (collision rectangle)
├─ isCollidingWith(other)
└─ getCollisionBounds()
```

-   Base for objects that participate in collision
-   Used by entities, pickups, projectiles, environment

---

#### Entity Subclasses (Polymorphism):

**4. Player extends Entity**

```javascript
Player extends Entity
├─ attackDamage
├─ attackRange
├─ dodgeSpeed
├─ dodgeDuration
├─ invincibilityTimer
├─ essences (collected)
├─ attack()
├─ dodge()
├─ collectEssence(essence)
└─ update(dt)
```

-   Player-specific stats and abilities
-   Manages essence collection
-   Handles attack and dodge mechanics

**5. Enemy extends Entity**

```javascript
Enemy extends Entity
├─ attackDamage
├─ attackRange
├─ detectionRange
├─ patrolPath (array of points)
├─ target (Player reference)
├─ attack()
├─ chase()
├─ patrol()
└─ update(dt)
```

-   Base enemy class with AI behaviors
-   Detection and pathfinding logic
-   Abstract methods for enemy-specific behavior

**6. ShadowBat extends Enemy**

```javascript
ShadowBat extends Enemy
├─ flySpeed (faster than base)
├─ swarmBehavior()
└─ update(dt)
```

-   Fast, swarm enemy
-   Overrides movement for flying behavior

**7. SpiritBoxer extends Enemy**

```javascript
SpiritBoxer extends Enemy
├─ comboChain (array)
├─ chargeSpeed
├─ comboAttack()
├─ chargeDash()
└─ update(dt)
```

-   Combo-based attacks
-   Charge dash ability

**8. TempleGuardian extends Enemy**

```javascript
TempleGuardian extends Enemy
├─ phase (boss phase enum)
├─ attack1(), attack2(), specialAttack()
├─ telegraphAttack()
└─ update(dt)
```

-   Boss enemy with multiple attack types
-   Phase-based behavior

---

#### Non-Entity Game Objects:

**9. EssencePickup extends GameObject implements Collidable**

```javascript
EssencePickup extends GameObject
├─ value (essence amount)
├─ animation (glowing animation)
├─ collect()
└─ update(dt)
```

-   Collectible item dropped by enemies
-   Animated visual effect

**10. EnvironmentalObject extends GameObject implements Collidable**

```javascript
EnvironmentalObject extends GameObject
├─ isSolid (collision flag)
├─ sprite
└─ render(context)
```

-   Static objects (rocks, walls, decorations)
-   Provides collision boundaries

---

#### System Classes:

**12. StateMachine**

```javascript
StateMachine
├─ states (object)
├─ currentState
├─ add(stateName, state)
├─ change(stateName, params)
├─ update(dt)
└─ render(context)
```

-   Manages state transitions
-   Used by game and entities

**13. EntityStateMachine extends StateMachine**

```javascript
EntityStateMachine extends StateMachine
├─ entity (reference to owner)
├─ previousState
└─ canTransition(from, to)
```

-   Entity-specific state machine
-   Validates state transitions

**14. Animation**

```javascript
Animation
├─ frames (array)
├─ interval (time per frame)
├─ currentFrame
├─ timer
├─ update(dt)
└─ getCurrentFrame()
```

-   Handles sprite sheet animation
-   Used by entities for visual feedback

**15. Sprite**

```javascript
Sprite
├─ image (Graphic)
├─ frameWidth, frameHeight
├─ frames (array of frame data)
├─ getFrame(frameIndex)
└─ render(context, x, y, frame)
```

-   Extracts frames from sprite sheets
-   Renders specific animation frames

**16. MapManager**

```javascript
MapManager
├─ currentMap (Map)
├─ maps (object of Map instances)
├─ transitionPoints (array)
├─ loadMap(mapName)
├─ checkTransitions(player)
└─ render(context)
```

-   Manages multiple maps
-   Handles map transitions
-   Renders current map

**17. Map**

```javascript
Map
├─ width, height (tile dimensions)
├─ tileSize
├─ layers (array of Layer)
├─ collisionLayer (Layer)
├─ animatedTiles (array)
├─ loadFromTMX(path)
├─ isValidTile(x, y)
├─ getTileAt(x, y)
└─ render(context, camera)
```

-   Represents a Tiled map
-   Handles tile rendering and collision
-   Manages animated tiles

**18. CollisionManager**

```javascript
CollisionManager
├─ entities (array of Entity)
├─ pickups (array of EssencePickup)
├─ environment (array of EnvironmentalObject)
├─ checkCollisions()
├─ entityVsEntity(entity1, entity2)
├─ entityVsPickup(entity, pickup)
└─ entityVsEnvironment(entity, env)
```

-   Centralized collision detection
-   Handles all collision types
-   Used polymorphically with Entity array

**19. SaveManager**

```javascript
SaveManager
├─ saveGame(gameState)
├─ loadGame()
├─ saveToLocalStorage(data)
├─ loadFromLocalStorage()
└─ hasSave()
```

-   Handles persistence (localStorage)
-   Saves/loads entire game state including:
    -   Player position (tile coordinates), HP, ATK, essence count
    -   Current map name and map progress
    -   Enemy states (which enemies are defeated/spawned)
    -   Pickup states (which essences have been collected)
    -   Game state flags (boss defeated, cutscenes viewed, etc.)
-   Players can save manually via pause menu at any time
-   Auto-saves occur when defeating bosses
-   Allows players to close browser tab and resume exactly where they saved

**20. EnemyFactory**

```javascript
EnemyFactory
├─ createEnemy(type, x, y)
├─ createShadowBat(x, y)
├─ createSpiritBoxer(x, y)
├─ createTempleGuardian(x, y)
└─ getEnemyConfig(type)
```

-   **Factory Design Pattern** (1 point)
-   Creates enemy instances based on type
-   Centralizes enemy creation logic

---

#### Utility Classes:

**21. Input**

```javascript
Input
├─ keys (object)
├─ isKeyPressed(key)
├─ isKeyHeld(key)
└─ update()
```

-   Handles keyboard input
-   Provides key state checking

**22. Camera**

```javascript
Camera
├─ x, y (position)
├─ target (Entity to follow)
├─ bounds (map boundaries)
├─ update(dt)
└─ applyTransform(context)
```

-   Manages viewport
-   Follows player
-   Handles map boundaries

**23. CutsceneState extends State**

```javascript
CutsceneState extends State
├─ cutscenes (array of cutscene data)
├─ currentCutsceneIndex
├─ currentDialogueIndex
├─ backgroundImage (Graphic)
├─ textPanel (UI element)
├─ loadCutscene(cutsceneIndex)
├─ nextDialogue()
├─ skipCutscene()
└─ render(context)
```

-   Manages story cutscenes
-   Renders static background and text panel
-   Handles dialogue progression

**Note on Tweens:** Tweens are handled by the `Timer.js` library class, which provides a `tween()` method for interpolating values over time. Used for smooth direction transitions, UI animations, and map transitions. No separate Tween class needed.

---

### Polymorphism Example

The rubric requires "polymorphically iterating through objects and calling methods on objects of the same type."

**Example in PlayState:**

```javascript
// Array of Entity references (Player, Enemy subclasses)
this.entities = [player, shadowBat1, shadowBat2, spiritBoxer, templeGuardian];

// Polymorphic update loop
update(dt) {
    // All entities share the same interface (Entity.update)
    this.entities.forEach(entity => {
        entity.update(dt); // Calls Player.update() or Enemy.update() or subclass
    });

    // Polymorphic collision checking
    this.collisionManager.checkCollisions(this.entities);
}

// Polymorphic rendering
render(context) {
    this.entities.forEach(entity => {
        entity.render(context); // Each entity renders differently
    });
}
```

---

### Enums (1 point)

**Direction.js:**

```javascript
const Direction = {
    N: 0,
    NE: 1,
    E: 2,
    SE: 3,
    S: 4,
    SW: 5,
    W: 6,
    NW: 7,
};
```

**EntityState.js:**

```javascript
const EntityState = {
    IDLE: "idle",
    PATROL: "patrol",
    CHASE: "chase",
    ATTACK: "attack",
    HIT: "hit",
    DYING: "dying",
};
```

**PlayerState.js:**

```javascript
const PlayerState = {
    NORMAL: "normal",
    ATTACKING: "attacking",
    DODGING: "dodging",
    HIT: "hit",
    DYING: "dying",
};
```

**GameStateName.js:**

```javascript
const GameStateName = {
    TitleScreen: "title-screen",
    Play: "play",
    Pause: "pause",
    Upgrade: "upgrade",
    Cutscene: "cutscene",
    GameOver: "game-over",
    Victory: "victory",
};
```

**EnemyType.js:**

```javascript
const EnemyType = {
    ShadowBat: "shadow-bat",
    SpiritBoxer: "spirit-boxer",
    TempleGuardian: "temple-guardian",
};
```

---

## Summary of Rubric Coverage

✅ **State Machines (2 points):** Global (StateMachine for game states) + Per Entity (EntityStateMachine)

✅ **Inheritance & Polymorphism (4 points):** GameObject → Entity → Player/Enemy → Enemy subclasses. Polymorphic iteration in PlayState.

✅ **Factory Design Pattern (1 point):** EnemyFactory creates enemy instances.

✅ **Enums (1 point):** Direction, EntityState, PlayerState, GameStateName, EnemyType.

✅ **Game Entities (3 points):** Player, Enemy, EssencePickup, Projectile, EnvironmentalObject.

✅ **Collision Detection (3 points):** CollisionManager handles entity-entity, entity-pickup, entity-environment.

✅ **Persistence (4 points):** SaveManager saves/loads entire game state (HP, essences, map, progress).

✅ **Win & Loss Conditions (2 points):** VictoryState (all enemies defeated) + GameOverState (player HP <= 0).

✅ **Score/Points (1 point):** Essence collection system (essences = score/currency).

✅ **Sprites (3 points):** All entities use Sprite class with sprite sheets.

✅ **Animations (2 points):** Animation class cycles through sprite sheet frames.

✅ **Tweens (2 points):** Timer.js `tween()` method for smooth direction transitions, UI animations, map transitions.

✅ **Sounds & Music (1 point):** Sound system (not detailed in class diagram but part of system).

✅ **Fonts (1 point):** Font system for title/body text (not detailed in class diagram but part of system).
