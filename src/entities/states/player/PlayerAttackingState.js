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
		
		// TODO: Activate attack hitbox
		console.log('PlayerAttackingState: Attack started, total frames:', player.totalFrames);
	}

	exit() {
		// Reset to idle animation
		const player = this.stateMachine.entity;
		player.setAnimation('idle');
		
		// TODO: Deactivate attack hitbox
		console.log('PlayerAttackingState: Attack finished at frame', player.currentFrame);
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

