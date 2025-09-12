/**
 * Mobile-Optimized Animations
 * Lightweight animations for mobile and low-end devices
 */

// Use CSS animations instead of JavaScript for better performance
const MOBILE_CONFIG = {
  SPIN_DURATION: 2000,
  SLOT_DURATION: 1500,
  USE_TRANSFORMS: true,
  USE_WILL_CHANGE: false, // Disabled to save memory
  MAX_PARTICLES: 5, // Reduced from 12
};

/**
 * Lightweight spin animation for mobile
 */
export function startSpinAnimation(element, options = {}) {
  return new Promise((resolve) => {
    if (!element) {
      resolve(null);
      return;
    }

    // Add CSS class for animation
    element.classList.add('mobile-spin-animation');
    
    // Use CSS animation
    element.style.animation = `mobileSpin ${MOBILE_CONFIG.SPIN_DURATION}ms ease-out`;
    
    setTimeout(() => {
      element.classList.remove('mobile-spin-animation');
      element.style.animation = '';
      resolve({ winner: Math.floor(Math.random() * 8) });
    }, MOBILE_CONFIG.SPIN_DURATION);
  });
}

/**
 * Lightweight slot animation for mobile
 */
export function startSlotAnimation(columns, options = {}) {
  return new Promise((resolve) => {
    if (!columns || !columns.length) {
      resolve([]);
      return;
    }

    const results = [];
    
    columns.forEach((column, index) => {
      // Stagger the animations
      setTimeout(() => {
        column.classList.add('mobile-slot-animation');
        column.style.animation = `mobileSlot ${MOBILE_CONFIG.SLOT_DURATION}ms ease-out`;
        
        setTimeout(() => {
          column.classList.remove('mobile-slot-animation');
          column.style.animation = '';
          results.push({ index, value: Math.floor(Math.random() * 10) });
          
          if (results.length === columns.length) {
            resolve(results);
          }
        }, MOBILE_CONFIG.SLOT_DURATION);
      }, index * 200); // Stagger by 200ms
    });
  });
}

/**
 * Lightweight particle effect for mobile
 */
export function createParticleEffect(element) {
  if (!element) return;
  
  // Use fewer particles on mobile
  for (let i = 0; i < MOBILE_CONFIG.MAX_PARTICLES; i++) {
    const particle = document.createElement('div');
    particle.className = 'mobile-particle';
    particle.style.cssText = `
      position: fixed;
      width: 4px;
      height: 4px;
      background: #FFD700;
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      animation: mobileParticle 0.6s ease-out forwards;
    `;
    
    // Position at element center
    const rect = element.getBoundingClientRect();
    particle.style.left = `${rect.left + rect.width / 2}px`;
    particle.style.top = `${rect.top + rect.height / 2}px`;
    particle.style.setProperty('--angle', `${(i / MOBILE_CONFIG.MAX_PARTICLES) * 360}deg`);
    
    document.body.appendChild(particle);
    
    // Clean up after animation
    setTimeout(() => particle.remove(), 600);
  }
}

/**
 * Add mobile-specific CSS animations
 */
function injectMobileStyles() {
  if (document.getElementById('mobile-animations-css')) return;
  
  const style = document.createElement('style');
  style.id = 'mobile-animations-css';
  style.textContent = `
    @keyframes mobileSpin {
      0% { transform: translateY(0); }
      100% { transform: translateY(-200px); }
    }
    
    @keyframes mobileSlot {
      0% { transform: translateY(-100px); opacity: 0; }
      50% { opacity: 1; }
      100% { transform: translateY(0); }
    }
    
    @keyframes mobileParticle {
      0% {
        transform: translate(0, 0) scale(1);
        opacity: 1;
      }
      100% {
        transform: translate(
          calc(cos(var(--angle)) * 30px),
          calc(sin(var(--angle)) * 30px)
        ) scale(0);
        opacity: 0;
      }
    }
    
    .mobile-spin-animation {
      will-change: transform;
    }
    
    .mobile-slot-animation {
      will-change: transform, opacity;
    }
    
    /* Disable complex effects on mobile */
    @media (max-width: 768px) {
      .particle-effect,
      .blur-effect,
      .glow-effect {
        display: none !important;
      }
      
      * {
        backdrop-filter: none !important;
        filter: none !important;
      }
    }
  `;
  
  document.head.appendChild(style);
}

// Auto-inject styles
injectMobileStyles();

// Export for use
export default {
  startSpinAnimation,
  startSlotAnimation,
  createParticleEffect,
  config: MOBILE_CONFIG
};