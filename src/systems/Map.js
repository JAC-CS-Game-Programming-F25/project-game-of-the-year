import Vector from '../../lib/Vector.js';

/**
 * Map class for loading and rendering Tiled TMX maps
 */
export default class Map {
	constructor(tmxPath, images) {
		this.tmxPath = tmxPath;
		this.images = images;
		this.width = 0;
		this.height = 0;
		this.tileWidth = 0;
		this.tileHeight = 0;
		this.tilesets = [];
		this.layers = [];
		this.collisionLayer = null;
		this.exits = []; // Exit zones for map transitions
		this.loaded = false;
	}

	/**
	 * Load map from TMX file
	 */
	async load() {
		try {
			const response = await fetch(this.tmxPath);
			const xmlText = await response.text();
			const parser = new DOMParser();
			const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

			// Parse map properties
			const mapElement = xmlDoc.querySelector('map');
			this.width = parseInt(mapElement.getAttribute('width'));
			this.height = parseInt(mapElement.getAttribute('height'));
			this.tileWidth = parseInt(mapElement.getAttribute('tilewidth'));
			this.tileHeight = parseInt(mapElement.getAttribute('tileheight'));

			// Parse tilesets
			const tilesetElements = xmlDoc.querySelectorAll('tileset');
			for (const tilesetEl of tilesetElements) {
				const firstGid = parseInt(tilesetEl.getAttribute('firstgid'));
				const source = tilesetEl.getAttribute('source');
				
				if (source) {
					// External tileset file
					const tileset = await this.loadTileset(source, firstGid);
					if (tileset) {
						this.tilesets.push(tileset);
					}
				} else {
					// Embedded tileset
					const tileset = this.parseEmbeddedTileset(tilesetEl, firstGid);
					if (tileset) {
						this.tilesets.push(tileset);
					}
				}
			}

			// Sort tilesets by firstGid descending
			this.tilesets.sort((a, b) => b.firstGid - a.firstGid);

			// Parse layers
			const layerElements = xmlDoc.querySelectorAll('layer');
			for (const layerEl of layerElements) {
				const layerName = layerEl.getAttribute('name');
				const visible = layerEl.getAttribute('visible');
				
				// Skip invisible layers except collisions
				if (visible === '0' && layerName.toLowerCase() !== 'collisions') {
					continue;
				}
				
				const layer = this.parseLayer(layerEl);
				
				if (layerName.toLowerCase() === 'collisions') {
					this.collisionLayer = layer;
				} else {
					this.layers.push(layer);
				}
			}

			// Parse object layers (exits)
			const objectGroupElements = xmlDoc.querySelectorAll('objectgroup');
			for (const objectGroupEl of objectGroupElements) {
				const groupName = objectGroupEl.getAttribute('name');
				
				if (groupName && groupName.toLowerCase() === 'exits') {
					this.parseExits(objectGroupEl);
				}
			}

			this.loaded = true;
		} catch (error) {
			console.error('Error loading map:', error);
			this.loaded = false;
		}
	}

	/**
	 * Load external tileset from TSX file
	 */
	async loadTileset(sourcePath, firstGid) {
		try {
			// Get directory of TMX file
			const tmxDir = this.tmxPath.substring(0, this.tmxPath.lastIndexOf('/') + 1);
			const fullPath = tmxDir + sourcePath;
			
			const response = await fetch(fullPath);
			const xmlText = await response.text();
			const parser = new DOMParser();
			const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

			return this.parseEmbeddedTileset(xmlDoc.querySelector('tileset'), firstGid, fullPath);
		} catch (error) {
			console.error(`Error loading tileset ${sourcePath}:`, error);
			return null;
		}
	}

	/**
	 * Parse embedded tileset element (handles both single-image and image-collection)
	 */
	parseEmbeddedTileset(tilesetEl, firstGid, tsxPath = null) {
		const name = tilesetEl.getAttribute('name') || 'unnamed';
		const tileWidth = parseInt(tilesetEl.getAttribute('tilewidth'));
		const tileHeight = parseInt(tilesetEl.getAttribute('tileheight'));
		const tileCount = parseInt(tilesetEl.getAttribute('tilecount')) || 0;
		const columns = parseInt(tilesetEl.getAttribute('columns')) || 0;
		const margin = parseInt(tilesetEl.getAttribute('margin')) || 0;
		const spacing = parseInt(tilesetEl.getAttribute('spacing')) || 0;
		
		// Check for single-image tileset
		const imageEl = tilesetEl.querySelector('image');
		
		if (imageEl) {
			// SINGLE-IMAGE TILESET (grid-based spritesheet)
			let imageSource = imageEl.getAttribute('source');
			
			// Resolve path
			if (tsxPath) {
				const tsxDir = tsxPath.substring(0, tsxPath.lastIndexOf('/') + 1);
				imageSource = tsxDir + imageSource;
			} else {
				const tmxDir = this.tmxPath.substring(0, this.tmxPath.lastIndexOf('/') + 1);
				imageSource = tmxDir + imageSource;
			}

			// Extract image name from path
			const imageFileName = imageSource.split('/').pop();
			const imageName = imageFileName.split('.')[0].toLowerCase().replace(/_/g, '-');
			
			const graphic = this.images.get(imageName);
			
			if (!graphic) {
				console.warn(`Tileset image "${imageName}" not found in Images. Check config.json`);
			}

			return {
				name,
				firstGid,
				tileWidth,
				tileHeight,
				columns,
				tileCount,
				margin,
				spacing,
				imageSource,
				imageName,
				graphic,
				type: 'single-image'
			};
		} else {
			// IMAGE-COLLECTION TILESET (individual images per tile)
			const tiles = {};
			const tileElements = tilesetEl.querySelectorAll('tile');
			
			for (const tileEl of tileElements) {
				const localId = parseInt(tileEl.getAttribute('id'));
				const tileImageEl = tileEl.querySelector('image');
				
				if (tileImageEl) {
					let imageSource = tileImageEl.getAttribute('source');
					
					// Resolve path
					if (tsxPath) {
						const tsxDir = tsxPath.substring(0, tsxPath.lastIndexOf('/') + 1);
						imageSource = tsxDir + imageSource;
					} else {
						const tmxDir = this.tmxPath.substring(0, this.tmxPath.lastIndexOf('/') + 1);
						imageSource = tmxDir + imageSource;
					}
					
					const imageFileName = imageSource.split('/').pop();
					const imageName = imageFileName.split('.')[0].toLowerCase().replace(/_/g, '-');
					const graphic = this.images.get(imageName);
					
					if (!graphic) {
						console.warn(`Tile image "${imageName}" not found in Images for tile ${localId}`);
					}
					
					tiles[localId] = {
						imageName,
						graphic,
						width: parseInt(tileImageEl.getAttribute('width')) || tileWidth,
						height: parseInt(tileImageEl.getAttribute('height')) || tileHeight
					};
				}
			}
			
			return {
				name,
				firstGid,
				tileWidth,
				tileHeight,
				tileCount,
				tiles,
				type: 'image-collection'
			};
		}
	}

	/**
	 * Parse a layer element
	 */
	parseLayer(layerEl) {
		const name = layerEl.getAttribute('name');
		const width = parseInt(layerEl.getAttribute('width'));
		const height = parseInt(layerEl.getAttribute('height'));
		const dataEl = layerEl.querySelector('data');
		const encoding = dataEl.getAttribute('encoding');
		
		let tileData = [];
		
		if (encoding === 'csv') {
			const csvText = dataEl.textContent.trim();
			tileData = csvText.split(/[,\s]+/).map(id => parseInt(id)).filter(id => !isNaN(id));
		}

		return {
			name,
			width,
			height,
			tileData
		};
	}

	/**
	 * Get the tileset for a given tile GID (Per Tiled spec: largest firstgid ≤ cleanGid)
	 */
	getTilesetForGid(gid) {
		if (gid === 0) return null;
		
		let chosen = null;
		for (const tileset of this.tilesets) {
			if (gid >= tileset.firstGid && (!chosen || tileset.firstGid > chosen.firstGid)) {
				chosen = tileset;
			}
		}
		return chosen;
	}

	/**
	 * Check if a tile position is collidable
	 */
	isCollidable(tileX, tileY) {
		if (!this.collisionLayer) return false;
		
		if (tileX < 0 || tileX >= this.collisionLayer.width ||
			tileY < 0 || tileY >= this.collisionLayer.height) {
			return true; // Out of bounds is collidable
		}

		const index = tileY * this.collisionLayer.width + tileX;
		const gid = this.collisionLayer.tileData[index];
		return gid !== 0 && gid !== undefined;
	}

	/**
	 * Convert world coordinates to tile coordinates
	 */
	worldToTile(worldX, worldY) {
		return {
			x: Math.floor(worldX / this.tileWidth),
			y: Math.floor(worldY / this.tileHeight)
		};
	}

	/**
	 * Convert tile coordinates to world coordinates
	 */
	tileToWorld(tileX, tileY) {
		return {
			x: tileX * this.tileWidth,
			y: tileY * this.tileHeight
		};
	}

	/**
	 * Parse exit objects from object layer
	 */
	parseExits(objectGroupElement) {
		const objectElements = objectGroupElement.querySelectorAll('object');
		
		for (const objectEl of objectElements) {
			const x = parseFloat(objectEl.getAttribute('x'));
			const y = parseFloat(objectEl.getAttribute('y'));
			const width = parseFloat(objectEl.getAttribute('width'));
			const height = parseFloat(objectEl.getAttribute('height'));
			
			this.exits.push({
				x: x,
				y: y,
				width: width,
				height: height
			});
		}
	}

	/**
	 * Check if a position overlaps with any exit zone
	 */
	checkExitCollision(x, y, width, height) {
		for (let i = 0; i < this.exits.length; i++) {
			const exit = this.exits[i];
			
			// AABB collision
			if (x < exit.x + exit.width &&
				x + width > exit.x &&
				y < exit.y + exit.height &&
				y + height > exit.y) {
				return i; // Return exit index
			}
		}
		return -1; // No collision
	}

	/**
	 * Render the map (fully Tiled-compliant with flip flags and both tileset types)
	 */
	render(context, camera) {
		if (!this.loaded) return;

		// Tiled flip flags per official spec
		const FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
		const FLIPPED_VERTICALLY_FLAG   = 0x40000000;
		const FLIPPED_DIAGONALLY_FLAG   = 0x20000000;
		const HEX_ROTATE_FLAG           = 0x10000000;

		// Calculate visible tile range
		const startTileX = Math.max(0, Math.floor(camera.x / this.tileWidth) - 1);
		const endTileX = Math.min(this.width - 1, Math.floor((camera.x + camera.width) / this.tileWidth) + 1);
		const startTileY = Math.max(0, Math.floor(camera.y / this.tileHeight) - 1);
		const endTileY = Math.min(this.height - 1, Math.floor((camera.y + camera.height) / this.tileHeight) + 1);

		// Render each layer
		for (const layer of this.layers) {
			for (let tileY = startTileY; tileY <= endTileY; tileY++) {
				for (let tileX = startTileX; tileX <= endTileX; tileX++) {
					const index = tileY * layer.width + tileX;
					const rawGid = layer.tileData[index];

					if (rawGid === 0 || rawGid === undefined) continue;

					// Step 1: Decode GID and extract flip flags
					const gid = rawGid >>> 0; // Force unsigned 32-bit
					const flippedHorizontally = (gid & FLIPPED_HORIZONTALLY_FLAG) !== 0;
					const flippedVertically   = (gid & FLIPPED_VERTICALLY_FLAG)   !== 0;
					const flippedDiagonally   = (gid & FLIPPED_DIAGONALLY_FLAG)   !== 0;

					// Clear all flag bits to get clean GID
					const cleanGid = gid & ~(
						FLIPPED_HORIZONTALLY_FLAG |
						FLIPPED_VERTICALLY_FLAG |
						FLIPPED_DIAGONALLY_FLAG |
						HEX_ROTATE_FLAG
					);

					if (cleanGid === 0) continue;

					// Step 2: Find correct tileset
					const tileset = this.getTilesetForGid(cleanGid);
					if (!tileset) {
						console.warn(`No tileset found for cleanGid ${cleanGid}`);
						continue;
					}

					// Calculate local tile ID
					const localId = cleanGid - tileset.firstGid;

					// Step 3: Get source rect based on tileset type
					let sourceImage = null;
					let sx = 0, sy = 0, sw = this.tileWidth, sh = this.tileHeight;

					if (tileset.type === 'single-image') {
						// SINGLE-IMAGE TILESET: grid-based spritesheet
						const graphic = this.images.get(tileset.imageName);
						if (!graphic || !graphic.image || !graphic.image.complete) continue;

						sourceImage = graphic.image;
						
						const margin = tileset.margin || 0;
						const spacing = tileset.spacing || 0;
						const cols = tileset.columns || 1;

						const tileX_local = localId % cols;
						const tileY_local = Math.floor(localId / cols);

						sx = margin + tileX_local * (tileset.tileWidth + spacing);
						sy = margin + tileY_local * (tileset.tileHeight + spacing);
						sw = tileset.tileWidth;
						sh = tileset.tileHeight;

					} else if (tileset.type === 'image-collection') {
						// IMAGE-COLLECTION TILESET: each tile has its own image
						const tileInfo = tileset.tiles[localId];
						if (!tileInfo || !tileInfo.graphic || !tileInfo.graphic.image) {
							console.warn(`Tile ${localId} not found in image-collection tileset ${tileset.name}`);
							continue;
						}

						sourceImage = tileInfo.graphic.image;
						sx = 0;
						sy = 0;
						sw = tileInfo.width;
						sh = tileInfo.height;
					} else {
						console.warn(`Unknown tileset type: ${tileset.type}`);
						continue;
					}

					// Step 4: Draw with correct transforms
					const destX = tileX * this.tileWidth - camera.x;
					const destY = tileY * this.tileHeight - camera.y;

					if (flippedHorizontally || flippedVertically || flippedDiagonally) {
						context.save();
						context.translate(destX + this.tileWidth / 2, destY + this.tileHeight / 2);

						let scaleX = 1;
						let scaleY = 1;
						let rotation = 0;

						// Apply diagonal flip FIRST (90° rotation + horizontal flip)
						if (flippedDiagonally) {
							rotation = Math.PI / 2;
							scaleX = -1; // Tiled's diagonal includes a horizontal flip
						}

						// Then apply H/V flips
						if (flippedHorizontally) scaleX *= -1;
						if (flippedVertically)   scaleY *= -1;

						if (rotation !== 0) context.rotate(rotation);
						context.scale(scaleX, scaleY);

						context.drawImage(
							sourceImage,
							sx, sy, sw, sh,
							-this.tileWidth / 2, -this.tileHeight / 2,
							this.tileWidth, this.tileHeight
						);

						context.restore();
					} else {
						// No flips, draw normally
						context.drawImage(
							sourceImage,
							sx, sy, sw, sh,
							destX, destY,
							this.tileWidth, this.tileHeight
						);
					}
				}
			}
		}
	}
}

