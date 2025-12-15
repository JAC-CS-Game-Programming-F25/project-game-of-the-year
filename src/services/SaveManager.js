/**
 * SaveManager - Handles saving and loading game state to localStorage.
 */
export default class SaveManager {
	static SAVE_KEY = 'echoes-of-the-fallen-star-save';

	/**
	 * Check if a save file exists.
	 * @returns {boolean}
	 */
	static hasSave() {
		const data = localStorage.getItem(SaveManager.SAVE_KEY);
		return data !== null;
	}

	/**
	 * Save the current game state.
	 * @param {Object} gameState - Complete game state to save
	 */
	static saveGame(gameState) {
		try {
			// Save alive enemies with their positions and HP
			const enemyData = (gameState.enemies || [])
				.filter(enemy => enemy.isAlive())
				.map(enemy => ({
					type: enemy.constructor.name,
					x: enemy.x,
					y: enemy.y,
					hp: enemy.hp,
					maxHp: enemy.maxHp
				}));

			const saveData = {
				version: '1.0',
				timestamp: Date.now(),
				player: {
					x: gameState.player.x,
					y: gameState.player.y,
					hp: gameState.player.hp,
					maxHp: gameState.player.maxHp,
					direction: gameState.player.direction
				},
				currentMap: gameState.currentMap,
				mapProgress: gameState.mapProgress || 0,
				enemies: enemyData,
				flags: gameState.flags || {}
			};

			localStorage.setItem(SaveManager.SAVE_KEY, JSON.stringify(saveData));
			return true;
		} catch (error) {
			console.error('Failed to save game:', error);
			return false;
		}
	}

	/**
	 * Load the saved game state.
	 * @returns {Object|null} - Saved game state or null if no save exists
	 */
	static loadGame() {
		try {
			const data = localStorage.getItem(SaveManager.SAVE_KEY);
			if (!data) {
				return null;
			}

			const saveData = JSON.parse(data);
			return saveData;
		} catch (error) {
			console.error('Failed to load game:', error);
			return null;
		}
	}

	/**
	 * Delete the current save file.
	 */
	static deleteSave() {
		try {
			localStorage.removeItem(SaveManager.SAVE_KEY);
			return true;
		} catch (error) {
			console.error('Failed to delete save:', error);
			return false;
		}
	}

	/**
	 * Get save file info (for display purposes).
	 * @returns {Object|null} - Save info or null
	 */
	static getSaveInfo() {
		try {
			const data = localStorage.getItem(SaveManager.SAVE_KEY);
			if (!data) return null;

			const saveData = JSON.parse(data);
			const date = new Date(saveData.timestamp);
			
			return {
				timestamp: saveData.timestamp,
				dateString: date.toLocaleDateString(),
				timeString: date.toLocaleTimeString(),
				currentMap: saveData.currentMap,
				playerHP: saveData.player.hp,
				playerMaxHP: saveData.player.maxHp
			};
		} catch (error) {
			console.error('Failed to get save info:', error);
			return null;
		}
	}
}

