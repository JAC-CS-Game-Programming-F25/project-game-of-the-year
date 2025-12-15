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
		
		this.shake = {
			x: 0,
			y: 0,
			intensity: 0,
			duration: 0,
			timer: 0
		};
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
	 * Trigger camera shake effect
	 */
	triggerShake(intensity, duration) {
		this.shake.intensity = intensity;
		this.shake.duration = duration;
		this.shake.timer = 0;
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

		// Update camera shake
		if (this.shake.timer < this.shake.duration) {
			this.shake.timer += dt;
			const progress = this.shake.timer / this.shake.duration;
			const currentIntensity = this.shake.intensity * (1 - progress);
			
			this.shake.x = (Math.random() - 0.5) * currentIntensity;
			this.shake.y = (Math.random() - 0.5) * currentIntensity;
		} else {
			this.shake.x = 0;
			this.shake.y = 0;
		}
	}

	/**
	 * Get camera position (including shake)
	 */
	get x() {
		return this.position.x + this.shake.x;
	}

	get y() {
		return this.position.y + this.shake.y;
	}
}

