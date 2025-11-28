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
     * Objects further away (larger Z) are drawn first
     */
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // Remove entities marked for deletion
        this.entities = this.entities.filter(entity => !entity.shouldDelete());

        // Sort entities by depth (furthest first for painter's algorithm)
        const sorted = [...this.entities].sort((a, b) => {
            // Calculate camera-relative Z position
            const aDepth = a.z - this.camera.z;
            const bDepth = b.z - this.camera.z;
            return bDepth - aDepth; // Furthest first
        });

        // Draw each entity in order
        sorted.forEach(entity => {
            entity.draw(this.ctx, this.camera);
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
