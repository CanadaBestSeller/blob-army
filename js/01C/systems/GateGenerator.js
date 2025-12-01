/**
 * GateGenerator.js
 * Gate generation logic for the ObstacleSpawner
 */

import { Gate } from '../entities/Gate.js';
import { GameParameters, ComputedValues } from '../game/GameParameters.js';

export class GateGenerator {
    /**
     * Generate a pair of gates at the specified Z position
     * @param {number} z - Z position to spawn gates
     * @returns {Array<Gate>} Array of gate entities
     */
    static generateGatePair(z) {
        // Generate random gate values (-20 to +20)
        const value1 = GateGenerator.generateGateValue();
        const value2 = GateGenerator.generateGateValue();

        // Lane positions from ComputedValues
        const leftLaneX = ComputedValues.LANE_POSITIONS[0];
        const rightLaneX = ComputedValues.LANE_POSITIONS[1];

        // Gate height
        const gateY = 50;

        // Create the gate pair
        const leftGate = new Gate(leftLaneX, gateY, z, value1);
        const rightGate = new Gate(rightLaneX, gateY, z, value2);

        return [leftGate, rightGate];
    }

    /**
     * Generate a random gate value between -20 and +20
     * @returns {number} Random value
     */
    static generateGateValue() {
        // Generate value from -20 to +20
        return Math.floor(Math.random() * 41) - 20;
    }
}
