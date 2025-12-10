import Vector from '../../lib/Vector.js';

/**
 * Camera class for following entities and managing viewport
 */
export default class Camera {
	constructor(x = 0, y = 0, width = 1280, height = 720) {
		this.position = new Vector(x, y);
		this.width = width;
		this.height = height;
		this.target = null;
		this.bounds = null;
	}

	/**
	 * Set the entity to follow
	 */
	setTarget(entity) {
		this.target = entity;
	}

	/**
	 * Set camera bounds (map boundaries)
	 */
	setBounds(mapWidth, mapHeight) {
		this.bounds = {
			width: mapWidth,
			height: mapHeight
		};
		
		// Center small maps
		if (mapWidth < this.width) {
			this.position.x = (mapWidth - this.width) / 2;
		}
		if (mapHeight < this.height) {
			this.position.y = (mapHeight - this.height) / 2;
		}
	}

	/**
	 * Update camera position to follow target
	 */
	update(dt) {
		if (!this.target) return;

		const targetX = (this.target.position?.x ?? this.target.x) - this.width / 2;
		const targetY = (this.target.position?.y ?? this.target.y) - this.height / 2;

		if (this.bounds) {
			// Keep small maps centered, scroll large maps
			if (this.bounds.width < this.width) {
				this.position.x = (this.bounds.width - this.width) / 2;
			} else {
				this.position.x = Math.max(0, Math.min(targetX, this.bounds.width - this.width));
			}
			
			if (this.bounds.height < this.height) {
				this.position.y = (this.bounds.height - this.height) / 2;
			} else {
				this.position.y = Math.max(0, Math.min(targetY, this.bounds.height - this.height));
			}
		} else {
			this.position.x = targetX;
			this.position.y = targetY;
		}
	}

	/**
	 * Get camera position
	 */
	get x() {
		return this.position.x;
	}

	get y() {
		return this.position.y;
	}
}

