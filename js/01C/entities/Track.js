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

        // Get camera Z position to make track relative to camera
        const camPos = camera.getPosition();
        const cameraZ = camPos.z;

        // Define ground plane corners RELATIVE to camera position
        // This keeps the track always visible and stable
        const nearZ = cameraZ - 500;  // Behind camera
        const farZ = cameraZ + 5000;  // Far ahead of camera (much longer now)

        const corners = [
            { x: -halfWidth, y: 0, z: nearZ },  // Near left
            { x: halfWidth, y: 0, z: nearZ },   // Near right
            { x: halfWidth, y: 0, z: farZ },    // Far right
            { x: -halfWidth, y: 0, z: farZ }    // Far left
        ];

        // Project corners to screen space
        const projected = corners.map(corner =>
            project(corner.x, corner.y, corner.z, camPos)
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
    }

    /**
     * Draw distance markers every 10 meters
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Camera} camera - Camera object
     * @param {Object} center - Canvas center point
     */
    drawDistanceMarkers(ctx, camera, center) {
        const markerInterval = 100; // Every 100 units
        const halfWidth = this.width / 2;
        const camPos = camera.getPosition();
        const cameraZ = camPos.z;

        // Draw markers relative to camera position
        const startZ = Math.floor(cameraZ / markerInterval) * markerInterval - 500;
        const endZ = cameraZ + 5000;

        for (let z = startZ; z <= endZ; z += markerInterval) {
            // Get marker settings from global (if available)
            const markerSettings = window.MARKER_SETTINGS || { color: '#BB00FF', width: 1, glow: 8, infinite: true };

            // Determine horizontal line width (infinite or track width)
            let leftX, rightX;
            if (markerSettings.infinite) {
                // Extend far beyond the track
                leftX = -10000;
                rightX = 10000;
            } else {
                // Stay within track width
                leftX = -halfWidth;
                rightX = halfWidth;
            }

            // Horizontal line across the width
            const leftPoint = { x: leftX, y: 0, z: z };
            const rightPoint = { x: rightX, y: 0, z: z };

            // Project points
            const leftProj = project(leftPoint.x, leftPoint.y, leftPoint.z, camPos);
            const rightProj = project(rightPoint.x, rightPoint.y, rightPoint.z, camPos);

            // Draw prominent horizontal line with optional glow
            if (markerSettings.glow > 0) {
                ctx.shadowColor = markerSettings.color;
                ctx.shadowBlur = markerSettings.glow;
            }
            ctx.strokeStyle = markerSettings.color;
            ctx.lineWidth = markerSettings.width;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(center.x + leftProj.x, center.y - leftProj.y);
            ctx.lineTo(center.x + rightProj.x, center.y - rightProj.y);
            ctx.stroke();

            // Reset shadow
            ctx.shadowBlur = 0;
        }
    }

    /**
     * Draw lane dividing lines
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Camera} camera - Camera object
     * @param {Object} center - Canvas center point
     */
    drawLaneLines(ctx, camera, center) {
        const camPos = camera.getPosition();
        const cameraZ = camPos.z;
        const nearZ = cameraZ - 500;
        const farZ = cameraZ + 5000;

        // Draw center line between the two lanes
        const centerLineX = 0;
        const nearPoint = { x: centerLineX, y: 0, z: nearZ };
        const farPoint = { x: centerLineX, y: 0, z: farZ };

        const nearProj = project(nearPoint.x, nearPoint.y, nearPoint.z, camPos);
        const farProj = project(farPoint.x, farPoint.y, farPoint.z, camPos);

        // Draw lane line
        ctx.strokeStyle = GameParameters.COLOR_LANE_LINE;
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(center.x + nearProj.x, center.y - nearProj.y);
        ctx.lineTo(center.x + farProj.x, center.y - farProj.y);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}
