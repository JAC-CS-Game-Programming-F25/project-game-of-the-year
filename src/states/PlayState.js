import State from "../../lib/State.js";
import Map from "../systems/Map.js";
import Camera from "../systems/Camera.js";
import Player from "../entities/Player.js";
import Direction from "../enums/Direction.js";
import { images, input, CANVAS_WIDTH, CANVAS_HEIGHT, canvas } from "../globals.js";
import Input from "../../lib/Input.js";

export default class PlayState extends State {
	constructor() {
		super();
		this.map = null;
		this.camera = null;
		this.player = null;
	}

	async enter() {
		try {
			// Initialize camera
			this.camera = new Camera(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

			// Load map (path from root of project)
			this.map = new Map('/Starting_map.tmx', images);
			await this.map.load();

			// Set camera bounds based on map size
			const mapWidth = this.map.width * this.map.tileWidth;
			const mapHeight = this.map.height * this.map.tileHeight;
			this.camera.setBounds(mapWidth, mapHeight);

			// Initialize player at starting position (center of map for now)
			const startX = mapWidth / 2;
			const startY = mapHeight / 2;
			this.player = new Player(startX, startY, 32, 32);
			this.player.direction = Direction.S;

			// Set camera bounds (this will center if map is smaller than canvas)
			this.camera.setBounds(mapWidth, mapHeight);
			
			// Set camera to follow player
			this.camera.setTarget(this.player);
			
			// If map is bigger than canvas, center camera on player
			// If map is smaller, setBounds already centered it
			if (mapWidth >= CANVAS_WIDTH && mapHeight >= CANVAS_HEIGHT) {
				this.camera.position.x = Math.max(0, Math.min(startX - CANVAS_WIDTH / 2, mapWidth - CANVAS_WIDTH));
				this.camera.position.y = Math.max(0, Math.min(startY - CANVAS_HEIGHT / 2, mapHeight - CANVAS_HEIGHT));
			}
			
			// Ensure canvas has focus for input
			canvas.focus();
			console.log('PlayState: Canvas focused, input should work');
			
			// Add click handler to focus canvas when clicked
			canvas.addEventListener('click', () => {
				canvas.focus();
				console.log('Canvas clicked and focused');
			});
		} catch (error) {
			console.error('Error initializing PlayState:', error);
			// Initialize with default values if map loading fails
			this.camera = new Camera(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
			this.player = new Player(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 32, 32);
			this.player.direction = Direction.S;
			this.camera.setTarget(this.player);
			// Center camera on player
			this.camera.position.x = this.player.x - CANVAS_WIDTH / 2;
			this.camera.position.y = this.player.y - CANVAS_HEIGHT / 2;
		}
	}

	update(dt) {
		// Debug: Check if input is working
		if (input && (input.isKeyHeld(Input.KEYS.W) || input.isKeyHeld(Input.KEYS.A) || input.isKeyHeld(Input.KEYS.S) || input.isKeyHeld(Input.KEYS.D))) {
			if (!this._inputDebugLogged) {
				console.log('PlayState: Input detected!', {
					w: input.isKeyHeld(Input.KEYS.W),
					a: input.isKeyHeld(Input.KEYS.A),
					s: input.isKeyHeld(Input.KEYS.S),
					d: input.isKeyHeld(Input.KEYS.D)
				});
				this._inputDebugLogged = true;
			}
		}
		
		// Store player's previous position for collision checking
		let prevX = 0;
		let prevY = 0;
		if (this.player) {
			prevX = this.player.x;
			prevY = this.player.y;
		}

		// Update player
		if (this.player) {
			this.player.update(dt, input, images);
		}

		// Check tile-based collision and adjust player position if needed
		if (this.player && this.map && this.map.loaded) {
			this.checkTileCollision(prevX, prevY);
		}

		// Update camera
		if (this.camera) {
			this.camera.update(dt);
		}
	}

	/**
	 * Check if player collides with tiles and adjust position
	 */
	checkTileCollision(prevX, prevY) {
		if (!this.map || !this.map.loaded) return;

		const player = this.player;
		const tileWidth = this.map.tileWidth;
		const tileHeight = this.map.tileHeight;

		// Check collision at player's corners and center
		// We'll check multiple points to handle edge cases
		const checkPoints = [
			{ x: player.x, y: player.y }, // Center
			{ x: player.x - player.width / 2, y: player.y - player.height / 2 }, // Top-left
			{ x: player.x + player.width / 2, y: player.y - player.height / 2 }, // Top-right
			{ x: player.x - player.width / 2, y: player.y + player.height / 2 }, // Bottom-left
			{ x: player.x + player.width / 2, y: player.y + player.height / 2 }, // Bottom-right
		];

		let collided = false;

		for (const point of checkPoints) {
			const tile = this.map.worldToTile(point.x, point.y);
			if (this.map.isCollidable(tile.x, tile.y)) {
				collided = true;
				break;
			}
		}

		// If collision detected, revert to previous position
		if (collided) {
			player.x = prevX;
			player.y = prevY;
		}
	}

	render(context) {
		// Clear canvas with a dark background color (instead of black)
		context.fillStyle = '#1a1a2e'; // Dark blue-grey background
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		
		// Ensure canvas has focus for input
		if (document.activeElement !== canvas) {
			canvas.focus();
		}

		// Save context for camera transform
		context.save();

		// Render map (map handles camera offset internally)
		if (this.map && this.map.loaded) {
			this.map.render(context, this.camera);
		}

		// Render player (offset by camera)
		if (this.player) {
			context.save();
			context.translate(-this.camera.x, -this.camera.y);
			this.player.render(context, images);
			context.restore();
		}

		// Restore context
		context.restore();
	}
}
