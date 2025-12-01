/**
 * GameParameters.js
 * Centralized configuration for all game constants and parameters
 */

export const GameParameters = {
    // Performance
    TARGET_FPS: 60,
    FRAME_TIME: 1000 / 60, // milliseconds per frame

    // World & Scrolling
    WORLD_SCROLL_SPEED: 200, // pixels per second (forward movement)
    METERS_PER_PIXEL: 0.01, // conversion factor for score

    // Player
    PLAYER_MOVEMENT_SPEED: 300, // pixels per second (horizontal)
    PLAYER_RADIUS: 20, // visual size of player blob
    PLAYER_START_X: 0, // center of track
    PLAYER_START_Y: 0.5, // slightly above ground
    PLAYER_START_Z: 0, // fixed Z position relative to camera
    PLAYER_START_BLOB_COUNT: 1,

    // Track & Lanes
    TRACK_WIDTH: 400, // total width of playable area
    LANE_COUNT: 2,
    LANE_SPACING: 200, // distance between lane centers
    LANE_OFFSET: -100, // offset from center (Lane 1 at -100, Lane 2 at +100)
    TRACK_LENGTH: 2000, // visual length extending into distance

    // Track Markers (Horizontal)
    MARKER_GLOW: 30, // glow blur in pixels
    MARKER_WIDTH: 1, // line width in pixels

    // Z-Axis Markers (Vertical)
    Z_MARKER_GLOW: 30, // glow blur in pixels
    Z_MARKER_WIDTH: 5, // line width in pixels

    // Gates
    GATE_SPAWN_INTERVAL: 2000, // milliseconds between spawns
    GATE_SPAWN_DISTANCE: 1500, // Z distance where gates spawn (far away)
    GATE_WIDTH: 200, // width of each lane
    GATE_HEIGHT: 100,
    GATE_VALUE_MIN: -20,
    GATE_VALUE_MAX: 20,
    GATE_CLEANUP_THRESHOLD: -200, // Z position behind camera to remove gates

    // Collision
    COLLISION_DISTANCE_THRESHOLD: 60, // distance for collision detection

    // Camera & Projection
    CAMERA_ANGLE: 15, // degrees
    CAMERA_HEIGHT: 280, // Y position above ground
    CAMERA_DISTANCE: 133, // Z distance behind player
    PROJECTION_SCALE: 1.0, // base scale for projection
    DEPTH_SCALE_FACTOR: 0.0005, // how much objects shrink with distance

    // Visual
    DEPTH_SHADING_ENABLED: true,
    DEPTH_SHADING_FACTOR: 0.3, // 0-1, how much darker distant objects are

    // Colors (can be customized later)
    COLOR_BACKGROUND: '#1a1a2e',
    COLOR_TRACK: '#2d2d44',
    COLOR_LANE_LINE: '#4a4a6a',
    COLOR_PLAYER: '#00ff88',
    COLOR_GATE_POSITIVE: '#00aaff',
    COLOR_GATE_NEGATIVE: '#ff4444',
    COLOR_GATE_TEXT: '#ffffff',
    COLOR_HUD_TEXT: '#ffffff',
};

// Computed values (derived from above parameters)
export const ComputedValues = {
    // Lane positions in world X coordinates
    get LANE_POSITIONS() {
        const positions = [];
        for (let i = 0; i < GameParameters.LANE_COUNT; i++) {
            positions.push(GameParameters.LANE_OFFSET + (i * GameParameters.LANE_SPACING));
        }
        return positions;
    },

    // Boundary limits for player movement
    get PLAYER_MIN_X() {
        return -GameParameters.TRACK_WIDTH / 2 + GameParameters.PLAYER_RADIUS;
    },
    get PLAYER_MAX_X() {
        return GameParameters.TRACK_WIDTH / 2 - GameParameters.PLAYER_RADIUS;
    },
};

// Log parameters on load for debugging
console.log('GameParameters loaded:', GameParameters);
console.log('Lane positions:', ComputedValues.LANE_POSITIONS);
console.log('Player X boundaries:', ComputedValues.PLAYER_MIN_X, 'to', ComputedValues.PLAYER_MAX_X);
