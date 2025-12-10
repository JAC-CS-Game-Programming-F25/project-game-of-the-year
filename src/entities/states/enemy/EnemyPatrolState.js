import State from '../../../../lib/State.js';
import EntityState from '../../../enums/EntityState.js';

/**
 * Enemy PATROL state - moving along patrol path.
 */
export default class EnemyPatrolState extends State {
	enter() {
		const enemy = this.stateMachine.entity;
		
		// Set walk/run animation if available
		if (enemy.setAnimation) {
			enemy.setAnimation('walk');
		}
	}

	update(dt, input) {
		const enemy = this.stateMachine.entity;
		
		// Check for player detection
		if (enemy.target && enemy.detectPlayer(enemy.target)) {
			this.stateMachine.change(EntityState.CHASE);
			return;
		}
		
		// Continue patrolling
		enemy.patrol(dt);
	}

	exit() {
		// Cleanup if needed
	}
}

