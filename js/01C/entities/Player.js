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

        // Sprite properties - stealth fighter
        this.spriteSheet = new Image();
        this.spriteSheet.src = 'js/01C/assets/stealth-fighter-v2.png';
        this.spriteLoaded = false;
        this.spritePixelData = null; // Store pixel data for collision detection
        this.spriteSheet.onload = () => {
            this.spriteLoaded = true;
            this.extractPixelData();
        };

        // Sprite dimensions (will be calculated after image loads)
        this.spriteDisplaySize = 72; // Base display size in pixels (60 * 1.2)
        this.spriteHeightMultiplier = 0.5; // Height shrinkage for angled perspective

        // Swarm properties
        this.swarmBlobs = []; // Array of swarm blob objects
        this.initializeSwarm();
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
            xSpreadMultiplier: 100,
            zSpreadMultiplier: 80
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
            fadeInDuration: 0,
            dying: false, // Death animation flag
            deathStartTime: 0, // When death animation started
            deathDuration: 500 // Death animation duration in milliseconds
        });

        // Create additional blobs around the center with random spread
        for (let i = 1; i < this.blobCount; i++) {
            // Use normal distribution for more organic clustering
            // Most blobs will be near center, fewer at extremes
            const offsetX = this.randomNormal() * params.spreadRadius * params.xSpreadMultiplier * 0.3;

            // Bias Z offset to be more forward (positive Z = toward camera) to balance visual clustering
            // Add minimum Z-distance to prevent blobs from being too close to the main fighter
            const minZDistance = 15; // Minimum Z-distance from center
            const rawOffsetZ = (this.randomNormal() + 1.0) * params.depthVariation * params.zSpreadMultiplier * 0.3;
            const offsetZ = rawOffsetZ < minZDistance ? rawOffsetZ + minZDistance : rawOffsetZ;

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
                fadeInDuration: 500, // Fade-in duration in milliseconds
                dying: false, // Death animation flag
                deathStartTime: 0, // When death animation started
                deathDuration: 500 // Death animation duration in milliseconds
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
            zSpreadMultiplier: 80
        };

        for (let i = 0; i < count; i++) {
            // Use normal distribution for more organic clustering
            const offsetX = this.randomNormal() * params.spreadRadius * params.xSpreadMultiplier * 0.3;

            // Bias Z offset to be more forward (positive Z = toward camera) to balance visual clustering
            // Add minimum Z-distance to prevent blobs from being too close to the main fighter
            const minZDistance = 15; // Minimum Z-distance from center
            const rawOffsetZ = (this.randomNormal() + 1.0) * params.depthVariation * params.zSpreadMultiplier * 0.3;
            const offsetZ = rawOffsetZ < minZDistance ? rawOffsetZ + minZDistance : rawOffsetZ;

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
                fadeInDuration: 500, // Fade-in duration in milliseconds
                dying: false, // Death animation flag
                deathStartTime: 0, // When death animation started
                deathDuration: 500 // Death animation duration in milliseconds
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
            console.log(`Player blob count changed: ${this.previousBlobCount} → ${this.blobCount} (diff: ${diff})`);

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
            console.log(`Swarm updated: ${this.swarmBlobs.length} blobs in swarm`);
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

        // Calculate fade-in effect
        const timeSinceSpawn = Date.now() - blob.spawnTime;
        const fadeProgress = Math.min(1, timeSinceSpawn / blob.fadeInDuration);

        // Calculate display size based on scale and blob size multiplier
        const baseSize = this.spriteDisplaySize * scale;
        const displayWidth = baseSize * blob.sizeMultiplier;
        const displayHeight = baseSize * blob.sizeMultiplier * this.spriteHeightMultiplier;

        ctx.save();

        // Handle death animation
        let alpha = fadeProgress;
        let deathProgress = 0;
        if (blob.dying) {
            const timeSinceDeath = Date.now() - blob.deathStartTime;
            deathProgress = Math.min(1, timeSinceDeath / blob.deathDuration);

            // Fade out during death animation
            alpha = fadeProgress * (1 - deathProgress);
        }

        // Apply alpha
        ctx.globalAlpha = alpha;

        // Draw stealth fighter sprite
        // Center the sprite at the position
        const drawX = finalX - displayWidth / 2;
        const drawY = finalY - displayHeight / 2;

        // If dying, tint the sprite bright red
        if (blob.dying && deathProgress < 1) {
            // Draw sprite to temporary canvas for color manipulation
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = displayWidth;
            tempCanvas.height = displayHeight;
            const tempCtx = tempCanvas.getContext('2d');

            // Draw original sprite
            tempCtx.drawImage(
                this.spriteSheet,
                0,
                0,
                displayWidth,
                displayHeight
            );

            // Get image data and tint it red
            const imageData = tempCtx.getImageData(0, 0, displayWidth, displayHeight);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const alpha = data[i + 3];
                if (alpha > 0) {
                    // Make it bright red
                    data[i] = 255;     // R
                    data[i + 1] = 0;   // G
                    data[i + 2] = 0;   // B
                    // Keep original alpha
                }
            }

            tempCtx.putImageData(imageData, 0, 0);

            // Draw tinted sprite to main canvas
            ctx.drawImage(tempCanvas, drawX, drawY);
        } else {
            // Draw normal sprite
            ctx.drawImage(
                this.spriteSheet,
                drawX,
                drawY,
                displayWidth,
                displayHeight
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
        const before = this.blobCount;
        this.blobCount += count;
        // Prevent blob count from going below 0
        if (this.blobCount < 0) {
            this.blobCount = 0;
        }
        console.log(`addBlobs: ${before} + ${count} = ${this.blobCount}`);
    }

    /**
     * Get pixel data for collision detection
     * @returns {ImageData} The sprite's pixel data
     */
    getPixelData() {
        return this.spritePixelData;
    }

    /**
     * Mark a blob as dying and start its death animation
     * @param {number} index - Index of the blob in swarmBlobs array
     */
    killBlob(index) {
        if (index >= 0 && index < this.swarmBlobs.length) {
            const blob = this.swarmBlobs[index];
            blob.dying = true;
            blob.deathStartTime = Date.now();
        }
    }
}
