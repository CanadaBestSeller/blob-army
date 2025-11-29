/**
 * Renderer.js
 * Handles rendering all game entities with depth sorting
 */

import { project } from './Projection.js';

export class Renderer {
    /**
     * Create a new Renderer
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
     * @param {Camera} camera - Camera object
     */
    constructor(ctx, camera) {
        this.ctx = ctx;
        this.camera = camera;
        this.entities = [];
    }

    /**
     * Add an entity to be rendered
     * @param {Entity3D} entity - Entity to render
     */
    addEntity(entity) {
        this.entities.push(entity);
    }

    /**
     * Remove an entity from rendering
     * @param {Entity3D} entity - Entity to remove
     */
    removeEntity(entity) {
        const index = this.entities.indexOf(entity);
        if (index > -1) {
            this.entities.splice(index, 1);
        }
    }

    /**
     * Clear all entities
     */
    clearEntities() {
        this.entities = [];
    }

    /**
     * Render all entities with depth sorting
     * Two-pass rendering system ensures gates always appear above track
     */
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // Remove entities marked for deletion
        this.entities = this.entities.filter(entity => !entity.shouldDelete());

        // PASS 1: Draw track first (absolute background, always drawn first)
        const track = this.entities.find(e => e.constructor.name === 'Track');
        const center = { x: this.ctx.canvas.width / 2, y: this.ctx.canvas.height / 2 };

        if (track) {
            // Track elements are drawn in fixed order as absolute background
            if (track.drawGroundPlane) track.drawGroundPlane(this.ctx, this.camera, center);
            if (track.drawDistanceMarkers) track.drawDistanceMarkers(this.ctx, this.camera, center);
            if (track.drawLaneLines) track.drawLaneLines(this.ctx, this.camera, center);
            // console.log('PASS 1: Drew track (background)');
        }

        // PASS 2: Draw all non-track entities (gates, player) with depth sorting
        // These are ALWAYS drawn after the track, ensuring they appear on top
        const gameEntities = this.entities.filter(e => e.constructor.name !== 'Track');

        // Sort by depth - FURTHEST objects drawn FIRST, CLOSEST objects drawn LAST
        // This ensures closer objects appear on top of further objects
        gameEntities.sort((a, b) => {
            // Objects with larger Z (further away) should be drawn first
            // Objects with smaller Z (closer) should be drawn last (on top)
            return b.z - a.z; // Sort by Z descending (furthest to closest)
        });

        // Draw all game entities - closer objects will appear on top of further ones
        gameEntities.forEach(entity => {
            entity.draw(this.ctx, this.camera);
            // console.log(`PASS 2: Drew ${entity.constructor.name} at Z=${entity.z.toFixed(0)}`);
        });
    }

    /**
     * Get the canvas center point for projections
     * @returns {Object} {x, y} center coordinates
     */
    getCenter() {
        return {
            x: this.ctx.canvas.width / 2,
            y: this.ctx.canvas.height / 2
        };
    }
}
