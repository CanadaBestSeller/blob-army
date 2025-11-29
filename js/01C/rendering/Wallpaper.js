/**
 * Wallpaper.js
 * Renders a static star field background
 */

export class Wallpaper {
    /**
     * Create a new Wallpaper
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @param {Object} options - Configuration options
     */
    constructor(width, height, options = {}) {
        this.width = width;
        this.height = height;

        // Star generation settings
        this.starCount = options.starCount || 200;
        this.starSizeMin = options.starSizeMin || 1;
        this.starSizeMax = options.starSizeMax || 3;
        this.glowIntensity = options.glowIntensity || 10; // Glow blur radius

        // Generate stars
        this.stars = this.generateStars();
    }

    /**
     * Generate random stars
     * @returns {Array} Array of star objects
     */
    generateStars() {
        const stars = [];

        for (let i = 0; i < this.starCount; i++) {
            stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: this.starSizeMin + Math.random() * (this.starSizeMax - this.starSizeMin),
                brightness: 0.3 + Math.random() * 0.7, // 30% to 100% brightness
                color: this.getStarColor()
            });
        }

        return stars;
    }

    /**
     * Get a random star color (mostly white, some with slight tint)
     * @returns {string} CSS color string
     */
    getStarColor() {
        const colorType = Math.random();

        if (colorType < 0.7) {
            // 70% pure white
            return '#ffffff';
        } else if (colorType < 0.85) {
            // 15% slight blue tint
            return '#d4e4ff';
        } else {
            // 15% slight yellow tint
            return '#fffad4';
        }
    }

    /**
     * Update glow intensity
     * @param {number} intensity - Glow blur radius
     */
    setGlowIntensity(intensity) {
        this.glowIntensity = intensity;
    }

    /**
     * Resize wallpaper (regenerates stars for new dimensions)
     * @param {number} width - New canvas width
     * @param {number} height - New canvas height
     */
    resize(width, height) {
        this.width = width;
        this.height = height;
        this.stars = this.generateStars();
    }

    /**
     * Draw the wallpaper
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
     * @param {Camera} camera - Camera object (optional, used to calculate horizon)
     */
    draw(ctx, camera = null) {
        // Save context state
        ctx.save();

        // Calculate where the farthest visible horizontal marker appears on screen
        let cutoffY = ctx.canvas.height; // Default to bottom of screen
        if (camera) {
            const camPos = camera.getPosition();
            const angleDegrees = camera.angle !== undefined ? camera.angle : 45;
            const cameraAngle = (angleDegrees * Math.PI) / 180;

            // Match Track.js logic: farthest marker is at camera.z + 5000
            const farthestZ = camPos.z + 5000;

            // The horizontal marker is at Y=0 (ground level) at this Z position
            // Calculate where this point projects to on screen
            const worldY = 0; // Horizontal markers are at Y=0

            const relY = -(worldY - camPos.y); // Camera-relative Y
            const relZ = farthestZ - camPos.z; // Camera-relative Z

            // Apply camera rotation (same as project() function)
            const rotatedY = relY * Math.cos(cameraAngle) - relZ * Math.sin(cameraAngle);
            const rotatedZ = relY * Math.sin(cameraAngle) + relZ * Math.cos(cameraAngle);

            // Perspective projection (same as project() function)
            const perspectiveDistance = 400;
            const scale = perspectiveDistance / Math.max(rotatedZ, 1);
            const screenY = -rotatedY * scale;

            // Convert to absolute screen coordinates (center of canvas)
            // This matches how Track.js draws: center.y - projectedY
            // So we want: center.y - screenY, which is the same as center.y + (-screenY)
            // But project() returns screenY with the negation already applied
            // So the final screen position is: center.y - screenY (as in Track.js line 84)
            cutoffY = ctx.canvas.height / 2 - screenY;

            // Store debug info for HUD display
            this.debugInfo = {
                cameraY: camPos.y,
                cameraAngle: angleDegrees,
                horizonScreenY: cutoffY,
                farthestMarkerZ: farthestZ,
                canvasHeight: ctx.canvas.height
            };
        }

        // Draw each star, but only if it's above the cutoff line
        // In screen space, "above" means smaller Y values (Y increases downward)
        this.stars.forEach(star => {
            // Skip stars at or below the cutoff
            if (camera && star.y >= cutoffY) {
                return; // Skip this star
            }

            ctx.beginPath();

            // Apply glow effect
            if (this.glowIntensity > 0) {
                ctx.shadowBlur = this.glowIntensity;
                ctx.shadowColor = star.color;
            }

            // Set star color with brightness
            ctx.fillStyle = star.color;
            ctx.globalAlpha = star.brightness;

            // Draw star as a circle
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Restore context state
        ctx.restore();
    }
}
