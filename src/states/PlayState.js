import State from "../../lib/State.js";
import Map from "../systems/Map.js";
import Camera from "../systems/Camera.js";
import MapManager from "../systems/MapManager.js";
import CollisionManager from "../systems/CollisionManager.js";
import Player from "../entities/Player.js";
import Direction from "../enums/Direction.js";
import Factory from "../services/Factory.js";
import EnemyType from "../enums/EnemyType.js";
import GameStateName from "../enums/GameStateName.js";
import { images, input, CANVAS_WIDTH, CANVAS_HEIGHT, canvas, stateMachine } from "../globals.js";
import Input from "../../lib/Input.js";

export default class PlayState extends State {
	constructor() {
		super();
		this.map = null;
		this.camera = null;
		this.player = null;
		this.enemies = [];
		this.collisionManager = new CollisionManager();
		this.mapManager = new MapManager();
		this.isTransitioning = false;
		this.transitionCooldown = 0; // Prevent immediate re-trigger
	}

	async enter() {
		await this.loadCurrentMap();
	}

	/**
	 * Load the current map from MapManager
	 */
	async loadCurrentMap() {
		try {
			const mapConfig = this.mapManager.getCurrentMap();
			
			// Initialize camera if not exists
			if (!this.camera) {
				this.camera = new Camera(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
			}

			// Load map
			this.map = new Map(mapConfig.path, images);
			await this.map.load();

			// Set camera bounds based on map size
			const mapWidth = this.map.width * this.map.tileWidth;
			const mapHeight = this.map.height * this.map.tileHeight;
			this.camera.setBounds(mapWidth, mapHeight);

			// Determine spawn position
			let spawnX, spawnY;
			
			if (mapConfig.useExitAsSpawn && this.map.exits.length > 0) {
				// Use exit zone as spawn point
				const exitIndex = mapConfig.exitIndex || 0;
				const entrance = this.map.exits[exitIndex];
				if (entrance) {
					// Spawn at center of exit zone, offset inward by 50px to avoid walls
					spawnX = entrance.x + entrance.width / 2;
					spawnY = entrance.y + entrance.height / 2;
					
					// Offset spawn position inward from exit to avoid walls
					if (entrance.x > 700) {
						spawnX -= 70;
					} else if (entrance.y > 700) {
						spawnY -= 80;
					}
				} else {
					spawnX = mapConfig.spawnX || 200;
					spawnY = mapConfig.spawnY || 200;
				}
			} else {
				spawnX = mapConfig.spawnX || 200;
				spawnY = mapConfig.spawnY || 200;
			}
			
			// Initialize or reposition player at spawn point
			if (!this.player) {
				this.player = new Player(spawnX, spawnY, 28, 36); // Taller hitbox to cover body
				this.player.direction = Direction.S;
			} else {
				// Reposition existing player
				this.player.x = spawnX;
				this.player.y = spawnY;
			}
			
		// Clear and spawn enemies for this map
		this.enemies = [];
		this.spawnEnemiesForMap(mapConfig.path);
			
			// Initialize collision manager
			if (!this.collisionManager) {
				this.collisionManager = new CollisionManager();
			}
			this.collisionManager.setPlayer(this.player);
			this.collisionManager.setEnemies(this.enemies);
			
			// Set camera to follow player
			this.camera.setTarget(this.player);
			
			// Center camera on player
			if (mapWidth >= CANVAS_WIDTH && mapHeight >= CANVAS_HEIGHT) {
				this.camera.position.x = Math.max(0, Math.min(spawnX - CANVAS_WIDTH / 2, mapWidth - CANVAS_WIDTH));
				this.camera.position.y = Math.max(0, Math.min(spawnY - CANVAS_HEIGHT / 2, mapHeight - CANVAS_HEIGHT));
			}
			
			this.isTransitioning = false;
			this.transitionCooldown = 1.0; // 1 second cooldown after map load
			
		// Ensure canvas has focus for input
		canvas.focus();
			
		// Add click handler to focus canvas when clicked
		canvas.addEventListener('click', () => {
			canvas.focus();
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

	/**
	 * Spawn enemies based on the current map.
	 */
	spawnEnemiesForMap(mapPath) {
		if (!this.player) return;
		
		const spawned = [];
		
		switch(mapPath) {
			case '/Starting_map.tmx':
				// Starting zone - A few bats in corners
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 100, 100));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 700, 100));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 100, 700));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 700, 700));
				break;
				
			case '/map1.tmx':
				// Map 1 - 5 bats spread out + 1 Spirit Boxer near top-left
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 150, 250));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 400, 200));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 650, 300));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 250, 500));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 550, 550));
				spawned.push(Factory.createEnemy(EnemyType.SpiritBoxer, 200, 150));
				break;
				
			case '/GoodMap.tmx':
				// Good Map - Lots of bats everywhere, spread out, some in water
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 200, 300));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 400, 250));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 600, 300));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 150, 450));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 350, 450));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 550, 450));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 250, 600));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 450, 600));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 650, 600));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 300, 750));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 500, 750));
				break;
				
			case '/map2.tmx':
				// Map 2 - Couple Spirit Boxers in front of EXIT (top), bats around
				spawned.push(Factory.createEnemy(EnemyType.SpiritBoxer, 300, 120));
				spawned.push(Factory.createEnemy(EnemyType.SpiritBoxer, 500, 120));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 150, 300));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 650, 300));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 300, 450));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 500, 450));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 400, 600));
				break;
				
			case '/terrainMapTiled.tmx':
				// Terrain Map - Lots of bats at far left and right extremities (black space)
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 50, 200));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 50, 350));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 50, 500));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 50, 650));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 750, 200));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 750, 350));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 750, 500));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 750, 650));
				break;
				
			case '/BossRoom.tmx':
				// Boss Room - Temple Guardian at top + few bats
				spawned.push(Factory.createEnemy(EnemyType.TempleGuardian, 400, 150));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 250, 300));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 550, 300));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 400, 450));
				break;
				
			default:
				break;
		}
		
		// Set player as target for all spawned enemies
		for (const enemy of spawned) {
			enemy.target = this.player;
		}
		
		this.enemies.push(...spawned);
	}

	update(dt) {
		
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

		// Update enemies
		for (const enemy of this.enemies) {
			enemy.update(dt);
		}

		// Remove dead enemies
		this.enemies = this.enemies.filter(enemy => !enemy.readyForRemoval);
		
		// Update collision manager with current enemies
		this.collisionManager.setEnemies(this.enemies);

		// Check combat collisions
		this.collisionManager.checkCollisions();
		
		// Check if player died
		if (this.player && !this.player.isAlive() && this.player.stateMachine.currentState.name !== 'dying') {
			this.player.stateMachine.change('dying');
		}
		
		// Check if player death animation complete (transition to GameOver)
		if (this.player && this.player.stateMachine.currentState.name === 'dying' && this.player.readyForGameOver) {
			stateMachine.change(GameStateName.GameOver);
			return;
		}

		// Update transition cooldown
		if (this.transitionCooldown > 0) {
			this.transitionCooldown -= dt;
		}
		
		// Check for exit collisions (map transitions)
		if (!this.isTransitioning && this.transitionCooldown <= 0 && this.player && this.map && this.map.loaded) {
			this.checkExitCollisions();
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
		// Clear canvas with a dark background color
		context.fillStyle = '#000000'; // Black background
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

		// Render enemies (offset by camera)
		context.save();
		context.translate(-this.camera.x, -this.camera.y);
		for (const enemy of this.enemies) {
			enemy.render(context, images);
		}
		context.restore();

		// Render player (offset by camera)
		if (this.player) {
			context.save();
			context.translate(-this.camera.x, -this.camera.y);
			this.player.render(context, images);
			context.restore();
		}

		// Restore context
		context.restore();
		
		// Render HUD (no camera offset)
		this.renderHUD(context);
	}
	
	/**
	 * Render HUD elements (HP bar, etc).
	 */
	renderHUD(context) {
		if (!this.player) return;
		
		// HP Bar (top-left corner)
		const barX = 20;
		const barY = 20;
		const barWidth = 200;
		const barHeight = 20;
		const hpPercent = this.player.hp / this.player.maxHp;
		
		// Background (black)
		context.fillStyle = 'rgba(0, 0, 0, 0.5)';
		context.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
		
		// Empty bar (dark red)
		context.fillStyle = '#3a0000';
		context.fillRect(barX, barY, barWidth, barHeight);
		
		// HP bar (red)
		context.fillStyle = '#cc0000';
		context.fillRect(barX, barY, barWidth * hpPercent, barHeight);
		
		// Border (white)
		context.strokeStyle = '#ffffff';
		context.lineWidth = 2;
		context.strokeRect(barX, barY, barWidth, barHeight);
		
		// HP Text
		context.fillStyle = '#ffffff';
		context.font = '14px Arial';
		context.textAlign = 'left';
		context.fillText(`HP: ${Math.ceil(this.player.hp)} / ${this.player.maxHp}`, barX + 5, barY + 15);
	}

	/**
	 * Check if player touches any exit zones
	 */
	checkExitCollisions() {
		const exitIndex = this.map.checkExitCollision(
			this.player.x - this.player.width / 2,
			this.player.y - this.player.height / 2,
			this.player.width,
			this.player.height
		);

		if (exitIndex !== -1) {
			const currentMapConfig = this.mapManager.getCurrentMap();
			const forwardExitIndex = currentMapConfig.forwardExitIndex;
			
			if (exitIndex === forwardExitIndex) {
				this.transitionToNextMap();
			}
		}
	}

	/**
	 * Transition to next map
	 */
	async transitionToNextMap() {
		if (this.isTransitioning) return;
		
		this.isTransitioning = true;
		
		const nextMap = this.mapManager.goToNextMap();
		
		if (nextMap) {
			await this.loadCurrentMap();
		} else {
			stateMachine.change(GameStateName.Victory);
		}
	}

	/**
	 * Transition to previous map
	 */
	async transitionToPreviousMap() {
		if (this.isTransitioning) return;
		
		this.isTransitioning = true;
		
		const prevMap = this.mapManager.goToPreviousMap();
		
		if (prevMap) {
			await this.loadCurrentMap();
		} else {
			this.isTransitioning = false;
		}
	}
}
