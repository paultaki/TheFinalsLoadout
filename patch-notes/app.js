// Enhanced Patch Notes Interactive System
class PatchNotesApp {
  constructor() {
    this.initializeContent();
    this.initializeNavigation();
    this.initializeFilters();
    this.initializeSearch();
    this.initializeIntersectionObserver();
    this.initializeSmoothScroll();
    this.initializeStats();
    this.initializeCardInteractions();
  }

  // Initialize content visibility
  initializeContent() {
    // Ensure all content is visible by default
    const changeCards = document.querySelectorAll(".change-card");
    const patchSections = document.querySelectorAll(".patch-section");

    changeCards.forEach((card) => {
      card.style.display = "block";
      card.classList.add("visible");
      card.dataset.hidden = "false";
    });

    patchSections.forEach((section) => {
      section.style.display = "block";
    });

    // Show the first section by default
    const firstSection = document.querySelector(".patch-section");
    if (firstSection) {
      firstSection.style.display = "block";
    }

    // Ensure navigation shows first item as active
    const firstNavItem = document.querySelector(".nav-item");
    if (firstNavItem) {
      firstNavItem.classList.add("active");
    }

    // Ensure filter shows "all" as active
    const allFilter = document.querySelector(
      '.filter-button[data-filter="all"]'
    );
    if (allFilter) {
      allFilter.classList.add("active");
    }

    console.log("Content initialized:", changeCards.length, "cards found");
  }

  // Enhanced Navigation System
  initializeNavigation() {
    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach((button) => {
      button.addEventListener("click", (e) => {
        // Remove active class from all
        navItems.forEach((b) => b.classList.remove("active"));

        // Add to clicked
        e.target.closest(".nav-item").classList.add("active");

        // Smooth scroll to section
        const sectionId = e.target.closest(".nav-item").dataset.section;
        const section = document.getElementById(sectionId);

        if (section) {
          const navHeight = document.querySelector(".patch-nav").offsetHeight;
          const mainNavHeight =
            document.querySelector(".main-nav").offsetHeight;
          const targetPosition =
            section.offsetTop - navHeight - mainNavHeight - 20;

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });
        }
      });
    });
  }

  // Enhanced Filter System
  initializeFilters() {
    const filterButtons = document.querySelectorAll(".filter-button");
    const changeCards = document.querySelectorAll(".change-card");

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        // Update active state
        filterButtons.forEach((b) => b.classList.remove("active"));
        button.classList.add("active");

        const filter = button.dataset.filter;

        // Filter cards with animation
        changeCards.forEach((card) => {
          if (filter === "all") {
            card.dataset.hidden = "false";
            card.style.display = "block";
            setTimeout(() => card.classList.add("visible"), 10);
          } else {
            if (card.classList.contains(filter)) {
              card.dataset.hidden = "false";
              card.style.display = "block";
              setTimeout(() => card.classList.add("visible"), 10);
            } else {
              card.dataset.hidden = "true";
              card.classList.remove("visible");
              setTimeout(() => {
                if (card.dataset.hidden === "true") {
                  card.style.display = "none";
                }
              }, 300);
            }
          }
        });

        // Update stats
        this.updateVisibleStats();
      });
    });
  }

  // Enhanced Search System
  initializeSearch() {
    const searchInput = document.querySelector(".patch-search");
    const searchClear = document.querySelector(".search-clear");
    const changeCards = document.querySelectorAll(".change-card");

    if (!searchInput) return;

    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim();

      // Show/hide clear button
      if (query.length > 0) {
        searchClear.style.display = "block";
      } else {
        searchClear.style.display = "none";
      }

      // Search through cards
      changeCards.forEach((card) => {
        const text = card.textContent.toLowerCase();
        const matches = text.includes(query);

        if (query === "" || matches) {
          card.style.display = "block";
          card.classList.add("visible");
          if (query !== "") {
            card.classList.add("highlight");
          } else {
            card.classList.remove("highlight");
          }
        } else {
          card.style.display = "none";
          card.classList.remove("visible", "highlight");
        }
      });

      // Update filter counts
      this.updateSearchStats(query);
    });

    // Clear search
    searchClear.addEventListener("click", () => {
      searchInput.value = "";
      searchClear.style.display = "none";

      changeCards.forEach((card) => {
        card.style.display = "block";
        card.classList.add("visible");
        card.classList.remove("highlight");
      });

      this.updateSearchStats("");
    });
  }

  // Update search statistics
  updateSearchStats(query) {
    const visibleCards = document.querySelectorAll(
      '.change-card:not([style*="display: none"])'
    );
    let buffs = 0,
      nerfs = 0,
      newItems = 0;

    visibleCards.forEach((card) => {
      if (card.classList.contains("buff")) buffs++;
      if (card.classList.contains("nerf")) nerfs++;
      if (card.classList.contains("new")) newItems++;
    });

    // Update filter counts
    this.updateFilterCount(
      '.filter-button[data-filter="all"]',
      visibleCards.length
    );
    this.updateFilterCount('.filter-button[data-filter="buff"]', buffs);
    this.updateFilterCount('.filter-button[data-filter="nerf"]', nerfs);
    this.updateFilterCount('.filter-button[data-filter="new"]', newItems);
  }

  // Update filter count display
  updateFilterCount(selector, count) {
    const button = document.querySelector(selector);
    if (button) {
      const countElement = button.querySelector(".filter-count");
      if (countElement) {
        countElement.textContent = count;
      }
    }
  }

  // Enhanced Intersection Observer
  initializeIntersectionObserver() {
    const sections = document.querySelectorAll(".patch-section");
    const navItems = document.querySelectorAll(".nav-item");

    const options = {
      root: null,
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;

          navItems.forEach((item) => {
            if (item.dataset.section === sectionId) {
              item.classList.add("active");
            } else {
              item.classList.remove("active");
            }
          });
        }
      });
    }, options);

    sections.forEach((section) => observer.observe(section));
  }

  // Enhanced Smooth Scroll
  initializeSmoothScroll() {
    // Handle all internal links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();

        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
          const navHeight = document.querySelector(".patch-nav").offsetHeight;
          const mainNavHeight =
            document.querySelector(".main-nav").offsetHeight;
          const targetPosition =
            target.offsetTop - navHeight - mainNavHeight - 20;

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });
        }
      });
    });
  }

  // Enhanced Stats Counter
  initializeStats() {
    const statCounts = document.querySelectorAll(".stat-count");

    statCounts.forEach((stat) => {
      const finalValue = parseInt(stat.textContent);
      let currentValue = 0;
      const increment = finalValue / 30; // 30 frames
      const duration = 1000; // 1 second

      const updateCounter = () => {
        currentValue += increment;

        if (currentValue < finalValue) {
          stat.textContent = Math.floor(currentValue);
          requestAnimationFrame(updateCounter);
        } else {
          stat.textContent = finalValue;
        }
      };

      // Start animation when visible
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            updateCounter();
            observer.unobserve(entry.target);
          }
        });
      });

      observer.observe(stat);
    });
  }

  // Card Interactions
  initializeCardInteractions() {
    const cards = document.querySelectorAll(".change-card");

    cards.forEach((card) => {
      // Add hover effects
      card.addEventListener("mouseenter", () => {
        card.style.transform = "translateY(-4px)";
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "translateY(0)";
      });

      // Add click to expand functionality
      const actionBtn = card.querySelector(".action-btn");
      if (actionBtn) {
        actionBtn.addEventListener("click", (e) => {
          e.preventDefault();
          this.toggleCardDetails(card);
        });
      }
    });
  }

  // Toggle card details
  toggleCardDetails(card) {
    const actionBtn = card.querySelector(".action-btn");
    const detailsSection = card.querySelector(".card-details-expanded");

    if (!detailsSection) {
      // Create expanded details section
      const expandedSection = document.createElement("div");
      expandedSection.className = "card-details-expanded";
      expandedSection.innerHTML = `
        <div class="expanded-content">
          <h4>Detailed Analysis</h4>
          <p>This change will have a significant impact on the meta. Players should expect to see new strategies emerge as teams adapt to these new tools.</p>
          <div class="meta-impact">
            <h5>Meta Impact: High</h5>
            <div class="impact-bar">
              <div class="impact-fill" style="width: 85%"></div>
            </div>
          </div>
        </div>
      `;

      card.appendChild(expandedSection);

      // Update button text
      actionBtn.innerHTML = `
        <span>Hide Details</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="18,15 12,9 6,15"/>
        </svg>
      `;
    } else {
      // Remove expanded section
      detailsSection.remove();

      // Update button text
      actionBtn.innerHTML = `
        <span>View Details</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6,9 12,15 18,9"/>
        </svg>
      `;
    }
  }

  // Update visible stats when filtering
  updateVisibleStats() {
    const visibleCards = document.querySelectorAll(
      '.change-card:not([data-hidden="true"])'
    );
    let buffs = 0,
      nerfs = 0,
      newItems = 0;

    visibleCards.forEach((card) => {
      if (card.classList.contains("buff")) buffs++;
      if (card.classList.contains("nerf")) nerfs++;
      if (card.classList.contains("new")) newItems++;
    });

    // Update stat displays with animation
    this.animateStatUpdate(".stat-item.buffs .stat-count", buffs);
    this.animateStatUpdate(".stat-item.nerfs .stat-count", nerfs);
    this.animateStatUpdate(".stat-item.new .stat-count", newItems);
  }

  animateStatUpdate(selector, newValue) {
    const element = document.querySelector(selector);
    if (!element) return;

    const currentValue = parseInt(element.textContent);
    const difference = newValue - currentValue;
    const steps = 20;
    const stepValue = difference / steps;
    let step = 0;

    const update = () => {
      step++;
      if (step <= steps) {
        element.textContent = Math.round(currentValue + stepValue * step);
        requestAnimationFrame(update);
      } else {
        element.textContent = newValue;
      }
    };

    update();
  }
}

// Global function for card details toggle
function toggleDetails(button) {
  const card = button.closest(".change-card");
  const app = window.patchNotesApp;
  if (app) {
    app.toggleCardDetails(card);
  }
}

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  window.patchNotesApp = new PatchNotesApp();
});
