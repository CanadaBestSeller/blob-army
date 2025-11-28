/**
 * Projection.js
 * Handles 3D to 2D perspective projection for racing game view
 * (Mario Kart / F-Zero / Outrun style)
 */

import { GameParameters } from '../game/GameParameters.js';

/**
 * Projects a 3D world coordinate to 2D screen space using perspective projection
 * Camera looks down the track at configurable angle
 *
 * @param {number} x - World X coordinate (horizontal, left-right)
 * @param {number} y - World Y coordinate (vertical, up-down)
 * @param {number} z - World Z coordinate (depth, forward-back along track)
 * @param {Object} camera - Camera object with position {x, y, z} and optional angle
 * @returns {Object} Object with {x, y, depth, scale} screen coordinates
 */
export function project(x, y, z, camera = { x: 0, y: 0, z: 0, angle: 45 }) {
    // Convert to camera-relative coordinates
    const relX = x - camera.x;
    const relY = -(y - camera.y); // Invert Y so positive Y is up (more intuitive)
    const relZ = z - camera.z;

    // Camera angle (default 45 degrees looking down, can be overridden)
    const angleDegrees = camera.angle !== undefined ? camera.angle : 45;
    const cameraAngle = (angleDegrees * Math.PI) / 180; // Convert to radians
    const cosAngle = Math.cos(cameraAngle);
    const sinAngle = Math.sin(cameraAngle);

    // Rotate Y and Z to simulate camera looking down
    const rotatedY = relY * cosAngle - relZ * sinAngle;
    const rotatedZ = relY * sinAngle + relZ * cosAngle;

    // Perspective division
    // Objects further away (larger Z) appear smaller and higher on screen
    const perspectiveDistance = 400;
    const effectiveZ = Math.max(rotatedZ, 1); // Prevent division by zero
    const scale = perspectiveDistance / effectiveZ;

    // Project to screen coordinates
    const screenX = relX * scale;
    const screenY = -rotatedY * scale; // Negative because screen Y goes down

    return {
        x: screenX,
        y: screenY,
        depth: relZ, // Original Z depth for sorting
        scale: scale // Scale factor for drawing
    };
}

/**
 * Calculate scale factor based on depth for size scaling
 * Objects further away appear smaller
 *
 * @param {number} depth - Z depth value
 * @returns {number} Scale multiplier (0-1+)
 */
export function getDepthScale(depth) {
    const scaleFactor = 1 - (depth * GameParameters.DEPTH_SCALE_FACTOR);
    return Math.max(0.1, scaleFactor); // Minimum scale of 0.1
}

/**
 * Calculate color brightness based on depth for atmospheric depth
 * Objects further away appear darker
 *
 * @param {number} depth - Z depth value
 * @param {string} baseColor - Base color in hex format
 * @returns {string} Adjusted color in hex format
 */
export function getDepthColor(depth, baseColor) {
    if (!GameParameters.DEPTH_SHADING_ENABLED) {
        return baseColor;
    }

    // Calculate brightness factor (0-1, where 1 is full brightness)
    const brightnessFactor = 1 - Math.min(1, depth * GameParameters.DEPTH_SHADING_FACTOR * 0.001);

    // Parse hex color
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Apply brightness
    const newR = Math.floor(r * brightnessFactor);
    const newG = Math.floor(g * brightnessFactor);
    const newB = Math.floor(b * brightnessFactor);

    // Convert back to hex
    const toHex = (n) => n.toString(16).padStart(2, '0');
    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}
