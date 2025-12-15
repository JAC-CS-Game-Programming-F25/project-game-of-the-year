import State from "../../lib/State.js";
import Map from "../systems/Map.js";
import Camera from "../systems/Camera.js";
import MapManager from "../systems/MapManager.js";
import CollisionManager from "../systems/CollisionManager.js";
import SaveManager from "../services/SaveManager.js";
import ParticleSystem from "../effects/ParticleSystem.js";
import Player from "../entities/Player.js";
import Direction from "../enums/Direction.js";
import Factory from "../services/Factory.js";
import EnemyType from "../enums/EnemyType.js";
import GameStateName from "../enums/GameStateName.js";
import { images, input, CANVAS_WIDTH, CANVAS_HEIGHT, canvas, stateMachine, timer, sounds } from "../globals.js";
import Input from "../../lib/Input.js";
import Easing from "../../lib/Easing.js";

export default class PlayState extends State {
	constructor() {
		super();
		this.map = null;
		this.camera = null;
		this.player = null;
		this.enemies = [];
		this.collisionManager = new CollisionManager();
		this.mapManager = new MapManager();
		this.particleSystem = new ParticleSystem();
		this.isTransitioning = false;
		this.transitionCooldown = 0;
		this.escapePressed = false;
		this.screenFade = {
			alpha: 0,
			isFading: false
		};
		this.bossMusicPlaying = false;
		this.enemiesKilled = 0;
	}

	async enter(params = {}) {
		// Expose saveGame to window for pause menu
		window.manualSave = () => this.saveGame();
		
		// If loading from save
		if (params.loadSave && params.saveData) {
			await this.loadFromSave(params.saveData);
			this.screenFade.alpha = 1.0;
			timer.tween(this.screenFade, { alpha: 0 }, 0.5, Easing.easeOutQuad);
			return;
		}
		
		// If returning from pause, don't reload
		if (params.fromPause) {
			return;
		}
		
		// If returning from cutscene, map is already loaded
		if (params.skipCutscene) {
			return;
		}
		
		await this.loadCurrentMap();
		
		// Fade in from black after cutscene
		this.screenFade.alpha = 1.0;
		timer.tween(this.screenFade, { alpha: 0 }, 0.5, Easing.easeOutQuad);
	}

	/**
	 * Load game from save data
	 */
	async loadFromSave(saveData) {
		try {
			// Set map manager to the saved map
			const mapIndex = this.mapManager.maps.findIndex(m => m.path === saveData.currentMap);
			if (mapIndex >= 0) {
				this.mapManager.currentMapIndex = mapIndex;
			}
			
			// Load the map
			const mapConfig = this.mapManager.getCurrentMap();
			if (!this.camera) {
				this.camera = new Camera(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
			}
			
			this.map = new Map(mapConfig.path, images);
			await this.map.load();
			
			const mapWidth = this.map.width * this.map.tileWidth;
			const mapHeight = this.map.height * this.map.tileHeight;
			this.camera.setBounds(mapWidth, mapHeight);
			
			// Restore player state
			if (!this.player) {
				this.player = new Player(saveData.player.x, saveData.player.y, 28, 36);
			} else {
				this.player.x = saveData.player.x;
				this.player.y = saveData.player.y;
			}
			this.player.hp = saveData.player.hp;
			this.player.maxHp = saveData.player.maxHp;
			this.player.direction = saveData.player.direction;
			
			// Restore enemies killed counter
			this.enemiesKilled = saveData.enemiesKilled || 0;
			
			// Set camera to follow player
			this.camera.setTarget(this.player);
			
			// Restore enemies from save data
			this.enemies = [];
			if (saveData.enemies && saveData.enemies.length > 0) {
				for (const enemyData of saveData.enemies) {
					let enemy = null;
					
					// Create enemy based on saved type
					if (enemyData.type === 'ShadowBat') {
						enemy = Factory.createEnemy(EnemyType.ShadowBat, enemyData.x, enemyData.y);
					} else if (enemyData.type === 'SpiritBoxer') {
						enemy = Factory.createEnemy(EnemyType.SpiritBoxer, enemyData.x, enemyData.y);
					} else if (enemyData.type === 'TempleGuardian') {
						enemy = Factory.createEnemy(EnemyType.TempleGuardian, enemyData.x, enemyData.y);
					}
					
					if (enemy) {
						enemy.hp = enemyData.hp;
						enemy.maxHp = enemyData.maxHp;
						enemy.target = this.player;
						enemy.camera = this.camera;
						enemy.particleSystem = this.particleSystem;
						this.enemies.push(enemy);
					}
				}
			}
			
			// Initialize collision manager
			if (!this.collisionManager) {
				this.collisionManager = new CollisionManager();
			}
			this.collisionManager.setPlayer(this.player);
			this.collisionManager.setEnemies(this.enemies);
		} catch (error) {
			console.error('Error loading from save:', error);
			// Fallback to normal map load
			await this.loadCurrentMap();
		}
	}

	/**
	 * Save the current game state
	 */
	saveGame() {
		try {
			if (!this.player || !this.mapManager) {
				console.error('Cannot save: player or mapManager not initialized');
				return false;
			}

			const gameState = {
				player: this.player,
				currentMap: this.mapManager.getCurrentMap().path,
				mapProgress: this.mapManager.currentMapIndex,
				enemies: this.enemies,
				enemiesKilled: this.enemiesKilled,
				flags: {
					// Add any game flags here (e.g., bossDefeated)
				}
			};
			
			const success = SaveManager.saveGame(gameState);
			if (!success) {
				console.error('SaveManager.saveGame returned false');
			}
			return success;
		} catch (error) {
			console.error('Error in saveGame:', error);
			return false;
		}
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
			case '/maps/Starting_map.tmx':
				// Starting zone - A few bats in corners
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 100, 100));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 700, 100));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 100, 700));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 700, 700));
				break;
				
			case '/maps/map1.tmx':
				// Map 1 - 5 bats spread out + 1 Spirit Boxer near top-left
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 150, 250));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 400, 200));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 650, 300));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 250, 500));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 550, 550));
				spawned.push(Factory.createEnemy(EnemyType.SpiritBoxer, 200, 150));
				break;
				
			case '/maps/GoodMap.tmx':
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
				
			case '/maps/map2.tmx':
				// Map 2 - Couple Spirit Boxers in front of EXIT (top), bats around
				spawned.push(Factory.createEnemy(EnemyType.SpiritBoxer, 300, 120));
				spawned.push(Factory.createEnemy(EnemyType.SpiritBoxer, 500, 120));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 150, 300));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 650, 300));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 300, 450));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 500, 450));
				spawned.push(Factory.createEnemy(EnemyType.ShadowBat, 400, 600));
				break;
				
			case '/maps/terrainMapTiled.tmx':
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
				
			case '/maps/BossRoom.tmx':
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
			enemy.camera = this.camera;
			enemy.particleSystem = this.particleSystem;
		}
		
		this.enemies.push(...spawned);
	}

	update(dt) {
		// Check for ESC key to open pause menu
		if (input.keys.ESCAPE && !this.escapePressed) {
			this.escapePressed = true;
			input.keys.ESCAPE = false; // Clear key immediately
			stateMachine.change(GameStateName.Pause);
			return;
		}
		if (!input.keys.ESCAPE) {
			this.escapePressed = false;
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

		// Update enemies
		for (const enemy of this.enemies) {
			enemy.update(dt);
		}

		// Check for living Temple Guardian to trigger boss music
		const hasLivingBoss = this.enemies.some(e => 
			e.constructor.name === 'TempleGuardian' && e.isAlive()
		);
		
		if (hasLivingBoss && !this.bossMusicPlaying) {
			// Start boss music
			sounds.stop('background-music');
			sounds.play('boss-music');
			
			// Skip first 10 seconds of silence
			const bossMusicPool = sounds.get('boss-music');
			if (bossMusicPool && bossMusicPool.pool[0]) {
				setTimeout(() => {
					bossMusicPool.pool[0].currentTime = 10;
				}, 50);
			}
			
			this.bossMusicPlaying = true;
		}

		// Check if Temple Guardian is about to be removed (victory condition)
		const bossDefeated = this.enemies.some(e => 
			e.constructor.name === 'TempleGuardian' && e.readyForRemoval
		);
		
		// Count enemies killed before removing them
		const enemiesKilledThisFrame = this.enemies.filter(e => e.readyForRemoval).length;
		this.enemiesKilled += enemiesKilledThisFrame;
		
		// Remove dead enemies
		this.enemies = this.enemies.filter(enemy => !enemy.readyForRemoval);
		
		// Trigger victory cutscene if boss was defeated
		if (bossDefeated) {
			// Stop boss music and resume background music
			if (this.bossMusicPlaying) {
				sounds.stop('boss-music');
				sounds.play('background-music');
				this.bossMusicPlaying = false;
			}
			
			this.triggerVictoryCutscenes();
			return;
		}
		
		// Update collision manager with current enemies
		this.collisionManager.setEnemies(this.enemies);

		// Check combat collisions
		this.collisionManager.checkCollisions();
		
		// Check if player died
		if (this.player && !this.player.isAlive() && this.player.stateMachine.currentState.name !== 'dying') {
			this.player.stateMachine.change('dying');
			
			// Stop boss music if playing
			if (this.bossMusicPlaying) {
				sounds.stop('boss-music');
				sounds.play('background-music');
				this.bossMusicPlaying = false;
			}
		}
		
		// Check if player death animation complete (transition to GameOver)
		if (this.player && this.player.stateMachine.currentState.name === 'dying' && this.player.readyForGameOver) {
			stateMachine.change(GameStateName.GameOver, { images });
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

		// Update particle system
		if (this.particleSystem) {
			this.particleSystem.update(dt);
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

		// Render particles (with camera offset)
		if (this.particleSystem) {
			this.particleSystem.render(context, this.camera);
		}

		// Restore context
		context.restore();
		
		// Render HUD (no camera offset)
		this.renderHUD(context);

		// Render screen fade overlay (for transitions)
		if (this.screenFade.alpha > 0) {
			context.save();
			context.fillStyle = `rgba(0, 0, 0, ${this.screenFade.alpha})`;
			context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
			context.restore();
		}
	}
	
	/**
	 * Render HUD elements (HP bar, etc).
	 */
	renderHUD(context) {
		if (!this.player) return;
		
		// Player HP Bar (top-left corner)
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
		
		// HP Text (below the bar)
		context.fillStyle = '#ffffff';
		context.font = '14px Arial';
		context.textAlign = 'left';
		context.fillText(`HP: ${Math.ceil(this.player.hp)} / ${this.player.maxHp}`, barX + 5, barY + barHeight + 15);
		
		// Enemies Killed Counter (top-right corner)
		context.fillStyle = '#ffffff';
		context.font = 'bold 18px Arial';
		context.textAlign = 'right';
		context.fillText(`Enemies Defeated: ${this.enemiesKilled}`, CANVAS_WIDTH - 20, 30);
		
		// Boss Health Bar (Temple Guardian)
		const boss = this.enemies.find(e => e.constructor.name === 'TempleGuardian' && e.isAlive());
		if (boss) {
			const bossBarWidth = 400;
			const bossBarHeight = 30;
			const bossBarX = (CANVAS_WIDTH - bossBarWidth) / 2;
			const bossBarY = 60;
			const bossHpPercent = boss.hp / boss.maxHp;
			
			// Boss Name (above bar)
			context.fillStyle = '#e8f4f8';
			context.font = 'bold 20px "Georgia", serif';
			context.textAlign = 'center';
			context.fillText('TEMPLE GUARDIAN', CANVAS_WIDTH / 2, bossBarY - 20);
			
			// Background (black)
			context.fillStyle = 'rgba(0, 0, 0, 0.7)';
			context.fillRect(bossBarX - 3, bossBarY - 3, bossBarWidth + 6, bossBarHeight + 6);
			
			// Empty bar (dark gold)
			context.fillStyle = '#3a2a00';
			context.fillRect(bossBarX, bossBarY, bossBarWidth, bossBarHeight);
			
			// HP bar (gold/orange - red when low)
			if (bossHpPercent > 0.5) {
				context.fillStyle = '#d4af37'; // Gold
			} else if (bossHpPercent > 0.25) {
				context.fillStyle = '#ff8c00'; // Orange
			} else {
				context.fillStyle = '#cc0000'; // Red
			}
			context.fillRect(bossBarX, bossBarY, bossBarWidth * bossHpPercent, bossBarHeight);
			
			// Buff indicator (glowing border if buffed)
			if (boss.isBuffed) {
				context.strokeStyle = 'rgba(255, 100, 0, 0.9)';
				context.lineWidth = 4;
				context.shadowColor = 'rgba(255, 100, 0, 0.8)';
				context.shadowBlur = 10;
			} else {
				context.strokeStyle = '#ffffff';
				context.lineWidth = 3;
				context.shadowBlur = 0;
			}
			context.strokeRect(bossBarX, bossBarY, bossBarWidth, bossBarHeight);
			context.shadowBlur = 0;
			
			// HP Text (inside bar)
			context.fillStyle = '#ffffff';
			context.font = 'bold 16px Arial';
			context.textAlign = 'center';
			context.fillText(`${Math.ceil(boss.hp)} / ${boss.maxHp}`, CANVAS_WIDTH / 2, bossBarY + bossBarHeight / 2 + 6);
		}
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
		
		// Get the current map index before advancing
		const currentMapIndex = this.mapManager.currentMapIndex;
		const nextMap = this.mapManager.goToNextMap();
		
		if (nextMap) {
			// Get cutscene for the map we just completed
			const { cutsceneData } = await import('../data/cutscenes.js');
			let cutscene = null;
			
			switch(currentMapIndex) {
				case 0: cutscene = cutsceneData.afterStarting; break;
				case 1: cutscene = cutsceneData.afterMap1; break;
				case 2: cutscene = cutsceneData.afterGoodMap; break;
				case 3: cutscene = cutsceneData.afterMap2; break;
				case 4: cutscene = cutsceneData.beforeBoss; break;
			}
			
			if (cutscene) {
				stateMachine.change(GameStateName.Cutscene, {
					cutsceneData: {
						image: images.get(cutscene.id),
						dialogue: cutscene.dialogue
					},
					nextState: GameStateName.Play,
					nextStateParams: {}
				});
			} else {
				// No cutscene for this transition, load map with fade
				this.screenFade.isFading = true;
				await timer.tweenAsync(this.screenFade, { alpha: 1.0 }, 0.5, Easing.easeInQuad);
				
				await this.loadCurrentMap();
				
				await timer.tweenAsync(this.screenFade, { alpha: 0 }, 0.5, Easing.easeOutQuad);
				this.screenFade.isFading = false;
			}
		} else {
			// No more maps, victory!
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
	
	/**
	 * Trigger victory cutscenes after defeating Temple Guardian
	 */
	async triggerVictoryCutscenes() {
		const { cutsceneData } = await import('../data/cutscenes.js');
		
		const postVictoryCutscene = cutsceneData.postVictory;
		const victoryCutscene = cutsceneData.victory;
		
		stateMachine.change(GameStateName.Cutscene, {
			cutsceneData: {
				image: images.get(postVictoryCutscene.id),
				dialogue: postVictoryCutscene.dialogue
			},
			onComplete: () => {
				stateMachine.change(GameStateName.Cutscene, {
					cutsceneData: {
						image: images.get(victoryCutscene.id),
						dialogue: victoryCutscene.dialogue
					},
					delayBeforePrompt: 20,
					onComplete: () => {
						window.location.reload();
					}
				});
			}
		});
	}
}
