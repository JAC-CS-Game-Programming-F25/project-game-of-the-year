import StateMachine from '../../lib/StateMachine.js';

/**
 * Specialized state machine for entities (Player, Enemy).
 * Extends StateMachine with entity-specific functionality like previous state tracking
 * and transition validation.
 */
export default class EntityStateMachine extends StateMachine {
	constructor(entity) {
		super();
		this.entity = entity;
		this.previousState = null;
	}

	change(stateName, enterParameters) {
		// Store previous state before changing
		if (this.currentState) {
			this.previousState = this.currentState.name;
		}
		
		// Check if transition is allowed
		if (this.canTransition(this.currentState?.name, stateName)) {
			super.change(stateName, enterParameters);
		}
	}

	/**
	 * Override in subclasses to define valid state transitions.
	 * @param {string} from - Current state name
	 * @param {string} to - Target state name
	 * @returns {boolean} - Whether transition is allowed
	 */
	canTransition(from, to) {
		// Default: allow all transitions
		// Subclasses should override this for specific rules
		return true;
	}
}

