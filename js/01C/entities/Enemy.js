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
        this.spritePixelData = null; // Store pixel data for collision detection
        this.spriteSheet.onload = () => {
            this.spriteLoaded = true;
            this.extractPixelData();
        };

        // Sprite dimensions
        this.spriteDisplaySize = 120; // Base display size in pixels
        this.spriteHeightMultiplier = 1.0; // Full height (no shrinkage)
    }

    /**
     * Extract pixel data from sprite for pixel-perfect collision detection
     */
    extractPixelData() {
        // Create a temporary canvas to extract pixel data
        const canvas = document.createElement('canvas');
        canvas.width = this.spriteSheet.width;
        canvas.height = this.spriteSheet.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.spriteSheet, 0, 0);

        // Get image data
        this.spritePixelData = ctx.getImageData(0, 0, canvas.width, canvas.height);
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
     * Check if a blob is colliding with this enemy using pixel-perfect detection
     * @param {Object} blob - The blob object with currentX, currentZ properties
     * @param {number} playerY - The player's Y position (all blobs share same Y)
     * @param {Camera} camera - Camera object for projection
     * @param {ImageData} blobPixelData - Pixel data from the fighter sprite
     * @returns {boolean} True if blob is colliding with enemy
     */
    checkBlobCollision(blob, playerY, camera, blobPixelData) {
        // Don't collide if already consumed or no pixel data available
        if (this.consumed || !this.spritePixelData || !blobPixelData) return false;

        // Project both the enemy and blob to screen space
        const enemyProjected = project(this.x, this.y, this.z, camera.getPosition());
        const blobProjected = project(blob.currentX, playerY, blob.currentZ, camera.getPosition());

        if (!enemyProjected || !blobProjected) return false;

        // Calculate enemy sprite bounding box in screen space
        const enemyWidth = this.spriteDisplaySize * enemyProjected.scale;
        const enemyHeight = this.spriteDisplaySize * enemyProjected.scale * this.spriteHeightMultiplier;

        const enemyLeft = enemyProjected.x - enemyWidth / 2;
        const enemyRight = enemyProjected.x + enemyWidth / 2;
        const enemyTop = enemyProjected.y - enemyHeight / 2;
        const enemyBottom = enemyProjected.y + enemyHeight / 2;

        // Calculate blob sprite bounding box in screen space
        const blobWidth = 72 * blobProjected.scale * blob.sizeMultiplier;
        const blobHeight = 72 * blobProjected.scale * blob.sizeMultiplier * 0.5;

        const blobLeft = blobProjected.x - blobWidth / 2;
        const blobRight = blobProjected.x + blobWidth / 2;
        const blobTop = blobProjected.y - blobHeight / 2;
        const blobBottom = blobProjected.y + blobHeight / 2;

        // First check AABB collision (cheap test)
        const aabbColliding = !(enemyRight < blobLeft ||
                               enemyLeft > blobRight ||
                               enemyBottom < blobTop ||
                               enemyTop > blobBottom);

        if (!aabbColliding) return false;

        // Calculate overlapping rectangle in screen space
        const overlapLeft = Math.max(enemyLeft, blobLeft);
        const overlapRight = Math.min(enemyRight, blobRight);
        const overlapTop = Math.max(enemyTop, blobTop);
        const overlapBottom = Math.min(enemyBottom, blobBottom);

        // Sample pixels in the overlapping region
        // We'll sample every few pixels for performance
        const sampleStep = 2;

        for (let screenY = overlapTop; screenY < overlapBottom; screenY += sampleStep) {
            for (let screenX = overlapLeft; screenX < overlapRight; screenX += sampleStep) {
                // Map screen coordinates to enemy sprite coordinates
                const enemyU = (screenX - enemyLeft) / enemyWidth;
                const enemyV = (screenY - enemyTop) / enemyHeight;
                const enemySpriteX = Math.floor(enemyU * this.spriteSheet.width);
                const enemySpriteY = Math.floor(enemyV * this.spriteSheet.height);

                // Map screen coordinates to blob sprite coordinates
                const blobU = (screenX - blobLeft) / blobWidth;
                const blobV = (screenY - blobTop) / blobHeight;
                const blobSpriteX = Math.floor(blobU * blobPixelData.width);
                const blobSpriteY = Math.floor(blobV * blobPixelData.height);

                // Check if both pixels are opaque (alpha > threshold)
                const alphaThreshold = 128;

                // Get enemy pixel alpha
                if (enemySpriteX >= 0 && enemySpriteX < this.spritePixelData.width &&
                    enemySpriteY >= 0 && enemySpriteY < this.spritePixelData.height) {
                    const enemyIndex = (enemySpriteY * this.spritePixelData.width + enemySpriteX) * 4;
                    const enemyAlpha = this.spritePixelData.data[enemyIndex + 3];

                    // Get blob pixel alpha
                    if (blobSpriteX >= 0 && blobSpriteX < blobPixelData.width &&
                        blobSpriteY >= 0 && blobSpriteY < blobPixelData.height) {
                        const blobIndex = (blobSpriteY * blobPixelData.width + blobSpriteX) * 4;
                        const blobAlpha = blobPixelData.data[blobIndex + 3];

                        // If both pixels are opaque, we have a collision
                        if (enemyAlpha > alphaThreshold && blobAlpha > alphaThreshold) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
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
