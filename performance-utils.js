// Performance utilities for The Finals Loadout Generator

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

// Export utilities
window.PerformanceUtils = {
  DOMCache: new DOMCache(),
  EventManager: new EventManager(),
  AnimationManager: new AnimationManager(),
  ImagePreloader: new ImagePreloader(),
  PerformanceMonitor: new PerformanceMonitor(),
  AudioManager: new AudioManager()
};