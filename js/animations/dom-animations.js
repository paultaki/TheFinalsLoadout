/**
 * DOM Animation Module
 * Uses DOM elements instead of canvas for better mobile performance
 */

export class DOMAnimations {
  constructor() {
    this.cache = null;
  }

  /**
   * Initialize with cache
   */
  async init(animationCache) {
    this.cache = animationCache;
    console.log("✅ DOM animations module initialized");
  }

  /**
   * Animate roulette using DOM elements
   */
  async animateRoulette(availableClasses) {
    // Check cache for pre-computed animation
    const cacheKey = this.cache.generateKey("dom-roulette", {
      classes: availableClasses.map((c) => c.name),
    });

    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log("🎲 Using cached roulette animation");
      return cached.winner;
    }

    // Use the existing DOM implementation from roulette-animations.js
    if (window.RouletteAnimations && this.animateClassSelectionDOM) {
      return this.animateClassSelectionDOM(availableClasses);
    }

    // Fallback implementation
    console.log("🎲 Creating DOM-based roulette wheel");

    const animationContainer = document.createElement("div");
    animationContainer.className =
      "roulette-animation-container mobile-dom-wheel";
    animationContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.9);
      z-index: 999999;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    `;

    const title = document.createElement("h2");
    title.textContent = "SELECTING CLASS...";
    title.style.cssText = `
      font-size: 32px;
      color: #ffb700;
      margin-bottom: 20px;
    `;

    const wheelContainer = document.createElement("div");
    wheelContainer.style.cssText = `
      width: 280px;
      height: 280px;
      position: relative;
    `;

    // Create simple wheel
    const wheel = this.createSimpleWheel(availableClasses);
    wheelContainer.appendChild(wheel);

    animationContainer.appendChild(title);
    animationContainer.appendChild(wheelContainer);
    document.body.appendChild(animationContainer);

    // Calculate winner
    const winnerIndex = Math.floor(Math.random() * availableClasses.length);
    const winner = availableClasses[winnerIndex];

    // Cache the result
    this.cache.set(cacheKey, { winner: winner.name, duration: 3000 });

    // Animate
    return new Promise((resolve) => {
      setTimeout(() => {
        const rotation = 720 + winnerIndex * (360 / availableClasses.length);
        wheel.style.transform = `rotate(${rotation}deg)`;
        wheel.style.transition = "transform 3s ease-out";

        setTimeout(() => {
          title.textContent = `${winner.name.toUpperCase()} SELECTED!`;
          title.style.color = winner.color;

          setTimeout(() => {
            document.body.removeChild(animationContainer);
            resolve(winner.name);
          }, 1000);
        }, 3000);
      }, 100);
    });
  }

  /**
   * Create a simple DOM wheel
   */
  createSimpleWheel(classes) {
    const wheel = document.createElement("div");
    wheel.style.cssText = `
      width: 280px;
      height: 280px;
      border-radius: 50%;
      position: relative;
      background: #222;
      overflow: hidden;
    `;

    const segmentAngle = 360 / Math.max(classes.length, 3);

    // Calculate proper skew angle for pie segments
    const skewAngle = 90 - 180 / Math.max(classes.length, 3);

    classes.forEach((cls, index) => {
      const segment = document.createElement("div");
      segment.style.cssText = `
        position: absolute;
        width: 50%;
        height: 50%;
        right: 0;
        bottom: 0;
        transform-origin: 0% 100%;
        transform: rotate(${index * segmentAngle}deg) skewY(${skewAngle}deg);
        background: ${cls.color};
        border: 1px solid rgba(255, 255, 255, 0.2);
        overflow: hidden;
      `;

      const label = document.createElement("div");
      label.textContent = cls.name;
      label.style.cssText = `
        position: absolute;
        top: 20%;
        left: 20%;
        transform: skewY(${-skewAngle}deg) rotate(${segmentAngle / 2}deg);
        color: white;
        font-weight: bold;
        font-size: 12px;
      `;

      segment.appendChild(label);
      wheel.appendChild(segment);
    });

    // Add center
    const center = document.createElement("div");
    center.style.cssText = `
      position: absolute;
      width: 60px;
      height: 60px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #333;
      border-radius: 50%;
      border: 3px solid #ffd700;
      z-index: 10;
    `;
    wheel.appendChild(center);

    // Add pointer
    const pointer = document.createElement("div");
    pointer.style.cssText = `
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-top: 20px solid #ffd700;
      z-index: 20;
    `;
    wheel.appendChild(pointer);

    return wheel;
  }

  /**
   * Create particle effect (disabled for performance)
   */
  createParticleEffect() {
    // No particles in DOM mode
    return null;
  }
}

// Export module
export default new DOMAnimations();
