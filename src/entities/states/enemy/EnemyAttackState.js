import State from '../../../../lib/State.js';
import EntityState from '../../../enums/EntityState.js';

/**
 * Enemy ATTACK state - attacking the player.
 */
export default class EnemyAttackState extends State {
	constructor() {
		super();
		this.attackDuration = 0.8; // seconds for attack animation
		this.attackTimer = 0;
		this.hasDealtDamage = false;
	}

	enter() {
		const enemy = this.stateMachine.entity;
		this.attackTimer = 0;
		this.hasDealtDamage = false;
		
		// Set attack animation
		if (enemy.setAnimation) {
			enemy.setAnimation('attack');
		}
		
		// Face player
		if (enemy.target) {
			enemy.direction = enemy.getDirectionToPlayer(enemy.target);
		}
	}

	update(dt, input) {
		const enemy = this.stateMachine.entity;
		this.attackTimer += dt;
		
		// Deal damage at mid-point of attack animation
		if (!this.hasDealtDamage && this.attackTimer >= this.attackDuration * 0.5) {
			this.hasDealtDamage = true;
			
			// Check if player is still in range and deal damage
			if (enemy.target && enemy.isPlayerInAttackRange(enemy.target)) {
				// Damage will be handled by CollisionManager
				// For now, just mark that we've attacked
				enemy.attack();
			}
		}
		
		// Attack complete
		if (this.attackTimer >= this.attackDuration) {
			// Check if player is still in range for another attack
			if (enemy.target && enemy.isPlayerInAttackRange(enemy.target)) {
				// Attack again
				this.stateMachine.change(EntityState.ATTACK);
			} else if (enemy.target && enemy.detectPlayer(enemy.target)) {
				// Chase player
				this.stateMachine.change(EntityState.CHASE);
			} else {
				// Return to patrol or idle
				if (enemy.patrolPath.length > 0) {
					this.stateMachine.change(EntityState.PATROL);
				} else {
					this.stateMachine.change(EntityState.IDLE);
				}
			}
		}
	}

	exit() {
		// Cleanup if needed
	}
}

