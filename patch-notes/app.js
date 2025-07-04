/**
 * THE FINALS PATCH NOTES - BLAST OFF!
 * Interactive Gaming Experience
 * Enhanced with spectacular effects and smooth animations
 */

class BlastOffExperience {
  constructor() {
    this.audioEnabled = true;
    this.particles = [];
    this.loadingProgress = 0;
    this.scrollProgress = 0;
    this.activeSection = "weapons";

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.startLoadingSequence();
    this.createParticleSystem();
    this.setupScrollEffects();
    this.initSmartNavigation();
    this.setupTabSystem();
    this.setupModalSystem();
    this.setupFAB();
    this.startAnimationLoop();
  }

  // ============================================
  // LOADING SYSTEM
  // ============================================

  startLoadingSequence() {
    const loadingScreen = document.getElementById("loadingScreen");
    const progressBar = document.getElementById("loadingProgress");
    const percentage = document.getElementById("loadingPercentage");

    // Create loading particles
    this.createLoadingParticles();

    // Simulate loading with realistic timing
    const loadingSteps = [
      { progress: 15, delay: 300, text: "Loading assets..." },
      { progress: 35, delay: 500, text: "Initializing systems..." },
      { progress: 60, delay: 400, text: "Preparing experience..." },
      { progress: 85, delay: 600, text: "Almost ready..." },
      { progress: 100, delay: 300, text: "Blast off!" },
    ];

    let currentStep = 0;

    const updateProgress = () => {
      if (currentStep >= loadingSteps.length) {
        this.completeLoading();
        return;
      }

      const step = loadingSteps[currentStep];

      // Animate progress bar
      this.animateValue(this.loadingProgress, step.progress, 300, (value) => {
        this.loadingProgress = value;
        progressBar.style.width = `${value}%`;
        percentage.textContent = `${Math.round(value)}%`;
      });

      currentStep++;
      setTimeout(updateProgress, step.delay);
    };

    // Start loading after brief delay
    setTimeout(updateProgress, 500);
  }

  createLoadingParticles() {
    const container = document.getElementById("loadingParticles");
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "loading-particle";

      // Random position
      particle.style.left = Math.random() * 100 + "%";
      particle.style.top = Math.random() * 100 + "%";

      // Random animation delay
      particle.style.animationDelay = Math.random() * 3 + "s";
      particle.style.animationDuration = 2 + Math.random() * 2 + "s";

      container.appendChild(particle);
    }
  }

  completeLoading() {
    const loadingScreen = document.getElementById("loadingScreen");

    // Fade out loading screen
    loadingScreen.classList.add("hidden");
    document.body.classList.remove("loading");

    // Start main experience
    setTimeout(() => {
      this.startMainExperience();
    }, 500);
  }

  startMainExperience() {
    // Initialize hero particles
    this.createHeroParticles();

    // Start counter animations
    this.animateCounters();

    // Show smart navigation after scroll
    setTimeout(() => {
      this.checkSmartNavVisibility();
    }, 1000);

    // Trigger entrance animations
    this.triggerEntranceAnimations();
  }

  // ============================================
  // PARTICLE SYSTEM
  // ============================================

  createHeroParticles() {
    const container = document.getElementById("heroParticles");
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "hero-particle";

      // Random properties
      const size = 1 + Math.random() * 3;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const duration = 4 + Math.random() * 4;
      const delay = Math.random() * 2;

      particle.style.cssText = `
                left: ${x}%;
                top: ${y}%;
                width: ${size}px;
                height: ${size}px;
                animation-duration: ${duration}s;
                animation-delay: ${delay}s;
            `;

      container.appendChild(particle);
    }
  }

  createParticleSystem() {
    // Create floating particles for various interactions
    this.particlePool = [];
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement("div");
      particle.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: var(--neon-cyan);
                border-radius: 50%;
                pointer-events: none;
                z-index: 10000;
                opacity: 0;
                transition: all 0.3s ease;
            `;
      document.body.appendChild(particle);
      this.particlePool.push(particle);
    }
  }

  createParticleExplosion(x, y, color = "var(--neon-cyan)", count = 8) {
    for (let i = 0; i < count; i++) {
      const particle = this.getParticle();
      if (!particle) continue;

      const angle = (Math.PI * 2 * i) / count;
      const velocity = 50 + Math.random() * 100;
      const targetX = x + Math.cos(angle) * velocity;
      const targetY = y + Math.sin(angle) * velocity;

      particle.style.left = x + "px";
      particle.style.top = y + "px";
      particle.style.background = color;
      particle.style.opacity = "1";
      particle.style.transform = "scale(1)";

      // Animate particle
      setTimeout(() => {
        particle.style.left = targetX + "px";
        particle.style.top = targetY + "px";
        particle.style.opacity = "0";
        particle.style.transform = "scale(0)";
      }, 10);

      // Return to pool
      setTimeout(() => {
        this.returnParticle(particle);
      }, 500);
    }
  }

  getParticle() {
    return this.particlePool.find((p) => p.style.opacity === "0");
  }

  returnParticle(particle) {
    particle.style.opacity = "0";
    particle.style.transform = "scale(0)";
  }

  // ============================================
  // SCROLL EFFECTS
  // ============================================

  setupScrollEffects() {
    let ticking = false;

    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updateScrollProgress();
          this.updateNavigation();
          this.checkSmartNavVisibility();
          this.updateSectionProgress();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  updateScrollProgress() {
    const scrollTop = window.pageYOffset;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;

    const progressBar = document.getElementById("scrollProgress");
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }

    this.scrollProgress = progress;
  }

  updateNavigation() {
    const nav = document.getElementById("mainNav");
    const scrolled = window.pageYOffset > 100;

    if (scrolled) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }
  }

  checkSmartNavVisibility() {
    const smartNav = document.getElementById("smartNav");
    const heroHeight = document.getElementById("hero").offsetHeight;
    const scrolled = window.pageYOffset > heroHeight * 0.8;

    if (scrolled) {
      smartNav.classList.add("visible");
    } else {
      smartNav.classList.remove("visible");
    }
  }

  updateSectionProgress() {
    const sections = document.querySelectorAll(".content-section");
    const progressIndicator = document.querySelector("#readingProgress::after");

    let currentSection = null;
    let maxVisibility = 0;

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const visibility = this.calculateVisibility(rect);

      if (visibility > maxVisibility) {
        maxVisibility = visibility;
        currentSection = section;
      }
    });

    if (currentSection) {
      this.activeSection = currentSection.id;
      this.updateActiveNavSection();
    }
  }

  calculateVisibility(rect) {
    const windowHeight = window.innerHeight;
    const elementTop = rect.top;
    const elementBottom = rect.bottom;

    if (elementBottom < 0 || elementTop > windowHeight) {
      return 0;
    }

    const visibleTop = Math.max(0, elementTop);
    const visibleBottom = Math.min(windowHeight, elementBottom);
    const visibleHeight = visibleBottom - visibleTop;
    const elementHeight = rect.height;

    return visibleHeight / elementHeight;
  }

  // ============================================
  // SMART NAVIGATION
  // ============================================

  initSmartNavigation() {
    const navSections = document.querySelectorAll(".nav-section");
    const navToggle = document.getElementById("smartNavToggle");
    const smartNav = document.getElementById("smartNav");

    // Initialize collapsed state
    this.smartNavExpanded = false;

    navSections.forEach((section) => {
      section.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = section.getAttribute("href").substring(1);
        this.scrollToSection(targetId);
        this.playSound("clickSound");
      });
    });

    // Toggle functionality
    navToggle?.addEventListener("click", () => {
      this.toggleSmartNav();
      this.playSound("clickSound");
    });

    // Auto-collapse on mobile when clicking outside
    document.addEventListener("click", (e) => {
      if (
        window.innerWidth <= 768 &&
        this.smartNavExpanded &&
        !smartNav.contains(e.target)
      ) {
        this.collapseSmartNav();
      }
    });
  }

  toggleSmartNav() {
    const smartNav = document.getElementById("smartNav");

    if (this.smartNavExpanded) {
      this.collapseSmartNav();
    } else {
      this.expandSmartNav();
    }
  }

  expandSmartNav() {
    const smartNav = document.getElementById("smartNav");
    smartNav.classList.add("expanded");
    this.smartNavExpanded = true;
  }

  collapseSmartNav() {
    const smartNav = document.getElementById("smartNav");
    smartNav.classList.remove("expanded");
    this.smartNavExpanded = false;
  }

  scrollToSection(sectionId) {
    const target = document.getElementById(sectionId);
    if (!target) return;

    const navHeight = document.getElementById("mainNav").offsetHeight;
    const targetPosition = target.offsetTop - navHeight - 20;

    this.smoothScrollTo(targetPosition, 800);
  }

  smoothScrollTo(target, duration) {
    const start = window.pageYOffset;
    const distance = target - start;
    let startTime = null;

    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      // Easing function
      const ease = this.easeInOutCubic(progress);
      window.scrollTo(0, start + distance * ease);

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  }

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }

  updateActiveNavSection() {
    const navSections = document.querySelectorAll(".nav-section");

    navSections.forEach((section) => {
      const href = section.getAttribute("href").substring(1);
      if (href === this.activeSection) {
        section.classList.add("active");
      } else {
        section.classList.remove("active");
      }
    });
  }

  // ============================================
  // TAB SYSTEM
  // ============================================

  setupTabSystem() {
    const tabButtons = document.querySelectorAll(".tab-btn");

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const tabName = button.getAttribute("data-tab");
        const card = button.closest(".change-card");

        this.switchTab(card, tabName);
        this.playSound("clickSound");
      });
    });
  }

  switchTab(card, activeTab) {
    // Update buttons
    const buttons = card.querySelectorAll(".tab-btn");
    buttons.forEach((btn) => {
      if (btn.getAttribute("data-tab") === activeTab) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Update content
    const contents = card.querySelectorAll(".tab-content");
    contents.forEach((content) => {
      if (content.getAttribute("data-tab") === activeTab) {
        content.classList.add("active");
      } else {
        content.classList.remove("active");
      }
    });
  }

  // ============================================
  // MODAL SYSTEM
  // ============================================

  setupModalSystem() {
    const quickSummaryBtn = document.getElementById("quickSummary");
    const modal = document.getElementById("summaryModal");
    const closeBtn = document.getElementById("modalClose");

    quickSummaryBtn?.addEventListener("click", () => {
      this.openModal();
    });

    closeBtn?.addEventListener("click", () => {
      this.closeModal();
    });

    modal?.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.closeModal();
      }
    });

    // ESC key to close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal?.classList.contains("active")) {
        this.closeModal();
      }
    });
  }

  openModal() {
    const modal = document.getElementById("summaryModal");
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
    this.playSound("clickSound");
  }

  closeModal() {
    const modal = document.getElementById("summaryModal");
    modal.classList.remove("active");
    document.body.style.overflow = "";
    this.playSound("clickSound");
  }

  // ============================================
  // FLOATING ACTION BUTTON
  // ============================================

  setupFAB() {
    const fabContainer = document.querySelector(".fab-container");
    const mainFab = document.getElementById("mainFab");
    const subFabs = document.querySelectorAll(".sub-fab");

    mainFab?.addEventListener("click", () => {
      fabContainer.classList.toggle("open");
      this.playSound("clickSound");
    });

    subFabs.forEach((fab) => {
      fab.addEventListener("click", () => {
        const action = fab.getAttribute("data-action");
        this.handleFABAction(action);
        fabContainer.classList.remove("open");
      });
    });

    // Close FAB menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!fabContainer.contains(e.target)) {
        fabContainer.classList.remove("open");
      }
    });
  }

  handleFABAction(action) {
    switch (action) {
      case "top":
        this.smoothScrollTo(0, 800);
        break;
      case "share":
        this.shareContent();
        break;
      case "bookmark":
        this.bookmarkPage();
        break;
    }
    this.playSound("clickSound");
  }

  shareContent() {
    if (navigator.share) {
      navigator.share({
        title: "THE FINALS - Update 7.3.0: BLAST OFF!",
        text: "Check out the explosive new update for The Finals!",
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      this.showNotification("Link copied to clipboard!");
    }
  }

  bookmarkPage() {
    // Add to favorites (browser dependent)
    try {
      window.external.AddFavorite(window.location.href, document.title);
    } catch (e) {
      this.showNotification("Press Ctrl+D to bookmark this page");
    }
  }

  // ============================================
  // ANIMATIONS & EFFECTS
  // ============================================

  animateCounters() {
    const counters = document.querySelectorAll("[data-count]");

    counters.forEach((counter) => {
      const target = parseInt(counter.getAttribute("data-count"));
      this.animateValue(0, target, 2000, (value) => {
        counter.textContent = Math.round(value);
      });
    });
  }

  animateValue(start, end, duration, callback) {
    let startTime = null;

    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      const value = start + (end - start) * this.easeOutQuart(progress);
      callback(value);

      if (progress < 1) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  }

  easeOutQuart(t) {
    return 1 - --t * t * t * t;
  }

  triggerEntranceAnimations() {
    // Add AOS-like animations
    const elements = document.querySelectorAll("[data-aos]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    elements.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(30px)";
      el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      observer.observe(el);
    });
  }

  startAnimationLoop() {
    const animate = () => {
      this.updateParticles();
      this.updateGlowEffects();
      requestAnimationFrame(animate);
    };
    animate();
  }

  updateParticles() {
    // Update any active particle animations
    this.particles.forEach((particle, index) => {
      if (particle.life <= 0) {
        this.particles.splice(index, 1);
        return;
      }

      particle.life--;
      particle.element.style.opacity = particle.life / 100;
    });
  }

  updateGlowEffects() {
    // Dynamic glow effects based on scroll position
    const cards = document.querySelectorAll(".change-card");

    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const visibility = this.calculateVisibility(rect);

      if (visibility > 0.5) {
        card.style.boxShadow = `0 0 ${
          20 + visibility * 20
        }px rgba(123, 47, 227, ${0.2 + visibility * 0.3})`;
      }
    });
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  setupEventListeners() {
    // Explore button
    document.getElementById("exploreButton")?.addEventListener("click", () => {
      this.scrollToSection("weapons");
    });

    // Interactive elements click effects
    document.addEventListener("click", (e) => {
      if (e.target.matches(".cta-button, .action-btn, .nav-link, .fab")) {
        // Create particle explosion at click point
        const rect = e.target.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        this.createParticleExplosion(x, y);
      }
    });

    // Card hover effects
    document.addEventListener(
      "mouseenter",
      (e) => {
        if (e.target.matches(".change-card")) {
          e.target.style.transform = "translateY(-10px) scale(1.02)";
        }
      },
      true
    );

    document.addEventListener(
      "mouseleave",
      (e) => {
        if (e.target.matches(".change-card")) {
          e.target.style.transform = "";
        }
      },
      true
    );
  }

  showNotification(message) {
    const notification = document.createElement("div");
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-secondary);
            color: var(--text-primary);
            padding: 1rem 1.5rem;
            border-radius: 10px;
            border: 1px solid rgba(123, 47, 227, 0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOutRight 0.3s ease";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  // Performance optimization
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Initialize the experience when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new BlastOffExperience();
});

// Add CSS animations for notifications
const style = document.createElement("style");
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
