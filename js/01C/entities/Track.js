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

        // Marker queue settings
        this.maxMarkers = 50; // Keep 50 horizontal markers active
        this.markerInterval = 1 / GameParameters.METERS_PER_PIXEL; // 1 meter between markers (100 world units)
        this.cleanupDistance = 5 / GameParameters.METERS_PER_PIXEL; // 5 meters behind player (500 world units)

        // Active markers queue (stores Z positions)
        this.markerQueue = [];

        // Next marker spawn Z position
        this.nextMarkerZ = 0;

        // Flag to track initialization
        this.initialized = false;
    }

    /**
     * Update track - manage marker queue
     * @param {number} deltaTime - Time since last frame
     * @param {Object} gameState - Current game state
     */
    update(deltaTime, gameState) {
        // Get player position
        const player = gameState.player || null;
        if (!player) return;

        // Initialize markers on first update
        if (!this.initialized) {
            this.initializeMarkers(player.z);
            this.initialized = true;
        }

        // Update marker queue
        this.updateMarkerQueue(player.z);
    }

    /**
     * Initialize marker queue with initial markers
     * @param {number} playerZ - Player's Z position
     */
    initializeMarkers(playerZ) {
        // Start markers behind the player
        this.nextMarkerZ = Math.floor(playerZ / this.markerInterval) * this.markerInterval - (5 * this.markerInterval);

        // Spawn initial markers
        for (let i = 0; i < this.maxMarkers; i++) {
            this.markerQueue.push(this.nextMarkerZ);
            this.nextMarkerZ += this.markerInterval;
        }
    }

    /**
     * Update marker queue - remove old markers and add new ones
     * @param {number} playerZ - Player's Z position
     */
    updateMarkerQueue(playerZ) {
        if (this.markerQueue.length === 0) return;

        // Check if oldest marker is behind the player
        const oldestMarkerZ = this.markerQueue[0];
        const distanceBehindPlayer = playerZ - oldestMarkerZ;

        // If marker is more than cleanupDistance behind player, remove it and spawn new one
        if (distanceBehindPlayer > this.cleanupDistance) {
            // Remove the oldest marker
            this.markerQueue.shift();

            // Add new marker at the end
            this.markerQueue.push(this.nextMarkerZ);
            this.nextMarkerZ += this.markerInterval;
        }
    }

    /**
     * Reset track markers (called when game resets)
     */
    reset() {
        this.markerQueue = [];
        this.nextMarkerZ = 0;
        this.initialized = false;
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
     * Draw distance markers from queue
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Camera} camera - Camera object
     * @param {Object} center - Canvas center point
     */
    drawDistanceMarkers(ctx, camera, center) {
        const camPos = camera.getPosition();

        // Get marker settings from global (if available) or use GameParameters
        const markerSettings = window.MARKER_SETTINGS || {
            color: '#BB00FF',
            width: GameParameters.MARKER_WIDTH,
            glow: GameParameters.MARKER_GLOW,
            infinite: true
        };

        // Draw markers from furthest to closest for proper z-ordering
        // Reverse iteration ensures closer markers render on top
        for (let i = this.markerQueue.length - 1; i >= 0; i--) {
            const z = this.markerQueue[i];
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
        const zMarkerSettings = window.Z_MARKER_SETTINGS || {
            color: '#BB00FF',
            width: GameParameters.Z_MARKER_WIDTH,
            glow: GameParameters.Z_MARKER_GLOW
        };
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
