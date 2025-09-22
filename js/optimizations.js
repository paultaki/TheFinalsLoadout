/**
 * Performance Optimizations for The Finals Loadout
 * Includes: Lazy Loading, Debounce, Storage Compression, Toast Notifications
 */

// ============================================
// DEBOUNCE UTILITY
// ============================================
function debounce(func, wait = 150, options = {}) {
  let timeout;
  let lastCallTime;
  let lastInvokeTime = 0;
  let leading = options.leading || false;
  let trailing = options.trailing !== false;
  let lastThis;
  let lastArgs;

  const invokeFunc = (time) => {
    const args = lastArgs;
    const thisArg = lastThis;
    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    return func.apply(thisArg, args);
  };

  const leadingEdge = (time) => {
    lastInvokeTime = time;
    timeout = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time) : undefined;
  };

  const timerExpired = () => {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timeout = setTimeout(timerExpired, wait - (time - lastCallTime));
  };

  const trailingEdge = (time) => {
    timeout = undefined;
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return undefined;
  };

  const shouldInvoke = (time) => {
    const timeSinceLastCall = time - lastCallTime;
    return lastCallTime === undefined || timeSinceLastCall >= wait;
  };

  const debounced = function (...args) {
    const time = Date.now();
    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (!timeout) {
      return leadingEdge(lastCallTime);
    }
    if (timeout) {
      clearTimeout(timeout);
      timeout = setTimeout(timerExpired, wait);
    }
    return undefined;
  };

  debounced.cancel = () => {
    if (timeout) clearTimeout(timeout);
    timeout = lastArgs = lastThis = lastCallTime = undefined;
  };

  return debounced;
}

// ============================================
// IMAGE LAZY LOADING
// ============================================
class ImageLazyLoader {
  constructor() {
    this.imageObserver = null;
    this.init();
  }

  init() {
    if (!('IntersectionObserver' in window)) {
      this.loadAllImages();
      return;
    }

    this.imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target);
            this.imageObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '100px', threshold: 0.01 }
    );

    this.observeImages();
  }

  loadImage(img) {
    const src = img.dataset.src;
    if (!src) return;

    const tempImg = new Image();
    tempImg.onload = () => {
      img.src = src;
      img.classList.add('lazy-loaded');
      img.removeAttribute('data-src');
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.3s ease-in-out';
      requestAnimationFrame(() => {
        img.style.opacity = '1';
      });
    };

    tempImg.onerror = () => {
      if (img.dataset.fallback) {
        img.src = img.dataset.fallback;
      }
    };

    tempImg.src = src;
  }

  observeImages() {
    // Convert existing images to lazy loading
    document.querySelectorAll('img[src*="images/"]').forEach(img => {
      // Skip already processed images
      if (img.dataset.src || img.classList.contains('lazy-loaded')) return;

      // Skip critical above-the-fold images
      const rect = img.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.top > -rect.height) return;

      // Convert to lazy loading
      img.dataset.src = img.src;
      img.dataset.fallback = 'images/placeholder.webp';
      img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="100%25" height="100%25" fill="%23111111"/%3E%3C/svg%3E';
      this.imageObserver.observe(img);
    });

    // Observe new images with data-src
    document.querySelectorAll('img[data-src]').forEach(img => {
      if (!img.classList.contains('lazy-loaded')) {
        this.imageObserver.observe(img);
      }
    });
  }

  refresh() {
    this.observeImages();
  }
}

// ============================================
// LOCALSTORAGE COMPRESSION
// ============================================
class CompressedStorage {
  constructor(prefix = 'finals_') {
    this.prefix = prefix;
  }

  compress(str) {
    try {
      return btoa(encodeURIComponent(str));
    } catch {
      return str;
    }
  }

  decompress(str) {
    try {
      return decodeURIComponent(atob(str));
    } catch {
      return str;
    }
  }

  set(key, value, compress = true) {
    try {
      const data = {
        v: value,
        t: Date.now(),
        c: compress
      };

      let stored = JSON.stringify(data);
      if (compress && stored.length > 500) {
        stored = 'C:' + this.compress(stored);
      }

      localStorage.setItem(this.prefix + key, stored);
      return true;
    } catch (e) {
      console.error('Storage error:', e);
      // Try to clear old data if quota exceeded
      if (e.name === 'QuotaExceededError') {
        this.cleanup();
        try {
          localStorage.setItem(this.prefix + key, stored);
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  }

  get(key, defaultValue = null) {
    try {
      let stored = localStorage.getItem(this.prefix + key);
      if (!stored) return defaultValue;

      if (stored.startsWith('C:')) {
        stored = this.decompress(stored.slice(2));
      }

      const data = JSON.parse(stored);
      return data.v;
    } catch {
      return defaultValue;
    }
  }

  cleanup() {
    const now = Date.now();
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        try {
          const stored = localStorage.getItem(key);
          const data = JSON.parse(stored.startsWith('C:') ? this.decompress(stored.slice(2)) : stored);
          if (data.t && now - data.t > maxAge) {
            localStorage.removeItem(key);
          }
        } catch {
          // Remove corrupted data
          localStorage.removeItem(key);
        }
      }
    }
  }
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
class ToastManager {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    if (!document.getElementById('toast-container')) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 99999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      `;
      document.body.appendChild(this.container);
    } else {
      this.container = document.getElementById('toast-container');
    }
  }

  show(message, type = 'success', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 250px;
      max-width: 400px;
      pointer-events: auto;
      cursor: pointer;
      animation: slideIn 0.3s ease-out;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 500;
    `;

    // Add icon
    const icon = document.createElement('span');
    icon.innerHTML = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    icon.style.cssText = 'font-size: 18px; font-weight: bold;';
    toast.appendChild(icon);

    // Add message
    const text = document.createElement('span');
    text.textContent = message;
    toast.appendChild(text);

    // Click to dismiss
    toast.onclick = () => this.dismiss(toast);

    this.container.appendChild(toast);

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => this.dismiss(toast), duration);
    }

    return toast;
  }

  dismiss(toast) {
    if (!toast || !toast.parentElement) return;

    toast.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 300);
  }

  success(message, duration = 3000) {
    return this.show(message, 'success', duration);
  }

  error(message, duration = 4000) {
    return this.show(message, 'error', duration);
  }

  info(message, duration = 3000) {
    return this.show(message, 'info', duration);
  }
}

// ============================================
// ENHANCED COPY FUNCTION
// ============================================
async function enhancedCopy(text, successMessage = 'Copied to clipboard!') {
  try {
    await navigator.clipboard.writeText(text);
    if (window.toastManager) {
      window.toastManager.success(successMessage);
    }
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);

      if (success && window.toastManager) {
        window.toastManager.success(successMessage);
      }
      return success;
    } catch {
      document.body.removeChild(textarea);
      if (window.toastManager) {
        window.toastManager.error('Failed to copy to clipboard');
      }
      return false;
    }
  }
}

// ============================================
// INITIALIZE OPTIMIZATIONS
// ============================================
function initializeOptimizations() {
  console.log('🚀 Initializing performance optimizations...');

  // Initialize lazy loading
  window.lazyLoader = new ImageLazyLoader();

  // Initialize compressed storage
  window.compressedStorage = new CompressedStorage('finals_');

  // Initialize toast notifications
  window.toastManager = new ToastManager();

  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }

    /* Enhanced focus states */
    button:focus-visible,
    a:focus-visible,
    input:focus-visible,
    select:focus-visible,
    textarea:focus-visible,
    [tabindex]:focus-visible {
      outline: 2px solid #3b82f6 !important;
      outline-offset: 2px !important;
    }

    .lazy-loaded {
      animation: fadeIn 0.3s ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  // Enhance filter operations with debounce
  const filterCheckboxes = document.querySelectorAll('#filter-content input[type="checkbox"]');
  if (filterCheckboxes.length > 0) {
    // Store reference to original applyFilters if it exists
    const originalApplyFilters = window.filterManager?.applyFilters;
    if (originalApplyFilters) {
      // Create debounced version
      const debouncedApplyFilters = debounce(function() {
        originalApplyFilters.call(window.filterManager);
      }, 200);

      // Replace with debounced version for auto-apply on checkbox change
      filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', debouncedApplyFilters);
      });
      console.log('✅ Filter operations debounced');
    }
  }

  // Enhance copy buttons
  document.addEventListener('click', async (e) => {
    // Handle copy buttons
    if (e.target.closest('.copy-button, .share-button, [data-copy]')) {
      e.preventDefault();
      const button = e.target.closest('.copy-button, .share-button, [data-copy]');

      // Get text to copy
      let textToCopy = button.dataset.copy;
      if (!textToCopy && button.classList.contains('share-button')) {
        // Handle share button logic
        const loadout = window.currentLoadout;
        if (loadout) {
          textToCopy = formatLoadoutForSharing(loadout);
        }
      }

      if (textToCopy) {
        await enhancedCopy(textToCopy, 'Loadout copied!');
      }
    }
  });

  // Monitor for dynamically added images
  const observer = new MutationObserver(() => {
    if (window.lazyLoader) {
      window.lazyLoader.refresh();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  console.log('✅ All optimizations initialized');
}

// Helper function for loadout formatting
function formatLoadoutForSharing(loadout) {
  return `🎮 THE FINALS LOADOUT 🎮
Class: ${loadout.class || 'Unknown'}
Weapon: ${loadout.weapon?.name || 'Unknown'}
Specialization: ${loadout.specialization?.name || 'Unknown'}
Gadgets: ${loadout.gadgets?.map(g => g.name).join(', ') || 'Unknown'}

Generated at: thefinalsloadout.com`;
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeOptimizations);
} else {
  initializeOptimizations();
}

// Export for use in other scripts
window.FinalsOptimizations = {
  debounce,
  ImageLazyLoader,
  CompressedStorage,
  ToastManager,
  enhancedCopy,
  initializeOptimizations
};