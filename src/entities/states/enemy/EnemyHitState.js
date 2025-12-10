import State from '../../../../lib/State.js';
import EntityState from '../../../enums/EntityState.js';

/**
 * Enemy HIT state - taking damage, brief stun.
 */
export default class EnemyHitState extends State {
	constructor() {
		super();
		this.stunDuration = 0.5; // seconds - increased for breathing room
		this.stunTimer = 0;
	}

	enter() {
		const enemy = this.stateMachine.entity;
		this.stunTimer = 0;
		
		// Set hit animation if available
		if (enemy.setAnimation) {
			enemy.setAnimation('hit');
		}
		
		// Check if dead
		if (!enemy.isAlive()) {
			this.stateMachine.change(EntityState.DYING);
			return;
		}
	}

	update(dt, input) {
		const enemy = this.stateMachine.entity;
		this.stunTimer += dt;
		
		// Check if still alive
		if (!enemy.isAlive()) {
			this.stateMachine.change(EntityState.DYING);
			return;
		}
		
		// Stun complete
		if (this.stunTimer >= this.stunDuration) {
			// Resume chasing player if detected
			if (enemy.target && enemy.detectPlayer(enemy.target)) {
				this.stateMachine.change(EntityState.CHASE);
			} else {
				this.stateMachine.change(EntityState.IDLE);
			}
		}
	}

	exit() {
		// Cleanup if needed
	}
}

