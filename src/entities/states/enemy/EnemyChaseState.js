import State from '../../../../lib/State.js';
import EntityState from '../../../enums/EntityState.js';

/**
 * Enemy CHASE state - pursuing the player.
 */
export default class EnemyChaseState extends State {
	constructor() {
		super();
		this.loseTargetDistance = 300; // Distance to stop chasing
	}

	enter() {
		const enemy = this.stateMachine.entity;
		
		// Set chase animation (walk/run/fly depending on enemy type)
		if (enemy.setAnimation) {
			enemy.setAnimation('chase');
		}
	}

	update(dt, input) {
		const enemy = this.stateMachine.entity;
		
		if (!enemy.target) {
			this.stateMachine.change(EntityState.IDLE);
			return;
		}
		
		// Check if player is in attack range
		if (enemy.isPlayerInAttackRange(enemy.target)) {
			this.stateMachine.change(EntityState.ATTACK);
			return;
		}
		
		// Check if player escaped
		const dx = enemy.target.x - enemy.x;
		const dy = enemy.target.y - enemy.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		
		if (distance > this.loseTargetDistance) {
			// Lost player, return to patrol or idle
			if (enemy.patrolPath.length > 0) {
				this.stateMachine.change(EntityState.PATROL);
			} else {
				this.stateMachine.change(EntityState.IDLE);
			}
			return;
		}
		
		// Continue chasing
		enemy.chase(dt);
	}

	exit() {
		// Cleanup if needed
	}
}

