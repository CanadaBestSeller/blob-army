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
        this.previousBlobCount = 1; // Track previous count to detect changes

        // Visual properties
        this.radius = 0.3; // Radius in world units
        this.color = this.generateRandomBrightColor();
        this.visible = true; // Visibility flag

        // Blob ID counter for stable sorting
        this.nextBlobId = 0;

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

        // Swarm properties
        this.swarmBlobs = []; // Array of swarm blob objects
        this.initializeSwarm();
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
     * Generate a random number from a normal distribution using Box-Muller transform
     * @returns {number} A random number from standard normal distribution (mean=0, stddev=1)
     */
    randomNormal() {
        const u1 = Math.random();
        const u2 = Math.random();
        return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    }

    /**
     * Initialize or update the swarm based on blob count
     */
    initializeSwarm() {
        // Get swarm parameters from global settings or use defaults
        const params = window.SWARM_PARAMS || {
            depthVariation: 1.5,
            sizeVariationMin: 0.1,
            sizeVariationMax: 1.0,
            lagFactor: 0.15,
            spreadRadius: 0.9,
            xSpreadMultiplier: 150,
            zSpreadMultiplier: 50
        };

        this.swarmBlobs = [];

        // Calculate center blob size based on total blob count
        const centerBlobSize = 1.2;

        // Always have the center blob (the main player)
        this.swarmBlobs.push({
            id: this.nextBlobId++,
            offsetX: 0,
            offsetZ: 0,
            targetOffsetX: 0,
            targetOffsetZ: 0,
            currentX: this.x,
            currentZ: this.z,
            sizeMultiplier: centerBlobSize,
            frameOffset: 0,
            isCenter: true,
            spawnTime: 0, // Center blob doesn't fade in
            fadeInDuration: 0
        });

        // Create additional blobs around the center with random spread
        for (let i = 1; i < this.blobCount; i++) {
            // Use normal distribution for more organic clustering
            // Most blobs will be near center, fewer at extremes
            const offsetX = this.randomNormal() * params.spreadRadius * params.xSpreadMultiplier * 0.3;
            // Bias Z offset to be more forward (positive Z = toward camera) to balance visual clustering
            const offsetZ = (this.randomNormal() + 1.0) * params.depthVariation * params.zSpreadMultiplier * 0.3;

            // Calculate distance from center for distance-based lag
            const distanceFromCenter = Math.sqrt(offsetX * offsetX + offsetZ * offsetZ);

            this.swarmBlobs.push({
                id: this.nextBlobId++,
                offsetX: offsetX,
                offsetZ: offsetZ,
                targetOffsetX: offsetX,
                targetOffsetZ: offsetZ,
                // Spawn blobs at their target offset immediately (not at center)
                currentX: this.x + offsetX,
                currentZ: this.z + offsetZ,
                sizeMultiplier: params.sizeVariationMin + Math.random() * (params.sizeVariationMax - params.sizeVariationMin),
                frameOffset: Math.floor(Math.random() * this.frameCount), // Random starting frame
                isCenter: false,
                distanceFromCenter: distanceFromCenter, // Store for distance-based lag
                spawnTime: Date.now(), // Track when blob was spawned for fade-in
                fadeInDuration: 500 // Fade-in duration in milliseconds
            });
        }
    }

    /**
     * Add new blobs to the swarm without reinitializing existing ones
     * @param {number} count - Number of new blobs to add
     */
    addNewBlobsToSwarm(count) {
        const params = window.SWARM_PARAMS || {
            depthVariation: 1.5,
            sizeVariationMin: 0.1,
            sizeVariationMax: 1.0,
            lagFactor: 0.15,
            spreadRadius: 0.9,
            xSpreadMultiplier: 100,
            zSpreadMultiplier: 40
        };

        for (let i = 0; i < count; i++) {
            // Use normal distribution for more organic clustering
            const offsetX = this.randomNormal() * params.spreadRadius * params.xSpreadMultiplier * 0.3;
            // Bias Z offset to be more forward (positive Z = toward camera) to balance visual clustering
            const offsetZ = (this.randomNormal() + 1.0) * params.depthVariation * params.zSpreadMultiplier * 0.3;

            // Calculate distance from center for distance-based lag
            const distanceFromCenter = Math.sqrt(offsetX * offsetX + offsetZ * offsetZ);

            this.swarmBlobs.push({
                id: this.nextBlobId++,
                offsetX: offsetX,
                offsetZ: offsetZ,
                targetOffsetX: offsetX,
                targetOffsetZ: offsetZ,
                // Spawn new blobs at their target offset immediately
                currentX: this.x + offsetX,
                currentZ: this.z + offsetZ,
                sizeMultiplier: params.sizeVariationMin + Math.random() * (params.sizeVariationMax - params.sizeVariationMin),
                frameOffset: Math.floor(Math.random() * this.frameCount),
                isCenter: false,
                distanceFromCenter: distanceFromCenter,
                spawnTime: Date.now(), // Track when blob was spawned for fade-in
                fadeInDuration: 500 // Fade-in duration in milliseconds
            });
        }
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

        // Check if blob count changed and add/remove blobs
        if (this.blobCount !== this.previousBlobCount) {
            const diff = this.blobCount - this.previousBlobCount;

            if (diff > 0) {
                // Add new blobs
                this.addNewBlobsToSwarm(diff);
            } else if (diff < 0) {
                // Remove blobs (remove from end, keep center blob)
                this.swarmBlobs.splice(this.blobCount, -diff);
            }

            // Update center blob size based on new blob count
            const centerBlobSize = Math.min(1.2 + (this.blobCount * 0.003), 3);
            if (this.swarmBlobs.length > 0 && this.swarmBlobs[0].isCenter) {
                this.swarmBlobs[0].sizeMultiplier = centerBlobSize;
            }

            this.previousBlobCount = this.blobCount;
        }

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

        // Update swarm blob positions with lag
        this.updateSwarmPositions(deltaTime);
    }

    /**
     * Update swarm blob positions with organic lag effect
     * @param {number} deltaTime - Time elapsed since last frame
     */
    updateSwarmPositions(deltaTime) {
        const params = window.SWARM_PARAMS || {
            lagFactor: 0.15
        };

        this.swarmBlobs.forEach(blob => {
            // Center blob follows immediately
            if (blob.isCenter) {
                blob.currentX = this.x;
                blob.currentZ = this.z;
            } else {
                // Other blobs lag behind with smooth interpolation
                const targetX = this.x + blob.targetOffsetX;
                const targetZ = this.z + blob.targetOffsetZ;

                // Distance-based lag: closer blobs respond faster, farther blobs lag more
                // Base lag factor is reduced based on distance from center
                // Closer blobs (small distance) get faster response, farther blobs (large distance) lag more
                const baseLagFactor = 0.5; // Fast base response for close blobs
                const distanceFactor = Math.max(0.01, baseLagFactor / (1 + blob.distanceFromCenter * 0.05));

                // Lerp towards target position with distance-based speed
                blob.currentX += (targetX - blob.currentX) * distanceFactor;
                blob.currentZ += (targetZ - blob.currentZ) * distanceFactor;
            }
        });
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

        const camPos = camera.getPosition();

        // Calculate screen center
        const center = {
            x: ctx.canvas.width / 2,
            y: ctx.canvas.height / 2
        };

        // Sort swarm blobs by their effective "ground" Z position
        // We need to account for sprite size when determining depth order
        // Larger sprites in front should have their bottom edge considered, not center
        const sortedBlobs = [...this.swarmBlobs].map((blob) => {
            // Calculate the sprite size to determine ground offset
            const projected = project(blob.currentX, this.y, blob.currentZ, camPos);
            let groundZ = blob.currentZ;

            if (projected) {
                const { scale } = projected;
                const baseSize = this.radius * 50 * scale * 12;
                const scaledSize = baseSize * blob.sizeMultiplier;
                // Approximate world-space size adjustment based on sprite height
                // Larger sprites should sort as if they're further forward
                // The adjustment should be proportional to the sprite height in world units
                const sizeAdjustment = blob.sizeMultiplier * 0.5;
                groundZ = blob.currentZ - sizeAdjustment;
            }

            return { blob, groundZ };
        }).sort((a, b) => {
            // Use epsilon for Z-depth comparison to reduce flickering
            const zDiff = b.groundZ - a.groundZ;
            const epsilon = 5.0; // Large threshold to handle lag-based movement

            if (Math.abs(zDiff) < epsilon) {
                // If blobs are at nearly the same depth, use stable blob ID for consistent ordering
                return a.blob.id - b.blob.id;
            }
            return zDiff;
        }).map(item => item.blob);

        // Draw each blob in the swarm
        sortedBlobs.forEach(blob => {
            this.drawSingleBlob(ctx, camera, center, blob);
        });

        // Draw blob count below the center sprite
        const projected = project(this.x, this.y, this.z, camPos);
        if (!projected) return;

        const { x: screenX, y: screenY, scale } = projected;
        const finalX = center.x + screenX;
        const finalY = center.y - screenY;
        const scaledSize = this.radius * 50 * scale * 12;

        const countFontSize = Math.max(12, scaledSize * 0.3);
        const countY = finalY + scaledSize / 2 + countFontSize;

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
     * Draw a single blob from the swarm
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Camera} camera - Camera object
     * @param {Object} center - Screen center coordinates
     * @param {Object} blob - Blob data object
     */
    drawSingleBlob(ctx, camera, center, blob) {
        // Project the blob's 3D position to 2D screen coordinates
        const projected = project(blob.currentX, this.y, blob.currentZ, camera.getPosition());

        // Don't draw if behind camera
        if (!projected) return;

        const { x: screenX, y: screenY, scale } = projected;

        const finalX = center.x + screenX;
        const finalY = center.y - screenY;

        // Calculate which frame to display (offset by blob's frameOffset)
        const blobFrame = (this.currentFrame + blob.frameOffset) % this.frameCount;
        const row = Math.floor(blobFrame / this.framesPerRow);
        const col = blobFrame % this.framesPerRow;

        // Calculate source coordinates in sprite sheet
        const srcX = col * this.frameWidth;
        const srcY = row * this.frameHeight;

        // Apply perspective scaling and size variation
        const baseSize = this.radius * 50 * scale * 12;
        const scaledSize = baseSize * blob.sizeMultiplier;

        // Calculate fade-in effect
        const timeSinceSpawn = Date.now() - blob.spawnTime;
        const fadeProgress = Math.min(1, timeSinceSpawn / blob.fadeInDuration);

        ctx.save();

        // Apply fade-in alpha
        ctx.globalAlpha = fadeProgress;

        // Draw the sprite with its bottom edge at the blob's ground position
        ctx.drawImage(
            this.spriteSheet,
            srcX, srcY,
            this.frameWidth, this.frameHeight,
            finalX - scaledSize / 2,
            finalY - scaledSize,
            scaledSize,
            scaledSize
        );

        // Apply white-to-color transition overlay
        if (fadeProgress < 1) {
            // Blend from white to transparent as fade progresses
            const whiteAmount = 1 - fadeProgress;
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = whiteAmount * 1.5; // Increased intensity

            ctx.drawImage(
                this.spriteSheet,
                srcX, srcY,
                this.frameWidth, this.frameHeight,
                finalX - scaledSize / 2,
                finalY - scaledSize,
                scaledSize,
                scaledSize
            );
        }

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
