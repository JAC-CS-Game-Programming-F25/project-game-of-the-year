import EntityStateMachine from './EntityStateMachine.js';
import PlayerState from '../enums/PlayerState.js';
import PlayerIdleState from './states/player/PlayerIdleState.js';
import PlayerMovingState from './states/player/PlayerMovingState.js';
import PlayerAttackingState from './states/player/PlayerAttackingState.js';
import PlayerDodgingState from './states/player/PlayerDodgingState.js';
import PlayerHitState from './states/player/PlayerHitState.js';
import PlayerDyingState from './states/player/PlayerDyingState.js';

/**
 * State machine for Player entity.
 * Manages all player states and transitions.
 */
export default class PlayerStateMachine extends EntityStateMachine {
	constructor(player) {
		super(player);
		
		// Add all player states
		this.add(PlayerState.IDLE, new PlayerIdleState());
		this.add(PlayerState.MOVING, new PlayerMovingState());
		this.add(PlayerState.ATTACKING, new PlayerAttackingState());
		this.add(PlayerState.DODGING, new PlayerDodgingState());
		this.add(PlayerState.HIT, new PlayerHitState());
		this.add(PlayerState.DYING, new PlayerDyingState());
		
		// Start in IDLE state
		this.change(PlayerState.IDLE);
	}

	update(dt, input) {
		// Check for death transition (can happen from any state)
		if (!this.entity.isAlive() && this.currentState?.name !== PlayerState.DYING) {
			this.change(PlayerState.DYING);
		}
		
		// Update current state
		if (this.currentState) {
			this.currentState.update(dt, input);
		}
	}

	canTransition(from, to) {
		// Define valid transitions based on implementation-details.md
		const validTransitions = {
			[PlayerState.IDLE]: [PlayerState.MOVING, PlayerState.ATTACKING, PlayerState.DODGING, PlayerState.HIT, PlayerState.DYING],
			[PlayerState.MOVING]: [PlayerState.IDLE, PlayerState.ATTACKING, PlayerState.DODGING, PlayerState.HIT, PlayerState.DYING],
			[PlayerState.ATTACKING]: [PlayerState.IDLE, PlayerState.HIT, PlayerState.DYING],
			[PlayerState.DODGING]: [PlayerState.IDLE, PlayerState.HIT, PlayerState.DYING],
			[PlayerState.HIT]: [PlayerState.IDLE, PlayerState.DYING],
			[PlayerState.DYING]: [], // No transitions from DYING
		};
		
		// Allow transition if it's in the valid list, or if from is null (initial state)
		if (!from) return true;
		return validTransitions[from]?.includes(to) || false;
	}
}


