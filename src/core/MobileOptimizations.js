/**
 * Mobile Performance Optimizations
 * Reduces animation complexity and improves performance on mobile devices
 */

// Detect if user is on mobile
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
    || window.innerWidth <= 768;
};

// Detect if device has low performance
export const isLowEndDevice = () => {
  // Check for low memory
  if (navigator.deviceMemory && navigator.deviceMemory <= 4) return true;
  
  // Check for low CPU cores
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) return true;
  
  // Check connection speed
  if (navigator.connection) {
    const connection = navigator.connection;
    if (connection.saveData) return true;
    if (connection.effectiveType && ['slow-2g', '2g', '3g'].includes(connection.effectiveType)) return true;
  }
  
  return false;
};

// Mobile-optimized physics values
export const MOBILE_SLOT_PHYSICS = {
  ACCELERATION: 4000,  // 50% of desktop
  MAX_VELOCITY: 2500,  // 50% of desktop
  DECELERATION: -2000, // Less aggressive deceleration
  BOUNCE_DAMPENING: 0.6, // Higher dampening for quicker settle
  ITEM_HEIGHT: 188,
  TIMING: {
    REGULAR_SPIN: {
      COLUMN_DELAY: 150,  // Faster column starts
      BASE_DURATION: 600, // Shorter duration
      DECELERATION_TIME: 300,
    },
    FINAL_SPIN: {
      COLUMN_DELAY: 150,
      BASE_DURATION: 1500, // Much shorter final spin
      DECELERATION_TIME: 500,
      COLUMN_STOPS: [1800, 2400, 3000, 3600, 4200], // 40% faster
    },
  },
};

// Reduced visual effects for mobile
export const MOBILE_VISUAL_EFFECTS = {
  // Disable or reduce blur on mobile
  BLUR_ENABLED: false,
  MAX_BLUR: 2, // Max 2px blur instead of 8px
  
  // Reduce glow effects
  GLOW_ENABLED: true,
  GLOW_INTENSITY_MULTIPLIER: 0.5, // 50% intensity
  
  // Reduce particle effects
  PARTICLE_COUNT_MULTIPLIER: 0.3, // 30% of desktop particles
  
  // Disable screen shake on very low-end devices
  SCREEN_SHAKE_ENABLED: !isLowEndDevice(),
  SCREEN_SHAKE_INTENSITY: 0.5, // 50% intensity
};

// Frame rate optimization
export const MOBILE_FRAME_SETTINGS = {
  TARGET_FPS: isLowEndDevice() ? 30 : 45, // 30fps for low-end, 45fps for others
  FRAME_DURATION: isLowEndDevice() ? 33.33 : 22.22,
  SKIP_FRAMES: isLowEndDevice() ? 2 : 1, // Skip every other frame on low-end
};

// Get optimized physics based on device
export const getOptimizedPhysics = () => {
  if (!isMobile()) {
    return null; // Use default desktop physics
  }
  
  return MOBILE_SLOT_PHYSICS;
};

// Get optimized visual settings
export const getOptimizedVisuals = () => {
  if (!isMobile()) {
    return null; // Use default desktop visuals
  }
  
  return MOBILE_VISUAL_EFFECTS;
};

// Performance monitoring
export const performanceMonitor = {
  frameCount: 0,
  lastTime: performance.now(),
  fps: 60,
  
  update() {
    this.frameCount++;
    const currentTime = performance.now();
    const delta = currentTime - this.lastTime;
    
    if (delta >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / delta);
      this.frameCount = 0;
      this.lastTime = currentTime;
      
      // Log low FPS warnings
      if (this.fps < 30 && isMobile()) {
        console.warn(`Low FPS detected on mobile: ${this.fps}fps`);
      }
    }
  },
  
  getFPS() {
    return this.fps;
  }
};

// Throttle function for performance-heavy operations
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Optimize animation loop for mobile
export const optimizedRAF = (callback) => {
  if (!isMobile()) {
    return requestAnimationFrame(callback);
  }
  
  const frameSettings = MOBILE_FRAME_SETTINGS;
  let skipCounter = 0;
  
  const wrappedCallback = (timestamp) => {
    skipCounter++;
    
    // Skip frames on low-end devices
    if (skipCounter % frameSettings.SKIP_FRAMES === 0) {
      callback(timestamp);
    }
    
    requestAnimationFrame(wrappedCallback);
  };
  
  return requestAnimationFrame(wrappedCallback);
};