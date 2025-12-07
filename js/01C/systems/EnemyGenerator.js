/**
 * EnemyGenerator.js
 * Generates enemies that spawn across lanes
 */

import { Enemy } from '../entities/Enemy.js';

export class EnemyGenerator {
    /**
     * Generate a large swarm of enemies that can threaten the player
     * @param {number} spawnZ - Z position where enemies should spawn
     * @param {Array<number>} lanePositions - Array of lane X positions
     * @returns {Array<Enemy>} Array of enemies forming a dangerous swarm
     */
    static generateEnemies(spawnZ, lanePositions) {
        const enemies = [];

        // Create a massive swarm of 15-30 enemies
        const totalEnemies = Math.floor(Math.random() * 16) + 15; // 15-30 enemies

        for (let i = 0; i < totalEnemies; i++) {
            // Random lane selection
            const laneX = lanePositions[Math.floor(Math.random() * lanePositions.length)];

            // Add some spread around the lane center (±30 units)
            const xOffset = (Math.random() - 0.5) * 60;
            const enemyX = laneX + xOffset;

            // Random Y position (height above ground)
            // Height between 10 and 60 units for variety
            const enemyY = 10 + Math.random() * 50;

            // Spread enemies in a cluster along Z axis
            // Create depth to the swarm (400 units deep)
            const zOffset = Math.random() * 400;

            enemies.push(new Enemy(enemyX, enemyY, spawnZ + zOffset));
        }

        return enemies;
    }

    /**
     * Shuffle array in place using Fisher-Yates algorithm
     * @param {Array} array - Array to shuffle
     */
    static shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}
