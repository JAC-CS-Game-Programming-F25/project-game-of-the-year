import State from '../../../../lib/State.js';
import PlayerState from '../../../enums/PlayerState.js';
import Input from '../../../../lib/Input.js';
import Direction from '../../../enums/Direction.js';

/**
 * Player DODGING state.
 * Quick sidestep with invincibility frames. Uses dodge animation.
 */
export default class PlayerDodgingState extends State {
	constructor() {
		super();
		this.dodgeTimer = 0;
		this.dodgeDirection = null;
	}

	enter() {
		const player = this.stateMachine.entity;
		this.dodgeTimer = player.dodgeDuration;
		
		// Determine dodge direction from current movement or facing direction
		// If moving, dodge in movement direction; otherwise dodge in facing direction
		// For now, use facing direction
		this.dodgeDirection = player.direction;
		
		// Set invincibility
		player.invincibilityTimer = player.dodgeDuration;
		
		// TODO: Play dodge animation
	}

	exit() {
		// Clean up
	}

	update(dt, input) {
		const player = this.stateMachine.entity;
		this.dodgeTimer -= dt;
		
		// Move player during dodge
		if (this.dodgeDirection) {
			const moveX = this.getDirectionX(this.dodgeDirection) * player.dodgeSpeed * dt;
			const moveY = this.getDirectionY(this.dodgeDirection) * player.dodgeSpeed * dt;
			player.x += moveX;
			player.y += moveY;
		}
		
		// Dodge complete, return to IDLE
		if (this.dodgeTimer <= 0) {
			this.stateMachine.change(PlayerState.IDLE);
		}
	}

	render() {
		// Rendering handled by Player class
	}

	/**
	 * Get X component of direction (-1, 0, or 1).
	 * @param {Direction} direction
	 * @returns {number}
	 */
	getDirectionX(direction) {
		const xMap = {
			[Direction.E]: 1,
			[Direction.NE]: 1,
			[Direction.SE]: 1,
			[Direction.W]: -1,
			[Direction.NW]: -1,
			[Direction.SW]: -1,
			[Direction.N]: 0,
			[Direction.S]: 0,
		};
		return xMap[direction] || 0;
	}

	/**
	 * Get Y component of direction (-1, 0, or 1).
	 * @param {Direction} direction
	 * @returns {number}
	 */
	getDirectionY(direction) {
		const yMap = {
			[Direction.S]: 1,
			[Direction.SE]: 1,
			[Direction.SW]: 1,
			[Direction.N]: -1,
			[Direction.NE]: -1,
			[Direction.NW]: -1,
			[Direction.E]: 0,
			[Direction.W]: 0,
		};
		return yMap[direction] || 0;
	}
}


