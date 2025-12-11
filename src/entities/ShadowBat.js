import Enemy from './Enemy.js';
import EnemyStateMachine from './EnemyStateMachine.js';

/**
 * Shadow Bat enemy - fast swarm enemy with flying behavior.
 * Simplified AI: no patrol, flies directly at player.
 */
export default class ShadowBat extends Enemy {
	constructor(x = 0, y = 0) {
		super(x, y, 32, 32);
		
		// Shadow Bat stats (weak but fast)
		this.hp = 20;
		this.maxHp = 20;
		this.attackDamage = 3;
		this.attackRange = 55; // Can attack from hover distance
		this.detectionRange = 250;
		this.speed = 100; // Fast flyer
		this.chaseSpeed = 120;
		this.minDistanceToPlayer = 50; // Hover at medium distance (flying enemy)
		
		// Sprite configuration (from shadow-bat-sprite.md)
		this.frameWidth = 44;
		this.frameHeight = 92;
		this.displayScale = 2; // 44×2 = 88px display size
		this.displayWidth = this.frameWidth * this.displayScale;
		this.displayHeight = this.frameHeight * this.displayScale;
		
		// Animation state
		this.currentAnimation = 'idle';
		this.currentFrame = 0;
		this.frameTime = 0;
		this.frameInterval = 0.12; // Fast animation for bat
		this.totalFrames = 0;
		this.transitionToFly = false; // Flag for idle-to-fly transition
		
		// Animation frame counts
		this.animationFrames = {
			'idle': 7,
			'idle-to-fly': 6,
			'fly': 7,
			'bite': 8,
			'hit': 3,
			'death': 4
		};
		
		// Shadow Bat doesn't patrol (flies directly at player)
		this.patrolPath = [];
		
		// Initialize state machine
		this.stateMachine = new EnemyStateMachine(this);
	}

	/**
	 * Set current animation.
	 * @param {string} animation - Animation name
	 */
	setAnimation(animation) {
		// Map state machine animation names to bat animation names
		const animationMap = {
			'idle': 'idle',
			'walk': 'fly',
			'chase': 'fly',
			'attack': 'bite',
			'hit': 'hit',
			'death': 'death'
		};
		
		const mappedAnimation = animationMap[animation] || animation;
		
		if (this.currentAnimation !== mappedAnimation) {
			// Special case: play idle-to-fly transition when going from idle to fly
			if (this.currentAnimation === 'idle' && mappedAnimation === 'fly') {
				this.currentAnimation = 'idle-to-fly';
				this.transitionToFly = true;
			} else {
				this.currentAnimation = mappedAnimation;
				this.transitionToFly = false;
			}
			this.currentFrame = 0;
			this.frameTime = 0;
		}
	}

	update(dt) {
		// Update frame animation
		this.frameTime += dt;
		if (this.frameTime >= this.frameInterval) {
			this.frameTime = 0;
			
			const maxFrames = this.animationFrames[this.currentAnimation];
			if (maxFrames) {
				this.currentFrame++;
				
				// Check if idle-to-fly animation completed
				if (this.transitionToFly && this.currentFrame >= maxFrames) {
					this.currentAnimation = 'fly';
					this.currentFrame = 0;
					this.transitionToFly = false;
				} else {
					this.currentFrame = this.currentFrame % maxFrames;
				}
			}
		}
		
		// Update state machine (handles AI logic)
		if (this.stateMachine) {
			this.stateMachine.update(dt);
		}
		
		// Update hitbox (Entity base class handles this now)
	}

	render(ctx, images) {
		// Get sprite sheet name
		let spriteSheetName = 'bat-' + this.currentAnimation;
		if (this.currentAnimation === 'idle-to-fly') {
			spriteSheetName = 'bat-idle-to-fly';
		} else if (this.currentAnimation === 'hit' || this.currentAnimation === 'death') {
			spriteSheetName = 'bat-hit-death';
		}
		
		const spriteSheet = images?.get(spriteSheetName);
		
		if (!spriteSheet || !spriteSheet.image || !spriteSheet.image.complete || spriteSheet.image.naturalWidth === 0) {
			// Fallback placeholder - RED SQUARE for debugging
			ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
			ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
			
			// Debug text
			ctx.fillStyle = 'white';
			ctx.font = '12px Arial';
			ctx.fillText(`BAT ${spriteSheetName}`, this.x - 40, this.y);
			ctx.fillText(`Loaded: ${!!spriteSheet}`, this.x - 40, this.y + 15);
			return;
		}
		
		// Calculate source X position (horizontal strip)
		// Use naturalWidth to ensure we have actual dimensions
		const actualWidth = spriteSheet.image.naturalWidth || spriteSheet.image.width;
		const maxFrames = this.animationFrames[this.currentAnimation];
		let sourceX = this.currentFrame * this.frameWidth;
		
		// For death animation, adjust frame offset (death uses frames 3-6)
		if (this.currentAnimation === 'death') {
			sourceX = (this.currentFrame + 3) * this.frameWidth;
		}
		
		// Draw the current frame (centered on bat position)
		const destX = this.x - this.displayWidth / 2;
		const destY = this.y - this.displayHeight / 2;
		
		ctx.drawImage(
			spriteSheet.image,
			sourceX, 0, // Source position (horizontal strip, y=0)
			this.frameWidth, this.frameHeight, // Source size (44×92)
			destX, destY, // Destination position (centered)
			this.displayWidth, this.displayHeight // Destination size (scaled)
		);
	}
}

