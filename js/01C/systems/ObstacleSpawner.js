/**
 * ObstacleSpawner.js
 * Generic obstacle management system using a rolling queue
 * Handles gates, enemies, events, and other obstacles
 */

import { GameParameters } from '../game/GameParameters.js';

export class ObstacleSpawner {
    /**
     * Create a new ObstacleSpawner
     * @param {Game} game - Reference to the game instance
     */
    constructor(game) {
        this.game = game;

        // Queue settings
        this.maxObstacleGroups = 4; // Keep 4 groups of obstacles active
        this.groupSpacing = 8 / GameParameters.METERS_PER_PIXEL; // 8 meters between obstacle groups (converted to world units)
        this.cleanupDistance = -2 / GameParameters.METERS_PER_PIXEL; // 2 meters past player (negative = behind)

        // Active obstacles queue
        this.obstacleQueue = [];

        // Next spawn Z position
        this.nextSpawnZ = 0;

        // Registered obstacle generators (different obstacle types)
        this.generators = [];
    }

    /**
     * Register an obstacle generator function
     * Generator should return an array of obstacle entities for a given Z position
     * @param {Function} generatorFn - Function(z) that returns obstacle entities
     * @param {number} weight - Probability weight (higher = more likely)
     */
    registerGenerator(generatorFn, weight = 1) {
        this.generators.push({
            fn: generatorFn,
            weight: weight
        });
    }

    /**
     * Initialize the obstacle queue with initial obstacles
     * Called when the game starts playing
     */
    initialize() {
        // Clear existing obstacles
        this.obstacleQueue = [];

        // Get player position
        const player = this.game.entities.find(e => e.constructor.name === 'Player');
        const playerZ = player ? player.z : 0;

        // Start spawning obstacles ahead of the player at 8m intervals
        // Convert 8 meters to world units
        const metersToWorld = 1 / GameParameters.METERS_PER_PIXEL;
        this.nextSpawnZ = playerZ + (5 * metersToWorld); // First obstacles appear at 8 meters

        // Spawn initial groups (4 groups at 8m, 16m, 24m, 32m)
        for (let i = 0; i < this.maxObstacleGroups; i++) {
            this.spawnObstacleGroup();
        }

        console.log(`ObstacleSpawner initialized with ${this.obstacleQueue.length} obstacle groups`);
    }

    /**
     * Spawn a new group of obstacles
     */
    spawnObstacleGroup() {
        if (this.generators.length === 0) {
            console.warn('No obstacle generators registered');
            return;
        }

        // Select a random generator based on weights
        const generator = this.selectGenerator();

        // Generate obstacles at the next spawn position
        const obstacles = generator.fn(this.nextSpawnZ);

        // Add obstacles to game
        obstacles.forEach(obstacle => {
            this.game.addEntity(obstacle);
        });

        // Track in queue as a group
        this.obstacleQueue.push({
            obstacles: obstacles,
            spawnZ: this.nextSpawnZ
        });

        // Update next spawn position
        this.nextSpawnZ += this.groupSpacing;
    }

    /**
     * Select a random generator based on weights
     * @returns {Object} Selected generator
     */
    selectGenerator() {
        // Calculate total weight
        const totalWeight = this.generators.reduce((sum, gen) => sum + gen.weight, 0);

        // Random selection based on weight
        let random = Math.random() * totalWeight;
        for (const generator of this.generators) {
            random -= generator.weight;
            if (random <= 0) {
                return generator;
            }
        }

        // Fallback to first generator
        return this.generators[0];
    }

    /**
     * Update the obstacle spawner
     * Check for obstacles that need to be removed and spawn new ones
     * @param {number} deltaTime - Time since last update
     */
    update(deltaTime) {
        if (this.obstacleQueue.length === 0) return;

        // Get player position
        const player = this.game.entities.find(e => e.constructor.name === 'Player');
        if (!player) return;

        // Check if oldest obstacle group is past the cleanup threshold
        const oldestGroup = this.obstacleQueue[0];
        // Distance past player (positive = player has passed the obstacle)
        const distancePastPlayer = player.z - oldestGroup.spawnZ;

        // cleanupDistance is negative (e.g., -200 for 2m past), so we check if we've exceeded it
        // When distancePastPlayer > abs(cleanupDistance), the obstacle is far enough past the player
        if (distancePastPlayer > Math.abs(this.cleanupDistance)) {
            // Remove the oldest obstacle group
            this.removeObstacleGroup(oldestGroup);

            // Spawn a new obstacle group to maintain queue size
            this.spawnObstacleGroup();
        }
    }

    /**
     * Remove an obstacle group from the game and queue
     * @param {Object} obstacleGroup - The obstacle group to remove
     */
    removeObstacleGroup(obstacleGroup) {
        // Remove from game entities
        obstacleGroup.obstacles.forEach(obstacle => {
            this.game.removeEntity(obstacle);
        });

        // Remove from queue
        const index = this.obstacleQueue.indexOf(obstacleGroup);
        if (index > -1) {
            this.obstacleQueue.splice(index, 1);
        }

        console.log(`Removed obstacle group at Z=${obstacleGroup.spawnZ.toFixed(0)}, queue size: ${this.obstacleQueue.length} groups`);
    }

    /**
     * Clear all obstacles from the game
     */
    clear() {
        // Remove all obstacles from game
        this.obstacleQueue.forEach(group => {
            group.obstacles.forEach(obstacle => {
                this.game.removeEntity(obstacle);
            });
        });

        // Clear queue
        this.obstacleQueue = [];

        console.log('ObstacleSpawner cleared');
    }

    /**
     * Get the number of active obstacle groups
     * @returns {number} Number of obstacle groups in queue
     */
    getActiveGroupCount() {
        return this.obstacleQueue.length;
    }

    /**
     * Get total number of active obstacles
     * @returns {number} Total obstacle count
     */
    getTotalObstacleCount() {
        return this.obstacleQueue.reduce((sum, group) => sum + group.obstacles.length, 0);
    }

    /**
     * Get queue state for debugging
     * @returns {Array} Array of queue information
     */
    getQueueState() {
        return this.obstacleQueue.map((group, index) => {
            const distanceInMeters = group.spawnZ * GameParameters.METERS_PER_PIXEL;
            return {
                index: index,
                spawnZ: group.spawnZ.toFixed(0),
                distanceMeters: distanceInMeters.toFixed(1),
                obstacleCount: group.obstacles.length
            };
        });
    }
}
