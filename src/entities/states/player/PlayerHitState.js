import State from '../../../../lib/State.js';
import PlayerState from '../../../enums/PlayerState.js';

/**
 * Player HIT state.
 * Brief state when taking damage. Invincibility frames active, visual feedback (flash red).
 */
export default class PlayerHitState extends State {
	enter() {
		// Hit state entered (invincibility already set by Player.takeDamage)
		// TODO: Play hit animation or visual feedback
	}

	exit() {
		// Exiting hit state
	}

	update(dt, input) {
		const player = this.stateMachine.entity;
		
		// Wait for invincibility to expire
		if (!player.isInvincible()) {
			this.stateMachine.change(PlayerState.IDLE);
		}
	}

	render() {
		// Rendering handled by Player class (with invincibility flicker)
	}
}


