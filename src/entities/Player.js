import Entity from './Entity.js';
import PlayerStateMachine from './PlayerStateMachine.js';
import Direction from '../enums/Direction.js';
import Input from '../../lib/Input.js';
import Animation from '../../lib/Animation.js';

/**
 * Player entity (Shadow Creature).
 * Extends Entity with player-specific mechanics: attack, dodge, invincibility.
 * Uses 8-directional sprites from Enemy-Melee sprite pack.
 */
export default class Player extends Entity {
	constructor(x = 0, y = 0, width = 32, height = 32) {
		super(x, y, width, height);
		
		// Player-specific stats
		this.attackDamage = 10;
		this.attackRange = 50;
		this.dodgeSpeed = 200;
		this.dodgeDuration = 0.3; // seconds
		this.invincibilityTimer = 0;
		this.invincibilityDuration = 1.0; // seconds
		
		// Movement
		this.speed = 100; // pixels per second
		
		// Sprite configuration
		this.frameSize = 256;
		this.displayScale = 0.5;
		this.displaySize = this.frameSize * this.displayScale;
		
		// Animation state
		this.currentAnimation = 'idle'; // 'idle', 'attack', 'death'
		this.currentFrame = 0;
		this.frameTime = 0;
		this.frameInterval = 0.15; // seconds per frame (idle)
		this.attackFrameInterval = 0.05; // Attack animation: 24 frames × 0.05 = 1.2 seconds total
		this.totalFrames = 0; // Will be calculated from sprite sheet
		
		// Direction mappings (NW/NE swapped for idle due to sprite mislabeling)
		this.directionToSpriteIdle = {
			[Direction.E]: 'e',
			[Direction.SE]: 'se',
			[Direction.S]: 's',
			[Direction.SW]: 'sw',
			[Direction.W]: 'w',
			[Direction.NW]: 'ne', // NW visually uses NE sprite file
			[Direction.N]: 'n',
			[Direction.NE]: 'nw'  // NE visually uses NW sprite file
		};
		
		// Attack/Death mapping (correctly labeled)
		this.directionToSpriteAttack = {
			[Direction.E]: 'e',
			[Direction.SE]: 'se',
			[Direction.S]: 's',
			[Direction.SW]: 'sw',
			[Direction.W]: 'w',
			[Direction.NW]: 'nw',
			[Direction.N]: 'n',
			[Direction.NE]: 'ne'
		};
		
		// Initialize state machine
		this.stateMachine = new PlayerStateMachine(this);
		console.log('Player: State machine initialized, current state:', this.stateMachine.currentState?.name);
	}

	update(dt, input, images) {
		// Update invincibility timer
		if (this.invincibilityTimer > 0) {
			this.invincibilityTimer -= dt;
		}
		
		// Update frame animation
		const currentInterval = this.currentAnimation === 'attack' ? this.attackFrameInterval : this.frameInterval;
		
		this.frameTime += dt;
		if (this.frameTime >= currentInterval) {
			this.frameTime = 0;
			
			// Get current sprite to calculate total frames
			const mapping = this.currentAnimation === 'idle' 
				? this.directionToSpriteIdle 
				: this.directionToSpriteAttack;
			const spriteDir = mapping[this.direction] || this.direction;
			let spriteName = `enemy-${this.currentAnimation}-${spriteDir}`;
			if (this.currentAnimation === 'death') {
				spriteName = 'enemy-death-s';
			}
			
			const spriteImage = images?.get(spriteName);
			if (spriteImage && spriteImage.image && spriteImage.image.complete) {
				// Use actual image dimensions
				const actualWidth = spriteImage.image.naturalWidth || spriteImage.image.width;
				const actualHeight = spriteImage.image.naturalHeight || spriteImage.image.height;
				const framesPerRow = Math.floor(actualWidth / this.frameSize);
				const rows = Math.floor(actualHeight / this.frameSize);
				this.totalFrames = framesPerRow * rows;
				
				// Cycle to next frame
				this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
			}
		}
		
		// Update state machine with input (don't call super.update for state machine)
		if (this.stateMachine) {
			this.stateMachine.update(dt, input);
		}
		
		// Update animation (from Entity, but skip state machine since we handle it above)
		if (this.animation) {
			this.animation.update(dt);
		}
		
		// Update hitbox position to match entity position
		this.hitbox.set(this.x, this.y, this.width, this.height);
	}
	
	/**
	 * Set current animation type.
	 * @param {string} animation - 'idle', 'attack', or 'death'
	 */
	setAnimation(animation) {
		if (this.currentAnimation !== animation) {
			this.currentAnimation = animation;
			this.currentFrame = 0; // Reset to first frame
			this.frameTime = 0;
			console.log('Player: Animation changed to', animation);
		}
	}
	
	/**
	 * Check if current animation has completed all frames
	 * @returns {boolean}
	 */
	isAnimationComplete() {
		return this.totalFrames > 0 && this.currentFrame === this.totalFrames - 1;
	}

	render(ctx, images) {
		// Handle invincibility flicker (visual feedback)
		if (this.invincibilityTimer > 0) {
			const flickerRate = 0.1; // seconds per flicker
			const shouldShow = Math.floor(this.invincibilityTimer / flickerRate) % 2 === 0;
			if (!shouldShow) {
				return; // Skip rendering this frame for flicker effect
			}
		}
		
		// Get sprite based on animation and direction
		const mapping = this.currentAnimation === 'idle' 
			? this.directionToSpriteIdle 
			: this.directionToSpriteAttack;
		
		const spriteDir = mapping[this.direction] || this.direction;
		
		// Build sprite name
		let spriteName = `enemy-${this.currentAnimation}-${spriteDir}`;
		
		// Death only has south direction
		if (this.currentAnimation === 'death') {
			spriteName = 'enemy-death-s';
		}
		
		// Get the sprite image
		const spriteImage = images?.get(spriteName);
		
		if (spriteImage && spriteImage.image && spriteImage.image.complete) {
			// Calculate frame grid position
			const actualWidth = spriteImage.image.naturalWidth || spriteImage.image.width;
			const framesPerRow = Math.floor(actualWidth / this.frameSize);
			const frameRow = Math.floor(this.currentFrame / framesPerRow);
			const frameCol = this.currentFrame % framesPerRow;
			const sourceX = frameCol * this.frameSize;
			const sourceY = frameRow * this.frameSize;
			
			// Draw the frame (centered on player position)
			const destX = this.x - this.displaySize / 2;
			const destY = this.y - this.displaySize / 2;
			
			ctx.drawImage(
				spriteImage.image,
				sourceX, sourceY,              // Source position (current frame)
				this.frameSize, this.frameSize, // Source size (256x256)
				destX, destY,                 // Destination position
				this.displaySize, this.displaySize // Destination size (scaled)
			);
		} else {
			// Fallback placeholder if sprite not loaded
			ctx.fillStyle = 'rgba(100, 50, 200, 0.8)';
			ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
		}
	}

	/**
	 * Perform melee attack.
	 */
	attack() {
		// Attack logic will be handled by AttackingState
	}

	/**
	 * Perform dodge (quick sidestep with invincibility).
	 */
	dodge() {
		// Dodge logic will be handled by DodgingState
	}

	/**
	 * Check if player is invincible.
	 * @returns {boolean}
	 */
	isInvincible() {
		return this.invincibilityTimer > 0;
	}

	/**
	 * Apply damage to player (with invincibility check).
	 * @param {number} amount - Damage amount
	 */
	takeDamage(amount) {
		if (this.isInvincible()) {
			return; // Can't take damage while invincible
		}
		
		super.takeDamage(amount);
		
		// Set invincibility timer
		this.invincibilityTimer = this.invincibilityDuration;
		
		// Transition to HIT state if not already dying
		if (this.isAlive() && this.stateMachine.currentState?.name !== 'dying') {
			this.stateMachine.change('hit');
		}
	}
}

