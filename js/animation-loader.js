/**
 * Animation System Loader
 * Dynamically loads appropriate animation modules based on device tier
 */

class AnimationLoader {
  constructor() {
    this.loadedModules = new Map();
    this.deviceTier = "unknown";
    this.animationCache = new AnimationCache();
  }

  /**
   * Initialize and load appropriate animation system
   */
  async init() {
    console.log("🎬 Initializing animation loader...");

    // Get device profile
    const profiler = new DeviceProfiler();
    const profile = await profiler.getProfile();
    this.deviceTier = profile.tier;

    console.log(`🎬 Device tier detected: ${this.deviceTier}`);

    // Load appropriate animation modules
    await this.loadModulesForTier(this.deviceTier);

    // Configure global animation settings
    this.configureAnimationSettings(profile);

    return {
      tier: this.deviceTier,
      profile: profile,
      modules: Array.from(this.loadedModules.keys()),
    };
  }

  /**
   * Load animation modules based on device tier
   */
  async loadModulesForTier(tier) {
    switch (tier) {
      case "high":
        await this.loadHighTierModules();
        break;
      case "medium":
        await this.loadMediumTierModules();
        break;
      case "low":
        await this.loadLowTierModules();
        break;
      default:
        await this.loadLowTierModules(); // Safe default
    }
  }

  /**
   * Load modules for high-end devices
   */
  async loadHighTierModules() {
    console.log("🎬 Loading high-tier animation modules...");

    // Load all animation features
    await Promise.all([
      this.loadModule("canvas-physics", () =>
        import("./animations/canvas-physics.js")
      ),
      this.loadModule("particle-effects", () =>
        import("./animations/particle-effects.js")
      ),
      this.loadModule("advanced-transitions", () =>
        import("./animations/advanced-transitions.js")
      ),
      this.loadModule("webgl-renderer", () =>
        import("./animations/webgl-renderer.js")
      ),
    ]);

    // Configure high-tier settings
    this.applyHighTierSettings();
  }

  /**
   * Load modules for medium-tier devices
   */
  async loadMediumTierModules() {
    console.log("🎬 Loading medium-tier animation modules...");

    // Load balanced set of features
    await Promise.all([
      this.loadModule("canvas-physics-lite", () =>
        import("./animations/canvas-physics-lite.js")
      ),
      this.loadModule("css-animations", () =>
        import("./animations/css-animations.js")
      ),
      this.loadModule("simple-particles", () =>
        import("./animations/simple-particles.js")
      ),
    ]);

    // Configure medium-tier settings
    this.applyMediumTierSettings();
  }

  /**
   * Load modules for low-end devices
   */
  async loadLowTierModules() {
    console.log("🎬 Loading low-tier animation modules...");

    // Load minimal features
    await Promise.all([
      this.loadModule("css-only", () => import("./animations/css-only.js")),
      this.loadModule("dom-animations", () =>
        import("./animations/dom-animations.js")
      ),
    ]);

    // Configure low-tier settings
    this.applyLowTierSettings();
  }

  /**
   * Load a single module with error handling
   */
  async loadModule(name, loader) {
    try {
      console.log(`📦 Loading module: ${name}`);
      const module = await loader();
      this.loadedModules.set(name, module);

      // Initialize module if it has an init method
      if (module.init) {
        await module.init(this.animationCache);
      }

      return module;
    } catch (error) {
      console.error(`❌ Failed to load module ${name}:`, error);
      return null;
    }
  }

  /**
   * Configure animation settings based on device profile
   */
  configureAnimationSettings(profile) {
    // Update global state
    if (!window.state) window.state = {};

    window.state.deviceProfile = profile;
    window.state.deviceTier = this.deviceTier;
    window.state.animationQuality = this.getQualityLevel();

    // Configure RAF throttling for low-end devices
    if (this.deviceTier === "low") {
      this.throttleRAF(30); // Cap at 30 FPS
    }
  }

  /**
   * Get animation system for specific feature
   */
  getAnimationSystem(feature) {
    // Map features to modules based on tier
    const featureMap = {
      roulette: this.getRouletteSystem(),
      "slot-machine": this.getSlotMachineSystem(),
      particles: this.getParticleSystem(),
      transitions: this.getTransitionSystem(),
    };

    return featureMap[feature] || null;
  }

  /**
   * Get roulette animation system
   */
  getRouletteSystem() {
    let module;
    switch (this.deviceTier) {
      case "high":
        module = this.loadedModules.get("canvas-physics");
        break;
      case "medium":
        module = this.loadedModules.get("canvas-physics-lite");
        break;
      case "low":
        module = this.loadedModules.get("dom-animations");
        break;
      default:
        module = this.loadedModules.get("css-only");
    }
    
    // Handle ES6 module default exports
    if (module && module.default) {
      return module.default;
    }
    
    return module;
  }

  /**
   * Get slot machine animation system
   */
  getSlotMachineSystem() {
    switch (this.deviceTier) {
      case "high":
        return this.loadedModules.get("advanced-transitions");
      case "medium":
        return this.loadedModules.get("css-animations");
      case "low":
        return this.loadedModules.get("css-only");
      default:
        return this.loadedModules.get("css-only");
    }
  }

  /**
   * Get particle system
   */
  getParticleSystem() {
    switch (this.deviceTier) {
      case "high":
        return this.loadedModules.get("particle-effects");
      case "medium":
        return this.loadedModules.get("simple-particles");
      case "low":
        return null; // No particles on low-end
      default:
        return null;
    }
  }

  /**
   * Get transition system
   */
  getTransitionSystem() {
    switch (this.deviceTier) {
      case "high":
        return this.loadedModules.get("advanced-transitions");
      case "medium":
        return this.loadedModules.get("css-animations");
      case "low":
        return this.loadedModules.get("css-only");
      default:
        return this.loadedModules.get("css-only");
    }
  }

  /**
   * Apply high-tier settings
   */
  applyHighTierSettings() {
    window.animationConfig = {
      particleCount: 10,
      particleDuration: 800,
      wheelSpinDuration: 8000,
      ballDuration: 7500,
      enableBlur: true,
      enableShadows: true,
      enableGlow: true,
      canvasSize: 600,
      frameRate: 60,
      soundQuality: "high",
    };
  }

  /**
   * Apply medium-tier settings
   */
  applyMediumTierSettings() {
    window.animationConfig = {
      particleCount: 5,
      particleDuration: 600,
      wheelSpinDuration: 6000,
      ballDuration: 5500,
      enableBlur: false,
      enableShadows: true,
      enableGlow: false,
      canvasSize: 400,
      frameRate: 30,
      soundQuality: "medium",
    };
  }

  /**
   * Apply low-tier settings
   */
  applyLowTierSettings() {
    window.animationConfig = {
      particleCount: 0,
      particleDuration: 0,
      wheelSpinDuration: 4000,
      ballDuration: 3500,
      enableBlur: false,
      enableShadows: false,
      enableGlow: false,
      canvasSize: 300,
      frameRate: 30,
      soundQuality: "low",
    };
  }

  /**
   * Get quality level string
   */
  getQualityLevel() {
    switch (this.deviceTier) {
      case "high":
        return "ultra";
      case "medium":
        return "balanced";
      case "low":
        return "performance";
      default:
        return "performance";
    }
  }

  /**
   * Throttle requestAnimationFrame to specific FPS
   */
  throttleRAF(targetFPS) {
    const frameTime = 1000 / targetFPS;
    let lastTime = 0;

    const originalRAF = window.requestAnimationFrame;

    window.requestAnimationFrame = function (callback) {
      const currentTime = Date.now();
      const timeToCall = Math.max(0, frameTime - (currentTime - lastTime));

      const id = window.setTimeout(function () {
        lastTime = currentTime + timeToCall;
        callback(currentTime + timeToCall);
      }, timeToCall);

      return id;
    };
  }
}

/**
 * Animation Cache System
 * Stores and reuses animation sequences
 */
class AnimationCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = 50; // Maximum cached animations
    this.maxAge = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get cached animation sequence
   */
  get(key) {
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    // Update access time
    entry.lastAccess = Date.now();
    return entry.data;
  }

  /**
   * Store animation sequence
   */
  set(key, data) {
    // Enforce size limit
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data: data,
      timestamp: Date.now(),
      lastAccess: Date.now(),
    });
  }

  /**
   * Generate cache key
   */
  generateKey(type, params) {
    return `${type}_${JSON.stringify(params)}`;
  }

  /**
   * Evict oldest entry
   */
  evictOldest() {
    let oldestKey = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache) {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Clear all cached animations
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      entries: Array.from(this.cache.keys()),
    };
  }
}

// Export for global use
window.AnimationLoader = AnimationLoader;
window.AnimationCache = AnimationCache;
