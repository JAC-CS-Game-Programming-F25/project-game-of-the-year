import State from '../../../../lib/State.js';
import PlayerState from '../../../enums/PlayerState.js';
import Input from '../../../../lib/Input.js';
import Direction from '../../../enums/Direction.js';

/**
 * Player IDLE state.
 * Default state when standing still. Player can attack, dodge, or start moving.
 */
export default class PlayerIdleState extends State {
	enter() {
		// Set idle animation
		this.stateMachine.entity.setAnimation('idle');
	}

	exit() {
		// Clean up if needed
	}

	update(dt, input) {
		const player = this.stateMachine.entity;
		
		// Check for movement input (WASD)
		if (this.hasMovementInput(input)) {
			this.stateMachine.change(PlayerState.MOVING);
			return;
		}
		
		// Check for attack input (Space)
		if (input.isKeyPressed(Input.KEYS.SPACE)) {
			this.stateMachine.change(PlayerState.ATTACKING);
			return;
		}
		
		// Check for dodge input (Shift or specific key)
		if (input.isKeyPressed(Input.KEYS.SHIFT)) {
			this.stateMachine.change(PlayerState.DODGING);
			return;
		}
	}

	render() {
		// Rendering handled by Player class
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

