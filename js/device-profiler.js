/**
 * Device Performance Profiler
 * Detects device capabilities and assigns performance tiers
 */

class DeviceProfiler {
  constructor() {
    this.profile = {
      tier: "unknown",
      features: {},
      benchmarkScore: 0,
      timestamp: Date.now(),
    };

    // Cache key for localStorage
    this.CACHE_KEY = "device_performance_profile";
    this.CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
  }

  /**
   * Get cached profile or run new profiling
   */
  async getProfile() {
    // Check cache first
    const cached = this.getCachedProfile();
    if (cached) {
      console.log("📱 Using cached device profile:", cached);
      return cached;
    }

    // Run profiling
    console.log("📱 Running device performance profiling...");
    await this.runProfiling();

    // Cache the results
    this.cacheProfile();

    return this.profile;
  }

  /**
   * Get cached profile if valid
   */
  getCachedProfile() {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const profile = JSON.parse(cached);
        // Check if cache is still valid
        if (Date.now() - profile.timestamp < this.CACHE_DURATION) {
          return profile;
        }
      }
    } catch (e) {
      console.warn("Failed to read cached profile:", e);
    }
    return null;
  }

  /**
   * Cache the current profile
   */
  cacheProfile() {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.profile));
    } catch (e) {
      console.warn("Failed to cache profile:", e);
    }
  }

  /**
   * Run comprehensive device profiling
   */
  async runProfiling() {
    // 1. Basic device detection
    this.detectBasicFeatures();

    // 2. Hardware capabilities
    this.detectHardware();

    // 3. Network speed estimation
    await this.estimateNetworkSpeed();

    // 4. GPU capabilities
    this.detectGPU();

    // 5. Run performance benchmark
    const benchmarkScore = await this.runBenchmark();
    this.profile.benchmarkScore = benchmarkScore;

    // 6. Determine tier based on all factors
    this.profile.tier = this.calculateTier();

    console.log("📱 Device profile complete:", this.profile);
  }

  /**
   * Detect basic device features
   */
  detectBasicFeatures() {
    this.profile.features = {
      // User agent detection
      isMobile:
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ),
      isIOS: /iPhone|iPad|iPod/i.test(navigator.userAgent),
      isAndroid: /Android/i.test(navigator.userAgent),

      // Screen properties
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      pixelRatio: window.devicePixelRatio || 1,

      // Touch support
      hasTouch: "ontouchstart" in window || navigator.maxTouchPoints > 0,

      // Browser features
      supportsWebGL: this.checkWebGLSupport(),
      supportsWebP: this.checkWebPSupport(),
      supportsPassive: this.checkPassiveSupport(),
    };
  }

  /**
   * Detect hardware capabilities
   */
  detectHardware() {
    // Device memory (Chrome/Edge)
    if ("deviceMemory" in navigator) {
      this.profile.features.deviceMemory = navigator.deviceMemory;
    }

    // CPU cores
    if ("hardwareConcurrency" in navigator) {
      this.profile.features.cpuCores = navigator.hardwareConcurrency;
    }

    // Connection info
    if ("connection" in navigator) {
      const conn = navigator.connection;
      this.profile.features.connection = {
        effectiveType: conn.effectiveType,
        downlink: conn.downlink,
        rtt: conn.rtt,
        saveData: conn.saveData,
      };
    }

    // Battery status
    if ("getBattery" in navigator) {
      navigator
        .getBattery()
        .then((battery) => {
          this.profile.features.batteryLevel = battery.level;
          this.profile.features.batteryCharging = battery.charging;
        })
        .catch(() => {});
    }
  }

  /**
   * Estimate network speed
   */
  async estimateNetworkSpeed() {
    // Skip if save data is enabled
    if (navigator.connection?.saveData) {
      this.profile.features.networkSpeed = "save-data";
      return;
    }

    try {
      // Download a small test image
      const testUrl = "/images/favicon.ico";
      const startTime = performance.now();

      const response = await fetch(testUrl + "?t=" + Date.now(), {
        method: "GET",
        cache: "no-store",
      });

      const blob = await response.blob();
      const endTime = performance.now();

      // Calculate speed in Mbps
      const sizeInBits = blob.size * 8;
      const timeInSeconds = (endTime - startTime) / 1000;
      const speedMbps = sizeInBits / timeInSeconds / 1000000;

      this.profile.features.networkSpeed = speedMbps;

      // Classify network
      if (speedMbps > 10) {
        this.profile.features.networkClass = "fast";
      } else if (speedMbps > 2) {
        this.profile.features.networkClass = "medium";
      } else {
        this.profile.features.networkClass = "slow";
      }
    } catch (e) {
      this.profile.features.networkSpeed = "unknown";
      this.profile.features.networkClass = "unknown";
    }
  }

  /**
   * Detect GPU capabilities
   */
  detectGPU() {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    if (gl) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        this.profile.features.gpu = {
          vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
          renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
        };

        // Classify GPU tier
        const renderer = this.profile.features.gpu.renderer.toLowerCase();
        if (
          renderer.includes("mali-4") ||
          renderer.includes("adreno 3") ||
          renderer.includes("powervr sgx") ||
          renderer.includes("tegra")
        ) {
          this.profile.features.gpuTier = "low";
        } else if (
          renderer.includes("mali-g") ||
          renderer.includes("adreno 5") ||
          renderer.includes("apple")
        ) {
          this.profile.features.gpuTier = "medium";
        } else {
          this.profile.features.gpuTier = "high";
        }
      }

      // Get max texture size
      this.profile.features.maxTextureSize = gl.getParameter(
        gl.MAX_TEXTURE_SIZE
      );
    }
  }

  /**
   * Run performance benchmark
   */
  async runBenchmark() {
    const benchmarks = [];

    // 1. DOM manipulation benchmark
    const domScore = this.benchmarkDOM();
    benchmarks.push(domScore);

    // 2. Canvas rendering benchmark
    const canvasScore = this.benchmarkCanvas();
    benchmarks.push(canvasScore);

    // 3. CSS animation benchmark
    const cssScore = await this.benchmarkCSS();
    benchmarks.push(cssScore);

    // Calculate average score
    const avgScore = benchmarks.reduce((a, b) => a + b, 0) / benchmarks.length;

    return Math.round(avgScore);
  }

  /**
   * DOM manipulation benchmark
   */
  benchmarkDOM() {
    const container = document.createElement("div");
    container.style.display = "none";
    document.body.appendChild(container);

    const startTime = performance.now();
    const iterations = 1000;

    for (let i = 0; i < iterations; i++) {
      const el = document.createElement("div");
      el.className = "benchmark-test";
      el.textContent = "Test " + i;
      container.appendChild(el);
    }

    // Force layout
    container.offsetHeight;

    // Clean up
    container.innerHTML = "";

    const endTime = performance.now();
    document.body.removeChild(container);

    // Score based on operations per second
    const opsPerSecond = iterations / ((endTime - startTime) / 1000);
    return Math.min(100, Math.round(opsPerSecond / 10));
  }

  /**
   * Canvas rendering benchmark
   */
  benchmarkCanvas() {
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");

    const startTime = performance.now();
    const frames = 60;

    for (let i = 0; i < frames; i++) {
      ctx.clearRect(0, 0, 300, 300);

      // Draw circles
      for (let j = 0; j < 20; j++) {
        ctx.beginPath();
        ctx.arc(
          Math.random() * 300,
          Math.random() * 300,
          Math.random() * 30 + 10,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `hsl(${Math.random() * 360}, 50%, 50%)`;
        ctx.fill();
      }
    }

    const endTime = performance.now();
    const fps = frames / ((endTime - startTime) / 1000);

    // Score based on FPS
    return Math.min(100, Math.round(fps * 1.5));
  }

  /**
   * CSS animation benchmark
   */
  async benchmarkCSS() {
    return new Promise((resolve) => {
      const element = document.createElement("div");
      element.style.cssText = `
        position: fixed;
        top: -100px;
        width: 50px;
        height: 50px;
        background: red;
        transition: transform 0.5s linear;
      `;
      document.body.appendChild(element);

      const startTime = performance.now();
      let frameCount = 0;
      let animationId;

      const measureFrames = () => {
        frameCount++;
        if (performance.now() - startTime < 500) {
          animationId = requestAnimationFrame(measureFrames);
        } else {
          // Clean up
          cancelAnimationFrame(animationId);
          document.body.removeChild(element);

          // Score based on achieved FPS
          const fps = frameCount * 2; // 0.5s test
          resolve(Math.min(100, Math.round(fps * 1.5)));
        }
      };

      // Start animation
      requestAnimationFrame(() => {
        element.style.transform = "translateX(300px) rotate(360deg)";
        measureFrames();
      });
    });
  }

  /**
   * Calculate device tier based on all factors
   */
  calculateTier() {
    const { features, benchmarkScore } = this.profile;

    // Automatic low tier for certain conditions
    if (
      features.saveData ||
      features.deviceMemory < 2 ||
      features.cpuCores < 2 ||
      features.gpuTier === "low" ||
      features.networkClass === "slow"
    ) {
      return "low";
    }

    // Score-based tiers
    if (benchmarkScore >= 75) {
      if (features.deviceMemory >= 8 && features.cpuCores >= 6) {
        return "high";
      }
      return "medium";
    } else if (benchmarkScore >= 40) {
      return "medium";
    } else {
      return "low";
    }
  }

  /**
   * Check WebGL support
   */
  checkWebGLSupport() {
    try {
      const canvas = document.createElement("canvas");
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
    } catch (e) {
      return false;
    }
  }

  /**
   * Check WebP support
   */
  checkWebPSupport() {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    return canvas.toDataURL("image/webp").indexOf("image/webp") === 5;
  }

  /**
   * Check passive event listener support
   */
  checkPassiveSupport() {
    let passiveSupported = false;
    try {
      const options = {
        get passive() {
          passiveSupported = true;
          return false;
        },
      };
      window.addEventListener("test", null, options);
      window.removeEventListener("test", null, options);
    } catch (err) {}
    return passiveSupported;
  }
}

// Export for global use
window.DeviceProfiler = DeviceProfiler;
