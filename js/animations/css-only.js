/**
 * CSS-Only Animation Module
 * Minimal animations using only CSS for low-end devices
 */

export class CSSOnlyAnimations {
  constructor() {
    this.cache = null;
    this.initialized = false;
  }

  /**
   * Initialize module with animation cache
   */
  async init(animationCache) {
    this.cache = animationCache;
    this.injectStyles();
    this.initialized = true;
    console.log("✅ CSS-only animations initialized");
  }

  /**
   * Inject optimized CSS animations
   */
  injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      /* Optimized CSS animations for low-end devices */
      
      @keyframes simpleSpinWheel {
        from { transform: rotate(0deg); }
        to { transform: rotate(1080deg); }
      }
      
      @keyframes simpleBallDrop {
        0% { transform: translateY(0); }
        100% { transform: translateY(100px); }
      }
      
      @keyframes fadeInScale {
        from {
          opacity: 0;
          transform: scale(0.8);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      
      @keyframes slideUp {
        from {
          transform: translateY(20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      
      /* Simple roulette wheel */
      .css-roulette-wheel {
        animation: simpleSpinWheel 3s ease-out forwards;
      }
      
      .css-roulette-ball {
        animation: simpleBallDrop 2.5s ease-in-out forwards;
      }
      
      /* Slot machine animations */
      .css-slot-spin {
        animation: slideUp 0.3s ease-out;
      }
      
      /* Disable complex effects */
      .low-tier * {
        box-shadow: none !important;
        text-shadow: none !important;
        filter: none !important;
      }
      
      /* Simple transitions only */
      .low-tier-transition {
        transition: transform 0.2s linear, opacity 0.2s linear;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Animate roulette wheel
   */
  animateRoulette(element, winner, duration = 3000) {
    // Check cache
    const cacheKey = this.cache.generateKey("roulette", { winner, duration });
    const cached = this.cache.get(cacheKey);

    if (cached) {
      return this.applyCachedAnimation(element, cached);
    }

    // Create simple CSS animation
    const rotations = 3;
    const segmentAngle = 360 / 12; // Assuming 12 segments
    const winnerAngle = winner * segmentAngle;
    const totalRotation = rotations * 360 + winnerAngle;

    // Store in cache
    const animationData = {
      className: "css-roulette-wheel",
      style: `transform: rotate(${totalRotation}deg); transition: transform ${duration}ms ease-out;`,
      duration: duration,
    };

    this.cache.set(cacheKey, animationData);

    // Apply animation
    element.classList.add(animationData.className);
    element.style.cssText = animationData.style;

    return new Promise((resolve) => {
      setTimeout(resolve, duration);
    });
  }

  /**
   * Animate slot machine
   */
  animateSlotMachine(columns, spinDuration = 2000) {
    // Simple staggered animations
    columns.forEach((column, index) => {
      const delay = index * 200;
      column.style.transition = `transform ${spinDuration}ms ease-out ${delay}ms`;
      column.classList.add("css-slot-spin");
    });

    return new Promise((resolve) => {
      setTimeout(resolve, spinDuration + columns.length * 200);
    });
  }

  /**
   * Show reveal card
   */
  showRevealCard(options) {
    const card = document.createElement("div");
    card.className = "css-reveal-card low-tier-transition";
    card.innerHTML = `
      <h2>${options.title}</h2>
      <p>${options.subtitle}</p>
    `;

    card.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.8);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 2rem;
      border-radius: 8px;
      text-align: center;
      opacity: 0;
      z-index: 10000;
    `;

    document.body.appendChild(card);

    // Animate in
    requestAnimationFrame(() => {
      card.style.opacity = "1";
      card.style.transform = "translate(-50%, -50%) scale(1)";
    });

    return new Promise((resolve) => {
      setTimeout(() => {
        card.style.opacity = "0";
        card.style.transform = "translate(-50%, -50%) scale(0.8)";

        setTimeout(() => {
          document.body.removeChild(card);
          resolve();
        }, 200);
      }, options.duration || 2000);
    });
  }

  /**
   * Simple particle effect (static images)
   */
  createParticleEffect(element) {
    // Low-end devices don't get particles
    console.log("Particles disabled for low-end devices");
    return null;
  }

  /**
   * Apply cached animation
   */
  applyCachedAnimation(element, animationData) {
    element.className = animationData.className;
    element.style.cssText = animationData.style;

    return new Promise((resolve) => {
      setTimeout(resolve, animationData.duration);
    });
  }

  /**
   * Get optimized timing for device
   */
  getOptimizedTiming(baseDuration) {
    // Always use shorter durations for low-end devices
    return Math.min(baseDuration * 0.6, 3000);
  }
}

// Export module
export default new CSSOnlyAnimations();
