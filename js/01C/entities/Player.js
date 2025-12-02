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
        this.visible = true; // Visibility flag

        // Sprite animation properties
        this.spriteSheet = new Image();
        this.spriteSheet.src = 'js/01C/assets/Blue_Slime/Run.png';
        this.spriteLoaded = false;
        this.spriteSheet.onload = () => {
            this.spriteLoaded = true;
        };

        // Sprite sheet configuration (7 frames in 1 row)
        this.frameCount = 7;
        this.framesPerRow = 7;
        this.currentFrame = 0;
        this.animationSpeed = 10; // FPS for animation
        this.animationTimer = 0;

        // Sprite dimensions (will be calculated after image loads)
        this.frameWidth = 0;
        this.frameHeight = 0;
        this.spriteDisplaySize = 120; // Default display size in pixels (2x bigger)
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

        // Update sprite animation
        this.animationTimer += deltaTime;
        const frameDuration = 1 / this.animationSpeed;
        if (this.animationTimer >= frameDuration) {
            this.animationTimer -= frameDuration;
            this.currentFrame = (this.currentFrame + 1) % this.frameCount;
        }
    }

    /**
     * Draw player as a sprite at projected position
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Camera} camera - Camera object for projection
     */
    draw(ctx, camera) {
        // Don't draw if not visible
        if (!this.visible) return;

        // Don't draw if sprite hasn't loaded yet
        if (!this.spriteLoaded) return;

        // Calculate frame dimensions if not already done
        if (this.frameWidth === 0) {
            this.frameWidth = this.spriteSheet.width / this.framesPerRow;
            this.frameHeight = this.spriteSheet.height; // Single row
        }

        // Project the player's 3D position to 2D screen coordinates
        const projected = project(this.x, this.y, this.z, camera.getPosition());

        // Don't draw if behind camera
        if (!projected) return;

        const { x: screenX, y: screenY, scale } = projected;

        // Calculate screen center (same as Track does)
        const center = {
            x: ctx.canvas.width / 2,
            y: ctx.canvas.height / 2
        };

        const finalX = center.x + screenX;
        const finalY = center.y - screenY;

        // Calculate which frame to display
        const row = Math.floor(this.currentFrame / this.framesPerRow);
        const col = this.currentFrame % this.framesPerRow;

        // Calculate source coordinates in sprite sheet
        const srcX = col * this.frameWidth;
        const srcY = row * this.frameHeight;

        // Apply perspective scaling to sprite size
        // Use the same scaling as the old circle player (radius * 50) for consistency
        const scaledSize = this.radius * 50 * scale * 12; // 12x multiplier for larger sprite

        // Add glow effect
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00FFFF';

        // Draw the sprite frame centered at the player position
        // Just like the original circle, center the sprite at the projected position
        ctx.drawImage(
            this.spriteSheet,
            srcX, srcY, // Source x, y
            this.frameWidth, this.frameHeight, // Source width, height
            finalX - scaledSize / 2, // Destination x (centered)
            finalY - scaledSize / 2, // Destination y (centered, same as original circle)
            scaledSize, // Destination width (scaled with perspective)
            scaledSize  // Destination height (scaled with perspective)
        );

        ctx.restore();

        // Draw blob count below the sprite
        const countFontSize = Math.max(12, scaledSize * 0.3); // Scale with sprite size
        const countY = finalY + scaledSize / 2 + countFontSize; // Position below sprite

        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00FFFF';
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${countFontSize}px 'Press Start 2P', cursive`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // Draw the blob count
        ctx.fillText(this.blobCount.toString(), finalX, countY);

        ctx.restore();
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
