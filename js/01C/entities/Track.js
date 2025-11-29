/**
 * Track.js
 * Renders distance markers for the game
 * Version: 3.0 - Simplified for star wallpaper background
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
     * Draw the track (only distance markers)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Camera} camera - Camera object
     */
    draw(ctx, camera) {
        const center = {
            x: ctx.canvas.width / 2,
            y: ctx.canvas.height / 2
        };

        this.drawDistanceMarkers(ctx, camera, center);
        this.drawZAxisMarker(ctx, camera, center);
    }

    /**
     * Draw distance markers every 10 meters
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Camera} camera - Camera object
     * @param {Object} center - Canvas center point
     */
    drawDistanceMarkers(ctx, camera, center) {
        const markerInterval = 100; // Every 100 units
        const camPos = camera.getPosition();
        const cameraZ = camPos.z;

        // Draw markers relative to camera position
        const startZ = Math.floor(cameraZ / markerInterval) * markerInterval - 500;
        const endZ = cameraZ + 5000;

        for (let z = startZ; z <= endZ; z += markerInterval) {
            // Get marker settings from global (if available)
            const markerSettings = window.MARKER_SETTINGS || { color: '#BB00FF', width: 1, glow: 8, infinite: true };

            // Determine horizontal line width (infinite or limited)
            const lineExtent = markerSettings.infinite ? 10000 : GameParameters.TRACK_WIDTH / 2;
            const leftX = -lineExtent;
            const rightX = lineExtent;

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
     * Draw continuous z-axis marker down the center
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Camera} camera - Camera object
     * @param {Object} center - Canvas center point
     */
    drawZAxisMarker(ctx, camera, center) {
        const zMarkerSettings = window.Z_MARKER_SETTINGS || { color: '#BB00FF', width: 2, glow: 8 };
        const camPos = camera.getPosition();

        // Draw z-axis markers at x = -200, 0, and 200
        const xPositions = [-200, 0, 200];

        // Start a bit ahead of the camera to ensure it's visible
        const startZ = camPos.z + 50;
        const endZ = camPos.z + 5000; // Extend 5000 units into the distance

        ctx.save();

        // Apply glow effect
        if (zMarkerSettings.glow > 0) {
            ctx.shadowColor = zMarkerSettings.color;
            ctx.shadowBlur = zMarkerSettings.glow;
        }

        ctx.strokeStyle = zMarkerSettings.color;
        ctx.lineWidth = zMarkerSettings.width;
        ctx.setLineDash([]); // Solid line
        ctx.lineCap = 'round';

        // Draw a line for each x position
        for (const x of xPositions) {
            const startPoint = project(x, 0, startZ, camPos);
            const endPoint = project(x, 0, endZ, camPos);

            const startX = center.x + startPoint.x;
            const startY = center.y - startPoint.y;
            const endX = center.x + endPoint.x;
            const endY = center.y - endPoint.y;

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }

        // Reset shadow
        ctx.shadowBlur = 0;

        ctx.restore();
    }
}
