import Entity from './Entity.js';
import Direction from '../enums/Direction.js';

/**
 * Base Enemy class.
 * Extends Entity with AI behaviors: detect, chase, patrol, attack.
 */
export default class Enemy extends Entity {
	constructor(x = 0, y = 0, width = 32, height = 32) {
		super(x, y, width, height);
		
		// Combat stats
		this.attackDamage = 5;
		this.attackRange = 40;
		this.detectionRange = 200;
		
		// AI behavior
		this.target = null; // Player reference
		this.patrolPath = [];
		this.currentPatrolIndex = 0;
		this.patrolWaitTime = 0;
		this.patrolWaitDuration = 1.0;
		this.lastAttackTime = 0; // Timestamp of last attack for cooldown
		
		// Movement
		this.speed = 60; // pixels per second
		this.chaseSpeed = 80; // faster when chasing
		
		// State machine (set by subclasses)
		this.stateMachine = null;
	}

	/**
	 * Detect if player is in detection range.
	 * @param {Player} player
	 * @returns {boolean}
	 */
	detectPlayer(player) {
		if (!player) return false;
		
		const dx = player.x - this.x;
		const dy = player.y - this.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		
		return distance <= this.detectionRange;
	}

	/**
	 * Check if player is in attack range.
	 * @param {Player} player
	 * @returns {boolean}
	 */
	isPlayerInAttackRange(player) {
		if (!player) return false;
		
		const dx = player.x - this.x;
		const dy = player.y - this.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		
		return distance <= this.attackRange;
	}

	/**
	 * Get direction to player.
	 * @param {Player} player
	 * @returns {Direction}
	 */
	getDirectionToPlayer(player) {
		if (!player) return this.direction;
		
		const dx = player.x - this.x;
		const dy = player.y - this.y;
		const angle = Math.atan2(dy, dx);
		
		return this.angleToDirection(angle);
	}

	/**
	 * Convert angle (radians) to Direction enum.
	 * @param {number} angle - Angle in radians
	 * @returns {Direction}
	 */
	angleToDirection(angle) {
		// Convert to degrees
		let degrees = angle * (180 / Math.PI);
		
		// Normalize to 0-360
		if (degrees < 0) degrees += 360;
		
		// Map to 8 directions (each direction covers 45 degrees)
		if (degrees >= 337.5 || degrees < 22.5) return Direction.E;
		if (degrees >= 22.5 && degrees < 67.5) return Direction.SE;
		if (degrees >= 67.5 && degrees < 112.5) return Direction.S;
		if (degrees >= 112.5 && degrees < 157.5) return Direction.SW;
		if (degrees >= 157.5 && degrees < 202.5) return Direction.W;
		if (degrees >= 202.5 && degrees < 247.5) return Direction.NW;
		if (degrees >= 247.5 && degrees < 292.5) return Direction.N;
		if (degrees >= 292.5 && degrees < 337.5) return Direction.NE;
		
		return Direction.S; // Default
	}

	/**
	 * Move toward player (chase behavior).
	 * @param {number} dt - Delta time
	 */
	chase(dt) {
		if (!this.target) return;
		
		const dx = this.target.x - this.x;
		const dy = this.target.y - this.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		
		// Use each enemy's specific minimum distance
		const minDistance = this.minDistanceToPlayer;
		
		if (distance > minDistance) {
			// Move closer
			const moveX = (dx / distance) * this.chaseSpeed * dt;
			const moveY = (dy / distance) * this.chaseSpeed * dt;
			
			this.x += moveX;
			this.y += moveY;
			
			// Update direction
			this.direction = this.getDirectionToPlayer(this.target);
		} else if (distance < minDistance - 10) {
			// Too close! Back up
			const moveX = (dx / distance) * this.chaseSpeed * dt * -0.3;
			const moveY = (dy / distance) * this.chaseSpeed * dt * -0.3;
			
			this.x += moveX;
			this.y += moveY;
		}
		// Else: at good distance, maintain position
	}

	/**
	 * Patrol along patrol path.
	 * @param {number} dt - Delta time
	 */
	patrol(dt) {
		if (this.patrolPath.length === 0) return;
		
		// Get current patrol target
		const target = this.patrolPath[this.currentPatrolIndex];
		
		const dx = target.x - this.x;
		const dy = target.y - this.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		
		// Reached patrol point
		if (distance < 5) {
			// Wait at patrol point
			this.patrolWaitTime += dt;
			if (this.patrolWaitTime >= this.patrolWaitDuration) {
				this.patrolWaitTime = 0;
				this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPath.length;
			}
		} else {
			// Move toward patrol point
			const moveX = (dx / distance) * this.speed * dt;
			const moveY = (dy / distance) * this.speed * dt;
			
			this.x += moveX;
			this.y += moveY;
			
			// Update direction
			const angle = Math.atan2(dy, dx);
			this.direction = this.angleToDirection(angle);
		}
	}

	/**
	 * Perform attack (to be overridden by subclasses).
	 */
	attack() {
		// Subclasses implement specific attack behavior
	}

	/**
	 * Update enemy (called by state machine).
	 * @param {number} dt - Delta time
	 */
	update(dt) {
		// Update state machine (handles AI logic)
		if (this.stateMachine) {
			this.stateMachine.update(dt);
		}
		
		// Update animation
		if (this.animation) {
			this.animation.update(dt);
		}
		
		// Update hitbox position (Entity base class handles this now)
	}

	/**
	 * Render enemy (to be overridden by subclasses).
	 * @param {CanvasRenderingContext2D} ctx
	 */
	render(ctx) {
		// Subclasses implement specific rendering
	}
}

