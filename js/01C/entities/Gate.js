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
     * @param {number} value - Gate value (positive or negative number)
     */
    constructor(x, y, z, value) {
        super(x, y, z);

        // Gate properties
        this.value = value;
        this.width = GameParameters.GATE_WIDTH;
        this.height = GameParameters.GATE_HEIGHT;

        // Determine color based on value
        this.color = value >= 0
            ? GameParameters.COLOR_GATE_POSITIVE
            : GameParameters.COLOR_GATE_NEGATIVE;
    }

    /**
     * Update gate (gates are static, just moved by world scrolling)
     * @param {number} deltaTime - Time since last frame
     * @param {Object} gameState - Current game state
     */
    update(deltaTime, gameState) {
        // Gates don't have their own update logic
        // They're moved forward by the world scrolling in Game.js
    }

    /**
     * Draw gate as a rectangle with value text
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Camera} camera - Camera object
     */
    draw(ctx, camera) {
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
        const gateColor = window.GATE_COLOR || { r: 255, g: 255, b: 0, a: 0.6 };

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
        ctx.strokeStyle = `rgba(${gateColor.r}, ${gateColor.g}, ${gateColor.b}, ${gateColor.a})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(center.x + projected[0].x, center.y - projected[0].y);
        ctx.lineTo(center.x + projected[1].x, center.y - projected[1].y);
        ctx.stroke();

        // Draw value text in center of gate (vertically centered at height/2)
        const gateCenter = project(this.x, this.height / 2, this.z, camPos);
        const textX = center.x + gateCenter.x;
        const textY = center.y - gateCenter.y;

        // Calculate font size based on distance (scale)
        const baseFontSize = 40;
        const fontSize = Math.max(12, baseFontSize * gateCenter.scale);

        ctx.fillStyle = GameParameters.COLOR_GATE_TEXT;
        ctx.font = `bold ${fontSize}px Mulish`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Format value with + or - sign
        const displayValue = this.value >= 0 ? `+${this.value}` : `${this.value}`;
        ctx.fillText(displayValue, textX, textY);
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
}
