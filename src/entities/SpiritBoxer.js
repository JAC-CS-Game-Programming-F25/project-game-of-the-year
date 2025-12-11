import Enemy from './Enemy.js';
import EnemyStateMachine from './EnemyStateMachine.js';
import EntityState from '../enums/EntityState.js';
import EnemyIdleState from './states/enemy/EnemyIdleState.js';
import EnemyChaseState from './states/enemy/EnemyChaseState.js';
import EnemyAttackState from './states/enemy/EnemyAttackState.js';
import EnemyHitState from './states/enemy/EnemyHitState.js';
import EnemyDyingState from './states/enemy/EnemyDyingState.js';

/**
 * Spirit Boxer - Medium difficulty melee enemy
 * Sprite specs: 137x44px per frame, vertical strips
 */
export default class SpiritBoxer extends Enemy {
	constructor(x, y, target = null) {
		// Frame specs from documentation
		const frameWidth = 137;
		const frameHeight = 44;
		const scale = 3; // Scale up for visibility (bigger than bats!)
		const displayWidth = frameWidth * scale;
		const displayHeight = frameHeight * scale;
		
		// The actual body in the sprite is much smaller than the full frame
		const actualBodyWidth = 80 * scale;  // ~240px (body width)
		const actualBodyHeight = 44 * scale; // ~132px
		
		super(x, y, actualBodyWidth, actualBodyHeight);
		
		// PERMANENT sprite offset - sprite body doesn't match hitbox center
		this.spriteOffsetX = 160; // Sprite draws 160px RIGHT of entity position (for facing right)
		this.spriteOffsetY = -60;  // Sprite draws 60px UP of entity position (dot at feet)
		
		// Sprite dimensions
		this.frameWidth = frameWidth;
		this.frameHeight = frameHeight;
		this.displayWidth = displayWidth;
		this.displayHeight = displayHeight;
		
		// Spirit Boxer stats
		this.hp = 40; // More HP than bats
		this.maxHp = 40;
		this.baseDamage = 5; // Base damage
		this.chaseSpeed = 60; // Slower than bats (they're melee focused)
		this.detectionRange = 200; // Medium detection range
		this.attackRange = 65; // TRUE MELEE - boxer needs to be close!
		this.attackCooldown = 2.0; // 2 second cooldown
		this.lastAttackTime = -this.attackCooldown; // Can attack immediately
		this.minDistanceToPlayer = 65; // Very close but not on top of player
		
		// Target
		this.target = target;
		
		// Animation setup (vertical strips!)
		this.currentAnimation = 'idle';
		this.currentFrame = 0;
		this.frameTime = 0;
		this.frameInterval = 0.12; // 12 frames per second
		
		// Animation frame counts (from documentation)
		this.animationFrames = {
			'idle': 4,      // Idle.png: 176 / 44 = 4
			'run': 6,       // Run.png: 264 / 44 = 6
			'attack1': 6,   // attack 1.png: 264 / 44 = 6
			'attack2': 13,  // attack 2.png: 572 / 44 = 13 (LONGEST!)
			'attack3': 10,  // attack 3.png: 440 / 44 = 10
			'hit': 4,       // First 4 frames of Damaged & Death.png
			'death': 6      // Last 6 frames of Damaged & Death.png (start at frame 4)
		};
		
		// Combo system - attacks chain beautifully!
		this.currentComboAttack = 1; // Which attack in the combo (1, 2, or 3)
		this.comboResetTime = 2.5; // Seconds before combo resets to attack1
		this.lastComboTime = 0; // Time of last attack in combo
		
		// No need for sprite offset anymore - position is corrected
		
		// State machine
		this.stateMachine = new EnemyStateMachine(this);
		this.stateMachine.add(EntityState.IDLE, new EnemyIdleState(this));
		this.stateMachine.add(EntityState.CHASE, new EnemyChaseState(this));
		this.stateMachine.add(EntityState.ATTACK, new EnemyAttackState(this));
		this.stateMachine.add(EntityState.HIT, new EnemyHitState(this));
		this.stateMachine.add(EntityState.DYING, new EnemyDyingState(this));
		this.stateMachine.change(EntityState.IDLE);
	}
	
	/**
	 * Set current animation and reset frame
	 */
	setAnimation(animationName) {
		if (this.currentAnimation !== animationName) {
			this.currentAnimation = animationName;
			this.currentFrame = 0;
			this.frameTime = 0;
			
			// If entering attack state, advance combo
			if (animationName === 'attack') {
				this.advanceCombo();
			}
		}
	}
	
	/**
	 * Advance to next attack in combo chain
	 */
	advanceCombo() {
		this.lastComboTime = Date.now();
		
		// Cycle through attacks: 1 -> 2 -> 3 -> 1
		this.currentComboAttack++;
		if (this.currentComboAttack > 3) {
			this.currentComboAttack = 1;
		}
	}
	
	/**
	 * Get damage for current combo attack
	 */
	getDamage() {
		// Bigger attacks do more damage!
		switch(this.currentComboAttack) {
			case 1: return this.baseDamage;         // 5 damage
			case 2: return this.baseDamage + 3;     // 8 damage (BIG punch!)
			case 3: return this.baseDamage + 2;     // 7 damage (finishing blow)
			default: return this.baseDamage;
		}
	}
	
	/**
	 * Check if boxer is facing the player
	 * Now boxer can face both directions by flipping sprite
	 */
	isPlayerToRight(player) {
		// Always return true now - boxer flips to face player automatically
		return true;
	}
	
	/**
	 * Check if player is to the left (need to flip sprite)
	 */
	shouldFlipSprite(player) {
		// Flip sprite if player is to the left
		return player && player.x < this.x;
	}
	
	update(dt) {
		// Update animation frame
		this.frameTime += dt;
		if (this.frameTime >= this.frameInterval) {
			this.frameTime = 0;
			
			// Map state animation to actual sprite animation
			let animation = this.currentAnimation;
			if (animation === 'chase') animation = 'run';
			if (animation === 'attack') animation = 'attack' + this.currentComboAttack; // Use current combo attack
			
			const maxFrames = this.animationFrames[animation];
			
			if (maxFrames > 0) {
				this.currentFrame = (this.currentFrame + 1) % maxFrames;
			}
		}
		
		// Check if combo should reset (too much time passed)
		const timeSinceLastCombo = (Date.now() - this.lastComboTime) / 1000;
		if (timeSinceLastCombo > this.comboResetTime) {
			this.currentComboAttack = 1; // Reset to attack1
		}
		
		// Update state machine
		if (this.stateMachine) {
			this.stateMachine.update(dt);
		}
		
		// Call super.update to update hitbox position
		super.update(dt);
	}
	
	render(ctx, images) {
		// Map state animations to actual sprite animations
		// Spirit Boxer uses 'run' for movement, not 'chase'
		let animation = this.currentAnimation;
		if (animation === 'chase') {
			animation = 'run'; // Chase state uses run animation
		} else if (animation === 'attack') {
			animation = 'attack' + this.currentComboAttack; // Use current combo attack!
		}
		
		// Get sprite sheet name (vertical strips)
		let spriteSheetName = 'spirit-boxer-' + animation;
		if (animation === 'hit' || animation === 'death') {
			spriteSheetName = 'spirit-boxer-damaged-death';
		}
		
		const spriteSheet = images?.get(spriteSheetName);
		
		if (!spriteSheet || !spriteSheet.image || !spriteSheet.image.complete || spriteSheet.image.naturalWidth === 0) {
			// Fallback placeholder
			ctx.fillStyle = 'rgba(255, 165, 0, 0.8)';
			ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
			
			// Debug text
			ctx.fillStyle = 'white';
			ctx.font = '12px Arial';
			ctx.fillText(`BOXER ${spriteSheetName}`, this.x - 40, this.y);
			return;
		}
		
		// Calculate source Y position (VERTICAL strip layout!)
		const maxFrames = this.animationFrames[animation];
		let sourceY = this.currentFrame * this.frameHeight;
		
		// For death animation, adjust frame offset (death uses frames 4-9)
		if (animation === 'death') {
			sourceY = (this.currentFrame + 4) * this.frameHeight;
		}
		
		// Flip sprite horizontally if player is to the left
		const shouldFlip = this.shouldFlipSprite(this.target);
		
		ctx.save();
		// Always translate to entity position (red dot)
		ctx.translate(this.x, this.y);
		
		// Flip if needed
		if (shouldFlip) {
			ctx.scale(-1, 1);
		}
		
		// Draw with offset (same for both directions, flip handles the mirroring)
		ctx.drawImage(
			spriteSheet.image,
			0, sourceY,
			this.frameWidth, this.frameHeight,
			-this.displayWidth / 2 + this.spriteOffsetX,
			-this.displayHeight / 2 + this.spriteOffsetY,
			this.displayWidth, this.displayHeight
		);
		
		ctx.restore();
	}
}

