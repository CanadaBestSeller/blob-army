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
        this.starParallaxFactor = options.starParallaxFactor || 0.04; // Parallax for stars

        // Sun settings
        this.sunEnabled = options.sunEnabled !== false; // Enabled by default
        this.sunImage = null;
        this.sunLoaded = false;
        this.sunSize = options.sunSize || 600; // Size in pixels
        this.sunGlow = options.sunGlow || 100; // Glow blur radius
        this.sunBaseX = options.sunBaseX || 0.5; // Relative position (0-1, 0.5 = centered)
        this.sunBaseY = options.sunBaseY || 0.33; // Relative position (0-1, 0.33 = 33% from top)
        this.sunParallaxFactor = options.sunParallaxFactor || 0.3; // Parallax strength (increased for visibility)

        // Mountain settings
        this.mountainEnabled = options.mountainEnabled !== false; // Enabled by default
        this.mountainImage = null;
        this.mountainLoaded = false;
        this.mountainWidth = options.mountainWidth || 1800; // Width in pixels (increased for visibility)
        this.mountainHeight = options.mountainHeight || 614; // Height in pixels (calculated from 3000x1023 ratio: 1800 * (1023/3000) ≈ 614)
        this.mountainGlow = options.mountainGlow || 150; // Glow blur radius (increased for visibility)
        this.mountainBaseX = options.mountainBaseX || 0.5; // Relative position (0-1, 0.5 = centered)
        this.mountainBaseY = options.mountainBaseY || 0.40; // Relative position (0-1, closer to sun)
        this.mountainYOffset = options.mountainYOffset || -50; // Vertical offset in pixels (negative = move up)
        this.mountainParallaxFactor = options.mountainParallaxFactor || 0.6; // More parallax than sun (increased from 0.5)

        // Galaxy/Aurora gradient settings
        this.galaxyEnabled = options.galaxyEnabled !== false; // Enabled by default
        this.galaxyLayers = this.generateGalaxyLayers();
        this.galaxyAnimationTime = 0; // Animation time counter

        // Load sun image
        if (this.sunEnabled) {
            this.loadSunImage();
        }

        // Load mountain image
        if (this.mountainEnabled) {
            this.loadMountainImage();
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
            console.log('Sun image loaded successfully');
        };
        this.sunImage.onerror = (error) => {
            console.error('Failed to load sun image:', error);
            console.error('Attempted path:', new URL('../assets/sun.png', import.meta.url).href);
            this.sunEnabled = false;
        };
        // Use import.meta.url to create absolute path from module location
        this.sunImage.src = new URL('../assets/sun.png', import.meta.url).href;
        console.log('Loading sun image from:', this.sunImage.src);
    }

    /**
     * Load the mountain image
     */
    loadMountainImage() {
        this.mountainImage = new Image();
        this.mountainImage.onload = () => {
            this.mountainLoaded = true;
            console.log('Mountain image loaded successfully');
        };
        this.mountainImage.onerror = (error) => {
            console.error('Failed to load mountain image:', error);
            console.error('Attempted path:', new URL('../assets/mountain.png', import.meta.url).href);
            this.mountainEnabled = false;
        };
        // Use import.meta.url to create absolute path from module location
        this.mountainImage.src = new URL('../assets/mountain.png', import.meta.url).href;
        console.log('Loading mountain image from:', this.mountainImage.src);
    }

    /**
     * Generate galaxy/aurora gradient layers
     * @returns {Array} Array of layer objects
     */
    generateGalaxyLayers() {
        return [
            {
                // Purple/magenta wispy cloud
                colors: ['rgba(138, 43, 226, 0.25)', 'rgba(186, 85, 211, 0.15)', 'rgba(138, 43, 226, 0)'],
                stops: [0, 0.3, 1],
                offsetX: 0.2,
                offsetY: 0.3,
                speed: 0.15,
                scale: 0.4,
                compositeMode: 'screen'
            },
            {
                // Blue/cyan wispy cloud
                colors: ['rgba(0, 191, 255, 0.2)', 'rgba(30, 144, 255, 0.12)', 'rgba(0, 191, 255, 0)'],
                stops: [0, 0.35, 1],
                offsetX: 0.7,
                offsetY: 0.2,
                speed: 0.1,
                scale: 0.5,
                compositeMode: 'screen'
            },
            {
                // Pink/rose wispy cloud
                colors: ['rgba(255, 20, 147, 0.18)', 'rgba(255, 105, 180, 0.1)', 'rgba(255, 20, 147, 0)'],
                stops: [0, 0.3, 1],
                offsetX: 0.5,
                offsetY: 0.6,
                speed: 0.2,
                scale: 0.45,
                compositeMode: 'screen'
            },
            {
                // Teal/green accent
                colors: ['rgba(64, 224, 208, 0.15)', 'rgba(72, 209, 204, 0.08)', 'rgba(64, 224, 208, 0)'],
                stops: [0, 0.25, 1],
                offsetX: 0.8,
                offsetY: 0.7,
                speed: 0.12,
                scale: 0.35,
                compositeMode: 'screen'
            }
        ];
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
     * Update sun base Y position
     * @param {number} yPosition - Y position (0-1, where 0 is top and 1 is bottom)
     */
    setSunBaseY(yPosition) {
        this.sunBaseY = yPosition;
    }

    /**
     * Update star parallax factor
     * @param {number} factor - Parallax strength (0 = no movement, higher = more movement)
     */
    setStarParallaxFactor(factor) {
        this.starParallaxFactor = factor;
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
        // Update animation time
        this.galaxyAnimationTime += 0.01;

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

        // Draw galaxy/aurora gradient layers (deepest background)
        if (this.galaxyEnabled) {
            this.galaxyLayers.forEach(layer => {
                ctx.save();

                // Set composite mode for blending
                ctx.globalCompositeOperation = layer.compositeMode || 'screen';

                // Calculate animated position for this layer
                const animOffset = Math.sin(this.galaxyAnimationTime * layer.speed) * 150;
                const animOffsetY = Math.cos(this.galaxyAnimationTime * layer.speed * 0.7) * 100;
                const centerX = (layer.offsetX * ctx.canvas.width) + animOffset;
                const centerY = (layer.offsetY * ctx.canvas.height) + animOffsetY;

                // Create radial gradient - smaller, more concentrated
                const radius = Math.max(ctx.canvas.width, ctx.canvas.height) * layer.scale;
                const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);

                // Add color stops
                layer.stops.forEach((stop, i) => {
                    gradient.addColorStop(stop, layer.colors[i]);
                });

                // Draw gradient
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

                ctx.restore();
            });
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

        // Reset global alpha after drawing stars
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;

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

        // Draw the mountain AFTER sun (in front of sun) - with more parallax
        if (this.mountainEnabled && this.mountainLoaded && this.mountainImage) {
            // Calculate mountain position (center point)
            let mountainX = this.mountainBaseX * ctx.canvas.width;
            let mountainY = this.mountainBaseY * ctx.canvas.height + this.mountainYOffset;
            let mountainHalfWidth = this.mountainWidth / 2;
            let mountainHalfHeight = this.mountainHeight / 2;

            // Apply parallax to mountain position (more than sun)
            if (camera) {
                const camPos = camera.getPosition();
                mountainX += camPos.x * this.mountainParallaxFactor * 0.5;
                mountainY -= camPos.y * this.mountainParallaxFactor;
                const angleDegrees = camPos.angle !== undefined ? camPos.angle : 45;
                const angleOffset = (angleDegrees - 45) * 2;
                mountainY -= angleOffset * this.mountainParallaxFactor;
            }

            // Draw the mountain (always draw for now, clipping will handle horizon)
            ctx.save();

            // Clip to horizon if needed
            if (camera && cutoffY < ctx.canvas.height) {
                ctx.beginPath();
                ctx.rect(0, 0, ctx.canvas.width, cutoffY);
                ctx.clip();
            }

            // Apply glow effect
            if (this.mountainGlow > 0) {
                ctx.shadowBlur = this.mountainGlow;
                ctx.shadowColor = '#4060ff'; // More blue glow
            }

            // Draw mountain image centered at calculated position
            ctx.drawImage(
                this.mountainImage,
                mountainX - mountainHalfWidth,
                mountainY - mountainHalfHeight,
                this.mountainWidth,
                this.mountainHeight
            );

            ctx.restore();
        }

        // Restore context state
        ctx.restore();
    }
}
