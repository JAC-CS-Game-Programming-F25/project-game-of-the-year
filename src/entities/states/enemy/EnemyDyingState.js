import State from '../../../../lib/State.js';

/**
 * Enemy DYING state - death animation, then removal.
 */
export default class EnemyDyingState extends State {
	constructor() {
		super();
		this.deathAnimationDuration = 1.0; // seconds
		this.deathTimer = 0;
	}

	enter() {
		const enemy = this.stateMachine.entity;
		this.deathTimer = 0;
		
		// Set death animation
		if (enemy.setAnimation) {
			enemy.setAnimation('death');
		}
		
		// Mark enemy as dead (for removal by PlayState)
		enemy.isDead = true;
	}

	update(dt, input) {
		this.deathTimer += dt;
		
		// Death animation complete - enemy will be removed by PlayState
		if (this.deathTimer >= this.deathAnimationDuration) {
			// Set flag for removal
			const enemy = this.stateMachine.entity;
			enemy.readyForRemoval = true;
		}
	}

	exit() {
		// Cleanup if needed
	}
}

