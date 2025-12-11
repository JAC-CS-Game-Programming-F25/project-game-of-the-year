import EnemyType from '../enums/EnemyType.js';
import ShadowBat from '../entities/ShadowBat.js';
import SpiritBoxer from '../entities/SpiritBoxer.js';

/**
 * Factory for creating enemies.
 * Uses EnemyType enum to centralize enemy creation logic.
 */
export default class Factory {
	/**
	 * Create an enemy of the specified type.
	 * @param {EnemyType} type - Enemy type enum
	 * @param {number} x - X position
	 * @param {number} y - Y position
	 * @returns {Enemy} - Created enemy instance
	 */
	static createEnemy(type, x, y) {
		switch (type) {
			case EnemyType.ShadowBat:
				return Factory.createShadowBat(x, y);
			
			case EnemyType.SpiritBoxer:
				return Factory.createSpiritBoxer(x, y);
			
			// TODO: Add Temple Guardian
			// case EnemyType.TempleGuardian:
			//     return Factory.createTempleGuardian(x, y);
			
			default:
				console.warn(`Unknown enemy type: ${type}`);
				return null;
		}
	}

	/**
	 * Create a Shadow Bat enemy.
	 * @param {number} x - X position
	 * @param {number} y - Y position
	 * @returns {ShadowBat}
	 */
	static createShadowBat(x, y) {
		return new ShadowBat(x, y);
	}

	/**
	 * Create a Spirit Boxer enemy.
	 * @param {number} x - X position
	 * @param {number} y - Y position
	 * @returns {SpiritBoxer}
	 */
	static createSpiritBoxer(x, y) {
		return new SpiritBoxer(x, y);
	}
	
	// TODO: Add Temple Guardian
	// static createTempleGuardian(x, y) {
	//     return new TempleGuardian(x, y);
	// }
}

