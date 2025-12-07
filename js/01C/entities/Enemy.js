/**
 * Enemy.js
 * Enemy entity that neutralizes blobs on contact
 */

import { Entity3D } from './Entity3D.js';
import { project } from '../rendering/Projection.js';
import { GameParameters } from '../game/GameParameters.js';

export class Enemy extends Entity3D {
    /**
     * Create a new Enemy
     * @param {number} x - X position
     * @param {number} y - Y position (height above ground)
     * @param {number} z - Z position (distance along track)
     */
    constructor(x, y, z) {
        super(x, y, z);

        // Enemy properties
        this.consumed = false; // Track if enemy has been neutralized

        // Sprite properties - skull
        this.spriteSheet = new Image();
        this.spriteSheet.src = 'js/01C/assets/skull-v2.png';
        this.spriteLoaded = false;
        this.spriteSheet.onload = () => {
            this.spriteLoaded = true;
        };

        // Sprite dimensions
        this.spriteDisplaySize = 120; // Base display size in pixels
        this.spriteHeightMultiplier = 1.0; // Full height (no shrinkage)
    }

    /**
     * Update enemy (enemies are static, just moved by world scrolling)
     * @param {number} deltaTime - Time since last frame
     * @param {Object} gameState - Current game state
     */
    update(deltaTime, gameState) {
        // Enemies don't have their own update logic
        // They're moved forward by the world scrolling in Game.js
    }

    /**
     * Draw enemy as skull sprite
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Camera} camera - Camera object
     * @param {Object} gameState - Game state (optional)
     */
    draw(ctx, camera, gameState = {}) {
        // Don't draw if consumed
        if (this.consumed) return;

        // Don't draw if sprite hasn't loaded yet
        if (!this.spriteLoaded) return;

        const camPos = camera.getPosition();

        // Project enemy position to screen space
        const projected = project(this.x, this.y, this.z, camPos);

        // Calculate screen position
        const center = {
            x: ctx.canvas.width / 2,
            y: ctx.canvas.height / 2
        };

        const screenX = center.x + projected.x;
        const screenY = center.y - projected.y;

        // Calculate display size based on scale
        const baseSize = this.spriteDisplaySize * projected.scale;
        const displayWidth = baseSize;
        const displayHeight = baseSize * this.spriteHeightMultiplier;

        // Draw skull sprite
        ctx.save();
        const drawX = screenX - displayWidth / 2;
        const drawY = screenY - displayHeight / 2;

        ctx.drawImage(
            this.spriteSheet,
            drawX,
            drawY,
            displayWidth,
            displayHeight
        );
        ctx.restore();
    }

    /**
     * Check if a blob is colliding with this enemy using sprite bounding boxes
     * @param {Object} blob - The blob object with currentX, currentZ properties
     * @param {number} playerY - The player's Y position (all blobs share same Y)
     * @param {Camera} camera - Camera object for projection
     * @returns {boolean} True if blob is colliding with enemy
     */
    checkBlobCollision(blob, playerY, camera) {
        // Don't collide if already consumed
        if (this.consumed) return false;

        // Project both the enemy and blob to screen space
        const enemyProjected = project(this.x, this.y, this.z, camera.getPosition());
        const blobProjected = project(blob.currentX, playerY, blob.currentZ, camera.getPosition());

        // Calculate enemy sprite bounding box in screen space
        const enemyWidth = this.spriteDisplaySize * enemyProjected.scale;
        const enemyHeight = this.spriteDisplaySize * enemyProjected.scale * this.spriteHeightMultiplier;

        const enemyLeft = enemyProjected.x - enemyWidth / 2;
        const enemyRight = enemyProjected.x + enemyWidth / 2;
        const enemyTop = enemyProjected.y - enemyHeight / 2;
        const enemyBottom = enemyProjected.y + enemyHeight / 2;

        // Calculate blob sprite bounding box in screen space
        // Use player's sprite display size and height multiplier
        const blobWidth = 72 * blobProjected.scale * blob.sizeMultiplier; // 72 is player's spriteDisplaySize
        const blobHeight = 72 * blobProjected.scale * blob.sizeMultiplier * 0.5; // 0.5 is player's height multiplier

        const blobLeft = blobProjected.x - blobWidth / 2;
        const blobRight = blobProjected.x + blobWidth / 2;
        const blobTop = blobProjected.y - blobHeight / 2;
        const blobBottom = blobProjected.y + blobHeight / 2;

        // Check for AABB (Axis-Aligned Bounding Box) collision
        const colliding = !(enemyRight < blobLeft ||
                           enemyLeft > blobRight ||
                           enemyBottom < blobTop ||
                           enemyTop > blobBottom);

        return colliding;
    }

    /**
     * Mark enemy as consumed (neutralized)
     */
    neutralize() {
        this.consumed = true;
    }

    /**
     * Check if enemy has been neutralized
     * @returns {boolean} True if enemy has been neutralized
     */
    isNeutralized() {
        return this.consumed;
    }
}
