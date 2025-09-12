/**
 * config.js - Game data (weapons, gadgets, specializations by class)
 * Part of The Finals Loadout v2
 * 
 * Dependencies:
 * - None (data configuration module)
 * 
 * Exports:
 * - WEAPONS (object with light, medium, heavy arrays)
 * - GADGETS (object with light, medium, heavy arrays)
 * - SPECIALIZATIONS (object with light, medium, heavy arrays)
 * - ANIMATION_CONFIG (timing and physics constants)
 */

// Feature Flags Configuration
const FEATURE_FLAGS = {
  // Jackpot Respin System - can be toggled for safe rollout
  JACKPOT_RESPIN: true, // Set to false to disable feature

  // Analytics tracking
  ANALYTICS_ENABLED: true,

  // Debug mode for development
  DEBUG_RESPIN: false,
};

// Analytics Events Configuration
const ANALYTICS_EVENTS = {
  JACKPOT_EARNED: "jackpot_earned",
  RESPIN_CHOICE_SHOWN: "respin_choice_shown",
  RESPIN_CHOSEN: "respin_chosen",
  LOADOUT_KEPT: "loadout_kept",
  RESPIN_COMPLETED: "respin_completed",
  RESPIN_ERROR: "respin_error",
};

// Respin System Configuration
const RESPIN_CONFIG = {
  // UI timing
  FREEZE_DURATION: 1000, // Time to show frozen loadout before choice
  CHOICE_TIMEOUT: 30000, // Max time to wait for user choice (30s)
  RESPIN_ANIMATION_DELAY: 500, // Delay before starting respin animation

  // Mobile UI
  MOBILE_BUTTON_HEIGHT: 60, // Touch-friendly button height
  MOBILE_BUTTON_SPACING: 16, // Gap between buttons

  // Feature constraints
  MAX_RESPINS_PER_SESSION: 5, // Prevent abuse
};

// Export for use in other modules
window.FEATURE_FLAGS = FEATURE_FLAGS;
window.ANALYTICS_EVENTS = ANALYTICS_EVENTS;
window.RESPIN_CONFIG = RESPIN_CONFIG;

// Debug logging helper
window.debugRespin = function (message, ...args) {
  if (FEATURE_FLAGS.DEBUG_RESPIN) {
    console.log(`🎰 [RESPIN DEBUG] ${message}`, ...args);
  }
};

// Analytics helper
window.trackRespinEvent = function (eventName, data = {}) {
  if (!FEATURE_FLAGS.ANALYTICS_ENABLED) return;

  // Add timestamp and session info
  const eventData = {
    ...data,
    timestamp: Date.now(),
    session_id: window.sessionStorage.getItem("session_id") || "unknown",
    feature_enabled: FEATURE_FLAGS.JACKPOT_RESPIN,
  };

  window.debugRespin(`Analytics: ${eventName}`, eventData);

  // Send to analytics service (Google Analytics, custom endpoint, etc.)
  if (typeof gtag !== "undefined") {
    gtag("event", eventName, eventData);
  }

  // Store locally for debugging
  const respinEvents = JSON.parse(
    localStorage.getItem("respin_events") || "[]"
  );
  respinEvents.push({ event: eventName, data: eventData });
  localStorage.setItem(
    "respin_events",
    JSON.stringify(respinEvents.slice(-50))
  ); // Keep last 50 events
};

console.log("✅ Respin config loaded:", {
  jackpotRespinEnabled: FEATURE_FLAGS.JACKPOT_RESPIN,
  analyticsEnabled: FEATURE_FLAGS.ANALYTICS_ENABLED,
  debugMode: FEATURE_FLAGS.DEBUG_RESPIN,
  allFeatureFlags: FEATURE_FLAGS,
});
