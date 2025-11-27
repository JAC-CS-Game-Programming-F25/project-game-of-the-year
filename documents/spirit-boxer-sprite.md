# Spirit Boxer Sprite Documentation

## Overview

This document details how to implement Spirit Boxer sprite rendering using the individual labeled sprite files from `assets/Sprites/Spirit Boxer/`.

## Sprite File Structure

### Individual Sprite Files

Each animation type has a separate sprite file:
- **Idle:** `Idle.png` (4 frames)
- **Attack 1:** `attack 1.png` (6 frames)
- **Attack 2:** `attack 2.png` (13 frames)
- **Attack 3:** `attack 3.png` (10 frames)
- **Run:** `Run.png` (6 frames)
- **Damaged and Death:** `Damaged & Death.png` (10 frames total - Damaged uses first 4, Death uses last 6)

**Note:** The attacks chain beautifully! Attack 1 → Attack 2 → Attack 3 creates a smooth combo sequence.

### Frame Specifications

- **Frame size:** 137x44 pixels per frame
- **Layout:** Each sprite file is a vertical strip (all frames stacked vertically)
- **Frame extraction:** Extract frames by dividing image height by 44px
- **Width:** Always 137px (single column)

## Sprite Sheet Dimensions and Frame Counts

| Animation | File | Dimensions | Frame Count | Calculation |
|-----------|------|------------|-------------|-------------|
| Idle | `Idle.png` | 137 x 176 | 4 frames | 176 ÷ 44 = 4 |
| Attack 1 | `attack 1.png` | 137 x 264 | 6 frames | 264 ÷ 44 = 6 |
| Attack 2 | `attack 2.png` | 137 x 572 | 13 frames | 572 ÷ 44 = 13 |
| Attack 3 | `attack 3.png` | 137 x 440 | 10 frames | 440 ÷ 44 = 10 |
| Run | `Run.png` | 137 x 264 | 6 frames | 264 ÷ 44 = 6 |
| Damaged & Death | `Damaged & Death.png` | 137 x 528 | 10 frames total | 528 ÷ 44 = 12 frames |

**Note:** The "Damaged & Death.png" file contains both animations:
- **Damaged:** Uses frames 0-3 (first 4 frames)
- **Death:** Uses frames 4-9 (last 6 frames)

## Implementation Steps

### 1. Add Sprites to config.json

Add all Spirit Boxer sprite files to `src/config.json`:

```json
{
    "images": [
        {
            "name": "spirit-boxer-idle",
            "path": "./assets/Sprites/Spirit Boxer/Idle.png",
            "width": 0,
            "height": 0
        },
        {
            "name": "spirit-boxer-attack1",
            "path": "./assets/Sprites/Spirit Boxer/attack 1.png",
            "width": 0,
            "height": 0
        },
        {
            "name": "spirit-boxer-attack2",
            "path": "./assets/Sprites/Spirit Boxer/attack 2.png",
            "width": 0,
            "height": 0
        },
        {
            "name": "spirit-boxer-attack3",
            "path": "./assets/Sprites/Spirit Boxer/attack 3.png",
            "width": 0,
            "height": 0
        },
        {
            "name": "spirit-boxer-run",
            "path": "./assets/Sprites/Spirit Boxer/Run.png",
            "width": 0,
            "height": 0
        },
        {
            "name": "spirit-boxer-damaged-death",
            "path": "./assets/Sprites/Spirit Boxer/Damaged & Death.png",
            "width": 0,
            "height": 0
        }
    ]
}
```

**Note:** Set `width` and `height` to `0` to let `Graphic.js` automatically detect the actual image dimensions.

### 2. Set Up Animation State

```javascript
export default class PlayState extends State {
    constructor() {
        super();
        // Spirit Boxer sprite specs: 137x44px per frame
        this.boxerFrameWidth = 137;
        this.boxerFrameHeight = 44;
        this.boxerScale = 4; // Scale up for visibility
        this.boxerDisplayWidth = this.boxerFrameWidth * this.boxerScale;
        this.boxerDisplayHeight = this.boxerFrameHeight * this.boxerScale;

        // Animation state
        this.boxerAnimation = 'idle'; // 'idle', 'attack1', 'attack2', 'attack3', 'run', 'damaged', 'death'
        this.boxerAnimationTypes = ['idle', 'attack1', 'attack2', 'attack3', 'run', 'damaged', 'death'];
        this.boxerFrame = 0;
        this.boxerFrameTime = 0;
        this.boxerFrameInterval = 0.15; // seconds per frame
        this.boxerAutoAnimate = true;

        // Animation frame counts
        this.boxerAnimationFrames = {
            'idle': 4,          // 176 / 44 = 4
            'attack1': 6,       // 264 / 44 = 6
            'attack2': 13,      // 572 / 44 = 13
            'attack3': 10,      // 440 / 44 = 10
            'run': 6,           // 264 / 44 = 6
            'damaged': 4,       // First 4 frames of Damaged & Death
            'death': 6          // Last 6 frames of Damaged & Death (starts at frame 4)
        };
    }
}
```

### 3. Get Sprite Sheet

```javascript
// Get the sprite sheet for current animation
let spriteSheetName = 'spirit-boxer-' + this.boxerAnimation;
if (this.boxerAnimation === 'damaged' || this.boxerAnimation === 'death') {
    spriteSheetName = 'spirit-boxer-damaged-death';
}

const spriteSheet = images.get(spriteSheetName);

if (!spriteSheet || !spriteSheet.image || !spriteSheet.image.complete || spriteSheet.image.naturalWidth === 0) {
    // Sprite not loaded yet
    return;
}
```

### 4. Extract and Display Current Frame

Since all frames are stacked vertically in a single column:

```javascript
const maxFrames = this.boxerAnimationFrames[this.boxerAnimation];
let sourceY = this.boxerFrame * this.boxerFrameHeight;

// For death animation, adjust frame offset (death uses frames 4-9)
if (this.boxerAnimation === 'death') {
    sourceY = (this.boxerFrame + 4) * this.boxerFrameHeight; // Start from frame 4
}

// Draw the current frame
context.drawImage(
    spriteSheet.image,
    0, sourceY, // Source position (x is always 0, y is frame * height)
    this.boxerFrameWidth, this.boxerFrameHeight, // Source size (137x44)
    destX, destY, // Destination position
    this.boxerDisplayWidth, this.boxerDisplayHeight // Destination size (scaled)
);
```

### 5. Animate Through Frames

```javascript
update(dt) {
    const spriteSheet = images.get(spriteSheetName);
    if (!spriteSheet || !spriteSheet.image || !spriteSheet.image.complete) {
        return;
    }

    // Auto-animate frames
    if (this.boxerAutoAnimate) {
        this.boxerFrameTime += dt;
        if (this.boxerFrameTime >= this.boxerFrameInterval) {
            this.boxerFrameTime = 0;
            const maxFrames = this.boxerAnimationFrames[this.boxerAnimation];
            this.boxerFrame = (this.boxerFrame + 1) % maxFrames;
        }
    }
}
```

### 6. Switch Between Animations

```javascript
// Switch to a different animation
this.boxerAnimation = 'attack1'; // or 'attack2', 'attack3', 'run', 'damaged', 'death', 'idle'
this.boxerFrame = 0; // Reset to start of new animation
this.boxerAutoAnimate = true; // Resume auto-animation
```

## Complete Example Structure

```javascript
import State from "../../lib/State.js";
import Input from "../../lib/Input.js";
import { images, CANVAS_WIDTH, CANVAS_HEIGHT, context, input } from "../globals.js";

export default class PlayState extends State {
    constructor() {
        super();
        // Spirit Boxer sprite specs: 137x44px per frame
        this.boxerFrameWidth = 137;
        this.boxerFrameHeight = 44;
        this.boxerScale = 4;
        this.boxerDisplayWidth = this.boxerFrameWidth * this.boxerScale;
        this.boxerDisplayHeight = this.boxerFrameHeight * this.boxerScale;

        // Animation state
        this.boxerAnimation = 'idle';
        this.boxerAnimationTypes = ['idle', 'attack1', 'attack2', 'attack3', 'run', 'damaged', 'death'];
        this.boxerFrame = 0;
        this.boxerFrameTime = 0;
        this.boxerFrameInterval = 0.15;
        this.boxerAutoAnimate = true;

        // Animation frame counts
        this.boxerAnimationFrames = {
            'idle': 4,
            'attack1': 6,
            'attack2': 13,
            'attack3': 10,
            'run': 6,
            'damaged': 4,
            'death': 6
        };
    }

    update(dt) {
        // Get sprite sheet name
        let spriteSheetName = 'spirit-boxer-' + this.boxerAnimation;
        if (this.boxerAnimation === 'damaged' || this.boxerAnimation === 'death') {
            spriteSheetName = 'spirit-boxer-damaged-death';
        }

        const spriteSheet = images.get(spriteSheetName);
        if (!spriteSheet || !spriteSheet.image || !spriteSheet.image.complete) {
            return;
        }

        // Handle input and animation logic...
        // Auto-animate frames
        if (this.boxerAutoAnimate) {
            this.boxerFrameTime += dt;
            if (this.boxerFrameTime >= this.boxerFrameInterval) {
                this.boxerFrameTime = 0;
                const maxFrames = this.boxerAnimationFrames[this.boxerAnimation];
                this.boxerFrame = (this.boxerFrame + 1) % maxFrames;
            }
        }
    }

    render() {
        // Clear with dark background
        context.fillStyle = '#1a1a2e';
        context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Get sprite sheet name
        let spriteSheetName = 'spirit-boxer-' + this.boxerAnimation;
        if (this.boxerAnimation === 'damaged' || this.boxerAnimation === 'death') {
            spriteSheetName = 'spirit-boxer-damaged-death';
        }

        const spriteSheet = images.get(spriteSheetName);

        if (!spriteSheet || !spriteSheet.image || !spriteSheet.image.complete || spriteSheet.image.naturalWidth === 0) {
            return;
        }

        const maxFrames = this.boxerAnimationFrames[this.boxerAnimation];
        let sourceY = this.boxerFrame * this.boxerFrameHeight;
        
        // For death animation, adjust frame offset
        if (this.boxerAnimation === 'death') {
            sourceY = (this.boxerFrame + 4) * this.boxerFrameHeight;
        }

        const centerX = CANVAS_WIDTH / 2;
        const centerY = CANVAS_HEIGHT / 2;
        const destX = centerX - this.boxerDisplayWidth / 2;
        const destY = centerY - this.boxerDisplayHeight / 2;

        // Draw the current frame
        context.drawImage(
            spriteSheet.image,
            0, sourceY,
            this.boxerFrameWidth, this.boxerFrameHeight,
            destX, destY,
            this.boxerDisplayWidth, this.boxerDisplayHeight
        );
    }
}
```

## Key Points to Remember

1. **Frame size is 137x44 pixels** - Always extract frames using this size
2. **Vertical strip layout** - All frames are stacked vertically in a single column (x is always 0)
3. **Frame extraction formula** - `sourceY = currentFrame * 44`
4. **Frame count calculation** - `totalFrames = imageHeight / 44`
5. **Damaged and Death share a sprite sheet** - `Damaged & Death.png` contains both animations:
   - Damaged uses frames 0-3 (first 4 frames)
   - Death uses frames 4-9 (last 6 frames)
   - When rendering death, add offset: `sourceY = (this.boxerFrame + 4) * 44`
6. **Attack chain** - The three attack animations (Attack 1, 2, 3) chain beautifully together for combo sequences
7. **Scale appropriately** - Use a scale of 3-4x for good visibility on screen

## Animation Details

- **Idle:** 4 frames - Standing idle pose
- **Attack 1:** 6 frames - First attack in combo chain
- **Attack 2:** 13 frames - Second attack in combo chain (longest attack)
- **Attack 3:** 10 frames - Third attack in combo chain
- **Run:** 6 frames - Running animation
- **Damaged:** 4 frames - Hit reaction (first 4 frames of Damaged & Death.png)
- **Death:** 6 frames - Death animation (last 6 frames of Damaged & Death.png)

## Testing Checklist

- [ ] All 7 animation types load correctly
- [ ] Frames animate smoothly through each sprite sheet
- [ ] Frame counts match expected values (4, 6, 13, 10, 6, 4, 6)
- [ ] Animation switching works correctly
- [ ] Attack chain flows smoothly (Attack 1 → Attack 2 → Attack 3)
- [ ] Damaged animation displays frames 0-3 correctly
- [ ] Death animation displays frames 4-9 correctly (with offset)
- [ ] Sprite displays at appropriate size (scaled 3-4x)
- [ ] No frame extraction errors (all frames visible)

