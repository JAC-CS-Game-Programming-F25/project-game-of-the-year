# Map and Player Implementation Documentation

This document details the implementation of the Tiled map system and player movement that was built and tested. This can be used as a reference for re-implementing these features later.

## Overview

We implemented:
1. **Tiled Map Loading** - Loading and rendering maps from `.tmx` files
2. **Tile-based Player Movement** - Shadow Creature player with 8-directional movement
3. **Collision Detection** - Using collision layer from Tiled
4. **Direction Tweening** - Smooth transitions through intermediate directions
5. **Camera System** - Auto-zoom and follow player

## Map System

### Tiled Map File Structure

- **File**: `terrainMapTiled.tmx` (at project root)
- **Tileset**: `ground.tsx` (references `Ground_rocks.png`)
- **Layers**:
  - `Ground` - Visual tiles (rendered)
  - `Collisions` - Collision layer (0 = walkable, non-zero = collision)

### Map Loading Implementation

```javascript
async loadMap() {
    // Fetch and parse TMX file
    const response = await fetch('./terrainMapTiled.tmx');
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Extract map dimensions
    const mapElement = xmlDoc.querySelector('map');
    this.mapWidth = parseInt(mapElement.getAttribute('width'));
    this.mapHeight = parseInt(mapElement.getAttribute('height'));
    
    // Parse layers (separate collision layer)
    const layers = xmlDoc.querySelectorAll('layer');
    layers.forEach((layer) => {
        const layerName = layer.getAttribute('name');
        const csvData = layer.querySelector('data').textContent.trim();
        
        // Parse CSV into 2D array
        const rows = csvData.split('\n').filter(row => row.trim() !== '');
        const layerData = rows.map(row => {
            return row.split(',').filter(val => val.trim() !== '')
                .map(val => parseInt(val.trim()));
        });
        
        // Store collision layer separately
        if (layerName.toLowerCase().includes('collision')) {
            this.collisionLayer = layerData;
        } else {
            this.mapLayers.push({ name: layerName, data: layerData });
        }
    });
}
```

### Map Rendering

- **Tile Size**: 16x16 pixels (from tileset)
- **Scale**: 4x (64px display size), with auto-zoom to fit map
- **GID Handling**: Mask flip flags (`0x3FFFFFFF`) before converting to tile coordinates
- **Tileset**: 31 columns (from `ground.tsx`)

```javascript
// Convert GID to tile coordinates
const FLIP_MASK = 0x3FFFFFFF;
gid = gid & FLIP_MASK; // Remove flip flags
const tileIndex = gid - 1; // GID is 1-indexed
const tileCol = tileIndex % this.tilesetColumns;
const tileRow = Math.floor(tileIndex / this.tilesetColumns);
```

### Camera System

- **Auto-zoom**: Calculates scale to fit entire map on screen
- **Auto-center**: Centers camera on map bounds
- **Follow player**: Camera follows player position
- **Zoom factor**: 1.5x additional zoom for closer view

## Player System

### Player State Variables

```javascript
// Position
this.playerTileX = 0; // Tile coordinates (not pixels)
this.playerTileY = 0;

// Direction
this.playerTargetDirection = 0; // Target direction (input)
this.playerDisplayDirection = 0; // Displayed direction (tweened)

// Animation
this.playerFrame = 0;
this.playerFrameTime = 0;
this.playerFrameInterval = 0.15;

// Display
this.playerScale = 8; // Scale relative to tiles
this.playerDisplaySize = this.displayTileSize * this.playerScale;
```

### Movement System

**Tile-based movement** - Player moves one tile at a time:
- Uses `isKeyPressed` for movement (one tile per press)
- Uses `isKeyHeld` for direction (smooth direction updates)
- Checks collision layer before allowing movement

```javascript
// Check collision
isValidTile(tileX, tileY) {
    if (this.collisionLayer) {
        const collisionGid = this.collisionLayer[tileY][tileX];
        return collisionGid === 0; // 0 = walkable
    }
    // Fallback to ground layer
    const gid = this.mapLayers[0].data[tileY][tileX];
    return gid !== 0; // Non-zero = walkable
}
```

### Direction System

**8 Directions** (clockwise from East):
```javascript
this.directions = ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'];
```

**Direction Mapping** (for idle sprites - NW/NE swapped):
```javascript
this.directionToSpriteIdle = {
    'e': 'e', 'se': 'se', 's': 's', 'sw': 'sw',
    'w': 'w', 'nw': 'ne', 'n': 'n', 'ne': 'nw' // NW/NE swapped
};
```

### Direction Tweening

**Smooth transitions** through intermediate directions:
- When moving from Right (0) to Up (6), shows: Right → Up-Right (7) → Up
- Duration: 800ms (configurable via `directionTweenDuration`)
- Handles wrap-around (e.g., Up-Right to Right)

```javascript
// Tween logic
if (Math.abs(diff) > 1) {
    // Multi-step: transition through intermediate
    if (t < 0.5) {
        const intermediateDir = (startDir + Math.sign(diff) + 8) % 8;
        this.playerDisplayDirection = intermediateDir;
    } else {
        this.playerDisplayDirection = endDir;
    }
}
```

### Sprite Rendering

**Uses enemy-sprite.md implementation**:
- Frame size: 256x256 pixels
- Calculates total frames: `(width / 256) * (height / 256)`
- Uses `naturalWidth`/`naturalHeight` for actual dimensions
- Sprite name format: `enemy-idle-${direction}`

## Config.json Changes

Added to `src/config.json`:
```json
{
    "images": [
        {
            "name": "terrain-ground-rocks",
            "path": "./assets/Sprites/Free-Undead-Tileset-Top-Down-Pixel-Art/PNG/Ground_rocks.png",
            "width": 0,
            "height": 0
        },
        {
            "name": "enemy-idle-n",
            "path": "./assets/Sprites/E_Bros_Assets_TopDownEnemy/Enemy-Melee-Idle-N.png",
            "width": 0,
            "height": 0
        },
        // ... all 8 directions (n, ne, e, se, s, sw, w, nw)
    ]
}
```

## Globals.js Changes

```javascript
export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;
```

## Key Implementation Details

### Image Loading
- Made `Images.load()` async with `Promise.all`
- Handles cached images (checks `image.complete`)
- Uses `naturalWidth`/`naturalHeight` for dimensions

### Map Parsing
- Handles trailing commas in CSV
- Separates collision layer from visual layers
- Calculates bounding box for auto-zoom

### Player Movement
- Tile-based (not pixel-based)
- Collision checks before movement
- Camera follows player automatically

### Direction Tweening
- Smooth transitions through intermediate directions
- Handles wrap-around correctly
- Configurable duration

## Testing Notes

- Map loads from `terrainMapTiled.tmx` at project root
- Collision layer named "Collisions" (case-insensitive check)
- Player starts at first valid tile in map
- Direction tweening visible when changing directions (800ms duration)

## Files Modified

1. `src/config.json` - Added terrain and player sprites
2. `src/globals.js` - Set canvas dimensions
3. `src/states/PlayState.js` - Complete implementation (502 lines)
4. `lib/Images.js` - Made async, handle cached images
5. `lib/Graphic.js` - Set src after handlers

## Future Improvements (Not Implemented)

- Entity classes for Player/Enemies
- Enums for directions instead of magic strings
- Factory pattern for creating entities
- Save/load system
- Win/loss conditions
- Score system
- Sound effects
- Custom fonts

