import Enemy from './Enemy.js';
import EnemyStateMachine from './EnemyStateMachine.js';
import EntityState from '../enums/EntityState.js';
import EnemyIdleState from './states/enemy/EnemyIdleState.js';
import EnemyChaseState from './states/enemy/EnemyChaseState.js';
import EnemyAttackState from './states/enemy/EnemyAttackState.js';
import EnemyHitState from './states/enemy/EnemyHitState.js';
import EnemyDyingState from './states/enemy/EnemyDyingState.js';

export default class SpiritBoxer extends Enemy {
	constructor(x, y, target = null) {
		const frameWidth = 137;
		const frameHeight = 44;
		const scale = 3;
		const displayWidth = frameWidth * scale;
		const displayHeight = frameHeight * scale;
		
		const actualBodyWidth = 80 * scale;
		const actualBodyHeight = 44 * scale;
		
		super(x, y, actualBodyWidth, actualBodyHeight);
		
		this.spriteOffsetX = 160;
		this.spriteOffsetY = -60;
		
		this.frameWidth = frameWidth;
		this.frameHeight = frameHeight;
		this.displayWidth = displayWidth;
		this.displayHeight = displayHeight;
		
		this.hp = 40;
		this.maxHp = 40;
		this.baseDamage = 5;
		this.chaseSpeed = 60;
		this.detectionRange = 200;
		this.attackRange = 65;
		this.attackCooldown = 2.0;
		this.lastAttackTime = -this.attackCooldown;
		this.minDistanceToPlayer = 65;
		
		this.target = target;
		
		this.currentAnimation = 'idle';
		this.currentFrame = 0;
		this.frameTime = 0;
		this.frameInterval = 0.12;
		
		this.animationFrames = {
			'idle': 4,
			'run': 6,
			'attack1': 6,
			'attack2': 13,
			'attack3': 10,
			'hit': 4,
			'death': 6
		};
		
		this.currentComboAttack = 1;
		this.comboResetTime = 2.5;
		this.lastComboTime = 0;
		this.isInComboChain = false;
		this.comboChainChance = 0.25;
		
		// State machine
		this.stateMachine = new EnemyStateMachine(this);
		this.stateMachine.add(EntityState.IDLE, new EnemyIdleState(this));
		this.stateMachine.add(EntityState.CHASE, new EnemyChaseState(this));
		this.stateMachine.add(EntityState.ATTACK, new EnemyAttackState(this));
		this.stateMachine.add(EntityState.HIT, new EnemyHitState(this));
		this.stateMachine.add(EntityState.DYING, new EnemyDyingState(this));
		this.stateMachine.change(EntityState.IDLE);
	}
	
	setAnimation(animationName) {
		if (this.currentAnimation !== animationName) {
			this.currentAnimation = animationName;
			this.currentFrame = 0;
			this.frameTime = 0;
			
			if (animationName === 'attack') {
				this.advanceCombo();
				
				// Chance to start a combo chain
				if (this.currentComboAttack === 1 && Math.random() < this.comboChainChance) {
					this.isInComboChain = true;
				}
			}
		}
	}
	
	advanceCombo() {
		this.lastComboTime = Date.now();
		
		this.currentComboAttack++;
		if (this.currentComboAttack > 3) {
			this.currentComboAttack = 1;
			this.isInComboChain = false;
		}
	}
	
	shouldComboImmediately() {
		return this.isInComboChain && this.currentComboAttack < 3;
	}
	
	getDamage() {
		switch(this.currentComboAttack) {
			case 1: return this.baseDamage;
			case 2: return this.baseDamage + 3;
			case 3: return this.baseDamage + 2;
			default: return this.baseDamage;
		}
	}
	
	isPlayerInAttackRange(player) {
		if (!player) return false;
		
		// Use same offset as chase for consistency
		const targetY = player.y + 50;
		const dx = player.x - this.x;
		const dy = targetY - this.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		
		return distance <= this.attackRange;
	}
	
	isPlayerToRight(player) {
		return true;
	}
	
	shouldFlipSprite(player) {
		return player && player.x < this.x;
	}
	
	chase(dt) {
		if (!this.target) return;
		
		// Offset target position down so boxer aligns better
		const targetY = this.target.y + 50;
		
		const dx = this.target.x - this.x;
		const dy = targetY - this.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		const minDistance = this.minDistanceToPlayer;
		
		const verticalDistance = Math.abs(dy);
		const verticalThreshold = 30;
		
		if (distance > minDistance) {
			let moveX = 0;
			let moveY = 0;
			
			// PRIORITY: Get on the same horizontal line (same Y position)
			if (verticalDistance > verticalThreshold) {
				// Focus almost entirely on vertical movement to align Y positions
				moveX = (dx / distance) * this.chaseSpeed * dt * 0.2;
				moveY = (dy / distance) * this.chaseSpeed * dt * 1.8;
			} else {
				// Already aligned vertically, now close horizontal distance
				moveX = (dx / distance) * this.chaseSpeed * dt;
				moveY = (dy / distance) * this.chaseSpeed * dt * 0.2;
			}
			
			this.x += moveX;
			this.y += moveY;
			
			this.direction = this.getDirectionToPlayer(this.target);
		} else if (distance < minDistance - 10) {
			// Too close, back up
			const moveX = (dx / distance) * this.chaseSpeed * dt * -0.3;
			const moveY = (dy / distance) * this.chaseSpeed * dt * -0.3;
			
			this.x += moveX;
			this.y += moveY;
		}
	}

	update(dt) {
		this.frameTime += dt;
		if (this.frameTime >= this.frameInterval) {
			this.frameTime = 0;
			
			let animation = this.currentAnimation;
			if (animation === 'chase') animation = 'run';
			if (animation === 'attack') animation = 'attack' + this.currentComboAttack;
			
			const maxFrames = this.animationFrames[animation];
			
			if (maxFrames > 0) {
				this.currentFrame = (this.currentFrame + 1) % maxFrames;
			}
		}
		
		const timeSinceLastCombo = (Date.now() - this.lastComboTime) / 1000;
		if (timeSinceLastCombo > this.comboResetTime) {
			this.currentComboAttack = 1;
		}
		
		if (this.stateMachine) {
			this.stateMachine.update(dt);
		}
		
		super.update(dt);
	}
	
	render(ctx, images) {
		let animation = this.currentAnimation;
		if (animation === 'chase') {
			animation = 'run';
		} else if (animation === 'attack') {
			animation = 'attack' + this.currentComboAttack;
		}
		
		let spriteSheetName = 'spirit-boxer-' + animation;
		if (animation === 'hit' || animation === 'death') {
			spriteSheetName = 'spirit-boxer-damaged-death';
		}
		
		const spriteSheet = images?.get(spriteSheetName);
		
		if (!spriteSheet || !spriteSheet.image || !spriteSheet.image.complete || spriteSheet.image.naturalWidth === 0) {
			ctx.fillStyle = 'rgba(255, 165, 0, 0.8)';
			ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
			
			ctx.fillStyle = 'white';
			ctx.font = '12px Arial';
			ctx.fillText(`BOXER ${spriteSheetName}`, this.x - 40, this.y);
			return;
		}
		
		const maxFrames = this.animationFrames[animation];
		let sourceY = this.currentFrame * this.frameHeight;
		
		if (animation === 'death') {
			sourceY = (this.currentFrame + 4) * this.frameHeight;
		}
		
		const shouldFlip = this.shouldFlipSprite(this.target);
		
		ctx.save();
		ctx.translate(this.x, this.y);
		
		if (shouldFlip) {
			ctx.scale(-1, 1);
		}
		
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

