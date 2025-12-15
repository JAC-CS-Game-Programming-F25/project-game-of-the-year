import State from '../../../../lib/State.js';
import EntityState from '../../../enums/EntityState.js';
import { sounds } from '../../../globals.js';

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
			duration = 9.0;
		} else if (enemy.currentAttackType === 'attack1') {
			duration = 0.88;
		} else if (enemy.currentAttackType === 'attack2') {
			duration = 5.5;
		}
		
		if (this.attackTimer >= duration) {
			if (enemy.currentAttackType === 'special' && enemy.activateBuff) {
				enemy.activateBuff();
				
				// Trigger massive special attack effects for Temple Guardian
				if (enemy.constructor.name === 'TempleGuardian') {
					// Play special attack sound
					sounds.play('boss-special');
					
					// Trigger MASSIVE camera shake
					if (enemy.camera) {
						enemy.camera.triggerShake(80, 1.2);
					}
					// Trigger special attack particle burst
					if (enemy.particleSystem) {
						enemy.particleSystem.createSpecialAttackBurst(enemy.x, enemy.y);
					}
				}
			}
			
			// Check if Spirit Boxer should immediately combo
			if (enemy.shouldComboImmediately && enemy.shouldComboImmediately()) {
				// Chain into next attack immediately (no cooldown)
				this.attackTimer = 0;
				this.hasDealtDamage = false;
				if (enemy.setAnimation) {
					enemy.setAnimation('attack');
				}
				return;
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

