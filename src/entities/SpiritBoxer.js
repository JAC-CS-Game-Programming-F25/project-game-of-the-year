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
			}
		}
	}
	
	advanceCombo() {
		this.lastComboTime = Date.now();
		
		this.currentComboAttack++;
		if (this.currentComboAttack > 3) {
			this.currentComboAttack = 1;
		}
	}
	
	getDamage() {
		switch(this.currentComboAttack) {
			case 1: return this.baseDamage;
			case 2: return this.baseDamage + 3;
			case 3: return this.baseDamage + 2;
			default: return this.baseDamage;
		}
	}
	
	isPlayerToRight(player) {
		return true;
	}
	
	shouldFlipSprite(player) {
		return player && player.x < this.x;
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

