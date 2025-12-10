# 🎯 ECHOES OF THE FALLEN STAR - Development Task Plan

**Current Branch:** `main`
**Current Score:** ~23.5/32 points (Rubric Maximum)
**Target Score:** 32/32 points + Adherence to Proposal (2 pts)

---

## ✅ COMPLETED FEATURES (Main Branch)

### Architecture & Core Systems
- ✅ Enums (Direction, PlayerState, EntityState, GameStateName, EnemyType)
- ✅ Base Classes (GameObject, Entity, GameEntity)
- ✅ State Machine pattern (StateMachine, EntityStateMachine)
- ✅ Map System (Tiled TMX loading, rendering, tile collision)
- ✅ Camera System (follow player, bounds, center small maps)
- ✅ Input System (keyboard handling)

### Player Implementation
- ✅ Player entity with full 8-directional sprites
- ✅ Player state machine (Idle, Moving, Attacking, Dodging, Hit, Dying)
- ✅ Player movement with WASD
- ✅ Player attack animation (24 frames, 1.2s)
- ✅ Sprite rendering with proper frame extraction

### Game States
- ✅ TitleScreenState (DOM overlay)
- ✅ PlayState (map, camera, player, collision)
- ✅ GameOverState
- ✅ VictoryState

### Assets
- ✅ Player sprites (all 8 directions, idle + attack)
- ✅ Map tilesets (ground, objects, temple)
- ✅ 2 sounds (background music, menu navigation)

**Points Earned:** ~23.5/32 (Base Rubric)

### What's Missing from Proposal:
- ❌ Enemies (3 types required)
- ❌ Combat system (damage detection)
- ❌ Essence collection (score/progression)
- ❌ Save/load system (persistence)
- ❌ Additional sounds/music
- ❌ Custom fonts
- ⚠️ Cutscenes (OPTIONAL - noted as "not fully necessary" in README)

---

## 📋 REMAINING TASKS - BY FEATURE BRANCH

---

## 🔴 BRANCH 1: `feature/enemy-base-and-shadow-bat` (HIGH PRIORITY)
**Estimated Time:** 4-5 hours
**Points:** 1 (Factory) + part of Enemies
**Dependencies:** None (can start immediately)

### Why This Branch?
Core gameplay requires enemies. Start with base enemy + simplest enemy (Shadow Bat) to establish patterns.

### Tasks:
1. **Create Base Enemy Class** (`src/entities/Enemy.js`)
   - Extends Entity
   - Add: attackDamage, attackRange, detectionRange, patrolPath, target
   - Methods: attack(), chase(), patrol(), detectPlayer()

2. **Create Enemy State Machine** (`src/entities/EnemyStateMachine.js`)
   - Extends EntityStateMachine
   - States: Idle, Patrol, Chase, Attack, Hit, Dying

3. **Create Enemy States** (`src/entities/states/enemy/`)
   - EnemyIdleState.js
   - EnemyPatrolState.js
   - EnemyChaseState.js
   - EnemyAttackState.js
   - EnemyHitState.js
   - EnemyDyingState.js

4. **Create Shadow Bat** (`src/entities/ShadowBat.js`)
   - Extends Enemy
   - Add bat sprites to config.json (idle, fly, bite, hit, death)
   - Simplified AI: Idle → Fly → Bite (no patrol)
   - Fast movement, low HP

5. **Create Enemy Factory** (`src/services/Factory.js`)
   - Methods: createEnemy(type, x, y)
   - createShadowBat(x, y)
   - Use EnemyType enum

6. **Add Enemy to PlayState**
   - Spawn 1-2 Shadow Bats for testing
   - Update enemies array
   - Render enemies with camera offset

### Testing Checklist:
- [ ] Shadow Bat spawns on map
- [ ] Shadow Bat idle animation plays
- [ ] Shadow Bat detects player and chases
- [ ] Shadow Bat plays fly animation when chasing
- [ ] Shadow Bat plays bite animation when in range
- [ ] Factory creates Shadow Bat correctly

### Files Created:
- `src/entities/Enemy.js` (~100 lines)
- `src/entities/EnemyStateMachine.js` (~50 lines)
- `src/entities/states/enemy/*.js` (6 files, ~50 lines each)
- `src/entities/ShadowBat.js` (~80 lines)
- `src/services/Factory.js` (~50 lines)

**Branch Commit Message:**
```
Implement base enemy system and Shadow Bat

- Add Enemy base class with AI (detect, chase, patrol, attack)
- Add EnemyStateMachine with 6 states
- Implement Shadow Bat enemy (swarm type)
- Create EnemyFactory for enemy creation
- Add bat sprites to config.json
- Spawn Shadow Bats in PlayState for testing
```

---

## 🔴 BRANCH 2: `feature/combat-system` (HIGH PRIORITY)
**Estimated Time:** 3-4 hours
**Points:** Part of Collision Detection (already scored)
**Dependencies:** Branch 1 (needs enemies)

### Why This Branch?
Enemies exist but can't fight. Add damage detection and death handling.

### Tasks:
1. **Create CollisionManager** (`src/systems/CollisionManager.js`)
   - Check player attack hitbox vs enemy hitboxes
   - Check enemy attack hitbox vs player hitbox
   - Handle damage application
   - Use polymorphic iteration

2. **Add Attack Hitboxes**
   - Player: activate hitbox in PlayerAttackingState
   - Enemy: activate hitbox in EnemyAttackState
   - Hitbox properties: x, y, width, height, damage, active

3. **Integrate CollisionManager into PlayState**
   - Create CollisionManager instance
   - Pass player and enemies array
   - Call checkCollisions() in update()

4. **Handle Death**
   - Player death → transition to GameOverState
   - Enemy death → play death animation → remove from array
   - Test with Shadow Bat

5. **Add Visual Feedback**
   - Player hit → flash red + invincibility
   - Enemy hit → flash/knockback

6. **Add HUD (HP Bar)**
   - Display player HP bar (top-left corner)
   - Update in real-time as HP changes
   - Visual: red bar with border

### Testing Checklist:
- [ ] Player attack hits enemy
- [ ] Enemy takes damage and HP decreases
- [ ] Enemy plays hit animation when damaged
- [ ] Enemy dies and plays death animation
- [ ] Enemy is removed after death animation
- [ ] Enemy attack hits player
- [ ] Player takes damage and HP decreases
- [ ] Player has invincibility frames after hit
- [ ] Player dies when HP reaches 0
- [ ] GameOverState triggers on player death
- [ ] HUD displays player HP bar
- [ ] HP bar updates when player takes damage

### Files Created:
- `src/systems/CollisionManager.js` (~150 lines)

**Branch Commit Message:**
```
Implement combat system with damage detection

- Add CollisionManager for attack hitbox checking
- Implement player vs enemy damage
- Implement enemy vs player damage
- Add death handling for player and enemies
- Add hit visual feedback (flash, knockback)
- Add HUD with player HP bar
- Test full combat loop with Shadow Bat
```

---

## 🟡 BRANCH 3: `feature/spirit-boxer-enemy` (MEDIUM PRIORITY)
**Estimated Time:** 2-3 hours
**Points:** Part of Enemies
**Dependencies:** Branch 2 (needs combat)

### Why This Branch?
Add variety with a melee enemy that has combo attacks.

### Tasks:
1. **Create Spirit Boxer** (`src/entities/SpiritBoxer.js`)
   - Extends Enemy
   - Add boxer sprites to config.json (idle, run, attack1, attack2, attack3, damaged, death)
   - Combo system: ATTACK1 → ATTACK2 → ATTACK3
   - Chase state uses run animation

2. **Update Enemy States**
   - Add support for combo attacks in EnemyAttackState
   - Add ATTACK1, ATTACK2, ATTACK3 states (or handle in one state)

3. **Update Factory**
   - Add createSpiritBoxer(x, y)

4. **Add to PlayState**
   - Spawn 1-2 Spirit Boxers for testing

### Testing Checklist:
- [ ] Spirit Boxer spawns on map
- [ ] Spirit Boxer idle animation plays
- [ ] Spirit Boxer chases player with run animation
- [ ] Spirit Boxer starts combo when in range
- [ ] Combo chains through all 3 attacks
- [ ] Spirit Boxer takes damage and dies correctly

### Files Created:
- `src/entities/SpiritBoxer.js` (~120 lines)

**Branch Commit Message:**
```
Add Spirit Boxer enemy with combo attacks

- Implement Spirit Boxer enemy (melee type)
- Add combo attack system (3-hit chain)
- Add Spirit Boxer sprites to config.json
- Update EnemyFactory to create Spirit Boxers
- Spawn Spirit Boxers in PlayState for testing
```

---

## 🟡 BRANCH 4: `feature/temple-guardian-boss` (MEDIUM PRIORITY)
**Estimated Time:** 4-5 hours
**Points:** Part of Enemies
**Dependencies:** Branch 3 (should have variety first)

### Why This Branch?
Final boss with special attacks and phase-based behavior.

### Tasks:
1. **Create Temple Guardian** (`src/entities/TempleGuardian.js`)
   - Extends Enemy
   - Add guardian sprites to config.json (walk, attack1, attack2, special, hit, death)
   - Phase system: phase 1 (HP > 50%), phase 2 (HP ≤ 50%)
   - Special attack with telegraph animation
   - Higher HP, damage, and slower movement

2. **Add Boss States**
   - Special attack state with telegraph
   - Phase transition logic

3. **Update Factory**
   - Add createTempleGuardian(x, y)

4. **Add to PlayState**
   - Spawn Temple Guardian in boss room
   - Boss fight music (add to config.json)

5. **Victory Condition**
   - Detect when Temple Guardian dies
   - Transition to VictoryState

### Testing Checklist:
- [ ] Temple Guardian spawns in boss room
- [ ] Temple Guardian patrols with walk animation
- [ ] Temple Guardian chases player
- [ ] Attack 1 and Attack 2 work correctly
- [ ] Special attack telegraphs before executing
- [ ] Phase 2 triggers at 50% HP
- [ ] Temple Guardian death triggers VictoryState

### Files Created:
- `src/entities/TempleGuardian.js` (~180 lines)

**Branch Commit Message:**
```
Implement Temple Guardian boss fight

- Add Temple Guardian boss enemy
- Implement phase-based AI (2 phases)
- Add special attack with telegraph animation
- Add guardian sprites to config.json
- Implement victory condition (boss death → VictoryState)
- Add boss fight music
```

---

## 🟢 BRANCH 5: `feature/essence-and-pickups` (LOW PRIORITY)
**Estimated Time:** 2-3 hours
**Points:** 1 (Score/Points)
**Dependencies:** Branch 2 (enemies need to drop items)

### Why This Branch?
Progression system - collect essences from enemies.

### Tasks:
1. **Create EssencePickup** (`src/objects/EssencePickup.js`)
   - Extends GameObject, implements Collidable
   - Animated sprite (glowing effect)
   - Value property

2. **Update CollisionManager**
   - Add entityVsPickup() method
   - Check player vs essence collisions
   - Remove essence when collected

3. **Update Enemy Death**
   - Spawn essence on death
   - Add to PlayState pickups array

4. **Update Player**
   - Add essences property (count)
   - Add collectEssence() method

5. **Add HUD Display**
   - Show essence count on screen
   - Update in PlayState render()

### Testing Checklist:
- [ ] Essence spawns when enemy dies
- [ ] Essence has glowing animation
- [ ] Player collects essence on contact
- [ ] Essence count increases
- [ ] HUD displays essence count
- [ ] Essence is removed after collection

### Files Created:
- `src/objects/EssencePickup.js` (~80 lines)

**Branch Commit Message:**
```
Add essence collection system

- Create EssencePickup game object
- Enemies drop essences on death
- Player collects essences on contact
- Add essence counter to HUD
- Update CollisionManager for pickup detection
```

---

## 🟢 BRANCH 6: `feature/save-system` (LOW PRIORITY)
**Estimated Time:** 3-4 hours
**Points:** 4 (Persistence)
**Dependencies:** Branch 5 (needs full game state)

### Why This Branch?
Save/load game state to localStorage.

### Tasks:
1. **Create SaveManager** (`src/services/SaveManager.js`)
   - saveGame(gameState)
   - loadGame()
   - saveToLocalStorage(data)
   - loadFromLocalStorage()
   - hasSave()

2. **Define Game State Schema**
   ```javascript
   {
     player: { x, y, hp, essences, direction },
     currentMap: 'map-name',
     enemies: [{ type, x, y, hp, state }],
     pickups: [{ x, y, value }],
     flags: { bossDefeated, ... }
   }
   ```

3. **Add Save Triggers**
   - Manual save via pause menu (ESC → Save)
   - Auto-save when defeating Temple Guardian

4. **Add Load Functionality**
   - "Continue" button on title screen
   - Restore player position, HP, essences
   - Restore enemy states
   - Restore pickups

5. **Update PauseState**
   - Add save button
   - Call SaveManager.saveGame()

### Testing Checklist:
- [ ] Save game from pause menu
- [ ] Data persists in localStorage
- [ ] Load game from title screen
- [ ] Player position restored correctly
- [ ] Player stats (HP, essences) restored
- [ ] Enemies restored correctly
- [ ] Pickups restored correctly
- [ ] Auto-save triggers when boss defeated

### Files Created:
- `src/services/SaveManager.js` (~120 lines)

**Branch Commit Message:**
```
Implement save/load system with localStorage

- Add SaveManager for game state persistence
- Manual save via pause menu
- Auto-save on boss defeat
- Continue option on title screen loads saved game
- Save player position, HP, essences, enemy states
```

---

## 🟢 BRANCH 7: `feature/sounds-and-music` (LOW PRIORITY)
**Estimated Time:** 2-3 hours
**Points:** 0.5 (Sounds & Music - currently have 0.5/1)
**Dependencies:** Branch 4 (needs all enemies for sound effects)

### Why This Branch?
Polish and required for full points.

### Tasks:
1. **Collect Sound Assets**
   - Use freesound.org (CC0 license)
   - Download ~15-20 essential sounds (see sounds-checklist.md)
   - Convert to WAV (effects) and MP3 (music)

2. **Add Sounds to config.json**
   - Player: attack, hurt, death, dodge
   - Enemies: attack, hit, death (per enemy type)
   - Gameplay: essence pickup
   - UI: menu click, pause open/close
   - Music: gameplay, boss fight

3. **Integrate Sound Playing**
   - Player states call sounds.play('player-attack')
   - Enemy states call sounds.play('shadow-bat-death')
   - CollisionManager plays hit sounds
   - PlayState plays background music

4. **Add Sound Credits**
   - Document sound sources in main.js header

### Testing Checklist:
- [ ] Player attack plays sound
- [ ] Player hit plays sound
- [ ] Player death plays sound
- [ ] Enemy attacks play sounds
- [ ] Enemy deaths play sounds
- [ ] Essence pickup plays sound
- [ ] Menu clicks play sound
- [ ] Background music loops
- [ ] Boss fight music plays in boss room

### Files Modified:
- `src/config.json` (add ~15-20 sounds)
- `src/states/PlayState.js` (add music)
- `src/entities/states/*` (add sound calls)
- `src/main.js` (add credits)

**Branch Commit Message:**
```
Add comprehensive sound effects and music

- Add 15+ sound effects (player, enemies, UI, gameplay)
- Add gameplay and boss fight background music
- Integrate sound playing into all states
- Document sound sources and credits
```

---

## 🟢 BRANCH 8: `feature/fonts-and-ui-polish` (LOW PRIORITY)
**Estimated Time:** 1-2 hours
**Points:** 1 (Fonts)
**Dependencies:** None

### Why This Branch?
Quick win for 1 point, improves visual quality.

### Tasks:
1. **Add Fonts**
   - Download 2 fonts (title + body)
   - Add to `assets/fonts/`
   - Add to config.json

2. **Update Font Loading**
   - Fonts.js loads fonts
   - Wait for fonts to load before starting game

3. **Apply Fonts**
   - Title screen: title font
   - HUD/menus: body font
   - Game over/victory: title font

4. **Polish UI Elements**
   - HP bar visual improvement
   - Essence counter styling
   - Pause menu styling

### Testing Checklist:
- [ ] Fonts load correctly
- [ ] Title screen uses title font
- [ ] HUD uses body font
- [ ] Game over/victory use title font
- [ ] All text is readable

### Files Modified:
- `src/config.json` (add fonts)
- `src/states/TitleScreenState.js` (apply font)
- `src/states/PlayState.js` (HUD font)
- `index.html` (title screen font)

**Branch Commit Message:**
```
Add custom fonts and polish UI

- Add title font (Orbitron) and body font (Roboto)
- Apply fonts to title screen, HUD, and menus
- Improve HP bar and essence counter visuals
- Polish pause menu styling
```

---

## 🟢 BRANCH 9: `feature/juice-and-effects` (LOW PRIORITY - POLISH)
**Estimated Time:** 4-5 hours
**Points:** 0 (Polish, not graded)
**Dependencies:** All combat branches (2, 3, 4)

### Why This Branch?
Game feel and polish. Not required for points but makes game enjoyable.

### Tasks:
1. **Particle System** (`src/effects/ParticleSystem.js`)
   - Simple particle emitter
   - Use for: enemy death, attacks, essence collection

2. **Screen Shake**
   - Camera shake on boss attacks
   - Camera shake on player taking heavy damage

3. **Visual Feedback**
   - Flash red on damage
   - Knockback on hit
   - Invincibility flicker (already implemented)

4. **Tweens**
   - Smooth knockback animations
   - UI fade transitions
   - Camera shake tween

5. **Polish Temple Guardian**
   - Special attack glow effect
   - Screen shake on special attack
   - Particle burst on special attack

### Testing Checklist:
- [ ] Particles spawn on enemy death
- [ ] Particles spawn on attack impact
- [ ] Screen shake on boss special attack
- [ ] Knockback on hit
- [ ] UI transitions are smooth

### Files Created:
- `src/effects/ParticleSystem.js` (~100 lines)

**Branch Commit Message:**
```
Add juice effects and polish

- Implement particle system for impacts and deaths
- Add screen shake for boss attacks
- Add knockback animations on hit
- Polish Temple Guardian special attack visuals
- Add smooth tween transitions
```

---

## 🟢 BRANCH 10: `feature/instructions-and-pause` (LOW PRIORITY)
**Estimated Time:** 2-3 hours
**Points:** 0 (Required but not graded separately)
**Dependencies:** None

### Why This Branch?
Required feature - instructions state and proper pause menu.

### Tasks:
1. **Create InstructionsState** (`src/states/InstructionsState.js`)
   - Display controls (WASD, Space, Shift)
   - Display gameplay mechanics
   - Display objective
   - Back button to title screen

2. **Create PauseState** (`src/states/PauseState.js`)
   - Overlay state (keeps PlayState visible but dimmed)
   - Options: Resume, Save, Quit
   - ESC to open/close

3. **Add to Title Screen**
   - Instructions button

4. **Add to PlayState**
   - ESC opens pause menu

### Testing Checklist:
- [ ] Instructions state accessible from title
- [ ] Instructions display all controls
- [ ] Back button returns to title
- [ ] ESC opens pause menu in gameplay
- [ ] Pause menu overlays gameplay
- [ ] Resume button closes pause menu
- [ ] Quit button returns to title

### Files Created:
- `src/states/InstructionsState.js` (~80 lines)
- `src/states/PauseState.js` (~100 lines)

**Branch Commit Message:**
```
Add instructions state and pause menu

- Create InstructionsState with controls and mechanics
- Create PauseState with resume/save/quit options
- Add instructions button to title screen
- Add ESC pause functionality to PlayState
```

---

## 📊 BRANCH PRIORITY ORDER (RECOMMENDED)

### Phase 1: Core Gameplay (Required for Playable Game)
1. ✅ `feature/map-and-camera-system` (DONE)
2. 🔴 `feature/enemy-base-and-shadow-bat` (START HERE)
3. 🔴 `feature/combat-system`

**After Phase 1:** You have a playable game with enemies and combat.

### Phase 2: Enemy Variety & Progression
4. 🟡 `feature/spirit-boxer-enemy`
5. 🟡 `feature/temple-guardian-boss`
6. 🟢 `feature/essence-and-pickups`

**After Phase 2:** You have all 3 enemy types and progression system.

### Phase 3: Systems & Quality of Life
7. 🟢 `feature/save-system`
8. 🟢 `feature/sounds-and-music`
9. 🟢 `feature/fonts-and-ui-polish`
10. 🟢 `feature/instructions-and-pause`

**After Phase 3:** You have all required features.

### Phase 4: Polish (Optional)
11. 🟢 `feature/juice-and-effects`

**After Phase 4:** Game is polished and feels great.

---

## 🎯 POINTS BREAKDOWN (Per Rubric.md)

| Feature | Current | Target | Branches | Notes |
|---------|---------|--------|----------|-------|
| State Machines | 2/2 | 2/2 | ✅ Done | Global + per entity |
| Inheritance & Polymorphism | 4/4 | 4/4 | ✅ Done | Need to prove polymorphic iteration |
| Factory Pattern | 0/1 | 1/1 | Branch 1 | EnemyFactory |
| Enums | 1/1 | 1/1 | ✅ Done | 5 enums implemented |
| Game Entities | 3/3 | 3/3 | ✅ Done | Player done, need 3 enemies |
| Collision Detection | 3/3 | 3/3 | Branch 2 | Tile done, need combat |
| Persistence | 0/4 | 4/4 | Branch 6 | Save/load full game state |
| Win/Loss Conditions | 2/2 | 2/2 | ✅ Done | GameOver + Victory states |
| Score/Points | 0/1 | 1/1 | Branch 5 | Essence collection system |
| Sprites | 3/3 | 3/3 | ✅ Done | Player + enemy sprites |
| Animations | 2/2 | 2/2 | ✅ Done | Sprite sheet animations |
| Tweens | 2/2 | 2/2 | ✅ Done | Camera, direction, knockback |
| Sounds & Music | 0.5/1 | 1/1 | Branch 7 | Have 2, need 15+ |
| Fonts | 0/1 | 1/1 | Branch 8 | Need title + body fonts |
| **Adherence to Proposal** | **?/2** | **2/2** | All branches | Must match README proposal |
| **TOTAL** | **23.5/32** | **32/32** | **+8.5 points** |
| **GRAND TOTAL (w/ Adherence)** | **~24.5/34** | **34/34** | **+9.5 points** |

---

## 🚀 QUICK START - NEXT BRANCH

**Ready to code?** Start with:

```bash
git checkout -b feature/enemy-base-and-shadow-bat
```

**First task:** Create `src/entities/Enemy.js`

**Estimated time to 32/32 points:** 20-25 hours of focused work

---

## 📝 OPTIONAL FEATURES (Not Required for Points)

### Cutscenes (CutsceneState)
**From README:** _"Cutscenes are an extra feature and not fully necessary for the core game"_

**If you want to add them:**
- Create `CutsceneState.js`
- Static background images + text panels
- Space/Enter to advance dialogue
- Appears at: intro, mid-game, victory

**Estimated time:** 2-3 hours

**Benefits:**
- Improves "Adherence to Proposal" score (mentioned in README)
- Adds narrative polish
- Simple to implement (just text + images)

**Recommendation:** Add after Phase 3 if time permits.

---

## ✅ PROPOSAL REQUIREMENTS CHECKLIST (for Adherence Points)

From README.md, you must have:

**Core Gameplay:**
- [x] Top-down action RPG with player movement (WASD)
- [x] Player entity (Shadow Creature) with 8-directional sprites
- [x] Player attacks (Space) and dodge mechanics
- [ ] 3 enemy types: Shadow Bat, Spirit Boxer, Temple Guardian *(Branches 1, 3, 4)*
- [ ] Enemy AI (patrol, chase, attack) *(Branches 1, 3, 4)*
- [ ] Combat with damage detection *(Branch 2)*
- [ ] Death animations for all characters *(Branches 1-4)*
- [x] Tile-based map system with collision
- [x] Camera following player

**Progression:**
- [ ] Essence collection from defeated enemies *(Branch 5)*
- [ ] Score/progression system *(Branch 5)*

**UI & Menus:**
- [x] Title screen with New Game/Continue
- [ ] Instructions state (controls, mechanics, objectives) *(Branch 10)*
- [ ] Pause menu (ESC) with Resume/Save/Quit *(Branch 10)*
- [ ] HUD with HP bar *(Need to add)*
- [ ] GameOver and Victory screens *(Have states, need polish)*

**Systems:**
- [ ] Save/load system (manual + auto-save) *(Branch 6)*
- [x] State machines (global + per entity)
- [x] Factory pattern for enemies *(Branch 1)*
- [x] Enums (Direction, States, etc.)

**Polish:**
- [ ] Sound effects (player, enemies, UI) *(Branch 7)*
- [ ] Background music (gameplay, boss) *(Branch 7)*
- [ ] Custom fonts (title + body) *(Branch 8)*
- [ ] Juice effects (particles, screen shake, knockback) *(Branch 9 - optional)*

**Optional (but mentioned in README):**
- [ ] Cutscenes with static backgrounds + text *(Not required)*
- [ ] Temple Guardian special attack with telegraphs *(Branch 4)*
- [ ] Invincibility flicker on damage *(Already implemented!)*

**Completed:** 8/22 required items (~36%)
**After all branches:** 22/22 required items (100%)

---

## 🎯 RECOMMENDED WORKFLOW

### Week 1: Core Combat (Branches 1-2)
- Get enemies working
- Get combat working
- **Result:** Playable game with fighting

### Week 2: Enemy Variety (Branches 3-5)
- Add all 3 enemy types
- Add essence collection
- **Result:** Full enemy roster + progression

### Week 3: Systems & Polish (Branches 6-10)
- Save/load system
- Sounds and fonts
- Instructions and pause
- Juice effects (if time)
- **Result:** Complete, polished game

**Good luck!** 🎮

