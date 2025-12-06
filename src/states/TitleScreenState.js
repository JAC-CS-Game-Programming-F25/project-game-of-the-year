import State from "../../lib/State.js";

/**
 * TitleScreenState is now handled via DOM overlay in index.html.
 * This state file is kept for the state machine but doesn't need implementation
 * since the title screen is rendered as HTML/CSS rather than canvas.
 */
export default class TitleScreenState extends State {
	constructor() {
		super();
	}

	enter() {
		// Title screen is handled by DOM overlay, no canvas rendering needed
	}

	update(dt) {
		// Title screen input is handled by DOM event listeners
	}

	render() {
		// Title screen is rendered as DOM overlay, not canvas
	}
}
