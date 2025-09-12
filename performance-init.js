// Performance initialization script
// This integrates performance optimizations without changing the visual experience

document.addEventListener("DOMContentLoaded", function () {
  // Only run if performance utils are loaded
  if (!window.PerformanceUtils) return;

  const { DOMCache, EventManager, AudioManager, ImagePreloader } =
    window.PerformanceUtils;

  // Preload critical audio files
  const audioFiles = [
    "clickSound",
    "tickSound",
    "classWinSound",
    "spinWinSound",
    "spinningSound",
    "transitionSound",
    "finalSound",
  ];

  audioFiles.forEach((id) => AudioManager.preload(id));

  // Cache frequently accessed DOM elements
  const domElements = [
    "#main-spin-button",
    "#output",
    "#selection-display",
    "#history-list",
    "#filter-panel",
    ".selection-container",
  ];

  domElements.forEach((selector) => DOMCache.get(selector));

  // Optimize scroll-based animations with throttling
  let scrollTimeout;
  const handleScroll = () => {
    if (scrollTimeout) return;

    scrollTimeout = setTimeout(() => {
      scrollTimeout = null;
      // Handle scroll events here if needed
    }, 16); // ~60fps
  };

  // Optimize resize events
  let resizeTimeout;
  const handleResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Handle resize logic here if needed
      DOMCache.clear(); // Clear cache on resize
    }, 250);
  };

  EventManager.add(window, "scroll", handleScroll, { passive: true });
  EventManager.add(window, "resize", handleResize, { passive: true });

  // Preload images for selected class buttons on hover
  const classButtons = document.querySelectorAll(".class-button");
  classButtons.forEach((button) => {
    EventManager.add(button, "mouseenter", function () {
      const activeImg = this.dataset.active;
      if (activeImg) {
        ImagePreloader.preload(activeImg);
      }
    });
  });

  // Optimize mobile performance by reducing animation complexity
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  if (isMobile) {
    // Add mobile optimization class
    document.body.classList.add("mobile-optimized");

    // Set global mobile flag early for roulette optimizations
    window.state = window.state || {};
    window.state.isMobile = true;

    // PHASE 3: Advanced device profiling and dynamic loading
    if (window.DeviceProfiler && window.AnimationLoader) {
      // Run async initialization
      (async () => {
        try {
          console.log(
            "🚀 Starting Phase 3 architecture-level optimizations..."
          );

          // Initialize animation loader with device profiling
          const animationLoader = new AnimationLoader();
          const result = await animationLoader.init();

          // Store globally for access
          window.animationLoader = animationLoader;
          window.deviceTier = result.tier;

          // Add tier class to body
          document.body.classList.add(`device-tier-${result.tier}`);

          // Log results
          console.log("✅ Phase 3 initialization complete:", {
            tier: result.tier,
            modules: result.modules,
            profile: result.profile,
          });

          // Update animation systems to use cached versions
          updateAnimationSystems(animationLoader);
        } catch (error) {
          console.error("❌ Phase 3 initialization failed:", error);
          // Fall back to basic detection
          fallbackToBasicDetection();
        }
      })();
    } else {
      // Fall back to basic detection if Phase 3 modules not loaded
      fallbackToBasicDetection();
    }
  } else {
    // Desktop path - also run profiling for tier detection
    if (window.DeviceProfiler && window.AnimationLoader) {
      (async () => {
        const animationLoader = new AnimationLoader();
        const result = await animationLoader.init();
        window.animationLoader = animationLoader;
        window.deviceTier = result.tier;
        document.body.classList.add(`device-tier-${result.tier}`);
      })();
    }
  }

  // Fallback function for basic detection
  function fallbackToBasicDetection() {
    console.log("📱 Using fallback device detection");

    // Detect low-end devices based on various factors
    const isLowEndDevice = () => {
      // Check device memory if available
      if ("deviceMemory" in navigator && navigator.deviceMemory < 4) {
        return true;
      }

      // Check hardware concurrency (CPU cores)
      if (
        "hardwareConcurrency" in navigator &&
        navigator.hardwareConcurrency < 4
      ) {
        return true;
      }

      // Check connection speed
      if ("connection" in navigator && navigator.connection) {
        const conn = navigator.connection;
        if (conn.effectiveType === "2g" || conn.effectiveType === "slow-2g") {
          return true;
        }
      }

      // Check for older devices by screen resolution and pixel ratio
      const screenArea = window.screen.width * window.screen.height;
      const pixelRatio = window.devicePixelRatio || 1;
      if (screenArea < 786432 && pixelRatio < 2) {
        // Less than 1024x768
        return true;
      }

      // Check for specific older GPU models (via WebGL if available)
      try {
        const canvas = document.createElement("canvas");
        const gl =
          canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if (gl) {
          const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
          if (debugInfo) {
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            // Check for older GPU models
            if (renderer.match(/Mali-4|Adreno 3|PowerVR SGX|Tegra/i)) {
              return true;
            }
          }
        }
      } catch (e) {
        // WebGL not available, assume lower-end device
        return true;
      }

      return false;
    };

    // Apply low-end optimizations if detected
    if (isLowEndDevice()) {
      console.log(
        "📱 Low-end device detected - applying additional optimizations"
      );
      window.state.isLowEndDevice = true;
      document.body.classList.add("low-end-device");

      // Apply more aggressive optimizations
      applyLowEndOptimizations();
    }
  }

  // Update animation systems to use cached and optimized versions
  function updateAnimationSystems(animationLoader) {
    // TEMPORARY: Disable roulette animation override to fix skipping issue
    const ENABLE_ROULETTE_OPTIMIZATION = false;
    
    // Override roulette animations
    if (window.RouletteAnimationSystem && ENABLE_ROULETTE_OPTIMIZATION) {
      const originalAnimate =
        window.RouletteAnimationSystem.prototype.animateClassSelection;
      window.RouletteAnimationSystem.prototype.animateClassSelection =
        async function () {
          // Check if animation loader exists and is properly initialized
          if (animationLoader && animationLoader.getAnimationSystem) {
            try {
              const rouletteSystem =
                animationLoader.getAnimationSystem("roulette");
              // Check if the system has the proper method
              if (
                rouletteSystem &&
                rouletteSystem.animateRoulette &&
                typeof rouletteSystem.animateRoulette === "function"
              ) {
                console.log("🎯 Using optimized roulette animation");
                return rouletteSystem.animateRoulette.apply(this, arguments);
              }
            } catch (error) {
              console.warn(
                "⚠️ Failed to use optimized roulette animation:",
                error
              );
            }
          }
          // Fall back to original
          console.log("🎯 Using original roulette animation");
          return originalAnimate.apply(this, arguments);
        };
    }

    // Override particle effects
    if (window.RouletteAnimationSystem) {
      const originalParticle =
        window.RouletteAnimationSystem.prototype.createParticleEffect;
      window.RouletteAnimationSystem.prototype.createParticleEffect =
        function () {
          const particleSystem =
            animationLoader.getAnimationSystem("particles");
          if (particleSystem && particleSystem.createParticleEffect) {
            return particleSystem.createParticleEffect.apply(this, arguments);
          }
          // Fall back to original or skip
          if (window.deviceTier === "low") {
            return null; // No particles on low-end
          }
          return originalParticle.apply(this, arguments);
        };
    }
  }

  // Apply low-end optimizations
  function applyLowEndOptimizations() {
    // Add performance hints to reduce layout thrashing
    const style = document.createElement("style");
    style.textContent = `
      /* Mobile performance optimizations */
      .roulette-animation-container,
      .overlay-backdrop {
        contain: layout style paint;
      }
      
      /* Reduce repaints during animations */
      .animating * {
        will-change: auto !important;
      }
      
      /* Disable hover effects on mobile */
      @media (hover: none) {
        *:not(svg):not(.wheel-rotating-group):hover {
          transform: none !important;
          box-shadow: none !important;
        }
      }
    `;
    document.head.appendChild(style);

    // Throttle requestAnimationFrame on low-end devices
    if (window.state.isLowEndDevice) {
      const originalRAF = window.requestAnimationFrame;
      let lastTime = 0;
      const targetFPS = 30; // Target 30 FPS on low-end devices
      const frameDelay = 1000 / targetFPS;

      window.requestAnimationFrame = function (callback) {
        const currentTime = Date.now();
        const timeElapsed = currentTime - lastTime;

        if (timeElapsed > frameDelay) {
          lastTime = currentTime;
          return originalRAF(callback);
        } else {
          return setTimeout(() => {
            lastTime = Date.now();
            callback(lastTime);
          }, frameDelay - timeElapsed);
        }
      };
    }
  }

  // Cleanup function for page unload
  window.addEventListener("beforeunload", () => {
    EventManager.removeAll();
    AudioManager.cleanup();
    window.PerformanceUtils.AnimationManager.clear();
  });

  // Log initial performance metrics
  if (
    window.location.hostname === "localhost" ||
    window.location.search.includes("debug")
  ) {
    console.log("Performance optimizations loaded");
    window.PerformanceUtils.PerformanceMonitor.logPerformance();
  }
});
