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
        this.starParallaxFactor = options.starParallaxFactor || 0.1; // Parallax for stars (increased for visibility)

        // Sun settings
        this.sunEnabled = options.sunEnabled !== false; // Enabled by default
        this.sunImage = null;
        this.sunLoaded = false;
        this.sunSize = options.sunSize || 500; // Size in pixels (25% bigger)
        this.sunGlow = options.sunGlow || 40; // Glow blur radius
        this.sunBaseX = options.sunBaseX || 0.5; // Relative position (0-1, 0.5 = centered)
        this.sunBaseY = options.sunBaseY || 0.35; // Relative position (0-1, 0.35 = 35% from top, slightly lower)
        this.sunParallaxFactor = options.sunParallaxFactor || 0.3; // Parallax strength (increased for visibility)

        // Load sun image
        if (this.sunEnabled) {
            this.loadSunImage();
        }

        // Generate stars
        this.stars = this.generateStars();
    }

    /**
     * Load the sun image
     */
    loadSunImage() {
        this.sunImage = new Image();
        this.sunImage.onload = () => {
            this.sunLoaded = true;
        };
        this.sunImage.onerror = () => {
            console.error('Failed to load sun image');
            this.sunEnabled = false;
        };
        this.sunImage.src = './assets/sun.png';
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
     * Update sun glow intensity
     * @param {number} glow - Sun glow blur radius
     */
    setSunGlow(glow) {
        this.sunGlow = glow;
    }

    /**
     * Update sun size
     * @param {number} size - Sun size in pixels
     */
    setSunSize(size) {
        this.sunSize = size;
    }

    /**
     * Update sun parallax factor
     * @param {number} factor - Parallax strength (0 = no movement, higher = more movement)
     */
    setSunParallaxFactor(factor) {
        this.sunParallaxFactor = factor;
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

        // Calculate sun position first (needed to check star occlusion)
        let sunX = this.sunBaseX * ctx.canvas.width;
        let sunY = this.sunBaseY * ctx.canvas.height;
        let sunRadius = this.sunSize / 2;

        // Apply parallax to sun position
        if (camera) {
            const camPos = camera.getPosition();
            sunX += camPos.x * this.sunParallaxFactor * 0.5;
            sunY -= camPos.y * this.sunParallaxFactor;
            const angleDegrees = camPos.angle !== undefined ? camPos.angle : 45;
            const angleOffset = (angleDegrees - 45) * 2;
            sunY -= angleOffset * this.sunParallaxFactor;
        }

        // Draw each star first (background layer), but only if it's above the cutoff line
        // In screen space, "above" means smaller Y values (Y increases downward)
        this.stars.forEach(star => {
            // Calculate star position with parallax
            let starX = star.x;
            let starY = star.y;

            // Apply parallax effect based on camera position and angle
            if (camera) {
                const camPos = camera.getPosition();
                // Stars move with camera movement (creating depth illusion)
                starX += camPos.x * this.starParallaxFactor;
                // Vertical parallax - stars move up when camera moves up
                starY -= camPos.y * this.starParallaxFactor;

                // Angle-based parallax - stars shift vertically based on camera pitch
                // When camera tilts up (increasing angle), stars should move up
                const angleDegrees = camPos.angle !== undefined ? camPos.angle : 45;
                const angleOffset = (angleDegrees - 45) * 2; // Scale the angle effect
                starY -= angleOffset * this.starParallaxFactor;

                // Wrap stars horizontally to create infinite scrolling
                starX = ((starX % ctx.canvas.width) + ctx.canvas.width) % ctx.canvas.width;
            }

            // Skip stars at or below the cutoff
            if (camera && starY >= cutoffY) {
                return; // Skip this star
            }

            // Skip stars that are occluded by the sun
            if (this.sunEnabled && this.sunLoaded) {
                const dx = starX - sunX;
                const dy = starY - sunY;
                const distanceToSun = Math.sqrt(dx * dx + dy * dy);
                if (distanceToSun < sunRadius) {
                    return; // Skip this star - it's behind the sun
                }
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
            ctx.arc(starX, starY, star.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw the sun AFTER stars (foreground layer) - position already calculated above
        if (this.sunEnabled && this.sunLoaded && this.sunImage) {
            // Only draw sun if its center is above the horizon cutoff
            // Skip if the sun center is at or below the cutoff line
            if (camera && sunY >= cutoffY) {
                // Sun is below horizon, skip drawing
            } else {
                ctx.save();

                // Clip to horizon if needed
                if (camera && cutoffY < ctx.canvas.height) {
                    ctx.beginPath();
                    ctx.rect(0, 0, ctx.canvas.width, cutoffY);
                    ctx.clip();
                }

                // Apply glow effect
                if (this.sunGlow > 0) {
                    ctx.shadowBlur = this.sunGlow;
                    ctx.shadowColor = '#ffaa00'; // Orange glow
                }

                // Draw sun image centered at calculated position
                ctx.drawImage(
                    this.sunImage,
                    sunX - sunRadius,
                    sunY - sunRadius,
                    this.sunSize,
                    this.sunSize
                );

                ctx.restore();
            }
        }

        // Restore context state
        ctx.restore();
    }
}
