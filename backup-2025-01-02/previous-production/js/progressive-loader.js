/**
 * Progressive Animation Loader
 * Loads animations based on device capability to reduce initial load time
 */

class ProgressiveAnimationLoader {
  constructor() {
    this.deviceProfile = null;
    this.loadedModules = new Map();
  }

  /**
   * Initialize and detect device capabilities
   */
  async init() {
    // Get device profile
    this.deviceProfile = await this.detectDevice();
    
    console.log('📱 Device Profile:', this.deviceProfile);
    
    // Preload critical animations based on device
    if (this.deviceProfile.isMobile || this.deviceProfile.isLowEnd) {
      // Load lightweight mobile animations
      await this.loadMobileAnimations();
    } else {
      // Desktop gets full animations but lazy loaded
      this.setupLazyLoading();
    }
    
    return this.deviceProfile;
  }

  /**
   * Detect device capabilities
   */
  async detectDevice() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const hasTouch = 'ontouchstart' in window;
    const deviceMemory = navigator.deviceMemory || 4; // Default to 4GB if not available
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    
    // Check for low-end device indicators
    const isLowEnd = deviceMemory < 4 || hardwareConcurrency < 4 || 
                     (isMobile && deviceMemory < 6);
    
    // Check connection speed if available
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const isSlowConnection = connection && 
                           (connection.effectiveType === 'slow-2g' || 
                            connection.effectiveType === '2g' ||
                            connection.saveData === true);
    
    return {
      isMobile,
      hasTouch,
      deviceMemory,
      cores: hardwareConcurrency,
      isLowEnd,
      isSlowConnection,
      canUseWebGL: this.checkWebGLSupport(),
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    };
  }

  /**
   * Check WebGL support for advanced effects
   */
  checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch (e) {
      return false;
    }
  }

  /**
   * Load mobile-optimized animations
   */
  async loadMobileAnimations() {
    console.log('📱 Loading mobile animations...');
    
    // Load only essential animations for mobile
    const essentials = await import('./mobile-animations.js').catch(() => {
      console.warn('Mobile animations not found, using fallback');
      return { 
        startSpinAnimation: this.createFallbackAnimation('spin'),
        startSlotAnimation: this.createFallbackAnimation('slot')
      };
    });
    
    this.loadedModules.set('animations', essentials);
    return essentials;
  }

  /**
   * Setup lazy loading for desktop animations
   */
  setupLazyLoading() {
    console.log('💻 Setting up lazy loading for desktop...');
    
    // Create lazy loaders for each animation system
    window.animationLoaders = {
      // Load spin wheel on demand
      loadSpinWheel: async () => {
        if (!this.loadedModules.has('spinWheel')) {
          console.log('⏳ Loading spin wheel animation...');
          const module = await import('./overlay-manager.js');
          this.loadedModules.set('spinWheel', module);
        }
        return this.loadedModules.get('spinWheel');
      },
      
      // Load slot machine on demand
      loadSlotMachine: async () => {
        if (!this.loadedModules.has('slotMachine')) {
          console.log('⏳ Loading slot machine animation...');
          const [engine, machine] = await Promise.all([
            import('../src/animation/AnimationEngine.js'),
            import('./slot-machine.js')
          ]);
          this.loadedModules.set('slotMachine', { engine, machine });
        }
        return this.loadedModules.get('slotMachine');
      },
      
      // Load class selector on demand
      loadClassSelector: async () => {
        if (!this.loadedModules.has('classSelector')) {
          console.log('⏳ Loading class selector animation...');
          const module = await import('./class-animation.js');
          this.loadedModules.set('classSelector', module);
        }
        return this.loadedModules.get('classSelector');
      }
    };
  }

  /**
   * Create fallback animation for low-end devices
   */
  createFallbackAnimation(type) {
    return function fallbackAnimation(elements, options = {}) {
      console.log(`🎯 Using fallback ${type} animation`);
      
      // Simple CSS-based animation fallback
      elements.forEach(el => {
        el.style.transition = 'transform 0.5s ease-out';
        el.style.transform = 'translateY(100px)';
        
        setTimeout(() => {
          el.style.transform = 'translateY(0)';
        }, 500);
      });
      
      return new Promise(resolve => {
        setTimeout(resolve, 1000);
      });
    };
  }

  /**
   * Preload animation for better performance
   */
  async preloadAnimation(animationType) {
    if (this.deviceProfile.isLowEnd) {
      return; // Don't preload on low-end devices
    }
    
    switch (animationType) {
      case 'spin':
        await window.animationLoaders?.loadSpinWheel?.();
        break;
      case 'slot':
        await window.animationLoaders?.loadSlotMachine?.();
        break;
      case 'class':
        await window.animationLoaders?.loadClassSelector?.();
        break;
    }
  }

  /**
   * Get appropriate animation based on device
   */
  getAnimation(type) {
    if (this.deviceProfile.isLowEnd || this.deviceProfile.prefersReducedMotion) {
      return this.createFallbackAnimation(type);
    }
    
    return this.loadedModules.get(type) || null;
  }
}

// Create and export singleton instance
const progressiveLoader = new ProgressiveAnimationLoader();

// Auto-initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => progressiveLoader.init());
} else {
  progressiveLoader.init();
}

export default progressiveLoader;

// Also expose globally for non-module scripts
window.progressiveLoader = progressiveLoader;