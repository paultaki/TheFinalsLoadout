// Performance utilities for The Finals Loadout Generator

// Enhanced mobile detection
const DeviceDetector = {
  isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  isTablet: /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent),
  isLowEnd: () => {
    // Detect low-end devices based on hardware capabilities
    const memory = navigator.deviceMemory || 4; // Default to 4GB if not available
    const cores = navigator.hardwareConcurrency || 2; // Default to 2 cores
    return memory <= 2 || cores <= 2;
  },
  isSlowConnection: () => {
    // Use Network Information API if available
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      return connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g';
    }
    return false;
  },
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
};

// DOM Cache Manager
class DOMCache {
  constructor() {
    this.cache = new Map();
  }

  get(selector) {
    if (!this.cache.has(selector)) {
      const element = document.querySelector(selector);
      if (element) {
        this.cache.set(selector, element);
      }
      return element;
    }
    return this.cache.get(selector);
  }

  getAll(selector) {
    const key = `all:${selector}`;
    if (!this.cache.has(key)) {
      const elements = document.querySelectorAll(selector);
      this.cache.set(key, elements);
      return elements;
    }
    return this.cache.get(key);
  }

  clear() {
    this.cache.clear();
  }
}

// Event Listener Manager to prevent memory leaks
class EventManager {
  constructor() {
    this.listeners = new Map();
  }

  add(element, event, handler, options) {
    if (!element) return;
    
    const key = `${element.id || element.className}_${event}`;
    
    // Remove existing listener if it exists
    this.remove(element, event);
    
    // Add new listener
    element.addEventListener(event, handler, options);
    this.listeners.set(key, { element, event, handler, options });
  }

  remove(element, event) {
    if (!element) return;
    
    const key = `${element.id || element.className}_${event}`;
    const listener = this.listeners.get(key);
    
    if (listener) {
      listener.element.removeEventListener(listener.event, listener.handler, listener.options);
      this.listeners.delete(key);
    }
  }

  removeAll() {
    this.listeners.forEach(listener => {
      listener.element.removeEventListener(listener.event, listener.handler, listener.options);
    });
    this.listeners.clear();
  }
}

// Optimized Animation Frame Manager
class AnimationManager {
  constructor() {
    this.animations = new Map();
    this.rafId = null;
    this.isRunning = false;
  }

  add(id, callback) {
    this.animations.set(id, callback);
    if (!this.isRunning) {
      this.start();
    }
  }

  remove(id) {
    this.animations.delete(id);
    if (this.animations.size === 0) {
      this.stop();
    }
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    const animate = (timestamp) => {
      if (!this.isRunning) return;
      
      this.animations.forEach(callback => {
        callback(timestamp);
      });
      
      this.rafId = requestAnimationFrame(animate);
    };
    
    this.rafId = requestAnimationFrame(animate);
  }

  stop() {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  clear() {
    this.stop();
    this.animations.clear();
  }
}

// Image Preloader with lazy loading support
class ImagePreloader {
  constructor() {
    this.loadedImages = new Set();
    this.imageCache = new Map();
  }

  preload(src) {
    if (this.loadedImages.has(src)) {
      return Promise.resolve(this.imageCache.get(src));
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.loadedImages.add(src);
        this.imageCache.set(src, img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  preloadBatch(srcs) {
    return Promise.all(srcs.map(src => this.preload(src)));
  }

  lazyLoadImage(img) {
    if ('loading' in HTMLImageElement.prototype) {
      img.loading = 'lazy';
    } else {
      // Fallback for browsers that don't support native lazy loading
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const image = entry.target;
              image.src = image.dataset.src;
              image.classList.remove('lazy');
              imageObserver.unobserve(image);
            }
          });
        });
        imageObserver.observe(img);
      }
    }
  }
}

// Performance monitoring
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      animationFrames: [],
      lastFrameTime: 0
    };
  }

  measureFPS() {
    const now = performance.now();
    const delta = now - this.metrics.lastFrameTime;
    this.metrics.lastFrameTime = now;
    
    this.metrics.animationFrames.push(delta);
    if (this.metrics.animationFrames.length > 60) {
      this.metrics.animationFrames.shift();
    }
    
    const avgDelta = this.metrics.animationFrames.reduce((a, b) => a + b, 0) / this.metrics.animationFrames.length;
    return Math.round(1000 / avgDelta);
  }

  logPerformance() {
    if ('performance' in window && 'memory' in performance) {
      console.log('Memory Usage:', {
        usedJSHeapSize: `${(performance.memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
        totalJSHeapSize: `${(performance.memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
        jsHeapSizeLimit: `${(performance.memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
      });
    }
  }
}

// Audio Manager for better audio handling
class AudioManager {
  constructor() {
    this.audioCache = new Map();
    this.activeAudios = new Set();
  }

  preload(id) {
    const audio = document.getElementById(id);
    if (audio && !this.audioCache.has(id)) {
      // Clone the audio element for reuse
      const clone = audio.cloneNode(true);
      this.audioCache.set(id, clone);
    }
  }

  play(id, volume = 1.0) {
    try {
      const audio = this.audioCache.get(id) || document.getElementById(id);
      if (audio) {
        audio.currentTime = 0;
        audio.volume = Math.min(Math.max(volume, 0), 1);
        
        // Track active audio for cleanup
        this.activeAudios.add(audio);
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log('Audio play failed:', error);
          });
        }
        
        // Auto-cleanup when audio ends
        audio.addEventListener('ended', () => {
          this.activeAudios.delete(audio);
        }, { once: true });
      }
    } catch (error) {
      console.error('Audio play error:', error);
    }
  }

  stopAll() {
    this.activeAudios.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.activeAudios.clear();
  }

  cleanup() {
    this.stopAll();
    this.audioCache.clear();
  }
}

// CSS Animation Replacer - Convert JS animations to CSS where possible
class CSSAnimationReplacer {
  constructor() {
    this.replacements = new Map();
  }

  // Replace JavaScript transform animations with CSS classes
  replaceTransformAnimation(element, properties) {
    if (DeviceDetector.isMobile || DeviceDetector.isLowEnd()) {
      // Use simplified CSS animations on mobile/low-end devices
      const animationClass = this.createOptimizedCSSAnimation(properties);
      element.classList.add(animationClass);
      return animationClass;
    }
    return null;
  }

  createOptimizedCSSAnimation(properties) {
    const animationId = `opt-anim-${Math.random().toString(36).substr(2, 9)}`;
    const duration = DeviceDetector.isMobile ? '0.3s' : '0.6s';
    
    const style = document.createElement('style');
    style.textContent = `
      .${animationId} {
        animation: ${animationId}-keyframes ${duration} ease-out;
        transform: ${properties.transform || 'none'};
      }
      
      @keyframes ${animationId}-keyframes {
        from { 
          transform: ${properties.from || 'scale(1)'}; 
          opacity: ${properties.fromOpacity || '1'};
        }
        to { 
          transform: ${properties.to || 'scale(1.05)'}; 
          opacity: ${properties.toOpacity || '1'};
        }
      }
    `;
    
    document.head.appendChild(style);
    this.replacements.set(animationId, style);
    return animationId;
  }

  cleanup() {
    this.replacements.forEach((style, id) => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    });
    this.replacements.clear();
  }
}

// Adaptive Performance Manager
class AdaptivePerformanceManager {
  constructor() {
    this.performanceLevel = this.detectPerformanceLevel();
    this.applyOptimizations();
  }

  detectPerformanceLevel() {
    let score = 100;
    
    // Reduce score based on device capabilities
    if (DeviceDetector.isMobile) score -= 30;
    if (DeviceDetector.isLowEnd()) score -= 40;
    if (DeviceDetector.isSlowConnection()) score -= 20;
    if (DeviceDetector.reducedMotion) score -= 10;
    
    // Return performance tier
    if (score >= 80) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }

  applyOptimizations() {
    console.log(`🔧 Applying ${this.performanceLevel} performance optimizations`);
    
    const style = document.createElement('style');
    style.id = 'adaptive-performance-styles';
    
    let optimizations = '';
    
    if (this.performanceLevel === 'low') {
      optimizations += `
        * {
          animation-duration: 0.2s !important;
          transition-duration: 0.1s !important;
        }
        
        .high-speed-blur,
        .extreme-blur,
        .velocity-blur {
          filter: none !important;
        }
        
        .particle,
        .celebration-animation {
          display: none !important;
        }
      `;
    } else if (this.performanceLevel === 'medium') {
      optimizations += `
        * {
          animation-duration: 0.4s !important;
          transition-duration: 0.2s !important;
        }
        
        .extreme-blur {
          filter: blur(2px) !important;
        }
      `;
    }
    
    style.textContent = optimizations;
    document.head.appendChild(style);
  }
}

// Export utilities
window.PerformanceUtils = {
  DOMCache: new DOMCache(),
  EventManager: new EventManager(),
  AnimationManager: new AnimationManager(),
  ImagePreloader: new ImagePreloader(),
  PerformanceMonitor: new PerformanceMonitor(),
  AudioManager: new AudioManager(),
  CSSAnimationReplacer: new CSSAnimationReplacer(),
  AdaptivePerformanceManager: new AdaptivePerformanceManager()
};

// Export device detector globally
window.DeviceDetector = DeviceDetector;