/**
 * MapManager - Handles map progression and transitions
 */
export default class MapManager {
	constructor() {
		// Map progression order
		// Spawn points will be determined by exit zones in each map
		this.maps = [
			{
				path: '/Starting_map.tmx',
				name: 'Starting Map',
				// First map - spawn at center
				useExitAsSpawn: false,
				spawnX: 335,
				spawnY: 300
			},
			{
				path: '/map1.tmx',
				name: 'Map 1',
				// Use entrance exit (first exit) as spawn
				useExitAsSpawn: true,
				exitIndex: 0 // Use first exit (entrance from Starting_map)
			},
			{
				path: '/terrainMapTiled.tmx',
				name: 'Terrain Map',
				// Use entrance exit as spawn
				useExitAsSpawn: true,
				exitIndex: 0 // Use first exit (entrance from map1)
			}
		];
		
		this.currentMapIndex = 0;
	}

	/**
	 * Get current map config
	 */
	getCurrentMap() {
		return this.maps[this.currentMapIndex];
	}

	/**
	 * Get next map config (or null if at end)
	 */
	getNextMap() {
		if (this.currentMapIndex < this.maps.length - 1) {
			return this.maps[this.currentMapIndex + 1];
		}
		return null; // No more maps (victory!)
	}

	/**
	 * Get previous map config (or null if at start)
	 */
	getPreviousMap() {
		if (this.currentMapIndex > 0) {
			return this.maps[this.currentMapIndex - 1];
		}
		return null; // No previous map
	}

	/**
	 * Advance to next map
	 */
	goToNextMap() {
		if (this.currentMapIndex < this.maps.length - 1) {
			this.currentMapIndex++;
			return this.getCurrentMap();
		}
		return null; // Victory!
	}

	/**
	 * Go back to previous map
	 */
	goToPreviousMap() {
		if (this.currentMapIndex > 0) {
			this.currentMapIndex--;
			return this.getCurrentMap();
		}
		return null; // Can't go back
	}

	/**
	 * Reset to first map
	 */
	reset() {
		this.currentMapIndex = 0;
	}

	/**
	 * Check if at final map
	 */
	isAtFinalMap() {
		return this.currentMapIndex === this.maps.length - 1;
	}
}

