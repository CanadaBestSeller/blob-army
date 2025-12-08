/**
 * Gate.js
 * Gate entity that player passes through to collect/lose blobs
 */

import { Entity3D } from './Entity3D.js';
import { project } from '../rendering/Projection.js';
import { GameParameters } from '../game/GameParameters.js';

export class Gate extends Entity3D {
    /**
     * Create a new Gate
     * @param {number} x - X position (lane position)
     * @param {number} y - Y position (height above ground)
     * @param {number} z - Z position (distance along track)
     * @param {number} value - Gate value (positive or negative number, or multiplier)
     * @param {string} type - Gate type: 'addition' or 'multiplication' (default: 'addition')
     */
    constructor(x, y, z, value, type = 'addition') {
        super(x, y, z);

        // Gate properties
        this.value = value;
        this.type = type; // 'addition' or 'multiplication'
        this.width = GameParameters.GATE_WIDTH;
        this.height = GameParameters.GATE_HEIGHT;
        this.consumed = false; // Track if gate has been consumed

        // Determine color based on value
        this.color = value >= 0
            ? GameParameters.COLOR_GATE_POSITIVE
            : GameParameters.COLOR_GATE_NEGATIVE;

        // Load fighter sprite
        this.fighterSprite = new Image();
        this.fighterSprite.src = 'js/01C/assets/stealth-fighter-v2.png';
        this.spriteLoaded = false;
        this.fighterSprite.onload = () => {
            this.spriteLoaded = true;
        };

        // Health system
        this.maxHealth = 20;
        this.health = 20;
        this.hitFlashDuration = 0.1; // Duration of hit flash in seconds
        this.hitFlashTimeRemaining = 0; // Time remaining for current flash
    }

    /**
     * Update gate (gates are static, just moved by world scrolling)
     * @param {number} deltaTime - Time since last frame
     * @param {Object} gameState - Current game state
     */
    update(deltaTime, gameState) {
        // Update hit flash timer
        if (this.hitFlashTimeRemaining > 0) {
            this.hitFlashTimeRemaining -= deltaTime;
        }
    }

    /**
     * Draw gate as a rectangle with value text
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Camera} camera - Camera object
     * @param {Object} gameState - Game state (optional)
     */
    draw(ctx, camera, gameState = {}) {
        // Don't draw if consumed
        if (this.consumed) return;

        const camPos = camera.getPosition();

        // Calculate gate corners in 3D space
        const halfWidth = this.width / 2;

        // Gate is a vertical rectangle with bottom edge on ground (y=0)
        // and extending upward by height
        const corners = [
            { x: this.x - halfWidth, y: 0, z: this.z },           // Bottom left (on ground)
            { x: this.x + halfWidth, y: 0, z: this.z },           // Bottom right (on ground)
            { x: this.x + halfWidth, y: this.height, z: this.z }, // Top right
            { x: this.x - halfWidth, y: this.height, z: this.z }  // Top left
        ];

        // Project corners to screen space
        const projected = corners.map(corner =>
            project(corner.x, corner.y, corner.z, camPos)
        );

        // Calculate center for drawing number
        const center = {
            x: ctx.canvas.width / 2,
            y: ctx.canvas.height / 2
        };

        // Create gradient from bottom (translucent) to top (transparent)
        // Use global gate color if set, otherwise default yellow
        let gateColor = window.GATE_COLOR || { r: 255, g: 255, b: 0, a: 0.6 };

        // Flash white when hit
        if (this.hitFlashTimeRemaining > 0) {
            gateColor = { r: 255, g: 255, b: 255, a: 0.9 };
        }

        const gradient = ctx.createLinearGradient(
            center.x + projected[0].x, center.y - projected[0].y, // Bottom
            center.x + projected[3].x, center.y - projected[3].y  // Top
        );
        gradient.addColorStop(0, `rgba(${gateColor.r}, ${gateColor.g}, ${gateColor.b}, ${gateColor.a})`);
        gradient.addColorStop(1, `rgba(${gateColor.r}, ${gateColor.g}, ${gateColor.b}, 0)`);

        // Draw gate rectangle with gradient fill
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(center.x + projected[0].x, center.y - projected[0].y);
        ctx.lineTo(center.x + projected[1].x, center.y - projected[1].y);
        ctx.lineTo(center.x + projected[2].x, center.y - projected[2].y);
        ctx.lineTo(center.x + projected[3].x, center.y - projected[3].y);
        ctx.closePath();
        ctx.fill();

        // Draw only bottom border
        ctx.save();
        ctx.strokeStyle = `rgba(${gateColor.r}, ${gateColor.g}, ${gateColor.b}, ${gateColor.a})`;
        ctx.lineWidth = 3;
        ctx.setLineDash([]); // Ensure solid line for gate border
        ctx.beginPath();
        ctx.moveTo(center.x + projected[0].x, center.y - projected[0].y);
        ctx.lineTo(center.x + projected[1].x, center.y - projected[1].y);
        ctx.stroke();
        ctx.restore();

        // Draw HP number in center of gate (vertically centered at height/2)
        const gateCenter = project(this.x, this.height / 2, this.z, camPos);
        const centerX = center.x + gateCenter.x;
        const centerY = center.y - gateCenter.y;

        // Calculate font size based on distance (scale)
        const baseFontSize = 35;
        const fontSize = Math.max(8, baseFontSize * gateCenter.scale);

        // Determine what to display
        const isPreplay = gameState.isPreplay || false;

        if (isPreplay) {
            // Show "Press Play" text in preplay mode
            ctx.save();
            ctx.shadowBlur = 20;
            ctx.shadowColor = GameParameters.COLOR_GATE_TEXT;
            ctx.fillStyle = GameParameters.COLOR_GATE_TEXT;
            ctx.font = `${fontSize}px 'Press Start 2P', cursive`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Press Play', centerX, centerY);
            ctx.shadowBlur = 40;
            ctx.fillText('Press Play', centerX, centerY);
            ctx.restore();
        } else {
            // Draw HP number in center of gate
            ctx.save();
            ctx.shadowBlur = 20;
            ctx.shadowColor = GameParameters.COLOR_GATE_TEXT;
            ctx.fillStyle = GameParameters.COLOR_GATE_TEXT;
            ctx.font = `${fontSize}px 'Press Start 2P', cursive`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const hpText = this.health.toString();
            ctx.fillText(hpText, centerX, centerY);
            ctx.shadowBlur = 40;
            ctx.fillText(hpText, centerX, centerY);
            ctx.restore();

            // Draw symbol (+ or ×) and fighter icon ABOVE the gate
            const gateTop = project(this.x, this.height, this.z, camPos);
            const topX = center.x + gateTop.x;
            const topY = center.y - gateTop.y;

            const symbol = this.type === 'multiplication' ? '×' : '+';
            const topFontSize = Math.max(6, fontSize * 0.7); // Slightly smaller for above gate

            // Calculate spacing for symbol and icon
            const spacing = topFontSize * 0.5;

            // Measure symbol width to position elements
            ctx.save();
            ctx.font = `${topFontSize}px 'Press Start 2P', cursive`;
            const symbolWidth = ctx.measureText(symbol).width;

            // Calculate icon size
            const iconSize = topFontSize * 1.8;

            // Calculate total width to center the group
            const totalWidth = symbolWidth + spacing + iconSize;
            const startX = topX - totalWidth / 2;

            // Position above the gate (offset upward)
            const aboveOffset = topFontSize * 1.5;
            const aboveY = topY - aboveOffset;

            // Draw symbol with glow effect
            ctx.shadowBlur = 20;
            ctx.shadowColor = GameParameters.COLOR_GATE_TEXT;
            ctx.fillStyle = GameParameters.COLOR_GATE_TEXT;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';

            const symbolX = startX;
            ctx.fillText(symbol, symbolX, aboveY);
            ctx.shadowBlur = 40;
            ctx.fillText(symbol, symbolX, aboveY);

            // Draw fighter icon to the right of the symbol
            if (this.spriteLoaded) {
                const iconX = startX + symbolWidth + spacing;
                const iconY = aboveY - iconSize / 2;

                // Add glow effect for the icon
                ctx.shadowBlur = 20;
                ctx.shadowColor = GameParameters.COLOR_GATE_TEXT;

                ctx.drawImage(
                    this.fighterSprite,
                    iconX,
                    iconY,
                    iconSize,
                    iconSize
                );
            }

            ctx.restore();
        }
    }

    /**
     * Get gate value
     * @returns {number} Gate value
     */
    getValue() {
        return this.value;
    }

    /**
     * Check if gate has been passed by the player
     * @param {number} playerZ - Player's Z position
     * @returns {boolean} True if player has passed this gate
     */
    isPassed(playerZ) {
        return playerZ > this.z;
    }

    /**
     * Check if player is colliding with this gate
     * @param {Player} player - The player entity
     * @returns {boolean} True if player is colliding with gate
     */
    checkCollision(player) {
        // Don't collide if already consumed
        if (this.consumed) return false;

        // Check collision with the swarm - any blob can trigger the gate
        const halfWidth = this.width / 2;
        const gateDepth = 10; // Collision zone depth (increased for better detection with lag)

        // Check player's center position first (most reliable)
        const centerInZRange = Math.abs(player.z - this.z) < gateDepth;
        if (centerInZRange) {
            const centerInXRange = player.x >= (this.x - halfWidth) && player.x <= (this.x + halfWidth);
            if (centerInXRange) {
                console.log(`Gate collision detected! Type: ${this.type}, Value: ${this.value}, Player count: ${player.getBlobCount()}`);
                return true; // Center blob hit the gate
            }
        }

        // Also check swarm blobs (in case only outer blobs hit)
        if (player.swarmBlobs && player.swarmBlobs.length > 0) {
            for (const blob of player.swarmBlobs) {
                // Check if blob's Z position is within the gate's depth
                const isInZRange = Math.abs(blob.currentZ - this.z) < gateDepth;

                if (isInZRange) {
                    // Check if blob's X position is within the gate's width
                    const isInXRange = blob.currentX >= (this.x - halfWidth) &&
                                      blob.currentX <= (this.x + halfWidth);

                    if (isInXRange) {
                        console.log(`Gate collision detected (blob)! Type: ${this.type}, Value: ${this.value}, Player count: ${player.getBlobCount()}`);
                        return true; // Any blob colliding triggers the gate
                    }
                }
            }
        }

        return false;
    }

    /**
     * Apply gate effect to player (only if health is depleted)
     * @param {Player} player - The player entity
     */
    applyEffect(player) {
        // Only apply effect if gate health is depleted
        if (this.consumed || this.health > 0) return;

        const oldCount = player.getBlobCount();

        if (this.type === 'multiplication') {
            // Multiply blob count
            const newCount = Math.floor(oldCount * this.value);
            player.blobCount = newCount;
            console.log(`Gate MULTIPLY: ${oldCount} × ${this.value} = ${newCount}`);
        } else {
            // Add or subtract blobs
            player.addBlobs(Math.floor(this.value));
            const newCount = player.getBlobCount();
            console.log(`Gate ADD: ${oldCount} + ${Math.floor(this.value)} = ${newCount}`);
        }

        // Mark gate as consumed
        this.consumed = true;
    }

    /**
     * Check collision with a bullet
     * @param {Bullet} bullet - The bullet to check
     * @returns {boolean} True if bullet hits this gate
     */
    checkBulletCollision(bullet) {
        if (!bullet.isActive() || this.consumed) return false;

        const halfWidth = this.width / 2;
        const gateDepth = 10;

        // Check if bullet is within gate bounds
        const inZRange = Math.abs(bullet.z - this.z) < gateDepth;
        const inXRange = bullet.x >= (this.x - halfWidth) && bullet.x <= (this.x + halfWidth);
        const inYRange = bullet.y >= 0 && bullet.y <= this.height;

        return inZRange && inXRange && inYRange;
    }

    /**
     * Take damage from a bullet
     * @param {number} damage - Amount of damage to take
     */
    takeDamage(damage = 1) {
        if (this.health <= 0) return;

        this.health -= damage;
        if (this.health < 0) this.health = 0;

        // Trigger hit flash
        this.hitFlashTimeRemaining = this.hitFlashDuration;

        console.log(`Gate hit! Health: ${this.health}/${this.maxHealth}`);

        // If health depleted, gate can be consumed
        if (this.health === 0) {
            console.log(`Gate destroyed! Can now be consumed.`);
        }
    }

    /**
     * Check if gate is destroyed (health depleted)
     * @returns {boolean} True if gate health is zero
     */
    isDestroyed() {
        return this.health <= 0;
    }
}
