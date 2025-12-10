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
		
		// Debug: Check if input is being received
		if (!input) {
			console.warn('PlayerIdleState: No input object provided');
			return;
		}
		
		// Check for movement input (WASD)
		if (this.hasMovementInput(input)) {
			console.log('PlayerIdleState: Movement input detected, transitioning to MOVING');
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
		const w = input.isKeyHeld(Input.KEYS.W);
		const a = input.isKeyHeld(Input.KEYS.A);
		const s = input.isKeyHeld(Input.KEYS.S);
		const d = input.isKeyHeld(Input.KEYS.D);
		
		// Debug first time
		if ((w || a || s || d) && !this._debugLogged) {
			console.log('PlayerIdleState: Keys detected', { w, a, s, d });
			this._debugLogged = true;
		}
		
		return w || a || s || d;
	}
}

