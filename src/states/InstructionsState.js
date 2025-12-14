import State from "../../lib/State.js";
import { context, input, CANVAS_WIDTH, CANVAS_HEIGHT } from "../globals.js";

export default class InstructionsState extends State {
	constructor() {
		super();
		this.escapePressed = false;
		this.spacePressed = false;
	}

	enter() {
		this.escapePressed = false;
		this.spacePressed = false;
		console.log('Instructions screen opened');
	}

	update(dt) {
		// ESC or Space to go back to title screen
		if ((input.keys.ESCAPE || input.keys[' ']) && !this.escapePressed && !this.spacePressed) {
			if (input.keys.ESCAPE) this.escapePressed = true;
			if (input.keys[' ']) this.spacePressed = true;
			
			// Go back to title screen (reload page)
			window.location.reload();
		}

		if (!input.keys.ESCAPE) this.escapePressed = false;
		if (!input.keys[' ']) this.spacePressed = false;
	}

	render() {
		// Dark background
		context.fillStyle = '#0a0a0f';
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// Title
		context.font = 'bold 56px "Georgia", serif';
		context.fillStyle = '#e8f4f8';
		context.textAlign = 'center';
		context.textBaseline = 'top';
		context.shadowColor = 'rgba(100, 220, 255, 0.6)';
		context.shadowBlur = 20;
		context.fillText('INSTRUCTIONS', CANVAS_WIDTH / 2, 60);
		context.shadowBlur = 0;

		// Instructions content
		const leftColumn = CANVAS_WIDTH / 2 - 280;
		const rightColumn = CANVAS_WIDTH / 2 + 80;
		let y = 160;
		const lineHeight = 40;
		const sectionGap = 60;

		// Section: Movement
		context.font = 'bold 24px "Courier New", monospace';
		context.fillStyle = '#64dcff';
		context.textAlign = 'left';
		context.fillText('MOVEMENT', leftColumn, y);
		y += lineHeight;

		context.font = '18px "Courier New", monospace';
		context.fillStyle = '#a0c8d8';
		context.fillText('W / Arrow Up', leftColumn, y);
		context.fillStyle = '#6a8a9a';
		context.fillText('Move North', rightColumn, y);
		y += lineHeight - 5;

		context.fillStyle = '#a0c8d8';
		context.fillText('S / Arrow Down', leftColumn, y);
		context.fillStyle = '#6a8a9a';
		context.fillText('Move South', rightColumn, y);
		y += lineHeight - 5;

		context.fillStyle = '#a0c8d8';
		context.fillText('A / Arrow Left', leftColumn, y);
		context.fillStyle = '#6a8a9a';
		context.fillText('Move West', rightColumn, y);
		y += lineHeight - 5;

		context.fillStyle = '#a0c8d8';
		context.fillText('D / Arrow Right', leftColumn, y);
		context.fillStyle = '#6a8a9a';
		context.fillText('Move East', rightColumn, y);
		y += sectionGap;

		// Section: Combat
		context.font = 'bold 24px "Courier New", monospace';
		context.fillStyle = '#64dcff';
		context.fillText('COMBAT', leftColumn, y);
		y += lineHeight;

		context.font = '18px "Courier New", monospace';
		context.fillStyle = '#a0c8d8';
		context.fillText('Space', leftColumn, y);
		context.fillStyle = '#6a8a9a';
		context.fillText('Attack', rightColumn, y);
		y += lineHeight - 5;

		context.fillStyle = '#a0c8d8';
		context.fillText('Shift', leftColumn, y);
		context.fillStyle = '#6a8a9a';
		context.fillText('Dodge', rightColumn, y);
		y += sectionGap;

		// Section: Game
		context.font = 'bold 24px "Courier New", monospace';
		context.fillStyle = '#64dcff';
		context.fillText('GAME CONTROLS', leftColumn, y);
		y += lineHeight;

		context.font = '18px "Courier New", monospace';
		context.fillStyle = '#a0c8d8';
		context.fillText('ESC', leftColumn, y);
		context.fillStyle = '#6a8a9a';
		context.fillText('Pause & Save', rightColumn, y);
		y += sectionGap;

		// Objective (right side)
		const objectiveX = CANVAS_WIDTH - 150;
		let objectiveY = 160;
		
		context.font = 'bold 24px "Courier New", monospace';
		context.fillStyle = '#64dcff';
		context.textAlign = 'right';
		context.fillText('OBJECTIVE', objectiveX, objectiveY);
		objectiveY += lineHeight;

		context.font = '16px "Courier New", monospace';
		context.fillStyle = '#a0c8d8';
		const objectiveText = [
			'Find the door to progress',
			'to the next room.',
			'',
			'Defeat corrupted guardians',
			'and reclaim your humanity.',
			'',
			'Face the Temple Guardian',
			'to complete your journey.'
		];

		objectiveText.forEach(line => {
			context.fillText(line, objectiveX, objectiveY);
			objectiveY += lineHeight - 15;
		});

		// Back instruction at bottom
		context.font = '20px "Courier New", monospace';
		context.fillStyle = '#6a8a9a';
		context.textAlign = 'center';
		context.fillText('Press SPACE or ESC to return', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 50);
	}
}

