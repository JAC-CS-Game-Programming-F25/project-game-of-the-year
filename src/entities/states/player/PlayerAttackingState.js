import State from '../../../../lib/State.js';
import PlayerState from '../../../enums/PlayerState.js';

/**
 * Player ATTACKING state - plays attack animation once, then returns to idle
 */
export default class PlayerAttackingState extends State {
	constructor() {
		super();
		this.hasSeenLastFrame = false;
	}

	enter() {
		const player = this.stateMachine.entity;
		
		// Set attack animation (this resets frame to 0)
		player.setAnimation('attack');
		this.hasSeenLastFrame = false;
		
		// Reset damage flag for this attack
		player.hasDealtDamage = false;
	}

	exit() {
		// Reset to idle animation
		const player = this.stateMachine.entity;
		player.setAnimation('idle');
	}

	update(dt, input) {
		const player = this.stateMachine.entity;
		
		// Wait for animation to complete one full cycle
		if (player.totalFrames > 0) {
			if (player.currentFrame >= player.totalFrames - 1) {
				this.hasSeenLastFrame = true;
			}
			
			// Done when we loop back to start
			if (this.hasSeenLastFrame && player.currentFrame <= 2) {
				this.stateMachine.change(PlayerState.IDLE);
				return;
			}
		}
	}

	render() {
		// Player handles rendering
	}
}

