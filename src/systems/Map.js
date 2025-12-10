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
				const layer = this.parseLayer(layerEl);
				
				if (layerName.toLowerCase() === 'collisions') {
					this.collisionLayer = layer;
				} else {
					this.layers.push(layer);
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
	 * Parse embedded tileset element
	 */
	parseEmbeddedTileset(tilesetEl, firstGid, tsxPath = null) {
		const tileWidth = parseInt(tilesetEl.getAttribute('tilewidth'));
		const tileHeight = parseInt(tilesetEl.getAttribute('tileheight'));
		const columns = parseInt(tilesetEl.getAttribute('columns'));
		const imageEl = tilesetEl.querySelector('image');
		
		if (!imageEl) return null;

		let imageSource = imageEl.getAttribute('source');
		
		// If we have a TSX path, resolve relative to it
		if (tsxPath) {
			const tsxDir = tsxPath.substring(0, tsxPath.lastIndexOf('/') + 1);
			imageSource = tsxDir + imageSource;
		} else {
			// Resolve relative to TMX file
			const tmxDir = this.tmxPath.substring(0, this.tmxPath.lastIndexOf('/') + 1);
			imageSource = tmxDir + imageSource;
		}

		// Extract image name from path
		const imageFileName = imageSource.split('/').pop();
		const imageName = imageFileName.split('.')[0].toLowerCase().replace(/_/g, '-');
		
		const graphic = this.images.get(imageName);
		
		if (!graphic) {
			console.warn(`Tileset image "${imageName}" not found in Images. Make sure it's loaded in config.json`);
		}

		return {
			firstGid,
			tileWidth,
			tileHeight,
			columns,
			imageSource,
			imageName,
			graphic
		};
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
	 * Get the tileset for a given tile GID
	 */
	getTilesetForGid(gid) {
		if (gid === 0) return null;
		
		for (const tileset of this.tilesets) {
			if (gid >= tileset.firstGid) {
				return tileset;
			}
		}
		return null;
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
	 * Render the map
	 */
	render(context, camera) {
		if (!this.loaded) return;

		// Calculate visible tile range based on camera
		const startTileX = Math.max(0, Math.floor(camera.x / this.tileWidth) - 1);
		const endTileX = Math.min(this.width - 1, Math.floor((camera.x + camera.width) / this.tileWidth) + 1);
		const startTileY = Math.max(0, Math.floor(camera.y / this.tileHeight) - 1);
		const endTileY = Math.min(this.height - 1, Math.floor((camera.y + camera.height) / this.tileHeight) + 1);

		// Render each layer
		for (const layer of this.layers) {
			for (let tileY = startTileY; tileY <= endTileY; tileY++) {
				for (let tileX = startTileX; tileX <= endTileX; tileX++) {
					const index = tileY * layer.width + tileX;
					const gid = layer.tileData[index];

					if (gid === 0 || gid === undefined) continue;

					const tileset = this.getTilesetForGid(gid);
					if (!tileset) continue;

					// Calculate local tile ID within the tileset
					const localId = gid - tileset.firstGid;
					
					// Calculate source position in tileset image
					const tilesPerRow = tileset.columns;
					const sourceX = (localId % tilesPerRow) * tileset.tileWidth;
					const sourceY = Math.floor(localId / tilesPerRow) * tileset.tileHeight;

					// Calculate destination position
					const destX = tileX * this.tileWidth - camera.x;
					const destY = tileY * this.tileHeight - camera.y;

					const graphic = this.images.get(tileset.imageName);
					if (graphic && graphic.image && graphic.image.complete) {
						context.drawImage(
							graphic.image,
							sourceX, sourceY,
							tileset.tileWidth, tileset.tileHeight,
							destX, destY,
							this.tileWidth, this.tileHeight
						);
					}
				}
			}
		}
	}
}

