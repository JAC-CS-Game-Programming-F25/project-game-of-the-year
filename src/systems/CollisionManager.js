/**
 * CollisionManager - Handles all combat collision detection.
 * Checks player attacks vs enemies, enemy attacks vs player.
 */
export default class CollisionManager {
	constructor() {
		this.player = null;
		this.enemies = [];
	}

	/**
	 * Set the player reference.
	 * @param {Player} player
	 */
	setPlayer(player) {
		this.player = player;
	}

	/**
	 * Set the enemies array.
	 * @param {Enemy[]} enemies
	 */
	setEnemies(enemies) {
		this.enemies = enemies;
	}

	/**
	 * Check all collisions (player vs enemies, enemies vs player).
	 */
	checkCollisions() {
		if (!this.player) return;
		this.checkPlayerAttacks();
		this.checkEnemyAttacks();
	}

	checkPlayerAttacks() {
		if (this.player.stateMachine.currentState.name !== 'attacking') {
			return;
		}

		if (this.player.hasDealtDamage) {
			return;
		}
		
		const currentFrame = this.player.currentFrame || 0;
		const totalFrames = this.player.totalFrames || 12;
		const damageStartFrame = Math.floor(totalFrames * 0.5);
		const damageEndFrame = Math.floor(totalFrames * 0.75);
		
		if (currentFrame < damageStartFrame || currentFrame > damageEndFrame) {
			return;
		}

		for (const enemy of this.enemies) {
			if (!enemy.isAlive()) {
				continue;
			}

			const dx = enemy.x - this.player.x;
			const dy = enemy.y - this.player.y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			if (distance <= this.player.attackRange) {
				const angleToEnemy = Math.atan2(dy, dx);
				const playerDirection = this.player.direction;
				const directionAngles = {
					'e': 0,
					'se': Math.PI / 4,
					's': Math.PI / 2,
					'sw': 3 * Math.PI / 4,
					'w': Math.PI,
					'nw': -3 * Math.PI / 4,
					'n': -Math.PI / 2,
					'ne': -Math.PI / 4
				};
				const playerAngle = directionAngles[playerDirection] || 0;
				
				let angleDiff = angleToEnemy - playerAngle;
				while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
				while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
				
				const attackArc = Math.PI;
				const isInFrontArc = Math.abs(angleDiff) <= attackArc / 2;
				
				if (isInFrontArc) {
					enemy.takeDamage(this.player.attackDamage);
					this.player.hasDealtDamage = true;

					if (distance > 0) {
						const knockbackStrength = 20;
						const knockbackX = (dx / distance) * knockbackStrength;
						const knockbackY = (dy / distance) * knockbackStrength;
						enemy.x += knockbackX;
						enemy.y += knockbackY;
					}

					if (enemy.isAlive()) {
						if (enemy.stateMachine.currentState.name !== 'hit') {
							enemy.stateMachine.change('hit');
						}
					} else {
						if (enemy.stateMachine.currentState.name !== 'dying') {
							enemy.stateMachine.change('dying');
						}
					}
				}
			}
		}
	}

	checkEnemyAttacks() {
		for (const enemy of this.enemies) {
			if (!enemy.isAlive()) {
				continue;
			}
			
			if (enemy.stateMachine.currentState.name !== 'attack') {
				continue;
			}

			const attackState = enemy.stateMachine.currentState;
			if (attackState.hasDealtDamage) {
				continue;
			}
			
			const currentFrame = enemy.currentFrame || 0;
			const totalFrames = enemy.animationFrames ? enemy.animationFrames[enemy.currentAnimation] : 8;
			const damageStartFrame = Math.floor(totalFrames * 0.5);
			const damageEndFrame = Math.floor(totalFrames * 0.9);
			
			if (currentFrame < damageStartFrame || currentFrame > damageEndFrame) {
				continue;
			}

			const dx = this.player.x - enemy.x;
			const dy = this.player.y - enemy.y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			if (distance <= enemy.attackRange) {
				const damage = enemy.getDamage ? enemy.getDamage() : (enemy.attackDamage || enemy.damage || 5);
				this.player.takeDamage(damage);
				attackState.hasDealtDamage = true;

				if (!this.player.isAlive()) {
					this.player.stateMachine.change('dying');
				}
			}
		}
	}

	/**
	 * Get angle (radians) for a Direction enum.
	 * @param {Direction} direction
	 * @returns {number}
	 */
	getDirectionAngle(direction) {
		const angleMap = {
			'e': 0,
			'se': Math.PI / 4,
			's': Math.PI / 2,
			'sw': (3 * Math.PI) / 4,
			'w': Math.PI,
			'nw': (5 * Math.PI) / 4,
			'n': (3 * Math.PI) / 2,
			'ne': (7 * Math.PI) / 4
		};
		return angleMap[direction] || 0;
	}

	/**
	 * Normalize angle to -PI to PI range.
	 * @param {number} angle
	 * @returns {number}
	 */
	normalizeAngle(angle) {
		while (angle > Math.PI) angle -= 2 * Math.PI;
		while (angle < -Math.PI) angle += 2 * Math.PI;
		return angle;
	}
}

