/**
 * Smooth Glowing Cursor Tail Effect
 * Seamless gradient tail that fades out
 * Matches The Finals Loadout Vegas theme (pink/purple)
 */

(function() {
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 9999;
        width: 100%;
        height: 100%;
    `;
    document.body.appendChild(canvas);

    // Initialize canvas
    const ctx = canvas.getContext('2d');
    let canvasWidth = window.innerWidth;
    let canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Trail points - stores cursor history
    const trailPoints = [];
    const maxTrailLength = 12; // Length of the tail (shorter, snappier)
    let fadeOutTimer = null; // Timer to clear trail when cursor stops

    // Configuration - Vegas theme
    const config = {
        trailWidth: 3, // Base width of the trail
        glowSize: 20, // Glow radius
        fadeOutDelay: 150, // Milliseconds before trail disappears when cursor stops
        colors: {
            primary: '#ff3366',   // Hot pink
            secondary: '#9c27b0', // Purple
        }
    };

    // Convert hex to RGB
    function hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
    }

    // Interpolate between two colors
    function interpolateColor(color1, color2, factor) {
        const c1 = hexToRgb(color1);
        const c2 = hexToRgb(color2);

        const r = Math.round(c1.r + (c2.r - c1.r) * factor);
        const g = Math.round(c1.g + (c2.g - c1.g) * factor);
        const b = Math.round(c1.b + (c2.b - c1.b) * factor);

        return { r, g, b };
    }

    // Draw smooth curve through points
    function drawSmoothTail() {
        if (trailPoints.length < 2) return;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Draw each segment with gradient opacity
        for (let i = 0; i < trailPoints.length - 1; i++) {
            const point = trailPoints[i];
            const nextPoint = trailPoints[i + 1];

            // Calculate opacity based on position in trail (fade toward tail)
            const opacity = (i / trailPoints.length);

            // Calculate width that tapers toward the tail
            const width = config.trailWidth * opacity;

            // Color interpolation from pink to purple along the trail
            const colorFactor = i / trailPoints.length;
            const color = interpolateColor(config.colors.primary, config.colors.secondary, colorFactor);

            // Draw glow layer
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(nextPoint.x, nextPoint.y);
            ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.3})`;
            ctx.lineWidth = width + config.glowSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.shadowBlur = 15;
            ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
            ctx.stroke();

            // Draw core trail
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(nextPoint.x, nextPoint.y);
            ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
            ctx.lineWidth = width + 2;
            ctx.shadowBlur = 10;
            ctx.stroke();

            // Draw bright center line
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(nextPoint.x, nextPoint.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
            ctx.lineWidth = width;
            ctx.shadowBlur = 5;
            ctx.shadowColor = `rgba(255, 255, 255, ${opacity})`;
            ctx.stroke();
        }

        // Reset shadow
        ctx.shadowBlur = 0;
    }

    // Mouse move handler
    function handleMouseMove(e) {
        // Clear any existing fade-out timer
        if (fadeOutTimer) {
            clearTimeout(fadeOutTimer);
        }

        // Add current position to trail
        trailPoints.push({
            x: e.clientX,
            y: e.clientY
        });

        // Limit trail length
        if (trailPoints.length > maxTrailLength) {
            trailPoints.shift();
        }

        // Set timer to clear trail when cursor stops moving
        fadeOutTimer = setTimeout(() => {
            trailPoints.length = 0; // Clear all trail points
        }, config.fadeOutDelay);
    }

    // Touch move handler for mobile
    function handleTouchMove(e) {
        if (e.touches.length > 0) {
            // Clear any existing fade-out timer
            if (fadeOutTimer) {
                clearTimeout(fadeOutTimer);
            }

            trailPoints.push({
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            });

            if (trailPoints.length > maxTrailLength) {
                trailPoints.shift();
            }

            // Set timer to clear trail when touch stops moving
            fadeOutTimer = setTimeout(() => {
                trailPoints.length = 0; // Clear all trail points
            }, config.fadeOutDelay);
        }
    }

    // Window resize handler
    function handleResize() {
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
    }

    // Animation loop
    function animate() {
        drawSmoothTail();
        requestAnimationFrame(animate);
    }

    // Event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('resize', handleResize);

    // Start animation
    animate();

    console.log('✨ Smooth glowing cursor tail activated!');
})();
