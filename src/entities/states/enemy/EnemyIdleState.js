import State from '../../../../lib/State.js';
import EntityState from '../../../enums/EntityState.js';

/**
 * Enemy IDLE state - standing still, waiting to detect player.
 */
export default class EnemyIdleState extends State {
	constructor() {
		super();
		this.idleTimer = 0;
		this.idleDuration = 2.0; // seconds before starting patrol
	}

	enter() {
		const enemy = this.stateMachine.entity;
		this.idleTimer = 0;
		
		// Set idle animation if available
		if (enemy.setAnimation) {
			enemy.setAnimation('idle');
		}
	}

	update(dt, input) {
		const enemy = this.stateMachine.entity;
		
		// Check for player detection
		if (enemy.target && enemy.detectPlayer(enemy.target)) {
			this.stateMachine.change(EntityState.CHASE);
			return;
		}
		
		// After idle duration, start patrolling if patrol path exists
		this.idleTimer += dt;
		if (this.idleTimer >= this.idleDuration && enemy.patrolPath.length > 0) {
			this.stateMachine.change(EntityState.PATROL);
			return;
		}
	}

	exit() {
		// Cleanup if needed
	}
}

