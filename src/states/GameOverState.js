import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import { input, stateMachine } from "../globals.js";

export default class GameOverState extends State {
	constructor() {
		super();
		this.backgroundImage = null;
		this.selectedOption = 0;
		this.options = ['TRY AGAIN', 'MAIN MENU'];
		this.wPressed = false;
		this.sPressed = false;
		this.spacePressed = false;
	}

	enter(params) {
		if (params && params.images) {
			this.backgroundImage = params.images.get('game-over-bg');
		}
		this.selectedOption = 0;
		this.wPressed = false;
		this.sPressed = false;
		this.spacePressed = false;
	}

	render(context) {
		const canvas = context.canvas;
		
		// Extract actual image from Graphic wrapper
		const img = this.backgroundImage?.image || this.backgroundImage;
		
		// Draw background image (full screen)
		if (img && img.complete && img.naturalWidth > 0) {
			context.drawImage(img, 0, 0, canvas.width, canvas.height);
		} else {
			// Fallback dark background
			context.fillStyle = '#0a0a0f';
			context.fillRect(0, 0, canvas.width, canvas.height);
		}
		
		// Draw "GAME OVER" title
		context.fillStyle = '#e8f4f8';
		context.font = 'bold 72px "Georgia", serif';
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		
		// Glowing text shadow
		context.shadowColor = 'rgba(100, 220, 255, 0.6)';
		context.shadowBlur = 20;
		context.fillText('GAME OVER', canvas.width / 2, 200);
		
		// Second shadow layer
		context.shadowColor = 'rgba(100, 220, 255, 0.3)';
		context.shadowBlur = 40;
		context.fillText('GAME OVER', canvas.width / 2, 200);
		
		// Reset shadow
		context.shadowColor = 'transparent';
		context.shadowBlur = 0;
		
		// Draw subtitle
		context.fillStyle = '#6a8a9a';
		context.font = '20px "Courier New", monospace';
		context.fillText('The shadows consumed you...', canvas.width / 2, 270);
		
		// Draw menu options
		const optionStartY = 400;
		const optionSpacing = 80;
		
		for (let i = 0; i < this.options.length; i++) {
			const y = optionStartY + (i * optionSpacing);
			const isSelected = i === this.selectedOption;
			
			// Option background
			if (isSelected) {
				const boxWidth = 300;
				const boxHeight = 60;
				const boxX = canvas.width / 2 - boxWidth / 2;
				const boxY = y - boxHeight / 2;
				
				context.fillStyle = 'rgba(20, 40, 60, 0.8)';
				context.fillRect(boxX, boxY, boxWidth, boxHeight);
				
				context.strokeStyle = 'rgba(100, 220, 255, 0.6)';
				context.lineWidth = 2;
				context.strokeRect(boxX, boxY, boxWidth, boxHeight);
			}
			
			// Option text
			context.fillStyle = isSelected ? '#e8f4f8' : '#a0c8d8';
			context.font = isSelected ? 'bold 28px "Courier New", monospace' : '24px "Courier New", monospace';
			
			if (isSelected) {
				context.shadowColor = 'rgba(100, 220, 255, 0.4)';
				context.shadowBlur = 10;
			}
			
			context.fillText(this.options[i], canvas.width / 2, y);
			
			context.shadowColor = 'transparent';
			context.shadowBlur = 0;
		}
	}

	update(dt) {
		// Navigate menu (with debouncing) - keys are uppercase
		if ((input.keys.W || input.keys.ARROWUP) && !this.wPressed) {
			this.wPressed = true;
			this.selectedOption = Math.max(0, this.selectedOption - 1);
		}
		if (!input.keys.W && !input.keys.ARROWUP) {
			this.wPressed = false;
		}
		
		if ((input.keys.S || input.keys.ARROWDOWN) && !this.sPressed) {
			this.sPressed = true;
			this.selectedOption = Math.min(this.options.length - 1, this.selectedOption + 1);
		}
		if (!input.keys.S && !input.keys.ARROWDOWN) {
			this.sPressed = false;
		}
		
		// Select option
		if ((input.keys[' '] || input.keys.ENTER) && !this.spacePressed) {
			this.spacePressed = true;
			
			if (this.selectedOption === 0) {
				// Try Again - restart game from beginning
				window.location.reload();
			} else {
				// Main Menu - back to title
				window.location.reload();
			}
		}
		if (!input.keys[' '] && !input.keys.ENTER) {
			this.spacePressed = false;
		}
	}
}
