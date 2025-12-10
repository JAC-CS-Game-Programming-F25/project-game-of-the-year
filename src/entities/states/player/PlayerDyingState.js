import State from '../../../../lib/State.js';
import GameStateName from '../../../enums/GameStateName.js';

/**
 * Player DYING state.
 * Death animation plays. Triggers GameOverState when complete.
 */
export default class PlayerDyingState extends State {
	constructor() {
		super();
		this.deathAnimationDuration = 2.5; // seconds - longer to see full death animation
		this.deathTimer = 0;
	}

	enter() {
		const player = this.stateMachine.entity;
		this.deathTimer = 0;
		player.readyForGameOver = false;
		
		// Set death animation
		player.setAnimation('death');
		
		console.log('PlayerDyingState: Player is dying');
	}

	exit() {
		// Clean up
	}

	update(dt, input) {
		const player = this.stateMachine.entity;
		this.deathTimer += dt;
		
		// Death animation complete
		if (this.deathTimer >= this.deathAnimationDuration) {
			player.readyForGameOver = true;
			console.log('PlayerDyingState: Death animation complete, ready for GameOver');
		}
	}

	render() {
		// Rendering handled by Player class
	}
}

