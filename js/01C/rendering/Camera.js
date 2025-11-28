/**
 * Camera.js
 * Manages the camera position and view transformations
 */

import { GameParameters } from '../game/GameParameters.js';

export class Camera {
    /**
     * Create a new Camera instance
     * @param {number} x - Initial X position
     * @param {number} y - Initial Y position
     * @param {number} z - Initial Z position
     */
    constructor(x = 0, y = GameParameters.CAMERA_HEIGHT, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;

        // Camera configuration
        this.angle = GameParameters.CAMERA_ANGLE;
        this.distance = GameParameters.CAMERA_DISTANCE;
    }

    /**
     * Update camera position to follow a target (e.g., player)
     * @param {Object} target - Target object with x, y, z properties
     */
    followTarget(target) {
        // Camera follows the player with a fixed offset
        this.x = target.x;
        // Keep camera at configured height
        this.y = GameParameters.CAMERA_HEIGHT;
        // Camera stays behind the player at a fixed distance
        this.z = target.z - this.distance;
    }

    /**
     * Set camera position directly
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} z - Z position
     */
    setPosition(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * Transform world coordinates to camera-relative coordinates
     * @param {number} worldX - World X coordinate
     * @param {number} worldY - World Y coordinate
     * @param {number} worldZ - World Z coordinate
     * @returns {Object} Camera-relative coordinates {x, y, z}
     */
    worldToCamera(worldX, worldY, worldZ) {
        return {
            x: worldX - this.x,
            y: worldY - this.y,
            z: worldZ - this.z
        };
    }

    /**
     * Get camera position as an object
     * @returns {Object} Camera position {x, y, z, angle}
     */
    getPosition() {
        return {
            x: this.x,
            y: this.y,
            z: this.z,
            angle: this.angle
        };
    }

    /**
     * Set camera angle
     * @param {number} angle - Camera pitch angle in degrees
     */
    setAngle(angle) {
        this.angle = Math.max(1, Math.min(89, angle)); // Clamp between 1 and 89 degrees
    }

    /**
     * Update camera (called each frame)
     * @param {number} deltaTime - Time elapsed since last frame (in seconds)
     */
    update(deltaTime) {
        // Camera update logic can be extended here
        // For now, camera position is controlled by followTarget()
    }
}
