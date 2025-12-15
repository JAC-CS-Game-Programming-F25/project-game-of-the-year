/**
 * Simple particle for visual effects
 */
export default class Particle {
	constructor(x, y, velocityX, velocityY, color, size, lifetime) {
		this.x = x;
		this.y = y;
		this.velocityX = velocityX;
		this.velocityY = velocityY;
		this.color = color;
		this.size = size;
		this.lifetime = lifetime;
		this.age = 0;
		this.isDead = false;
	}

	update(dt) {
		this.x += this.velocityX * dt;
		this.y += this.velocityY * dt;
		this.age += dt;

		if (this.age >= this.lifetime) {
			this.isDead = true;
		}
	}

	render(context) {
		const alpha = 1 - (this.age / this.lifetime);
		context.save();
		context.globalAlpha = alpha;
		context.fillStyle = this.color;
		context.beginPath();
		context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
		context.fill();
		context.restore();
	}
}

