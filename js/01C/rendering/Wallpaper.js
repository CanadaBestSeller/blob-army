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
     */
    draw(ctx) {
        // Save context state
        ctx.save();

        // Draw each star
        this.stars.forEach(star => {
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
