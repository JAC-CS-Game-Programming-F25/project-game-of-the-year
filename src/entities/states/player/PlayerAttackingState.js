import State from '../../../../lib/State.js';
import PlayerState from '../../../enums/PlayerState.js';

/**
 * Player ATTACKING state.
 * Player performs melee attack. Attack animation plays, hitbox active, movement disabled.
 */
export default class PlayerAttackingState extends State {
	constructor() {
		super();
		this.attackDuration = 0.5; // seconds
		this.attackTimer = 0;
	}

	enter() {
		this.attackTimer = this.attackDuration;
		// Set attack animation
		this.stateMachine.entity.setAnimation('attack');
		// TODO: Activate attack hitbox
	}

	exit() {
		// TODO: Deactivate attack hitbox
	}

	update(dt, input) {
		this.attackTimer -= dt;
		
		// Attack complete, return to IDLE
		if (this.attackTimer <= 0) {
			this.stateMachine.change(PlayerState.IDLE);
		}
	}

	render() {
		// Rendering handled by Player class
	}
}

