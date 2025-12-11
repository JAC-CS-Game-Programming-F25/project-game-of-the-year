import Enemy from './Enemy.js';
import EnemyStateMachine from './EnemyStateMachine.js';
import EntityState from '../enums/EntityState.js';
import EnemyIdleState from './states/enemy/EnemyIdleState.js';
import EnemyChaseState from './states/enemy/EnemyChaseState.js';
import EnemyAttackState from './states/enemy/EnemyAttackState.js';
import EnemyHitState from './states/enemy/EnemyHitState.js';
import EnemyDyingState from './states/enemy/EnemyDyingState.js';

export default class TempleGuardian extends Enemy {
	constructor(x, y, target = null) {
		const frameWidth = 160;
		const frameHeight = 59;
		const scale = 3.5;
		const displayWidth = frameWidth * scale;
		const displayHeight = frameHeight * scale;
		
		const actualBodyWidth = 120 * scale;
		const actualBodyHeight = 59 * scale;
		
		super(x, y, actualBodyWidth, actualBodyHeight);
		
		this.frameWidth = frameWidth;
		this.frameHeight = frameHeight;
		this.displayWidth = displayWidth;
		this.displayHeight = displayHeight;
		
		this.hp = 120;
		this.maxHp = 120;
		this.baseDamage = 8;
		this.chaseSpeed = 50;
		this.detectionRange = 250;
		this.attackRange = 70;
		this.attackCooldown = 2.5;
		this.lastAttackTime = -this.attackCooldown;
		this.minDistanceToPlayer = 60;
		
		this.target = target;
		
		this.currentAnimation = 'idle';
		this.currentFrame = 0;
		this.frameTime = 0;
		this.frameInterval = 0.12;
		
		this.isBuffed = false;
		this.buffDuration = 8.0;
		this.buffTimer = 0;
		this.buffDamageMultiplier = 1.5;
		this.buffSpeedMultiplier = 1.3;
		
		this.animationFrames = {
			'idle': 8,
			'walk': 8,
			'attack1': 11,
			'attack2': 11,
			'special': 14,
			'hit': 2,
			'death': 10
		};
		
		this.specialAttackChance = 0.3;
		this.currentAttackType = 'attack1';
		this.lastAttackType = null;
		this.normalAttacksSinceSpecial = 0;
		this.minNormalAttacksBeforeSpecial = 2;
		
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
				this.chooseAttack();
			}
		}
	}
	
	chooseAttack() {
		const canUseSpecial = this.lastAttackType !== 'special' && 
		                      this.normalAttacksSinceSpecial >= this.minNormalAttacksBeforeSpecial;
		
		const roll = Math.random();
		
		if (canUseSpecial && roll < this.specialAttackChance) {
			this.currentAttackType = 'special';
			this.normalAttacksSinceSpecial = 0;
		} else if (roll < 0.5) {
			this.currentAttackType = 'attack1';
			this.normalAttacksSinceSpecial++;
		} else {
			this.currentAttackType = 'attack2';
			this.normalAttacksSinceSpecial++;
		}
		
		this.lastAttackType = this.currentAttackType;
	}
	
	getDamage() {
		if (this.currentAttackType === 'special') {
			return 0;
		}
		
		let damage = 0;
		switch(this.currentAttackType) {
			case 'attack1': damage = this.baseDamage; break;
			case 'attack2': damage = this.baseDamage + 2; break;
			default: damage = this.baseDamage;
		}
		
		if (this.isBuffed) {
			damage = Math.floor(damage * this.buffDamageMultiplier);
		}
		
		return damage;
	}
	
	activateBuff() {
		this.isBuffed = true;
		this.buffTimer = this.buffDuration;
	}
	
	shouldFlipSprite(player) {
		return player && player.x < this.x;
	}
	
	update(dt) {
		if (this.isBuffed) {
			this.buffTimer -= dt;
			if (this.buffTimer <= 0) {
				this.isBuffed = false;
				this.buffTimer = 0;
			}
		}
		
		const baseChaseSpeed = 50;
		this.chaseSpeed = this.isBuffed ? baseChaseSpeed * this.buffSpeedMultiplier : baseChaseSpeed;
		
		let currentInterval = this.frameInterval;
		
		if (this.currentAnimation === 'attack') {
			if (this.currentAttackType === 'special') {
				currentInterval = 0.20;
			} else if (this.currentAttackType === 'attack1') {
				currentInterval = 0.08;
			} else {
				currentInterval = 0.16;
			}
		}
		
		this.frameTime += dt;
		if (this.frameTime >= currentInterval) {
			this.frameTime = 0;
			
			let animation = this.currentAnimation;
			if (animation === 'chase') animation = 'walk';
			if (animation === 'attack') animation = this.currentAttackType;
			if (animation === 'idle') animation = 'walk';
			
			const maxFrames = this.animationFrames[animation];
			
			if (maxFrames > 0) {
				this.currentFrame = (this.currentFrame + 1) % maxFrames;
			}
		}
		
		if (this.stateMachine) {
			this.stateMachine.update(dt);
		}
		
		super.update(dt);
	}
	
	render(ctx, images) {
		let animation = this.currentAnimation;
		if (animation === 'chase') animation = 'walk';
		if (animation === 'attack') animation = this.currentAttackType;
		if (animation === 'idle') animation = 'walk';
		
		const spriteSheetName = 'temple-guardian-' + animation;
		const spriteSheet = images?.get(spriteSheetName);
		
		if (!spriteSheet || !spriteSheet.image || !spriteSheet.image.complete || spriteSheet.image.naturalWidth === 0) {
			ctx.fillStyle = 'rgba(139, 0, 139, 0.8)';
			ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
			
			ctx.fillStyle = 'white';
			ctx.font = '12px Arial';
			ctx.fillText(`GUARDIAN ${spriteSheetName}`, this.x - 60, this.y);
			return;
		}
		
		const maxFrames = this.animationFrames[animation];
		const sourceY = this.currentFrame * this.frameHeight;
		
		const shouldFlip = this.shouldFlipSprite(this.target);
		
		ctx.save();
		ctx.translate(this.x, this.y);
		
		if (shouldFlip) {
			ctx.scale(-1, 1);
		}
		
		if (this.isBuffed) {
			ctx.shadowColor = 'rgba(255, 100, 0, 0.8)';
			ctx.shadowBlur = 20;
		}
		
		ctx.drawImage(
			spriteSheet.image,
			0, sourceY,
			this.frameWidth, this.frameHeight,
			-this.displayWidth / 2,
			-this.displayHeight / 2,
			this.displayWidth, this.displayHeight
		);
		
		ctx.restore();
		
		if (this.isBuffed) {
			ctx.strokeStyle = 'rgba(255, 100, 0, 0.6)';
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.width / 2 + 10, 0, Math.PI * 2);
			ctx.stroke();
		}
	}
}

