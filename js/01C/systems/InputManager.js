/**
 * InputManager.js
 * Handles keyboard input state tracking
 */

export class InputManager {
    /**
     * Create a new InputManager
     */
    constructor() {
        // Store key states (true = pressed, false = released)
        this.keys = {};

        // Bind event handlers
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);

        // Register event listeners
        this.enable();
    }

    /**
     * Enable input listening
     */
    enable() {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    /**
     * Disable input listening
     */
    disable() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
    }

    /**
     * Handle keydown events
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyDown(event) {
        this.keys[event.key.toLowerCase()] = true;
    }

    /**
     * Handle keyup events
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyUp(event) {
        this.keys[event.key.toLowerCase()] = false;
    }

    /**
     * Check if a key is currently pressed
     * @param {string} key - Key name (case insensitive)
     * @returns {boolean} True if key is pressed
     */
    isKeyPressed(key) {
        return this.keys[key.toLowerCase()] === true;
    }

    /**
     * Check if left arrow key is pressed
     * @returns {boolean} True if left is pressed
     */
    isLeftPressed() {
        return this.isKeyPressed('arrowleft');
    }

    /**
     * Check if right arrow key is pressed
     * @returns {boolean} True if right is pressed
     */
    isRightPressed() {
        return this.isKeyPressed('arrowright');
    }

    /**
     * Check if up arrow key is pressed
     * @returns {boolean} True if up is pressed
     */
    isUpPressed() {
        return this.isKeyPressed('arrowup');
    }

    /**
     * Check if down arrow key is pressed
     * @returns {boolean} True if down is pressed
     */
    isDownPressed() {
        return this.isKeyPressed('arrowdown');
    }

    /**
     * Reset all key states
     */
    reset() {
        this.keys = {};
    }

    /**
     * Cleanup and remove event listeners
     */
    destroy() {
        this.disable();
        this.keys = {};
    }
}
