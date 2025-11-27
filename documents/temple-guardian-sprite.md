# Temple Guardian Sprite Documentation

## Overview

This document details how to implement Temple Guardian sprite rendering using the individual labeled sprite files from `assets/Sprites/DARK - Temple Guardians/Temple Guardian/`.

## Sprite File Structure

### Individual Sprite Files

Each animation type has a separate sprite file:
- **Walk:** `walk.png` (8 frames)
- **Attack 1:** `attack 1 without VFX.png` (11 frames)
- **Attack 2:** `Attack 2 without VFX.png` (11 frames)
- **Special Attack:** `Special Without VFX.png` (14 frames)
- **Hit Reaction:** `hit.png` (2 frames)
- **Death:** `death.png` (10 frames)

**Note:** There are also versions with VFX (visual effects) available, but for basic implementation, use the "without VFX" versions.

### Frame Specifications

- **Frame size:** 160x59 pixels per frame
- **Layout:** Each sprite file is a vertical strip (all frames stacked vertically)
- **Frame extraction:** Extract frames by dividing image height by 59px
- **Width:** Always 160px (single column)

## Sprite Sheet Dimensions and Frame Counts

| Animation | File | Dimensions | Frame Count | Calculation |
|-----------|------|------------|-------------|-------------|
| Walk | `walk.png` | 160 x 472 | 8 frames | 472 ÷ 59 = 8 |
| Attack 1 | `attack 1 without VFX.png` | 160 x 649 | 11 frames | 649 ÷ 59 = 11 |
| Attack 2 | `Attack 2 without VFX.png` | 160 x 649 | 11 frames | 649 ÷ 59 = 11 |
| Special | `Special Without VFX.png` | 160 x 826 | 14 frames | 826 ÷ 59 = 14 |
| Hit | `hit.png` | 160 x 118 | 2 frames | 118 ÷ 59 = 2 |
| Death | `death.png` | 160 x 590 | 10 frames | 590 ÷ 59 = 10 |

## Implementation Steps

### 1. Add Sprites to config.json

Add all Temple Guardian sprite files to `src/config.json`:

```json
{
    "images": [
        {
            "name": "temple-guardian-walk",
            "path": "./assets/Sprites/DARK - Temple Guardians/Temple Guardian/walk.png",
            "width": 0,
            "height": 0
        },
        {
            "name": "temple-guardian-attack1",
            "path": "./assets/Sprites/DARK - Temple Guardians/Temple Guardian/attack 1 without VFX.png",
            "width": 0,
            "height": 0
        },
        {
            "name": "temple-guardian-attack2",
            "path": "./assets/Sprites/DARK - Temple Guardians/Temple Guardian/Attack 2 without VFX.png",
            "width": 0,
            "height": 0
        },
        {
            "name": "temple-guardian-special",
            "path": "./assets/Sprites/DARK - Temple Guardians/Temple Guardian/Special Without VFX.png",
            "width": 0,
            "height": 0
        },
        {
            "name": "temple-guardian-hit",
            "path": "./assets/Sprites/DARK - Temple Guardians/Temple Guardian/hit.png",
            "width": 0,
            "height": 0
        },
        {
            "name": "temple-guardian-death",
            "path": "./assets/Sprites/DARK - Temple Guardians/Temple Guardian/death.png",
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
        // Sprite specs: 160x59px per frame
        this.guardianFrameWidth = 160;
        this.guardianFrameHeight = 59;
        this.guardianScale = 4; // Scale up for visibility
        this.guardianDisplayWidth = this.guardianFrameWidth * this.guardianScale;
        this.guardianDisplayHeight = this.guardianFrameHeight * this.guardianScale;

        // Animation state
        this.currentAnimation = 'walk'; // 'walk', 'attack1', 'attack2', 'special', 'hit', 'death'
        this.animationTypes = ['walk', 'attack1', 'attack2', 'special', 'hit', 'death'];
        this.currentFrame = 0;
        this.frameTime = 0;
        this.frameInterval = 0.15; // seconds per frame
        this.autoAnimate = true;

        // Animation frame counts (calculated from sprite sheet dimensions)
        this.animationFrames = {
            'walk': 8,      // 472 / 59 = 8
            'attack1': 11,  // 649 / 59 = 11
            'attack2': 11,  // 649 / 59 = 11
            'special': 14,  // 826 / 59 = 14
            'hit': 2,       // 118 / 59 = 2
            'death': 10     // 590 / 59 = 10
        };
    }
}
```

### 3. Get Sprite Sheet

```javascript
// Get the sprite sheet for current animation
const spriteSheet = images.get(`temple-guardian-${this.currentAnimation}`);

if (!spriteSheet || !spriteSheet.image || !spriteSheet.image.complete) {
    // Sprite not loaded yet
    return;
}
```

### 4. Extract and Display Current Frame

Since all frames are stacked vertically in a single column:

```javascript
// Calculate source Y position (frame index * frame height)
const sourceY = this.currentFrame * this.guardianFrameHeight;

// Draw the current frame
context.drawImage(
    spriteSheet.image,
    0, sourceY,                                    // Source position (x is always 0, y is frame * height)
    this.guardianFrameWidth, this.guardianFrameHeight, // Source size (160x59)
    destX, destY,                                  // Destination position
    this.guardianDisplayWidth, this.guardianDisplayHeight // Destination size (scaled)
);
```

### 5. Animate Through Frames

```javascript
update(dt) {
    const spriteSheet = images.get(`temple-guardian-${this.currentAnimation}`);
    if (!spriteSheet || !spriteSheet.image || !spriteSheet.image.complete) {
        return;
    }

    // Auto-animate frames
    if (this.autoAnimate) {
        this.frameTime += dt;
        if (this.frameTime >= this.frameInterval) {
            this.frameTime = 0;
            const maxFrames = this.animationFrames[this.currentAnimation];
            this.currentFrame = (this.currentFrame + 1) % maxFrames;
        }
    }
}
```

### 6. Switch Between Animations

```javascript
// Switch to a different animation
this.currentAnimation = 'attack1'; // or 'attack2', 'special', 'hit', 'death', 'walk'
this.currentFrame = 0; // Reset to start of new animation
this.autoAnimate = true; // Resume auto-animation
```

## Complete Example Structure

```javascript
import State from "../../lib/State.js";
import Input from "../../lib/Input.js";
import { images, CANVAS_WIDTH, CANVAS_HEIGHT, context, input } from "../globals.js";

export default class PlayState extends State {
    constructor() {
        super();
        // Sprite specs: 160x59px per frame
        this.guardianFrameWidth = 160;
        this.guardianFrameHeight = 59;
        this.guardianScale = 4; // Scale up for visibility
        this.guardianDisplayWidth = this.guardianFrameWidth * this.guardianScale;
        this.guardianDisplayHeight = this.guardianFrameHeight * this.guardianScale;

        // Animation state
        this.currentAnimation = 'walk';
        this.animationTypes = ['walk', 'attack1', 'attack2', 'special', 'hit', 'death'];
        this.currentFrame = 0;
        this.frameTime = 0;
        this.frameInterval = 0.15;
        this.autoAnimate = true;

        // Animation frame counts
        this.animationFrames = {
            'walk': 8,
            'attack1': 11,
            'attack2': 11,
            'special': 14,
            'hit': 2,
            'death': 10
        };
    }

    update(dt) {
        const spriteSheet = images.get(`temple-guardian-${this.currentAnimation}`);
        if (!spriteSheet || !spriteSheet.image || !spriteSheet.image.complete) {
            return;
        }

        // Manual frame navigation
        if (input.isKeyPressed(Input.KEYS.ARROW_RIGHT)) {
            this.autoAnimate = false;
            const maxFrames = this.animationFrames[this.currentAnimation];
            this.currentFrame = (this.currentFrame + 1) % maxFrames;
        }
        if (input.isKeyPressed(Input.KEYS.ARROW_LEFT)) {
            this.autoAnimate = false;
            const maxFrames = this.animationFrames[this.currentAnimation];
            this.currentFrame = (this.currentFrame - 1 + maxFrames) % maxFrames;
        }

        // Animation type selection
        if (input.isKeyPressed(Input.KEYS.ARROW_UP)) {
            const currentIndex = this.animationTypes.indexOf(this.currentAnimation);
            this.currentAnimation = this.animationTypes[(currentIndex - 1 + this.animationTypes.length) % this.animationTypes.length];
            this.currentFrame = 0;
            this.autoAnimate = true;
        }
        if (input.isKeyPressed(Input.KEYS.ARROW_DOWN)) {
            const currentIndex = this.animationTypes.indexOf(this.currentAnimation);
            this.currentAnimation = this.animationTypes[(currentIndex + 1) % this.animationTypes.length];
            this.currentFrame = 0;
            this.autoAnimate = true;
        }

        // Toggle auto-animate
        if (input.isKeyPressed(Input.KEYS.SPACE)) {
            this.autoAnimate = !this.autoAnimate;
        }

        // Auto-animate frames
        if (this.autoAnimate) {
            this.frameTime += dt;
            if (this.frameTime >= this.frameInterval) {
                this.frameTime = 0;
                const maxFrames = this.animationFrames[this.currentAnimation];
                this.currentFrame = (this.currentFrame + 1) % maxFrames;
            }
        }
    }

    render() {
        // Clear with dark background
        context.fillStyle = '#1a1a2e';
        context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        const spriteSheet = images.get(`temple-guardian-${this.currentAnimation}`);

        if (!spriteSheet || !spriteSheet.image || !spriteSheet.image.complete) {
            context.fillStyle = '#ffffff';
            context.font = '20px Arial';
            context.fillText(`Temple Guardian sprite not loaded: ${this.currentAnimation}`, 20, 30);
            return;
        }

        const maxFrames = this.animationFrames[this.currentAnimation];
        const sourceY = this.currentFrame * this.guardianFrameHeight;

        const centerX = CANVAS_WIDTH / 2;
        const centerY = CANVAS_HEIGHT / 2;
        const destX = centerX - this.guardianDisplayWidth / 2;
        const destY = centerY - this.guardianDisplayHeight / 2;

        // Draw background for sprite
        context.fillStyle = '#333333';
        context.fillRect(destX - 10, destY - 10, this.guardianDisplayWidth + 20, this.guardianDisplayHeight + 20);

        // Draw the current frame
        context.drawImage(
            spriteSheet.image,
            0, sourceY, // Source position (x is always 0, y is frame * height)
            this.guardianFrameWidth, this.guardianFrameHeight, // Source size (160x59)
            destX, destY, // Destination position (centered)
            this.guardianDisplayWidth, this.guardianDisplayHeight // Destination size (scaled)
        );

        // Draw debug info
        context.fillStyle = '#ffffff';
        context.font = '24px Arial';
        context.textAlign = 'left';
        context.fillText('Temple Guardian Test', 20, 30);
        context.font = '20px Arial';
        context.fillText(`Animation: ${this.currentAnimation.toUpperCase()}`, 20, 60);
        context.fillText(`Frame: ${this.currentFrame + 1} / ${maxFrames} ${this.autoAnimate ? '(Auto)' : '(Manual)'}`, 20, 90);
        context.fillText(`Frame size: ${this.guardianFrameWidth} x ${this.guardianFrameHeight} px`, 20, 120);
        context.fillText(`Sheet: ${spriteSheet.image.width} x ${spriteSheet.image.height} px`, 20, 150);
    }
}
```

## Key Points to Remember

1. **Frame size is 160x59 pixels** - Always extract frames using this size
2. **Vertical strip layout** - All frames are stacked vertically in a single column (x is always 0)
3. **No directions** - Unlike the enemy sprite, Temple Guardian has no directional variations (single facing direction)
4. **Frame extraction formula** - `sourceY = currentFrame * 59`
5. **Frame count calculation** - `totalFrames = imageHeight / 59`
6. **High-resolution sprite** - This is a high-quality, detailed sprite (160x59 per frame), much larger than typical 16x16 or 32x32 pixel art
7. **Scale appropriately** - Use a scale of 3-4x for good visibility on screen

## Animation Details

- **Walk:** 8 frames - Standard walking/running cycle
- **Attack 1:** 11 frames - Light attack animation
- **Attack 2:** 11 frames - Heavier attack animation
- **Special:** 14 frames - Special attack (longest animation)
- **Hit:** 2 frames - Quick hit reaction
- **Death:** 10 frames - Death animation

## Testing Checklist

- [ ] All 6 animation types load correctly
- [ ] Frames animate smoothly through each sprite sheet
- [ ] Frame counts match expected values (8, 11, 11, 14, 2, 10)
- [ ] Animation switching works correctly
- [ ] Sprite displays at appropriate size (scaled 3-4x)
- [ ] No frame extraction errors (all frames visible)

