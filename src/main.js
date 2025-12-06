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
import PlayState from './states/PlayState.js';
import GameOverState from './states/GameOverState.js';
import VictoryState from './states/VictoryState.js';
import TitleScreenState from './states/TitleScreenState.js';

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
stateMachine.add(GameStateName.TitleScreen, new TitleScreenState());
stateMachine.add(GameStateName.GameOver, new GameOverState());
stateMachine.add(GameStateName.Victory, new VictoryState());
stateMachine.add(GameStateName.Play, new PlayState());

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

// Notify that assets are loaded
if (window.onAssetsLoaded) {
	window.onAssetsLoaded();
}

// Function to start background music (called after user interaction)
window.startBackgroundMusic = function() {
	sounds.play('background-music');
};

// Function to play menu navigation sound
window.playMenuNavigate = function() {
	sounds.play('menu-navigate');
};
