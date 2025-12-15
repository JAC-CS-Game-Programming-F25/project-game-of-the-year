import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import { input, stateMachine, timer } from "../globals.js";
import Easing from "../../lib/Easing.js";

export default class CutsceneState extends State {
	constructor() {
		super();
		this.currentDialogueIndex = 0;
		this.dialogueLines = [];
		this.backgroundImage = null;
		this.nextState = null;
		this.nextStateParams = null;
		this.onComplete = null;
		this.spacePressed = false;
		this.escapePressed = false;
		this.delayBeforePrompt = 0;
		this.delayTimer = 0;
		this.fade = { alpha: 1.0 };
	}

	enter(params = {}) {
		const { cutsceneData, nextState, nextStateParams, onComplete, delayBeforePrompt } = params;
		
		this.currentDialogueIndex = 0;
		this.dialogueLines = cutsceneData?.dialogue || ["..."];
		this.backgroundImage = cutsceneData?.image || null;
		this.nextState = nextState || GameStateName.Play;
		this.nextStateParams = nextStateParams || {};
		this.onComplete = onComplete || null;
		this.delayBeforePrompt = delayBeforePrompt || 0;
		this.delayTimer = 0;
		this.spacePressed = false;
		this.escapePressed = false;
		
		// Fade in from black
		this.fade.alpha = 1.0;
		timer.tween(this.fade, { alpha: 0 }, 0.8, Easing.linear);
	}

	update(dt) {
		// Handle delay before allowing input
		if (this.delayBeforePrompt > 0) {
			this.delayTimer += dt;
			if (this.delayTimer < this.delayBeforePrompt) {
				return;
			}
		}
		
		// If no dialogue (like victory screen), wait for Space/ESC to finish
		if (this.dialogueLines.length === 0) {
			if ((input.keys[' '] && !this.spacePressed) || (input.keys.ESCAPE && !this.escapePressed)) {
				this.fadeOutAndTransition();
				return;
			}
			
			if (!input.keys[' ']) {
				this.spacePressed = false;
			}
			if (!input.keys.ESCAPE) {
				this.escapePressed = false;
			}
			return;
		}
		
		// Handle Space to advance dialogue
		if (input.keys[' '] && !this.spacePressed) {
			this.spacePressed = true;
			this.currentDialogueIndex++;
			
			// If finished all dialogue, fade out then transition
			if (this.currentDialogueIndex >= this.dialogueLines.length) {
				this.fadeOutAndTransition();
				return;
			}
		}
		
		if (!input.keys[' ']) {
			this.spacePressed = false;
		}
		
		// Handle Escape to skip cutscene
		if (input.keys.ESCAPE && !this.escapePressed) {
			this.escapePressed = true;
			this.fadeOutAndTransition();
			return;
		}
		
		if (!input.keys.ESCAPE) {
			this.escapePressed = false;
		}
	}

	/**
	 * Fade out then transition to next state
	 */
	async fadeOutAndTransition() {
		// Fade out to black
		await timer.tweenAsync(this.fade, { alpha: 1.0 }, 0.5, Easing.linear);
		
		// Transition to next state
		if (this.onComplete) {
			this.onComplete();
		} else {
			stateMachine.change(this.nextState, this.nextStateParams);
		}
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
		
		// Draw dialogue box at bottom (only if there's dialogue)
		if (this.dialogueLines.length > 0) {
			this.renderDialogueBox(context);
		} else {
			// For victory screen with no dialogue, show continue prompt after delay
			if (this.delayTimer >= this.delayBeforePrompt) {
				context.fillStyle = '#a0c8d8';
				context.font = '24px "Georgia", serif';
				context.textAlign = 'center';
				context.fillText("Press SPACE or ESC to return to Main Menu", canvas.width / 2, canvas.height - 50);
			}
		}

		// Draw fade overlay
		if (this.fade.alpha > 0) {
			context.save();
			context.fillStyle = `rgba(0, 0, 0, ${this.fade.alpha})`;
			context.fillRect(0, 0, canvas.width, canvas.height);
			context.restore();
		}
	}

	renderDialogueBox(context) {
		const canvas = context.canvas;
		const boxHeight = 180;
		const boxY = canvas.height - boxHeight - 20;
		const boxX = 40;
		const boxWidth = canvas.width - 80;
		
		// Dialogue box background (dark with transparency)
		context.fillStyle = 'rgba(10, 20, 30, 0.92)';
		context.fillRect(boxX, boxY, boxWidth, boxHeight);
		
		// Dialogue box border (glowing cyan)
		context.strokeStyle = 'rgba(100, 220, 255, 0.5)';
		context.lineWidth = 3;
		context.strokeRect(boxX, boxY, boxWidth, boxHeight);
		
		// Inner glow effect
		context.strokeStyle = 'rgba(100, 220, 255, 0.2)';
		context.lineWidth = 1;
		context.strokeRect(boxX + 5, boxY + 5, boxWidth - 10, boxHeight - 10);
		
		// Render current dialogue text
		const currentDialogue = this.dialogueLines[this.currentDialogueIndex] || "";
		
		context.fillStyle = '#e8f4f8';
		context.font = '22px "Courier New", monospace';
		context.textAlign = 'left';
		context.textBaseline = 'top';
		
		// Text shadow for readability
		context.shadowColor = 'rgba(100, 220, 255, 0.3)';
		context.shadowBlur = 5;
		
		// Word wrap the dialogue
		const words = currentDialogue.split(' ');
		const lines = [];
		let currentLine = '';
		const maxWidth = boxWidth - 60;
		
		for (const word of words) {
			const testLine = currentLine + word + ' ';
			const metrics = context.measureText(testLine);
			
			if (metrics.width > maxWidth && currentLine.length > 0) {
				lines.push(currentLine.trim());
				currentLine = word + ' ';
			} else {
				currentLine = testLine;
			}
		}
		lines.push(currentLine.trim());
		
		// Draw wrapped lines
		const lineHeight = 28;
		const startY = boxY + 30;
		
		for (let i = 0; i < lines.length; i++) {
			context.fillText(lines[i], boxX + 30, startY + (i * lineHeight));
		}
		
		// Reset shadow
		context.shadowColor = 'transparent';
		context.shadowBlur = 0;
		
		// Draw progress indicator
		const progressText = `${this.currentDialogueIndex + 1} / ${this.dialogueLines.length}`;
		context.fillStyle = '#6a8a9a';
		context.font = '16px "Courier New", monospace';
		context.textAlign = 'right';
		context.fillText(progressText, boxX + boxWidth - 30, boxY + boxHeight - 35);
		
		// Draw "Press SPACE" prompt
		context.fillStyle = '#a0c8d8';
		context.font = '18px "Courier New", monospace';
		context.textAlign = 'center';
		
		const promptText = this.currentDialogueIndex < this.dialogueLines.length - 1 
			? "PRESS SPACE TO CONTINUE" 
			: "PRESS SPACE TO START";
		
		context.fillText(promptText, canvas.width / 2, boxY + boxHeight - 30);
	}
}

