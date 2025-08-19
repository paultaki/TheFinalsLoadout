/**
 * Lazy Image Loading for The Finals Loadout v3
 * Progressive enhancement - doesn't break if it fails
 */

(function() {
  'use strict';
  
  // Only run if IntersectionObserver is supported
  if (!('IntersectionObserver' in window)) {
    return;
  }
  
  // Configuration
  const IMAGE_LOAD_DELAY = 50; // Small delay to prevent thrashing
  const BATCH_SIZE = 5; // Load images in batches
  
  let pendingImages = [];
  let isLoading = false;
  
  /**
   * Load a batch of images
   */
  function loadBatch() {
    if (isLoading || pendingImages.length === 0) return;
    
    isLoading = true;
    const batch = pendingImages.splice(0, BATCH_SIZE);
    
    Promise.all(
      batch.map(img => {
        return new Promise((resolve) => {
          const src = img.dataset.src;
          if (!src) {
            resolve();
            return;
          }
          
          // Create a new image to test loading
          const testImg = new Image();
          testImg.onload = () => {
            img.src = src;
            img.classList.add('loaded');
            delete img.dataset.src;
            resolve();
          };
          testImg.onerror = () => {
            // Fall back to placeholder
            img.classList.add('error');
            resolve();
          };
          testImg.src = src;
        });
      })
    ).then(() => {
      isLoading = false;
      // Load next batch if available
      if (pendingImages.length > 0) {
        setTimeout(loadBatch, IMAGE_LOAD_DELAY);
      }
    });
  }
  
  /**
   * Observer for lazy loading
   */
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        pendingImages.push(img);
        imageObserver.unobserve(img);
      }
    });
    
    // Start loading if not already
    if (pendingImages.length > 0 && !isLoading) {
      loadBatch();
    }
  }, {
    rootMargin: '50px' // Start loading 50px before visible
  });
  
  /**
   * Initialize lazy loading
   */
  function initLazyLoading() {
    // Find all images with data-src
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    lazyImages.forEach(img => {
      // Add loading placeholder class
      img.classList.add('lazy-image');
      
      // Start observing
      imageObserver.observe(img);
    });
    
    // Also handle dynamically added images
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeName === 'IMG' && node.dataset.src) {
            node.classList.add('lazy-image');
            imageObserver.observe(node);
          }
          // Check children too
          if (node.querySelectorAll) {
            const imgs = node.querySelectorAll('img[data-src]');
            imgs.forEach(img => {
              img.classList.add('lazy-image');
              imageObserver.observe(img);
            });
          }
        });
      });
    });
    
    // Observe the entire document for new images
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLazyLoading);
  } else {
    initLazyLoading();
  }
  
  // Export for manual trigger if needed
  window.lazyLoadImages = {
    loadAll: function() {
      const remaining = document.querySelectorAll('img[data-src]');
      remaining.forEach(img => {
        const src = img.dataset.src;
        if (src) {
          img.src = src;
          delete img.dataset.src;
        }
      });
    }
  };
})();

/**
 * CSS to add to your stylesheet:
 * 
 * .lazy-image {
 *   background: #1a1a1a;
 *   min-height: 80px;
 * }
 * 
 * .lazy-image.loaded {
 *   animation: fadeIn 0.3s ease;
 * }
 * 
 * @keyframes fadeIn {
 *   from { opacity: 0; }
 *   to { opacity: 1; }
 * }
 */