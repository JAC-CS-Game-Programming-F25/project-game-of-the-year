# Shadow Bat Sprite Documentation

## Overview

This document details how to implement Shadow Bat sprite rendering using the individual labeled sprite files from `assets/Sprites/Bat/`.

## Sprite File Structure

### Individual Sprite Files

Each animation type has a separate sprite file:
- **Idle:** `idle.png` (7 frames)
- **Idle to Fly:** `idle to fly.png` (6 frames)
- **Fly:** `fly.png` (7 frames)
- **Bite:** `bite.png` (8 frames)
- **Hit and Death:** `hit and death.png` (7 frames total - hit uses first 3, death uses last 4)

### Frame Specifications

- **Frame size:** 44x92 pixels per frame
- **Layout:** Each sprite file is a horizontal strip (all frames arranged side by side)
- **Frame extraction:** Extract frames by dividing image width by 44px
- **Height:** Always 92px (single row)

## Sprite Sheet Dimensions and Frame Counts

| Animation | File | Dimensions | Frame Count | Calculation |
|-----------|------|------------|-------------|-------------|
| Idle | `idle.png` | 308 x 92 | 7 frames | 308 ÷ 44 = 7 |
| Idle to Fly | `idle to fly.png` | 264 x 92 | 6 frames | 264 ÷ 44 = 6 |
| Fly | `fly.png` | 308 x 92 | 7 frames | 308 ÷ 44 = 7 |
| Bite | `bite.png` | 352 x 92 | 8 frames | 352 ÷ 44 = 8 |
| Hit and Death | `hit and death.png` | 308 x 92 | 7 frames total | 308 ÷ 44 = 7 |

**Note:** The "hit and death.png" file contains both animations:
- **Hit:** Uses frames 0-2 (first 3 frames)
- **Death:** Uses frames 3-6 (last 4 frames)

## Implementation Steps

### 1. Add Sprites to config.json

Add all Shadow Bat sprite files to `src/config.json`:

```json
{
    "images": [
        {
            "name": "bat-idle",
            "path": "./assets/Sprites/Bat/idle.png",
            "width": 0,
            "height": 0
        },
        {
            "name": "bat-idle-to-fly",
            "path": "./assets/Sprites/Bat/idle to fly.png",
            "width": 0,
            "height": 0
        },
        {
            "name": "bat-fly",
            "path": "./assets/Sprites/Bat/fly.png",
            "width": 0,
            "height": 0
        },
        {
            "name": "bat-bite",
            "path": "./assets/Sprites/Bat/bite.png",
            "width": 0,
            "height": 0
        },
        {
            "name": "bat-hit-death",
            "path": "./assets/Sprites/Bat/hit and death.png",
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
        // Shadow Bat sprite specs: 44x92px per frame
        this.batFrameWidth = 44;
        this.batFrameHeight = 92;
        this.batScale = 4; // Scale up for visibility
        this.batDisplayWidth = this.batFrameWidth * this.batScale;
        this.batDisplayHeight = this.batFrameHeight * this.batScale;

        // Animation state
        this.batAnimation = 'idle'; // 'idle', 'idle-to-fly', 'fly', 'bite', 'hit', 'death'
        this.batAnimationTypes = ['idle', 'idle-to-fly', 'fly', 'bite', 'hit', 'death'];
        this.batFrame = 0;
        this.batFrameTime = 0;
        this.batFrameInterval = 0.15; // seconds per frame
        this.batAutoAnimate = true;

        // Animation frame counts
        this.batAnimationFrames = {
            'idle': 7,          // 308 / 44 = 7
            'idle-to-fly': 6,   // 264 / 44 = 6
            'fly': 7,           // 308 / 44 = 7
            'bite': 8,          // 352 / 44 = 8
            'hit': 3,           // First 3 frames of hit and death
            'death': 4          // Last 4 frames of hit and death
        };
    }
}
```

### 3. Get Sprite Sheet

```javascript
// Get the sprite sheet for current animation
let spriteSheetName = 'bat-' + this.batAnimation;
if (this.batAnimation === 'idle-to-fly') {
    spriteSheetName = 'bat-idle-to-fly';
} else if (this.batAnimation === 'hit' || this.batAnimation === 'death') {
    spriteSheetName = 'bat-hit-death';
}

const spriteSheet = images.get(spriteSheetName);

if (!spriteSheet || !spriteSheet.image || !spriteSheet.image.complete || spriteSheet.image.naturalWidth === 0) {
    // Sprite not loaded yet
    return;
}
```

### 4. Extract and Display Current Frame

Since all frames are arranged horizontally in a single row:

```javascript
const maxFrames = this.batAnimationFrames[this.batAnimation];
let sourceX = this.batFrame * this.batFrameWidth;

// For death animation, adjust frame offset (death uses frames 3-6)
if (this.batAnimation === 'death') {
    sourceX = (this.batFrame + 3) * this.batFrameWidth; // Start from frame 3
}

// Draw the current frame
context.drawImage(
    spriteSheet.image,
    sourceX, 0, // Source position (x is frame * width, y is always 0)
    this.batFrameWidth, this.batFrameHeight, // Source size (44x92)
    destX, destY, // Destination position
    this.batDisplayWidth, this.batDisplayHeight // Destination size (scaled)
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
    if (this.batAutoAnimate) {
        this.batFrameTime += dt;
        if (this.batFrameTime >= this.batFrameInterval) {
            this.batFrameTime = 0;
            const maxFrames = this.batAnimationFrames[this.batAnimation];
            this.batFrame = (this.batFrame + 1) % maxFrames;
        }
    }
}
```

### 6. Switch Between Animations

```javascript
// Switch to a different animation
this.batAnimation = 'fly'; // or 'idle', 'idle-to-fly', 'bite', 'hit', 'death'
this.batFrame = 0; // Reset to start of new animation
this.batAutoAnimate = true; // Resume auto-animation
```

## Complete Example Structure

```javascript
import State from "../../lib/State.js";
import Input from "../../lib/Input.js";
import { images, CANVAS_WIDTH, CANVAS_HEIGHT, context, input } from "../globals.js";

export default class PlayState extends State {
    constructor() {
        super();
        // Shadow Bat sprite specs: 44x92px per frame
        this.batFrameWidth = 44;
        this.batFrameHeight = 92;
        this.batScale = 4; // Scale up for visibility
        this.batDisplayWidth = this.batFrameWidth * this.batScale;
        this.batDisplayHeight = this.batFrameHeight * this.batScale;

        // Animation state
        this.batAnimation = 'idle';
        this.batAnimationTypes = ['idle', 'idle-to-fly', 'fly', 'bite', 'hit', 'death'];
        this.batFrame = 0;
        this.batFrameTime = 0;
        this.batFrameInterval = 0.15;
        this.batAutoAnimate = true;

        // Animation frame counts
        this.batAnimationFrames = {
            'idle': 7,
            'idle-to-fly': 6,
            'fly': 7,
            'bite': 8,
            'hit': 3,
            'death': 4
        };
    }

    update(dt) {
        // Get sprite sheet name
        let spriteSheetName = 'bat-' + this.batAnimation;
        if (this.batAnimation === 'idle-to-fly') {
            spriteSheetName = 'bat-idle-to-fly';
        } else if (this.batAnimation === 'hit' || this.batAnimation === 'death') {
            spriteSheetName = 'bat-hit-death';
        }

        const spriteSheet = images.get(spriteSheetName);
        if (!spriteSheet || !spriteSheet.image || !spriteSheet.image.complete) {
            return;
        }

        // Manual frame navigation
        if (input.isKeyPressed(Input.KEYS.ARROW_RIGHT)) {
            this.batAutoAnimate = false;
            const maxFrames = this.batAnimationFrames[this.batAnimation];
            this.batFrame = (this.batFrame + 1) % maxFrames;
        }
        if (input.isKeyPressed(Input.KEYS.ARROW_LEFT)) {
            this.batAutoAnimate = false;
            const maxFrames = this.batAnimationFrames[this.batAnimation];
            this.batFrame = (this.batFrame - 1 + maxFrames) % maxFrames;
        }

        // Animation type selection
        if (input.isKeyPressed(Input.KEYS.ARROW_UP)) {
            const currentIndex = this.batAnimationTypes.indexOf(this.batAnimation);
            this.batAnimation = this.batAnimationTypes[(currentIndex - 1 + this.batAnimationTypes.length) % this.batAnimationTypes.length];
            this.batFrame = 0;
            this.batAutoAnimate = true;
        }
        if (input.isKeyPressed(Input.KEYS.ARROW_DOWN)) {
            const currentIndex = this.batAnimationTypes.indexOf(this.batAnimation);
            this.batAnimation = this.batAnimationTypes[(currentIndex + 1) % this.batAnimationTypes.length];
            this.batFrame = 0;
            this.batAutoAnimate = true;
        }

        // Toggle auto-animate
        if (input.isKeyPressed(Input.KEYS.SPACE)) {
            this.batAutoAnimate = !this.batAutoAnimate;
        }

        // Auto-animate frames
        if (this.batAutoAnimate) {
            this.batFrameTime += dt;
            if (this.batFrameTime >= this.batFrameInterval) {
                this.batFrameTime = 0;
                const maxFrames = this.batAnimationFrames[this.batAnimation];
                this.batFrame = (this.batFrame + 1) % maxFrames;
            }
        }
    }

    render() {
        // Clear with dark background
        context.fillStyle = '#1a1a2e';
        context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Get sprite sheet name
        let spriteSheetName = 'bat-' + this.batAnimation;
        if (this.batAnimation === 'idle-to-fly') {
            spriteSheetName = 'bat-idle-to-fly';
        } else if (this.batAnimation === 'hit' || this.batAnimation === 'death') {
            spriteSheetName = 'bat-hit-death';
        }

        const spriteSheet = images.get(spriteSheetName);

        if (!spriteSheet || !spriteSheet.image || !spriteSheet.image.complete || spriteSheet.image.naturalWidth === 0) {
            context.fillStyle = '#ffffff';
            context.font = '20px Arial';
            context.textAlign = 'left';
            context.fillText(`Shadow Bat sprite not loaded: ${spriteSheetName}`, 20, 30);
            return;
        }

        const maxFrames = this.batAnimationFrames[this.batAnimation];
        let sourceX = this.batFrame * this.batFrameWidth;
        
        // For death animation, adjust frame offset (death uses frames 3-6)
        if (this.batAnimation === 'death') {
            sourceX = (this.batFrame + 3) * this.batFrameWidth; // Start from frame 3
        }

        const centerX = CANVAS_WIDTH / 2;
        const centerY = CANVAS_HEIGHT / 2;
        const destX = centerX - this.batDisplayWidth / 2;
        const destY = centerY - this.batDisplayHeight / 2;

        // Draw background for sprite
        context.fillStyle = '#333333';
        context.fillRect(destX - 10, destY - 10, this.batDisplayWidth + 20, this.batDisplayHeight + 20);

        // Draw the current frame
        context.drawImage(
            spriteSheet.image,
            sourceX, 0, // Source position (x is frame * width, y is always 0)
            this.batFrameWidth, this.batFrameHeight, // Source size (44x92)
            destX, destY, // Destination position (centered)
            this.batDisplayWidth, this.batDisplayHeight // Destination size (scaled)
        );

        // Draw debug info
        context.fillStyle = '#ffffff';
        context.font = '24px Arial';
        context.textAlign = 'left';
        context.fillText('Shadow Bat Test', 20, 30);
        context.font = '20px Arial';
        context.fillText(`Animation: ${this.batAnimation.toUpperCase()}`, 20, 60);
        context.fillText(`Frame: ${this.batFrame + 1} / ${maxFrames} ${this.batAutoAnimate ? '(Auto)' : '(Manual)'}`, 20, 90);
        context.fillText(`Frame size: ${this.batFrameWidth} x ${this.batFrameHeight} px`, 20, 120);
        context.fillText(`Sheet: ${spriteSheet.image.width} x ${spriteSheet.image.height} px`, 20, 150);
    }
}
```

## Key Points to Remember

1. **Frame size is 44x92 pixels** - Always extract frames using this size
2. **Horizontal strip layout** - All frames are arranged side by side in a single row (y is always 0)
3. **Frame extraction formula** - `sourceX = currentFrame * 44`
4. **Frame count calculation** - `totalFrames = imageWidth / 44`
5. **Hit and Death share a sprite sheet** - `hit and death.png` contains both animations:
   - Hit uses frames 0-2 (first 3 frames)
   - Death uses frames 3-6 (last 4 frames)
   - When rendering death, add offset: `sourceX = (this.batFrame + 3) * 44`
6. **Sprite sheet naming** - Use `bat-idle-to-fly` for the transition animation and `bat-hit-death` for both hit and death
7. **Scale appropriately** - Use a scale of 3-4x for good visibility on screen

## Animation Details

- **Idle:** 7 frames - Bat hanging/idle pose
- **Idle to Fly:** 6 frames - Transition from idle to flying
- **Fly:** 7 frames - Flying animation loop
- **Bite:** 8 frames - Attack animation (longest)
- **Hit:** 3 frames - Quick hit reaction (first 3 frames of hit and death.png)
- **Death:** 4 frames - Death animation (last 4 frames of hit and death.png)

## Testing Checklist

- [ ] All 6 animation types load correctly
- [ ] Frames animate smoothly through each sprite sheet
- [ ] Frame counts match expected values (7, 6, 7, 8, 3, 4)
- [ ] Animation switching works correctly
- [ ] Hit animation displays frames 0-2 correctly
- [ ] Death animation displays frames 3-6 correctly (with offset)
- [ ] Sprite displays at appropriate size (scaled 3-4x)
- [ ] No frame extraction errors (all frames visible)

