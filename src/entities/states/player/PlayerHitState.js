import State from '../../../../lib/State.js';
import PlayerState from '../../../enums/PlayerState.js';

/**
 * Player HIT state - quick vanish flash.
 */
export default class PlayerHitState extends State {
	constructor() {
		super();
		this.flashDuration = 0.12; // Very fast flash (120ms)
		this.flashTimer = 0;
	}

	enter() {
		const player = this.stateMachine.entity;
		this.flashTimer = 0;
		
		// Keep current animation - vanish is visual effect only
		// (Player doesn't have dedicated hit sprite)
	}

	exit() {
		// No animation change needed
	}

	update(dt, input) {
		const player = this.stateMachine.entity;
		this.flashTimer += dt;
		
		// Quick flash complete - return to idle
		if (this.flashTimer >= this.flashDuration) {
			this.stateMachine.change(PlayerState.IDLE);
		}
	}

	render() {
		// Rendering handled by Player class
	}
}


