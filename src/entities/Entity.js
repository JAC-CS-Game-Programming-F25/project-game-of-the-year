import GameObject from '../objects/GameObject.js';
import Hitbox from '../../lib/Hitbox.js';
import Direction from '../enums/Direction.js';

/**
 * Base class for all game entities (Player, Enemy).
 * Extends GameObject and adds health, collision, state management, and animations.
 */
export default class Entity extends GameObject {
	constructor(x = 0, y = 0, width = 0, height = 0) {
		super(x, y, width, height);
		
		// Health system
		this.hp = 100;
		this.maxHp = 100;
		
		// Collision detection
		this.hitbox = new Hitbox(x, y, width, height);
		
		// Movement
		this.direction = Direction.S;
		this.speed = 0;
		
		// State machine (will be set by subclasses)
		this.stateMachine = null;
		
		// Animation and sprite (will be set by subclasses)
		this.animation = null;
		this.sprite = null;
	}

	update(dt) {
		// Update state machine
		if (this.stateMachine) {
			this.stateMachine.update(dt);
		}
		
		// Update animation
		if (this.animation) {
			this.animation.update(dt);
		}
		
		// Update hitbox position to match entity position
		// Entity (x, y) is center, Hitbox expects top-left corner
		this.hitbox.set(
			this.x - this.width / 2,
			this.y - this.height / 2,
			this.width,
			this.height
		);
	}

	render(ctx) {
		// Override in subclasses for specific rendering
	}

	/**
	 * Apply damage to this entity.
	 * @param {number} amount - Damage amount
	 */
	takeDamage(amount) {
		this.hp = Math.max(0, this.hp - amount);
	}

	/**
	 * Check if entity is alive.
	 * @returns {boolean}
	 */
	isAlive() {
		return this.hp > 0;
	}
}

