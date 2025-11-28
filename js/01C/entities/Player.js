/**
 * Player.js
 * Player entity - the blob controlled by the user
 */

import { Entity3D } from './Entity3D.js';
import { project } from '../rendering/Projection.js';
import { GameParameters } from '../game/GameParameters.js';

export class Player extends Entity3D {
    /**
     * Create a new Player
     * @param {number} x - Initial X position (default: 0, centered)
     * @param {number} y - Initial Y position (default: 0.5, slightly above ground)
     * @param {number} z - Initial Z position (default: 0, at camera position)
     */
    constructor(x = 0, y = 0.5, z = 0) {
        super(x, y, z);

        // Game properties
        this.blobCount = 1; // Starts with 1 blob

        // Visual properties
        this.radius = 0.3; // Radius in world units
        this.color = this.generateRandomBrightColor();
    }

    /**
     * Generate a random bright color
     * @returns {string} RGB color string
     */
    generateRandomBrightColor() {
        const colors = [
            '#00FFFF', // Cyan
            '#FF00FF', // Magenta
            '#FFFF00', // Yellow
            '#00FF00', // Lime
            '#FF6600', // Orange
            '#FF0066', // Hot Pink
            '#66FF00', // Chartreuse
            '#0066FF', // Blue
            '#FF0099', // Deep Pink
            '#00FF99', // Spring Green
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Update player state with movement
     * @param {number} deltaTime - Time elapsed since last frame
     * @param {Object} gameState - Current game state (includes inputManager)
     */
    update(deltaTime, gameState) {
        // Get input manager from game state
        const input = gameState.inputManager;
        if (!input) return;

        // Calculate movement based on input
        let moveDirection = 0;
        if (input.isLeftPressed()) moveDirection -= 1;
        if (input.isRightPressed()) moveDirection += 1;

        // Apply movement
        if (moveDirection !== 0) {
            const moveSpeed = GameParameters.PLAYER_MOVEMENT_SPEED;
            this.x += moveDirection * moveSpeed * deltaTime;

            // Clamp to track boundaries
            const minX = -GameParameters.TRACK_WIDTH / 2;
            const maxX = GameParameters.TRACK_WIDTH / 2;
            this.x = Math.max(minX, Math.min(maxX, this.x));
        }
    }

    /**
     * Draw player as a circle at projected position
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Camera} camera - Camera object for projection
     */
    draw(ctx, camera) {
        // Project the player's 3D position to 2D screen coordinates
        const projected = project(this.x, this.y, this.z, camera.getPosition());

        // Don't draw if behind camera
        if (!projected) return;

        const { x: screenX, y: screenY } = projected;

        // Calculate screen center (same as Track does)
        const center = {
            x: ctx.canvas.width / 2,
            y: ctx.canvas.height / 2
        };

        const finalX = center.x + screenX;
        const finalY = center.y - screenY;

        // Draw the player blob as a circle, centered like the track
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(
            finalX,
            finalY,
            this.radius * 50,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Optional: Add a subtle outline for better visibility
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    /**
     * Get current blob count
     * @returns {number} Number of blobs
     */
    getBlobCount() {
        return this.blobCount;
    }

    /**
     * Add blobs to the player
     * @param {number} count - Number of blobs to add (can be negative)
     */
    addBlobs(count) {
        this.blobCount += count;
        // Prevent blob count from going below 0
        if (this.blobCount < 0) {
            this.blobCount = 0;
        }
    }
}
