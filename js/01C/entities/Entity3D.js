/**
 * Entity3D.js
 * Base class for all 3D entities in the game world
 */

export class Entity3D {
    /**
     * Create a new 3D entity
     * @param {number} x - Initial X position (horizontal, left-right)
     * @param {number} y - Initial Y position (vertical, up-down)
     * @param {number} z - Initial Z position (depth, forward-back)
     */
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;

        // Flag to mark entity for removal
        this.markedForDeletion = false;
    }

    /**
     * Update entity state
     * Must be implemented by subclasses
     * @param {number} deltaTime - Time elapsed since last frame (in seconds)
     * @param {Object} gameState - Current game state
     */
    update(deltaTime, gameState) {
        throw new Error('update() must be implemented by subclass');
    }

    /**
     * Draw entity to canvas
     * Must be implemented by subclasses
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Camera} camera - Camera object for projection
     */
    draw(ctx, camera) {
        throw new Error('draw() must be implemented by subclass');
    }

    /**
     * Get entity position as an object
     * @returns {Object} Position {x, y, z}
     */
    getPosition() {
        return {
            x: this.x,
            y: this.y,
            z: this.z
        };
    }

    /**
     * Set entity position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} z - Z position
     */
    setPosition(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * Move entity by delta values
     * @param {number} dx - Change in X
     * @param {number} dy - Change in Y
     * @param {number} dz - Change in Z
     */
    move(dx, dy, dz) {
        this.x += dx;
        this.y += dy;
        this.z += dz;
    }

    /**
     * Calculate distance to another entity
     * @param {Entity3D} other - Another entity
     * @returns {number} Euclidean distance
     */
    distanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const dz = this.z - other.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    /**
     * Mark entity for deletion (to be removed from game)
     */
    destroy() {
        this.markedForDeletion = true;
    }

    /**
     * Check if entity should be deleted
     * @returns {boolean} True if marked for deletion
     */
    shouldDelete() {
        return this.markedForDeletion;
    }
}
