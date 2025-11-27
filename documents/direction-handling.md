# Direction Handling for Top-Down Game

## Problem

In a top-down game, we ideally want 8-directional sprites (N, NE, E, SE, S, SW, W, NW) for all characters. However, only the **Shadow Creature (player)** has full 8-directional sprite support. The other enemies (Temple Guardian, Spirit Boxer, Shadow Bat) do not have 8-directional sprites.

## Solution: Sprite Flipping + Angle-Based Facing

### For Temple Guardian & Spirit Boxer

These enemies have single-direction sprites (typically facing right). We use **sprite flipping** combined with **angle calculation** to make them face the player:

#### Implementation:

```javascript
// Calculate angle from enemy to player
const dx = player.x - enemy.x;
const dy = player.y - enemy.y;
const angle = Math.atan2(dy, dx) * (180 / Math.PI); // Convert to degrees

// Normalize angle to 0-360
const normalizedAngle = (angle + 360) % 360;

// Determine if enemy should face left or right
// Right half: 0° to 180° (normal sprite)
// Left half: 180° to 360° (flipped sprite)
const shouldFlip = normalizedAngle > 180;

// Render with flip
context.save();
if (shouldFlip) {
    context.translate(enemy.x + spriteWidth, enemy.y);
    context.scale(-1, 1); // Flip horizontally
    context.translate(-enemy.x, -enemy.y);
}
// Draw sprite normally
context.drawImage(spriteSheet, ...);
context.restore();
```

#### Why This Works:

- **Visual Illusion:** Even though the sprite only faces one direction, flipping it creates the appearance of facing left/right
- **Top-Down Perspective:** In a top-down view, players primarily see the character from above, so left/right facing is more important than front/back
- **Simple & Effective:** Works well for enemies that primarily move horizontally or need to face the player

### For Shadow Bat

The Shadow Bat is a flying enemy, so it doesn't need directional sprites:

- **Flying Animation:** The bat's animations (idle, fly, bite) work from any angle
- **Optional Rotation:** If needed, we can apply a slight rotation to the sprite based on movement direction:
  ```javascript
  const moveAngle = Math.atan2(velocityY, velocityX);
  context.save();
  context.translate(bat.x, bat.y);
  context.rotate(moveAngle);
  context.drawImage(batSprite, -spriteWidth/2, -spriteHeight/2);
  context.restore();
  ```
- **Simpler Approach:** Just use the animation as-is—flying creatures don't need to "face" a direction as clearly

## Player (Shadow Creature)

The Shadow Creature has full 8-directional support:

- **8 Directions:** N, NE, E, SE, S, SW, W, NW
- **Full Rotation:** Player can face any direction naturally
- **Smooth Movement:** No flipping needed—just select the correct sprite based on movement direction

## Direction Calculation for Player

```javascript
// Calculate movement direction
const dx = targetX - currentX;
const dy = targetY - currentY;
const angle = Math.atan2(dy, dx) * (180 / Math.PI);
const normalizedAngle = (angle + 360) % 360;

// Map angle to 8 directions
const directions = ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'];
const directionAngles = [0, 45, 90, 135, 180, 225, 270, 315];

// Find closest direction
let closestDir = 'e';
let minDiff = 360;
for (let i = 0; i < directionAngles.length; i++) {
    const diff = Math.abs(normalizedAngle - directionAngles[i]);
    if (diff < minDiff) {
        minDiff = diff;
        closestDir = directions[i];
    }
}
```

## Summary

| Character | Sprite Support | Solution |
|-----------|---------------|----------|
| **Shadow Creature (Player)** | 8 directions | Use full directional sprites |
| **Temple Guardian** | 1 direction | Sprite flipping + angle-based facing |
| **Spirit Boxer** | 1 direction | Sprite flipping + angle-based facing |
| **Shadow Bat** | No directions needed | Use animations as-is (flying enemy) |

This approach allows all enemies to feel responsive and face the player appropriately while working within sprite limitations. The player gets the full 8-directional experience, while enemies use smart flipping to create the illusion of facing the player.

