# Phase 3 Architecture-Level Enhancements - Test Plan

## Overview

This test plan covers validation of the Phase 3 mobile optimization features including device profiling, dynamic module loading, and animation caching.

## Test Environment Setup

### Browser Testing

1. **Chrome DevTools**

   - Enable Device Mode
   - Test with various device profiles
   - Enable CPU throttling (4x, 6x slowdown)
   - Enable network throttling (Slow 3G, Fast 3G)

2. **Real Device Testing**
   - Low-tier: Galaxy A12, Moto G7
   - Mid-tier: iPhone SE 2nd Gen, Pixel 4a
   - High-tier: iPhone 14, Galaxy S23

### Feature Flags

```javascript
// Force specific tier for testing
window.debugDeviceTier = "low"; // 'low', 'medium', 'high'

// Disable caching for testing
window.disableAnimationCache = true;

// Force profiler to run (bypass cache)
localStorage.removeItem("device_performance_profile");
```

## Test Cases

### 1. Device Profiler Tests

#### TC-1.1: Profile Detection Accuracy

**Steps:**

1. Clear localStorage
2. Load the site on test device
3. Open console and check profiler output

**Expected:**

- Profile completes within 3 seconds
- Correct tier assignment based on device
- All hardware features detected
- Benchmark scores reasonable (0-100)

#### TC-1.2: Profile Caching

**Steps:**

1. Load site and let profiler run
2. Refresh page
3. Check if cached profile is used

**Expected:**

- Second load uses cached profile
- No benchmarks run on cached load
- Cache expires after 7 days

#### TC-1.3: Network Speed Detection

**Steps:**

1. Test on various network speeds
2. Check detected speed classification

**Expected:**

- Fast: >10 Mbps
- Medium: 2-10 Mbps
- Slow: <2 Mbps
- Save-data mode detected

### 2. Module Loading Tests

#### TC-2.1: Tier-Based Loading

**Steps:**

1. Force each tier using debug flag
2. Check which modules are loaded

**Expected High-Tier:**

- canvas-physics.js loaded
- particle-effects.js loaded
- advanced-transitions.js loaded
- webgl-renderer.js loaded

**Expected Medium-Tier:**

- canvas-physics-lite.js loaded
- css-animations.js loaded
- simple-particles.js loaded

**Expected Low-Tier:**

- css-only.js loaded
- dom-animations.js loaded
- No particle modules

#### TC-2.2: Module Initialization

**Steps:**

1. Check console for module init messages
2. Verify no loading errors

**Expected:**

- All modules initialize successfully
- Animation cache passed to modules
- No 404 errors in network tab

#### TC-2.3: Fallback Handling

**Steps:**

1. Block animation module files
2. Test if system falls back gracefully

**Expected:**

- Error logged but app continues
- Falls back to basic animations
- No user-facing errors

### 3. Animation System Tests

#### TC-3.1: Roulette Animation - Low Tier

**Steps:**

1. Force low tier
2. Trigger roulette animation
3. Monitor performance

**Expected:**

- DOM-based wheel used
- No canvas rendering
- 30+ FPS maintained
- Animation completes in 3-4s

#### TC-3.2: Roulette Animation - Medium Tier

**Steps:**

1. Force medium tier
2. Trigger roulette animation
3. Monitor performance

**Expected:**

- Simplified canvas used
- Basic particle effects
- 30+ FPS maintained
- Animation completes in 4-5s

#### TC-3.3: Roulette Animation - High Tier

**Steps:**

1. Force high tier
2. Trigger roulette animation
3. Monitor performance

**Expected:**

- Full canvas physics
- All particle effects
- 60 FPS target
- Animation completes in 6-8s

### 4. Animation Cache Tests

#### TC-4.1: Cache Hit

**Steps:**

1. Trigger same animation twice
2. Check console for cache messages

**Expected:**

- Second animation uses cache
- "Using cached animation" logged
- Faster execution time

#### TC-4.2: Cache Eviction

**Steps:**

1. Trigger 50+ different animations
2. Check if old entries evicted

**Expected:**

- Cache size stays at 50 max
- LRU eviction works
- No memory leaks

#### TC-4.3: Cache Expiration

**Steps:**

1. Set system time forward 6 minutes
2. Try to use cached animation

**Expected:**

- Expired entries removed
- New animation calculated
- Cache refreshed

### 5. Performance Tests

#### TC-5.1: FPS Monitoring

**Steps:**

1. Enable Chrome FPS meter
2. Run animations on each tier
3. Record FPS values

**Expected Minimum FPS:**

- Low tier: 30 FPS
- Medium tier: 30 FPS
- High tier: 45 FPS

#### TC-5.2: Memory Usage

**Steps:**

1. Open Chrome Memory Profiler
2. Run multiple animations
3. Check memory usage

**Expected:**

- Low tier: <80MB increase
- Medium tier: <100MB increase
- High tier: <150MB increase
- No memory leaks after GC

#### TC-5.3: CPU Usage

**Steps:**

1. Open Chrome Performance tab
2. Record during animation
3. Check CPU usage

**Expected Peak CPU:**

- Low tier: <40%
- Medium tier: <60%
- High tier: <80%

### 6. Integration Tests

#### TC-6.1: Full Flow Test

**Steps:**

1. Clear all caches
2. Load site fresh
3. Complete full loadout generation

**Expected:**

- Device profiled
- Correct modules loaded
- Animations run smoothly
- No console errors

#### TC-6.2: A/B Test Toggle

**Steps:**

1. Disable Phase 3 via flag
2. Compare performance

**Expected:**

- Flag properly disables new features
- Falls back to Phase 2 behavior
- Performance degrades as expected

## Performance Benchmarks

### Target Metrics by Tier

| Metric         | Low Tier | Medium Tier | High Tier |
| -------------- | -------- | ----------- | --------- |
| Profile Time   | <2s      | <2s         | <3s       |
| Module Load    | <500ms   | <800ms      | <1200ms   |
| Animation FPS  | 30+      | 30+         | 45+       |
| Total Memory   | <80MB    | <120MB      | <200MB    |
| Battery Impact | Minimal  | Low         | Medium    |

## Regression Tests

1. **Existing Features**

   - Slot machine still works
   - Sound controls function
   - Filter system operates
   - History saves correctly

2. **Cross-Browser**

   - Chrome/Edge: Full support
   - Safari: WebGL detection fallback
   - Firefox: Connection API fallback

3. **Error Scenarios**
   - localStorage disabled
   - No WebGL support
   - Slow network timeout
   - Module load failures

## Monitoring & Analytics

### Metrics to Track

```javascript
// Performance metrics
gtag("event", "device_tier", {
  tier: window.deviceTier,
  score: window.deviceProfile?.benchmarkScore,
});

// Animation performance
gtag("event", "animation_performance", {
  type: "roulette",
  fps: averageFPS,
  duration: animationDuration,
  cached: wasFromCache,
});
```

### Error Tracking

```javascript
// Module load errors
window.addEventListener("error", (e) => {
  if (e.filename?.includes("/animations/")) {
    gtag("event", "module_load_error", {
      module: e.filename,
      error: e.message,
    });
  }
});
```

## Rollout Checklist

- [ ] All test cases pass on target devices
- [ ] Performance metrics meet targets
- [ ] No console errors in production build
- [ ] A/B test configured properly
- [ ] Analytics tracking implemented
- [ ] Rollback plan documented
- [ ] Cache headers configured on CDN
- [ ] Module files minified and optimized
