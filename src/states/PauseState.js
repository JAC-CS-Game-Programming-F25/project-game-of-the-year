import State from "../../lib/State.js";
import { context, input, stateMachine, CANVAS_WIDTH, CANVAS_HEIGHT } from "../globals.js";
import GameStateName from "../enums/GameStateName.js";

export default class PauseState extends State {
	constructor() {
		super();
		this.options = ['RESUME', 'SAVE GAME', 'QUIT TO MENU'];
		this.selectedOption = 0;
		this.wPressed = false;
		this.sPressed = false;
		this.spacePressed = false;
		this.escapePressed = false;
		this.saveMessage = '';
		this.saveMessageTimer = 0;
	}

	enter() {
		this.selectedOption = 0;
		this.saveMessage = '';
		this.saveMessageTimer = 0;
		this.wPressed = false;
		this.sPressed = false;
		this.spacePressed = false;
		this.escapePressed = false;
	}

	update(dt) {
		// Update save message timer
		if (this.saveMessageTimer > 0) {
			this.saveMessageTimer -= dt;
			if (this.saveMessageTimer <= 0) {
				this.saveMessage = '';
			}
		}

		// Navigate menu (with debouncing) - keys are uppercase
		if ((input.keys.W || input.keys.ARROWUP) && !this.wPressed) {
			this.wPressed = true;
			this.selectedOption = (this.selectedOption - 1 + this.options.length) % this.options.length;
		}
		if (!input.keys.W && !input.keys.ARROWUP) {
			this.wPressed = false;
		}

		if ((input.keys.S || input.keys.ARROWDOWN) && !this.sPressed) {
			this.sPressed = true;
			this.selectedOption = (this.selectedOption + 1) % this.options.length;
		}
		if (!input.keys.S && !input.keys.ARROWDOWN) {
			this.sPressed = false;
		}

		// Select option
		if ((input.keys[' '] || input.keys.ENTER) && !this.spacePressed) {
			this.spacePressed = true;
			this.selectOption();
		}
		if (!input.keys[' '] && !input.keys.ENTER) {
			this.spacePressed = false;
		}

		// ESC to resume (close pause menu) - clear the key immediately to prevent flicker
		if (input.keys.ESCAPE && !this.escapePressed) {
			this.escapePressed = true;
			input.keys.ESCAPE = false; // Clear immediately
			stateMachine.change(GameStateName.Play, { fromPause: true });
		}
		if (!input.keys.ESCAPE) {
			this.escapePressed = false;
		}
	}

	selectOption() {
		switch (this.selectedOption) {
			case 0: // RESUME
				stateMachine.change(GameStateName.Play, { fromPause: true });
				break;

			case 1: // SAVE GAME
				if (window.manualSave) {
					try {
						const success = window.manualSave();
						if (success) {
							this.saveMessage = 'Game Saved Successfully!';
							this.saveMessageTimer = 2.0;
						} else {
							this.saveMessage = 'Save Failed!';
							this.saveMessageTimer = 2.0;
						}
					} catch (error) {
						console.error('Error saving game:', error);
						this.saveMessage = 'Save Error!';
						this.saveMessageTimer = 2.0;
					}
				} else {
					console.error('window.manualSave is not defined!');
					this.saveMessage = 'Save function not available!';
					this.saveMessageTimer = 2.0;
				}
				// Stay in pause menu
				break;

			case 2: // QUIT TO MENU
				window.location.reload();
				break;
		}
	}

	render() {
		// Dim the background (PlayState still renders beneath)
		context.fillStyle = 'rgba(0, 0, 0, 0.7)';
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// Draw "PAUSED" title
		context.font = 'bold 64px "Georgia", serif';
		context.fillStyle = '#e8f4f8';
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.shadowColor = 'rgba(100, 220, 255, 0.6)';
		context.shadowBlur = 20;
		context.fillText('PAUSED', CANVAS_WIDTH / 2, 150);
		context.shadowBlur = 0;

		// Draw menu options
		context.font = '28px "Courier New", monospace';
		context.textBaseline = 'top';
		const startY = 280;
		const lineHeight = 60;

		this.options.forEach((option, index) => {
			const textX = CANVAS_WIDTH / 2;
			const textY = startY + index * lineHeight;

			if (index === this.selectedOption) {
				// Draw selection box
				const boxWidth = 300;
				const boxHeight = 50;
				const boxX = CANVAS_WIDTH / 2 - boxWidth / 2;
				const boxY = textY - 10;

				context.fillStyle = 'rgba(20, 40, 60, 0.8)';
				context.fillRect(boxX, boxY, boxWidth, boxHeight);

				context.strokeStyle = 'rgba(100, 220, 255, 0.6)';
				context.lineWidth = 2;
				context.strokeRect(boxX, boxY, boxWidth, boxHeight);

				// Selected text
				context.fillStyle = '#e8f4f8';
				context.shadowColor = 'rgba(100, 220, 255, 0.4)';
				context.shadowBlur = 10;
			} else {
				// Unselected text
				context.fillStyle = '#6a8a9a';
				context.shadowBlur = 0;
			}

			context.fillText(option, textX, textY);
		});

		context.shadowBlur = 0;

		// Draw save message if active
		if (this.saveMessage && this.saveMessageTimer > 0) {
			context.font = '20px "Courier New", monospace';
			context.fillStyle = '#64dcff';
			context.textAlign = 'center';
			const alpha = Math.min(1, this.saveMessageTimer / 0.5); // Fade out in last 0.5s
			context.globalAlpha = alpha;
			context.fillText(this.saveMessage, CANVAS_WIDTH / 2, 500);
			context.globalAlpha = 1;
		}

		// Draw instructions at bottom
		context.font = '16px "Courier New", monospace';
		context.fillStyle = '#6a8a9a';
		context.textAlign = 'center';
		context.fillText('ESC to Resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 40);
	}
}

