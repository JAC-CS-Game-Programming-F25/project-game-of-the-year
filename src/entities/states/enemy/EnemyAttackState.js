import State from '../../../../lib/State.js';
import EntityState from '../../../enums/EntityState.js';

/**
 * Enemy ATTACK state - attacking the player.
 */
export default class EnemyAttackState extends State {
	constructor() {
		super();
		this.attackDuration = 1.2; // seconds for attack animation (8 frames * 0.12 = 0.96s + buffer)
		this.attackCooldown = 1.5; // seconds before can attack again
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
		
		// Damage is handled by CollisionManager based on animation frames
		
		// Attack animation complete
		if (this.attackTimer >= this.attackDuration) {
			// Set cooldown before next attack
			enemy.lastAttackTime = Date.now();
			
			// Return to chasing (cooldown will prevent immediate re-attack)
			if (enemy.target && enemy.detectPlayer(enemy.target)) {
				this.stateMachine.change(EntityState.CHASE);
			} else if (enemy.patrolPath.length > 0) {
				this.stateMachine.change(EntityState.PATROL);
			} else {
				this.stateMachine.change(EntityState.IDLE);
			}
		}
	}

	exit() {
		// Cleanup if needed
	}
}

