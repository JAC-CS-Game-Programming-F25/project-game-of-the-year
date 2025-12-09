/**
 * Enemy state machine states.
 * Used by all enemy entities (Shadow Bat, Spirit Boxer, Temple Guardian).
 */
const EntityState = {
	IDLE: 'idle',
	PATROL: 'patrol',
	CHASE: 'chase',
	ATTACK: 'attack',
	HIT: 'hit',
	DYING: 'dying',
};

export default EntityState;

