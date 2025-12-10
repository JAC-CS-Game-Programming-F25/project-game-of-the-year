/**
 * Game Name
 *
 * Authors
 *
 * Brief description
 *
 * Asset sources
 */

import GameStateName from './enums/GameStateName.js';
import Game from '../lib/Game.js';
import {
	canvas,
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	context,
	fonts,
	images,
	timer,
	sounds,
	stateMachine,
} from './globals.js';
// Import states - wrap PlayState in try-catch since it has dependencies that might fail
import GameOverState from './states/GameOverState.js';
import VictoryState from './states/VictoryState.js';
import TitleScreenState from './states/TitleScreenState.js';

let PlayState = null;
try {
	PlayState = (await import('./states/PlayState.js')).default;
} catch (error) {
	console.error('Error loading PlayState:', error);
	// Create a placeholder PlayState that won't break
	PlayState = class extends TitleScreenState {
		async enter() {
			console.error('PlayState failed to load. Please check console for errors.');
		}
	};
}

// Set the dimensions of the play area (canvas already exists in DOM from index.html)
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
canvas.setAttribute('tabindex', '1'); // Allows the canvas to receive user input.

// Fetch the asset definitions from config.json.
const {
	images: imageDefinitions,
	fonts: fontDefinitions,
	sounds: soundDefinitions,
} = await fetch('./src/config.json').then((response) => response.json());

// Load all the assets from their definitions.
await images.load(imageDefinitions);
fonts.load(fontDefinitions);
sounds.load(soundDefinitions);

// Add all the states to the state machine.
// Make sure TitleScreen is added first and set as initial state
try {
	stateMachine.add(GameStateName.TitleScreen, new TitleScreenState());
	stateMachine.add(GameStateName.GameOver, new GameOverState());
	stateMachine.add(GameStateName.Victory, new VictoryState());
	stateMachine.add(GameStateName.Play, new PlayState());
	// Set TitleScreen as the initial state (not the last one added)
	stateMachine.change(GameStateName.TitleScreen);
} catch (error) {
	console.error('Error initializing states:', error);
	// Continue anyway - at least TitleScreen should work
}

// Create game instance but don't start it yet
const game = new Game(
	stateMachine,
	context,
	timer,
	canvas.width,
	canvas.height
);

// Function to start the game (called from title screen buttons)
window.startGame = function() {
	// Start the game with PlayState
	stateMachine.change(GameStateName.Play);
	game.start();
	
	// Focus the canvas so that the player doesn't have to click on it.
	canvas.focus();
};

// Notify that assets are loaded (this MUST run for Enter key to work)
console.log('main.js: Assets loaded, calling onAssetsLoaded');
if (window.onAssetsLoaded) {
	window.onAssetsLoaded();
} else {
	console.error('window.onAssetsLoaded is not defined!');
}

// Function to start background music (called after user interaction)
window.startBackgroundMusic = function() {
	sounds.play('background-music');
};

// Function to play menu navigation sound
window.playMenuNavigate = function() {
	sounds.play('menu-navigate');
};
