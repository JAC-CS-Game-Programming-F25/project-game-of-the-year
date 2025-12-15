import State from '../../../../lib/State.js';
import PlayerState from '../../../enums/PlayerState.js';
import Input from '../../../../lib/Input.js';
import Direction from '../../../enums/Direction.js';

/**
 * Player MOVING state.
 * Player is moving with WASD input. Uses idle animation (player floats).
 */
export default class PlayerMovingState extends State {
	constructor() {
		super();
		this.previousDirection = null;
	}

	enter() {
		const player = this.stateMachine.entity;
		this.previousDirection = player.direction;
	}

	exit() {
		// Exiting moving state
	}

	update(dt, input) {
		const player = this.stateMachine.entity;
		
		// Calculate movement direction from WASD input
		const direction = this.getMovementDirection(input);
		if (direction) {
			// Smooth direction transitions
			if (this.previousDirection !== direction) {
				const intermediate = this.getIntermediateDirection(this.previousDirection, direction);
				if (intermediate) {
					player.direction = intermediate;
					this.previousDirection = intermediate;
				} else {
					player.direction = direction;
					this.previousDirection = direction;
				}
			} else {
				player.direction = direction;
			}
			
			// Calculate movement vector
			const moveX = this.getDirectionX(direction) * player.speed * dt;
			const moveY = this.getDirectionY(direction) * player.speed * dt;
			
			// Update position (collision will be handled by PlayState/MapManager)
			player.x += moveX;
			player.y += moveY;
		}
		
		// Check if movement stopped
		if (!this.hasMovementInput(input)) {
			this.stateMachine.change(PlayerState.IDLE);
			return;
		}
		
		// Check for attack input (can attack while moving)
		if (input.isKeyPressed(Input.KEYS.SPACE)) {
			this.stateMachine.change(PlayerState.ATTACKING);
			return;
		}
		
		// Check for dodge input
		if (input.isKeyPressed(Input.KEYS.SHIFT)) {
			this.stateMachine.change(PlayerState.DODGING);
			return;
		}
	}

	render() {
		// Rendering handled by Player class
	}

	/**
	 * Get intermediate direction between two directions for smooth transitions.
	 * @param {Direction} from - Previous direction
	 * @param {Direction} to - New direction
	 * @returns {Direction|null} - Intermediate direction or null if already adjacent
	 */
	getIntermediateDirection(from, to) {
		const transitions = {
			[Direction.N]: {
				[Direction.E]: Direction.NE,
				[Direction.W]: Direction.NW,
				[Direction.S]: null, // Opposite, no intermediate
			},
			[Direction.S]: {
				[Direction.E]: Direction.SE,
				[Direction.W]: Direction.SW,
				[Direction.N]: null,
			},
			[Direction.E]: {
				[Direction.N]: Direction.NE,
				[Direction.S]: Direction.SE,
				[Direction.W]: null,
			},
			[Direction.W]: {
				[Direction.N]: Direction.NW,
				[Direction.S]: Direction.SW,
				[Direction.E]: null,
			},
		};

		return transitions[from]?.[to] || null;
	}

	/**
	 * Get movement direction from WASD input.
	 * @param {Input} input - Input handler
	 * @returns {Direction|null}
	 */
	getMovementDirection(input) {
		const up = input.isKeyHeld(Input.KEYS.W);
		const down = input.isKeyHeld(Input.KEYS.S);
		const left = input.isKeyHeld(Input.KEYS.A);
		const right = input.isKeyHeld(Input.KEYS.D);
		
		// 8-directional movement
		if (up && right) return Direction.NE;
		if (up && left) return Direction.NW;
		if (down && right) return Direction.SE;
		if (down && left) return Direction.SW;
		if (up) return Direction.N;
		if (down) return Direction.S;
		if (left) return Direction.W;
		if (right) return Direction.E;
		
		return null;
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

	/**
	 * Check if any movement keys are pressed.
	 * @param {Input} input - Input handler
	 * @returns {boolean}
	 */
	hasMovementInput(input) {
		return input.isKeyHeld(Input.KEYS.W) ||
		       input.isKeyHeld(Input.KEYS.A) ||
		       input.isKeyHeld(Input.KEYS.S) ||
		       input.isKeyHeld(Input.KEYS.D);
	}
}


