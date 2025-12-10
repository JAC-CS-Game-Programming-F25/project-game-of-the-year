import State from '../../../../lib/State.js';
import GameStateName from '../../../enums/GameStateName.js';

/**
 * Player DYING state.
 * Death animation plays. Triggers GameOverState when complete.
 */
export default class PlayerDyingState extends State {
	constructor() {
		super();
		this.deathAnimationDuration = 1.0; // seconds
		this.deathTimer = 0;
	}

	enter() {
		this.deathTimer = this.deathAnimationDuration;
		// Set death animation
		this.stateMachine.entity.setAnimation('death');
	}

	exit() {
		// Clean up
	}

	update(dt, input) {
		this.deathTimer -= dt;
		
		// Death animation complete, trigger game over
		if (this.deathTimer <= 0) {
			// TODO: Transition to GameOverState
			// This will be handled by PlayState when it detects player is dead
		}
	}

	render() {
		// Rendering handled by Player class
	}
}

