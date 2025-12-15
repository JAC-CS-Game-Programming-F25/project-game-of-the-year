import Particle from './Particle.js';

/**
 * Manages particle effects throughout the game
 */
export default class ParticleSystem {
	constructor() {
		this.particles = [];
	}

	/**
	 * Create a burst of particles at a location
	 */
	createBurst(x, y, count, color = '#ff6600', minSpeed = 50, maxSpeed = 150) {
		for (let i = 0; i < count; i++) {
			const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
			const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
			const velocityX = Math.cos(angle) * speed;
			const velocityY = Math.sin(angle) * speed;
			const size = 2 + Math.random() * 3;
			const lifetime = 0.5 + Math.random() * 0.5;

			this.particles.push(new Particle(x, y, velocityX, velocityY, color, size, lifetime));
		}
	}

	/**
	 * Create a special attack effect with lots of particles
	 */
	createSpecialAttackBurst(x, y) {
		this.createBurst(x, y, 30, '#ff6600', 100, 300);
		this.createBurst(x, y, 20, '#ffaa00', 150, 250);
		this.createBurst(x, y, 15, '#ffffff', 200, 350);
	}

	/**
	 * Create a death burst effect
	 */
	createDeathBurst(x, y, color = '#8800ff') {
		this.createBurst(x, y, 20, color, 80, 180);
	}

	update(dt) {
		for (const particle of this.particles) {
			particle.update(dt);
		}

		this.particles = this.particles.filter(p => !p.isDead);
	}

	render(context, camera) {
		context.save();
		context.translate(-camera.x, -camera.y);

		for (const particle of this.particles) {
			particle.render(context);
		}

		context.restore();
	}

	clear() {
		this.particles = [];
	}
}

