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
        this.state = 'PREPLAY'; // PREPLAY, PLAYING
        this.lastTime = 0;
        this.distanceTraveled = 0; // In world units

        // Entities (managed by renderer, but we track them here too)
        this.entities = [];

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
        // World scrolling speed
        const scrollSpeed = GameParameters.WORLD_SCROLL_SPEED;

        // Track distance traveled
        this.distanceTraveled += scrollSpeed * deltaTime;

        // Create game state object for entities
        const gameState = {
            inputManager: this.inputManager,
            distanceTraveled: this.distanceTraveled,
            scrollSpeed: scrollSpeed
        };

        // Move player forward (not gates or track - they stay fixed in world space)
        const player = this.entities.find(e => e.constructor.name === 'Player');
        if (player) {
            player.z += scrollSpeed * deltaTime;
        }

        // Update all entities
        this.entities.forEach(entity => {
            // Call entity's update method
            if (entity.update) {
                entity.update(deltaTime, gameState);
            }
        });

        // Make camera follow player
        if (player && this.camera.followTarget) {
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
     * Reset the game
     */
    reset() {
        this.distanceTraveled = 0;
        this.camera.setPosition(0, GameParameters.CAMERA_HEIGHT, 0);
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
        this.start(); // Start the loop for scrolling
        console.log('Entered PREPLAY state');
    }
}
