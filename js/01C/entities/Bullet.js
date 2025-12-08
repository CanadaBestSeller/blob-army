/**
 * Bullet.js
 * Bullet entity fired by player fighters
 */

import { Entity3D } from './Entity3D.js';
import { project } from '../rendering/Projection.js';

export class Bullet extends Entity3D {
    /**
     * Create a new Bullet
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} z - Z position
     * @param {number} speed - Bullet speed in world units per second
     */
    constructor(x, y, z, speed = 2000) {
        super(x, y, z);

        this.speed = speed; // World units per second (forward) - fast enough to outpace world scroll
        this.maxDistance = 100; // Maximum travel distance in meters (10000 world units)
        this.startZ = z; // Starting Z position to track distance traveled
        this.active = true; // Whether bullet is still active

        // Visual properties
        this.size = 8; // Pixel size for rendering (increased for visibility)
        this.color = '#ff0000'; // Red color
        this.glowIntensity = 20;
    }

    /**
     * Update bullet position
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {Object} gameState - Current game state
     */
    update(deltaTime, gameState) {
        if (!this.active) return;

        // Move bullet forward (increase Z)
        this.z += this.speed * deltaTime;

        // Deactivate if traveled max distance
        const distanceTraveled = (this.z - this.startZ) / 100; // Convert to meters
        if (distanceTraveled >= this.maxDistance) {
            this.active = false;
        }
    }

    /**
     * Draw bullet as a glowing red dot
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Camera} camera - Camera object
     */
    draw(ctx, camera) {
        if (!this.active) return;

        const camPos = camera.getPosition();

        // Project bullet position to screen space
        const projected = project(this.x, this.y, this.z, camPos);

        // Calculate center of screen
        const center = {
            x: ctx.canvas.width / 2,
            y: ctx.canvas.height / 2
        };

        const screenX = center.x + projected.x;
        const screenY = center.y - projected.y;

        // Calculate size based on distance (scale with perspective)
        const bulletSize = Math.max(2, this.size * projected.scale);

        // Draw bullet with glow effect
        ctx.save();

        // Glow effect
        ctx.shadowBlur = this.glowIntensity;
        ctx.shadowColor = this.color;

        // Draw bullet
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(screenX, screenY, bulletSize, 0, Math.PI * 2);
        ctx.fill();

        // Draw again with stronger glow for better effect
        ctx.shadowBlur = this.glowIntensity * 2;
        ctx.beginPath();
        ctx.arc(screenX, screenY, bulletSize, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Check if bullet is still active
     * @returns {boolean} True if bullet is active
     */
    isActive() {
        return this.active;
    }

    /**
     * Deactivate bullet
     */
    deactivate() {
        this.active = false;
    }
}
