// Performance initialization script
// This integrates performance optimizations without changing the visual experience

document.addEventListener('DOMContentLoaded', function() {
  // Only run if performance utils are loaded
  if (!window.PerformanceUtils) return;

  const { DOMCache, EventManager, AudioManager, ImagePreloader } = window.PerformanceUtils;

  // Preload critical audio files
  const audioFiles = [
    'clickSound', 'tickSound', 'classWinSound', 'spinWinSound',
    'spinningSound', 'transitionSound', 'finalSound'
  ];
  
  audioFiles.forEach(id => AudioManager.preload(id));

  // Cache frequently accessed DOM elements
  const domElements = [
    '#main-spin-button', '#output', '#selection-display',
    '#history-list', '#filter-panel', '.selection-container'
  ];
  
  domElements.forEach(selector => DOMCache.get(selector));

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

  EventManager.add(window, 'scroll', handleScroll, { passive: true });
  EventManager.add(window, 'resize', handleResize, { passive: true });

  // Preload images for selected class buttons on hover
  const classButtons = document.querySelectorAll('.class-button');
  classButtons.forEach(button => {
    EventManager.add(button, 'mouseenter', function() {
      const activeImg = this.dataset.active;
      if (activeImg) {
        ImagePreloader.preload(activeImg);
      }
    });
  });

  // Optimize mobile performance by reducing animation complexity
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // Add mobile optimization class
    document.body.classList.add('mobile-optimized');
    
    // Mobile performance optimizations applied via CSS
  }

  // Cleanup function for page unload
  window.addEventListener('beforeunload', () => {
    EventManager.removeAll();
    AudioManager.cleanup();
    window.PerformanceUtils.AnimationManager.clear();
  });

  // Log initial performance metrics
  if (window.location.hostname === 'localhost' || window.location.search.includes('debug')) {
    console.log('Performance optimizations loaded');
    window.PerformanceUtils.PerformanceMonitor.logPerformance();
  }
});