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

		// Check player attacks hitting enemies
		this.checkPlayerAttacks();

		// Check enemy attacks hitting player
		this.checkEnemyAttacks();
	}

	/**
	 * Check if player's attack hits any enemies.
	 */
	checkPlayerAttacks() {
		// Only check if player is attacking
		if (this.player.stateMachine.currentState.name !== 'attacking') {
			return;
		}

		// Check if player has dealt damage this attack
		if (this.player.hasDealtDamage) {
			return; // Already dealt damage this attack
		}
		
		// Only deal damage during active frames (50-75% of animation)
		const currentFrame = this.player.currentFrame || 0;
		const totalFrames = this.player.totalFrames || 12;
		const damageStartFrame = Math.floor(totalFrames * 0.5); // 50% through
		const damageEndFrame = Math.floor(totalFrames * 0.75); // 75% through
		
		if (currentFrame < damageStartFrame || currentFrame > damageEndFrame) {
			return; // Not in damage window yet
		}


		// Check each enemy
		for (const enemy of this.enemies) {
			if (!enemy.isAlive()) {
				continue;
			}

			// Check if enemy is in attack range
			const dx = enemy.x - this.player.x;
			const dy = enemy.y - this.player.y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			if (distance <= this.player.attackRange) {
				// Calculate angle to enemy
				const angleToEnemy = Math.atan2(dy, dx);
				
				// Get player's facing direction angle
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
				
				// Calculate angle difference (normalized to -PI to PI)
				let angleDiff = angleToEnemy - playerAngle;
				while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
				while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
				
				// Check if enemy is in front arc (180 degrees = PI radians)
				const attackArc = Math.PI; // Half circle in front
				const isInFrontArc = Math.abs(angleDiff) <= attackArc / 2;
				
				if (isInFrontArc) {
					// Hit!
					enemy.takeDamage(this.player.attackDamage);
					this.player.hasDealtDamage = true;

					// Apply knockback (push enemy away from player)
					if (distance > 0) {
						const knockbackStrength = 20;
						const knockbackX = (dx / distance) * knockbackStrength;
						const knockbackY = (dy / distance) * knockbackStrength;
						enemy.x += knockbackX;
						enemy.y += knockbackY;
					}

					// Transition enemy state based on HP
					if (enemy.isAlive()) {
						// Still alive, transition to HIT state
						if (enemy.stateMachine.currentState.name !== 'hit') {
							enemy.stateMachine.change('hit');
						}
					} else {
						// Dead! Transition to DYING state
						if (enemy.stateMachine.currentState.name !== 'dying') {
							enemy.stateMachine.change('dying');
							console.log('💀 Enemy killed!');
						}
					}
				}
			}
		}
	}

	/**
	 * Check if any enemy attacks hit the player.
	 */
	checkEnemyAttacks() {
		for (const enemy of this.enemies) {
			// Skip dead enemies
			if (!enemy.isAlive()) {
				continue;
			}
			
			// Only check if enemy is attacking
			if (enemy.stateMachine.currentState.name !== 'attack') {
				continue;
			}

			// Check if enemy has dealt damage this attack
			const attackState = enemy.stateMachine.currentState;
			if (attackState.hasDealtDamage) {
				continue; // Already dealt damage this attack
			}
			
			// Only deal damage during active frames (50-90% of animation for bite)
			const currentFrame = enemy.currentFrame || 0;
			const totalFrames = enemy.animationFrames ? enemy.animationFrames[enemy.currentAnimation] : 8;
			const damageStartFrame = Math.floor(totalFrames * 0.5); // 50% through (more forgiving)
			const damageEndFrame = Math.floor(totalFrames * 0.9); // 90% through
			
			if (currentFrame < damageStartFrame || currentFrame > damageEndFrame) {
				continue; // Not in damage window yet
			}

			// Check if player is in attack range
			const dx = this.player.x - enemy.x;
			const dy = this.player.y - enemy.y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			if (distance <= enemy.attackRange) {
				// Hit! Use getDamage() if available (for combo system)
				const damage = enemy.getDamage ? enemy.getDamage() : (enemy.attackDamage || enemy.damage || 5);
				this.player.takeDamage(damage);
				attackState.hasDealtDamage = true;

				// Check if player died
				if (!this.player.isAlive()) {
					console.log('Player died!');
					// PlayState will handle transitioning to GameOverState
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

