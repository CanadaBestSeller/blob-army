/**
 * MathGateGenerator.js
 * Generates math gates (addition and multiplication) with difficulty scaling based on player's swarm size
 */

import { Gate } from '../entities/Gate.js';

export class MathGateGenerator {
    /**
     * Generate a pair of math gates (one addition, one multiplication)
     * Uses revised linear growth system to prevent runaway exponential growth
     * @param {number} spawnZ - Z position where gates should spawn
     * @param {number} currentSwarmSize - Player's current blob count (C)
     * @param {number} lanePositions - Array of lane X positions
     * @returns {Array<Gate>} Array of two gates (one per lane)
     */
    static generateMathGatePair(spawnZ, currentSwarmSize, lanePositions) {
        // Ensure we have a valid swarm size (minimum 1)
        const C = Math.max(1, currentSwarmSize);

        // Calculate target gain: T = RoundUp(Random(0.5, 1.0) * C + 15)
        const percentageMultiplier = 0.5 + Math.random() * 0.5; // 0.5 to 1.0
        const baseGain = 15;
        const targetGain = Math.ceil(percentageMultiplier * C + baseGain);

        // Generate multiplication value
        const multiplicationValue = this.generateMultiplicationValue();

        // Calculate actual gain from multiplication: G_M = C * (M - 1)
        const actualMultiplicationGain = C * (multiplicationValue - 1);

        // Generate addition value competitive with multiplication gain
        // A = G_M ± Random(1, 8)
        const variance = Math.floor(Math.random() * 8) + 1; // 1 to 8
        const additionValue = actualMultiplicationGain + (Math.random() < 0.5 ? variance : -variance);

        // Ensure addition is at least 1
        const finalAdditionValue = Math.max(1, Math.ceil(additionValue));

        // Randomly assign which gate goes to which lane
        const gates = [];

        if (Math.random() < 0.5) {
            // Addition on left, multiplication on right
            gates.push(new Gate(lanePositions[0], 0, spawnZ, finalAdditionValue, 'addition'));
            gates.push(new Gate(lanePositions[1], 0, spawnZ, multiplicationValue, 'multiplication'));
        } else {
            // Multiplication on left, addition on right
            gates.push(new Gate(lanePositions[0], 0, spawnZ, multiplicationValue, 'multiplication'));
            gates.push(new Gate(lanePositions[1], 0, spawnZ, finalAdditionValue, 'addition'));
        }

        return gates;
    }

    /**
     * Generate multiplication value as an integer with reduced jackpot frequency
     * 90% chance: ×2 (common, standard multiplier)
     * 7% chance: ×3 (strong multiplier)
     * 3% chance: ×4 (rare excitement multiplier)
     * @returns {number} Multiplication value (integer 2-4)
     */
    static generateMultiplicationValue() {
        const roll = Math.random();

        if (roll < 0.90) {
            return 2; // 90% chance: ×2
        } else if (roll < 0.97) {
            return 3; // 7% chance: ×3
        } else {
            return 4; // 3% chance: ×4 (jackpot!)
        }
    }

    /**
     * Calculate the crossover point where multiplication becomes better than addition
     * This is informational and can be used for balancing
     * @param {number} avgAddition - Average addition value
     * @param {number} avgMultiplier - Average multiplication value
     * @returns {number} The swarm size where strategies switch
     */
    static calculateCrossoverPoint(avgAddition = 20, avgMultiplier = 1.7) {
        // Solve: C + A = C * M
        // C + A = C * M
        // A = C * M - C
        // A = C * (M - 1)
        // C = A / (M - 1)
        return avgAddition / (avgMultiplier - 1);
    }
}
