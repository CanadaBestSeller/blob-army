/**
 * Track.js
 * Renders the racing track/ground plane with lanes
 */

import { Entity3D } from './Entity3D.js';
import { project } from '../rendering/Projection.js';
import { GameParameters } from '../game/GameParameters.js';

export class Track extends Entity3D {
    /**
     * Create a new Track
     */
    constructor() {
        super(0, 0, 0);

        // Track dimensions
        this.width = GameParameters.TRACK_WIDTH;
        this.length = GameParameters.TRACK_LENGTH;

        // Lane configuration
        this.laneCount = GameParameters.LANE_COUNT;
        this.lanePositions = this.calculateLanePositions();
    }

    /**
     * Calculate lane positions based on parameters
     * @returns {Array} Array of X coordinates for lane centers
     */
    calculateLanePositions() {
        const positions = [];
        const spacing = GameParameters.LANE_SPACING;
        const offset = GameParameters.LANE_OFFSET;

        for (let i = 0; i < this.laneCount; i++) {
            positions.push(offset + (i * spacing));
        }

        return positions;
    }

    /**
     * Update track (not needed for static track)
     * @param {number} deltaTime - Time since last frame
     * @param {Object} gameState - Current game state
     */
    update(deltaTime, gameState) {
        // Track is static, no update needed
    }

    /**
     * Draw the track with lanes
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Camera} camera - Camera object
     */
    draw(ctx, camera) {
        const center = {
            x: ctx.canvas.width / 2,
            y: ctx.canvas.height / 2
        };

        // Draw ground plane
        this.drawGroundPlane(ctx, camera, center);

        // Draw distance markers
        this.drawDistanceMarkers(ctx, camera, center);

        // Draw lane lines
        this.drawLaneLines(ctx, camera, center);
    }

    /**
     * Draw the ground plane as a rectangle
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Camera} camera - Camera object
     * @param {Object} center - Canvas center point
     */
    drawGroundPlane(ctx, camera, center) {
        const halfWidth = this.width / 2;

        // Define ground plane corners in world space
        const corners = [
            { x: -halfWidth, y: 0, z: -500 },  // Near left
            { x: halfWidth, y: 0, z: -500 },   // Near right
            { x: halfWidth, y: 0, z: this.length }, // Far right
            { x: -halfWidth, y: 0, z: this.length }  // Far left
        ];

        // Project corners to screen space
        const projected = corners.map(corner =>
            project(corner.x, corner.y, corner.z, camera.getPosition())
        );

        // Draw ground plane
        ctx.fillStyle = GameParameters.COLOR_TRACK;
        ctx.beginPath();
        ctx.moveTo(center.x + projected[0].x, center.y - projected[0].y);
        ctx.lineTo(center.x + projected[1].x, center.y - projected[1].y);
        ctx.lineTo(center.x + projected[2].x, center.y - projected[2].y);
        ctx.lineTo(center.x + projected[3].x, center.y - projected[3].y);
        ctx.closePath();
        ctx.fill();

        // Draw ground plane border
        ctx.strokeStyle = GameParameters.COLOR_LANE_LINE;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    /**
     * Draw distance markers every 10 meters
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Camera} camera - Camera object
     * @param {Object} center - Canvas center point
     */
    drawDistanceMarkers(ctx, camera, center) {
        const markerInterval = 100; // Every 100 units (10 meters at 0.01 conversion)
        const halfWidth = this.width / 2;

        // Draw markers from 0 to track length
        for (let z = 0; z <= this.length; z += markerInterval) {
            // Horizontal line across the entire track width
            const leftPoint = { x: -halfWidth, y: 0, z: z };
            const rightPoint = { x: halfWidth, y: 0, z: z };

            // Project points
            const leftProj = project(leftPoint.x, leftPoint.y, leftPoint.z, camera.getPosition());
            const rightProj = project(rightPoint.x, rightPoint.y, rightPoint.z, camera.getPosition());

            // Draw faint horizontal line
            ctx.strokeStyle = 'rgba(74, 74, 106, 0.4)'; // Slightly more visible
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]); // Dashed line
            ctx.beginPath();
            ctx.moveTo(center.x + leftProj.x, center.y - leftProj.y);
            ctx.lineTo(center.x + rightProj.x, center.y - rightProj.y);
            ctx.stroke();
            ctx.setLineDash([]); // Reset to solid lines
        }
    }

    /**
     * Draw lane dividing lines
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Camera} camera - Camera object
     * @param {Object} center - Canvas center point
     */
    drawLaneLines(ctx, camera, center) {
        // Draw a line for each lane position except the edges
        // (lanes are between the lines, not on them)
        const laneLinePositions = [];

        // Add center line between the two lanes
        if (this.laneCount === 2) {
            laneLinePositions.push(0); // Center line
        }

        laneLinePositions.forEach(xPos => {
            // Define line from near to far
            const nearPoint = { x: xPos, y: 0, z: -500 };
            const farPoint = { x: xPos, y: 0, z: this.length };

            // Project to screen space
            const nearProj = project(nearPoint.x, nearPoint.y, nearPoint.z, camera.getPosition());
            const farProj = project(farPoint.x, farPoint.y, farPoint.z, camera.getPosition());

            // Draw lane line
            ctx.strokeStyle = GameParameters.COLOR_LANE_LINE;
            ctx.lineWidth = 2;
            ctx.setLineDash([10, 10]); // Dashed line
            ctx.beginPath();
            ctx.moveTo(center.x + nearProj.x, center.y - nearProj.y);
            ctx.lineTo(center.x + farProj.x, center.y - farProj.y);
            ctx.stroke();
            ctx.setLineDash([]); // Reset to solid lines
        });
    }
}
