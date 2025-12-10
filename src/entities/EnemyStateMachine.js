import EntityStateMachine from './EntityStateMachine.js';
import EntityState from '../enums/EntityState.js';

// Import enemy states
import EnemyIdleState from './states/enemy/EnemyIdleState.js';
import EnemyPatrolState from './states/enemy/EnemyPatrolState.js';
import EnemyChaseState from './states/enemy/EnemyChaseState.js';
import EnemyAttackState from './states/enemy/EnemyAttackState.js';
import EnemyHitState from './states/enemy/EnemyHitState.js';
import EnemyDyingState from './states/enemy/EnemyDyingState.js';

/**
 * State machine for enemy AI.
 * Manages enemy behavior states: idle, patrol, chase, attack, hit, dying.
 */
export default class EnemyStateMachine extends EntityStateMachine {
	constructor(enemy) {
		super(enemy);
		
		// Add all enemy states
		this.add(EntityState.IDLE, new EnemyIdleState());
		this.add(EntityState.PATROL, new EnemyPatrolState());
		this.add(EntityState.CHASE, new EnemyChaseState());
		this.add(EntityState.ATTACK, new EnemyAttackState());
		this.add(EntityState.HIT, new EnemyHitState());
		this.add(EntityState.DYING, new EnemyDyingState());
		
		// Start in idle state
		this.change(EntityState.IDLE);
	}

	update(dt) {
		// Pass input as null for enemies (they don't need player input)
		if (this.currentState) {
			this.currentState.update(dt, null);
		}
	}
}

