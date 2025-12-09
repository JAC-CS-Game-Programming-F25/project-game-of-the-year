/**
 * Base class for all game objects.
 * Provides position, dimensions, and basic update/render methods.
 */
export default class GameObject {
	constructor(x = 0, y = 0, width = 0, height = 0) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	update(dt) {
		// Override in subclasses
	}

	render(ctx) {
		// Override in subclasses
	}
}

