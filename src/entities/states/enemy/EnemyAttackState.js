import State from '../../../../lib/State.js';
import EntityState from '../../../enums/EntityState.js';

export default class EnemyAttackState extends State {
	constructor() {
		super();
		this.attackDuration = 1.2;
		this.attackCooldown = 1.5;
		this.attackTimer = 0;
		this.hasDealtDamage = false;
	}

	enter() {
		const enemy = this.stateMachine.entity;
		this.attackTimer = 0;
		this.hasDealtDamage = false;
		
		if (enemy.setAnimation) {
			enemy.setAnimation('attack');
		}
		
		if (enemy.target) {
			enemy.direction = enemy.getDirectionToPlayer(enemy.target);
		}
	}

	update(dt, input) {
		const enemy = this.stateMachine.entity;
		this.attackTimer += dt;
		
		let duration = this.attackDuration;
		if (enemy.currentAttackType === 'special') {
			duration = 2.8;
		} else if (enemy.currentAttackType === 'attack1') {
			duration = 0.9;
		} else if (enemy.currentAttackType === 'attack2') {
			duration = 1.8;
		}
		
		if (this.attackTimer >= duration) {
			if (enemy.currentAttackType === 'special' && enemy.activateBuff) {
				enemy.activateBuff();
			}
			
			enemy.lastAttackTime = Date.now();
			
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
	}
}

