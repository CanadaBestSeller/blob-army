/**
 * Game.js
 * Main game loop and world management
 */

import { GameParameters } from './GameParameters.js';

export class Game {
    /**
     * Create a new Game instance
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Renderer} renderer - Renderer instance
     * @param {Camera} camera - Camera instance
     * @param {InputManager} inputManager - Input manager instance
     */
    constructor(ctx, renderer, camera, inputManager) {
        this.ctx = ctx;
        this.renderer = renderer;
        this.camera = camera;
        this.inputManager = inputManager;

        // Game state
        this.running = false;
        this.state = 'PREPLAY'; // PREPLAY, PLAYING, GAME_OVER
        this.lastTime = 0;
        this.distanceTraveled = 0; // In world units
        this.finalDistance = 0; // Distance when game over occurred
        this.currentSpeed = GameParameters.WORLD_SCROLL_SPEED_MIN; // Current speed in pixels/second
        this.gameTime = 0; // Time elapsed since game started (for speed ramping)

        // Entities (managed by renderer, but we track them here too)
        this.entities = [];

        // Obstacle spawner (initialized later)
        this.obstacleSpawner = null;

        // Bind the game loop
        this.gameLoop = this.gameLoop.bind(this);
    }

    /**
     * Add an entity to the game
     * @param {Entity3D} entity - Entity to add
     */
    addEntity(entity) {
        this.entities.push(entity);
        this.renderer.addEntity(entity);
    }

    /**
     * Remove an entity from the game
     * @param {Entity3D} entity - Entity to remove
     */
    removeEntity(entity) {
        const index = this.entities.indexOf(entity);
        if (index > -1) {
            this.entities.splice(index, 1);
        }
        this.renderer.removeEntity(entity);
    }

    /**
     * Start the game loop
     */
    start() {
        if (this.running) return;

        this.running = true;
        this.lastTime = performance.now();
        console.log('Game started');
        requestAnimationFrame(this.gameLoop);
    }

    /**
     * Stop the game loop
     */
    stop() {
        this.running = false;
        console.log('Game stopped');
    }

    /**
     * Main game loop
     * @param {number} currentTime - Current timestamp from requestAnimationFrame
     */
    gameLoop(currentTime) {
        if (!this.running) return;

        // Calculate delta time in seconds
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Cap delta time to prevent huge jumps (e.g., when tab loses focus)
        const cappedDeltaTime = Math.min(deltaTime, 0.1);

        // Update game state
        this.update(cappedDeltaTime);

        // Render
        this.render();

        // Continue the loop
        requestAnimationFrame(this.gameLoop);
    }

    /**
     * Update all game systems
     * @param {number} deltaTime - Time elapsed since last frame (seconds)
     */
    update(deltaTime) {
        // Update game time and speed ramping (ONLY during PLAYING, not PREPLAY)
        if (this.state === 'PLAYING') {
            this.gameTime += deltaTime;

            // Calculate speed with ramping (linear interpolation from min to max)
            const speedProgress = Math.min(this.gameTime / GameParameters.SPEED_RAMP_DURATION, 1.0);
            this.currentSpeed = GameParameters.WORLD_SCROLL_SPEED_MIN +
                (GameParameters.WORLD_SCROLL_SPEED_MAX - GameParameters.WORLD_SCROLL_SPEED_MIN) * speedProgress;
        }
        // PREPLAY keeps minimum speed (no ramping)

        // World scrolling speed
        const scrollSpeed = this.currentSpeed;

        // Track distance traveled (continues even in game over for world scrolling)
        this.distanceTraveled += scrollSpeed * deltaTime;

        // Get player reference
        const player = this.entities.find(e => e.constructor.name === 'Player');

        // Create game state object for entities
        const gameState = {
            inputManager: this.inputManager,
            distanceTraveled: this.distanceTraveled,
            scrollSpeed: scrollSpeed,
            player: player
        };

        // Move player forward (not gates or track - they stay fixed in world space)
        // Move player in both PREPLAY and PLAYING states for scrolling effect
        if ((this.state === 'PREPLAY' || this.state === 'PLAYING') && player) {
            player.z += scrollSpeed * deltaTime;
        }

        // Update obstacle spawner (continues in game over for visual effect)
        if (this.obstacleSpawner) {
            this.obstacleSpawner.update(deltaTime);
        }

        // Update all entities
        this.entities.forEach(entity => {
            // Call entity's update method
            if (entity.update) {
                entity.update(deltaTime, gameState);
            }
        });

        // Check gate collisions (only in PLAYING state)
        if (this.state === 'PLAYING' && player) {
            this.checkGateCollisions(player);
            this.checkEnemyCollisions(player);

            // Check for game over (no fighters left)
            if (player.getBlobCount() <= 0) {
                this.gameOver();
            }
        }

        // Make camera follow player (or continue scrolling in game over)
        if (this.state === 'GAME_OVER') {
            // During game over, keep camera moving forward to maintain scrolling effect
            this.camera.z += scrollSpeed * deltaTime;
        } else if (player && this.camera.followTarget) {
            this.camera.followTarget(player);
        }

        // Update camera
        if (this.camera.update) {
            this.camera.update(deltaTime);
        }
    }

    /**
     * Render the game
     */
    render() {
        // Renderer handles clearing and background (wallpaper)
        // No need to fill with COLOR_BACKGROUND here

        // Render all entities through the renderer
        this.renderer.render();
    }

    /**
     * Get current distance traveled
     * @returns {number} Distance in world units
     */
    getDistanceTraveled() {
        return this.distanceTraveled;
    }

    /**
     * Get distance in meters
     * @returns {number} Distance in meters
     */
    getDistanceInMeters() {
        return this.distanceTraveled * GameParameters.METERS_PER_PIXEL;
    }

    /**
     * Get current speed in meters per second
     * @returns {number} Speed in m/s
     */
    getSpeedInMetersPerSecond() {
        return this.currentSpeed * GameParameters.METERS_PER_PIXEL;
    }

    /**
     * Reset the game
     */
    reset() {
        this.distanceTraveled = 0;
        this.gameTime = 0;
        this.currentSpeed = GameParameters.WORLD_SCROLL_SPEED_MIN;
        this.camera.setPosition(0, GameParameters.CAMERA_HEIGHT, 0);

        // Reset all entities that have a reset method
        this.entities.forEach(entity => {
            if (entity.reset) {
                entity.reset();
            }
        });

        console.log('Game reset');
    }

    /**
     * Check if in PREPLAY state
     * @returns {boolean}
     */
    get isPreplay() {
        return this.state === 'PREPLAY';
    }

    /**
     * Check if running (for backwards compatibility)
     * @returns {boolean}
     */
    get isRunning() {
        return this.running;
    }

    /**
     * Start playing (exit PREPLAY state and start game)
     */
    startPlaying() {
        this.state = 'PLAYING';
        this.reset();

        // Initialize obstacle spawner
        if (this.obstacleSpawner) {
            this.obstacleSpawner.initialize();
        }

        this.start();
        console.log('Started playing');
    }

    /**
     * Enter PREPLAY state
     */
    enterPreplay() {
        this.state = 'PREPLAY';
        this.stop();
        this.reset();

        // Clear obstacle spawner
        if (this.obstacleSpawner) {
            this.obstacleSpawner.clear();
        }

        this.start(); // Start the loop for scrolling
        console.log('Entered PREPLAY state');
    }

    /**
     * Trigger game over
     */
    gameOver() {
        this.state = 'GAME_OVER';
        // Store the final distance at the moment of game over
        this.finalDistance = this.distanceTraveled;
        console.log('Game Over! Final distance:', (this.finalDistance * GameParameters.METERS_PER_PIXEL).toFixed(1), 'm');
        // Keep running so we can still render the game over screen and world scrolling
    }

    /**
     * Get the display distance (frozen at game over distance, or current distance if playing)
     * @returns {number} Distance in world units
     */
    getDisplayDistance() {
        if (this.state === 'GAME_OVER') {
            return this.finalDistance;
        }
        return this.distanceTraveled;
    }

    /**
     * Get display distance in meters
     * @returns {number} Distance in meters
     */
    getDisplayDistanceInMeters() {
        return this.getDisplayDistance() * GameParameters.METERS_PER_PIXEL;
    }

    /**
     * Set the obstacle spawner
     * @param {ObstacleSpawner} spawner - The obstacle spawner instance
     */
    setObstacleSpawner(spawner) {
        this.obstacleSpawner = spawner;
    }

    /**
     * Check for collisions between player and gates
     * @param {Player} player - The player entity
     */
    checkGateCollisions(player) {
        // Find all gate entities
        const gates = this.entities.filter(e => e.constructor.name === 'Gate');

        gates.forEach(gate => {
            if (gate.checkCollision(player)) {
                // Apply gate effect to player
                gate.applyEffect(player);
                console.log(`Gate collision! Type: ${gate.type}, Value: ${gate.value}, New blob count: ${player.getBlobCount()}`);
            }
        });
    }

    /**
     * Check for collisions between player blobs and enemies
     * @param {Player} player - The player entity
     */
    checkEnemyCollisions(player) {
        // Find all enemy entities that haven't been neutralized
        const enemies = this.entities.filter(e => e.constructor.name === 'Enemy' && !e.isNeutralized());

        // Get player's swarm blobs
        if (!player.swarmBlobs || player.swarmBlobs.length === 0) return;

        const blobsToRemove = new Set(); // Use Set to avoid duplicates

        enemies.forEach(enemy => {
            // Check each blob for collision with this enemy
            for (let i = player.swarmBlobs.length - 1; i >= 0; i--) {
                // Skip blobs that are already marked for removal
                if (blobsToRemove.has(i)) continue;

                const blob = player.swarmBlobs[i];

                // Pass player's Y position and camera for sprite-based collision
                if (enemy.checkBlobCollision(blob, player.y, this.camera)) {
                    // Mark blob for removal
                    blobsToRemove.add(i);

                    // Neutralize the enemy
                    enemy.neutralize();

                    console.log(`Enemy neutralized! Blob ${i} destroyed. Remaining blobs: ${player.getBlobCount() - 1}`);

                    // Only one blob can neutralize this enemy
                    break;
                }
            }
        });

        // Only update blob count if blobs were actually removed
        if (blobsToRemove.size > 0) {
            // Remove blobs that collided with enemies (in reverse order to maintain indices)
            const blobIndices = Array.from(blobsToRemove).sort((a, b) => b - a);
            blobIndices.forEach(index => {
                player.swarmBlobs.splice(index, 1);
            });

            // Update blob count to match the new swarm size
            player.blobCount = player.swarmBlobs.length;
            player.previousBlobCount = player.blobCount; // Prevent triggering blob count change logic
        }
    }
}
