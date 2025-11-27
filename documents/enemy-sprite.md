# Enemy Sprite Documentation

## Overview

This document details how to implement enemy sprite rendering using the individual labeled sprite files from `assets/Sprites/E_Bros_Assets_TopDownEnemy/`.

## Sprite File Structure

### Individual Sprite Files

Each animation type has separate sprite files for each direction:
- **Idle:** `Enemy-Melee-Idle-N.png`, `Enemy-Melee-Idle-NE.png`, `Enemy-Melee-Idle-E.png`, `Enemy-Melee-Idle-SE.png`, `Enemy-Melee-Idle-S.png`, `Enemy-Melee-Idle-SW.png`, `Enemy-Melee-Idle-W.png`, `Enemy-Melee-Idle-NW.png`
- **Attack:** `Enemy-Melee-Attack-N.png`, `Enemy-Melee-Attack-NE.png`, etc. (8 directions)
- **Death:** `Enemy-Melee-Death.png` (only south direction)

### Frame Specifications

- **Frame size:** 256x256 pixels
- **Layout:** Each sprite file is a sprite sheet containing multiple frames arranged in a grid
- **Frame extraction:** Extract frames by dividing image dimensions by 256x256

## Direction Order

The sprite pack uses 8 directions in clockwise order:
- **E** (East/right) → **SE** (Southeast/down-right) → **S** (South/down) → **SW** (Southwest/down-left) → **W** (West/left) → **NW** (Northwest/up-left) → **N** (North/up) → **NE** (Northeast/up-right) → **E** (loop)

**Important:** Use this order for cycling through directions: `['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne']`

## Critical: Direction Mapping Issue

### Idle Animation
The idle sprite files have a **mislabeling issue**:
- `Enemy-Melee-Idle-NW.png` contains the sprite facing **NE** visually
- `Enemy-Melee-Idle-NE.png` contains the sprite facing **NW** visually

**Solution:** Use a mapping to swap NW and NE for idle animations:
```javascript
directionToSpriteIdle = {
    'e': 'e',
    'se': 'se',
    's': 's',
    'sw': 'sw',
    'w': 'w',
    'nw': 'ne', // NW visually uses NE sprite file
    'n': 'n',
    'ne': 'nw'  // NE visually uses NW sprite file
};
```

### Attack/Death Animations
The attack and death sprite files are **correctly labeled**:
- `Enemy-Melee-Attack-NW.png` contains the sprite facing **NW** visually
- `Enemy-Melee-Attack-NE.png` contains the sprite facing **NE** visually

**Solution:** Use a direct mapping (no swap) for attack/death:
```javascript
directionToSpriteAttack = {
    'e': 'e',
    'se': 'se',
    's': 's',
    'sw': 'sw',
    'w': 'w',
    'nw': 'nw', // Correctly labeled
    'n': 'n',
    'ne': 'ne'  // Correctly labeled
};
```

## Implementation Steps

### 1. Add Sprites to config.json

Add all enemy sprite files to `src/config.json`:

```json
{
    "images": [
        {
            "name": "enemy-idle-n",
            "path": "./assets/Sprites/E_Bros_Assets_TopDownEnemy/Enemy-Melee-Idle-N.png",
            "width": 64,
            "height": 64
        },
        {
            "name": "enemy-idle-ne",
            "path": "./assets/Sprites/E_Bros_Assets_TopDownEnemy/Enemy-Melee-Idle-NE.png",
            "width": 64,
            "height": 64
        },
        // ... add all 8 idle directions
        {
            "name": "enemy-attack-n",
            "path": "./assets/Sprites/E_Bros_Assets_TopDownEnemy/Enemy-Melee-Attack-N.png",
            "width": 64,
            "height": 64
        },
        // ... add all 8 attack directions
        {
            "name": "enemy-death-s",
            "path": "./assets/Sprites/E_Bros_Assets_TopDownEnemy/Enemy-Melee-Death.png",
            "width": 64,
            "height": 64
        }
    ]
}
```

### 2. Set Up Direction Mappings

Create separate mappings for idle vs attack/death:

```javascript
// Direction order (clockwise from East)
this.directions = ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'];

// Idle mapping (NW/NE swapped)
this.directionToSpriteIdle = {
    'e': 'e', 'se': 'se', 's': 's', 'sw': 'sw',
    'w': 'w', 'nw': 'ne', 'n': 'n', 'ne': 'nw'
};

// Attack/Death mapping (correctly labeled)
this.directionToSpriteAttack = {
    'e': 'e', 'se': 'se', 's': 's', 'sw': 'sw',
    'w': 'w', 'nw': 'nw', 'n': 'n', 'ne': 'ne'
};
```

### 3. Get Sprite Based on Animation and Direction

```javascript
// Get current direction
const dir = this.directions[this.currentDirection];

// Select the correct mapping based on animation type
const mapping = this.currentAnimation === 'idle' 
    ? this.directionToSpriteIdle 
    : this.directionToSpriteAttack;

// Map visual direction to sprite filename
const spriteDir = mapping[dir] || dir;

// Build sprite name
let spriteName = `enemy-${this.currentAnimation}-${spriteDir}`;

// Death only has south direction
if (this.currentAnimation === 'death') {
    spriteName = 'enemy-death-s';
}

// Get the sprite
const enemyImage = images.get(spriteName);
```

### 4. Extract and Display Frames

Each sprite file is a sprite sheet with multiple 256x256 frames:

```javascript
if (enemyImage && enemyImage.image && enemyImage.image.complete) {
    const frameSize = 256; // Each frame is 256x256
    const displaySize = 512; // Scale up 2x for visibility
    
    // Calculate frame grid position
    const framesPerRow = Math.floor(enemyImage.image.width / frameSize);
    const frameRow = Math.floor(this.currentFrame / framesPerRow);
    const frameCol = this.currentFrame % framesPerRow;
    const sourceX = frameCol * frameSize;
    const sourceY = frameRow * frameSize;
    
    // Draw the frame
    context.drawImage(
        enemyImage.image,
        sourceX, sourceY,        // Source position (current frame)
        frameSize, frameSize,    // Source size (256x256)
        destX, destY,            // Destination position
        displaySize, displaySize // Destination size (scaled)
    );
}
```

### 5. Animate Through Frames

Cycle through frames in the sprite sheet:

```javascript
// Update frame animation
this.frameTime += dt;
if (this.frameTime >= this.frameInterval) {
    this.frameTime = 0;
    
    // Calculate total frames in current sprite sheet
    const framesPerRow = Math.floor(enemyImage.image.width / 256);
    const rows = Math.floor(enemyImage.image.height / 256);
    const totalFrames = framesPerRow * rows;
    
    // Cycle to next frame
    this.currentFrame = (this.currentFrame + 1) % totalFrames;
}
```

## Complete Example Structure

```javascript
export default class PlayState extends State {
    constructor() {
        super();
        this.currentAnimation = 'idle'; // 'idle', 'attack', 'death'
        this.currentDirection = 0; // Index into directions array
        this.currentFrame = 0; // Current frame in animation
        this.frameTime = 0;
        this.frameInterval = 0.15; // Time between frames (seconds)
        
        // Direction order (clockwise from East)
        this.directions = ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'];
        
        // Mappings
        this.directionToSpriteIdle = {
            'e': 'e', 'se': 'se', 's': 's', 'sw': 'sw',
            'w': 'w', 'nw': 'ne', 'n': 'n', 'ne': 'nw'
        };
        this.directionToSpriteAttack = {
            'e': 'e', 'se': 'se', 's': 's', 'sw': 'sw',
            'w': 'w', 'nw': 'nw', 'n': 'n', 'ne': 'ne'
        };
    }
    
    update(dt) {
        // Handle direction changes
        // Handle animation changes
        // Animate through frames
    }
    
    render() {
        // Get sprite based on animation and direction
        // Extract and draw current frame
    }
}
```

## Key Points to Remember

1. **Frame size is 256x256** - Always extract frames using this size
2. **Idle has NW/NE swap** - Use `directionToSpriteIdle` mapping
3. **Attack/Death are correct** - Use `directionToSpriteAttack` mapping
4. **Direction order is clockwise from East** - `['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne']`
5. **Each sprite file is a sprite sheet** - Calculate frames by dividing image dimensions by 256
6. **Death only has south direction** - Always use `enemy-death-s` regardless of direction

## Testing Checklist

- [ ] All 8 idle directions display correctly (with NW/NE swap)
- [ ] All 8 attack directions display correctly (no swap)
- [ ] Death animation displays correctly
- [ ] Frames animate smoothly through each sprite sheet
- [ ] Direction cycling works correctly (clockwise/counter-clockwise)
- [ ] Animation switching works (idle → attack → death)
