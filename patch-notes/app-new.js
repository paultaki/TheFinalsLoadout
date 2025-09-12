// Patch Notes Interactive System
class PatchNotesApp {
  constructor() {
    this.initializeNavigation();
    this.initializeFilters();
    this.initializeIntersectionObserver();
    this.initializeSmoothScroll();
    this.initializeStats();
  }

  // Navigation System
  initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(button => {
      button.addEventListener('click', (e) => {
        // Remove active class from all
        navItems.forEach(b => b.classList.remove('active'));
        
        // Add to clicked
        e.target.classList.add('active');
        
        // Smooth scroll to section
        const sectionId = e.target.dataset.section;
        const section = document.getElementById(sectionId);
        
        if (section) {
          const navHeight = document.querySelector('.patch-nav').offsetHeight;
          const mainNavHeight = document.querySelector('.main-nav').offsetHeight;
          const targetPosition = section.offsetTop - navHeight - mainNavHeight - 20;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // Filter System
  initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-button');
    const changeCards = document.querySelectorAll('.change-card');
    
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Update active state
        filterButtons.forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        
        const filter = button.dataset.filter;
        
        // Filter cards with animation
        changeCards.forEach(card => {
          if (filter === 'all') {
            card.dataset.hidden = 'false';
            card.style.display = 'block';
          } else {
            if (card.classList.contains(filter)) {
              card.dataset.hidden = 'false';
              card.style.display = 'block';
            } else {
              card.dataset.hidden = 'true';
              setTimeout(() => {
                if (card.dataset.hidden === 'true') {
                  card.style.display = 'none';
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

  // Intersection Observer for Section Highlighting
  initializeIntersectionObserver() {
    const sections = document.querySelectorAll('.patch-section');
    const navItems = document.querySelectorAll('.nav-item');
    
    const options = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          
          navItems.forEach(item => {
            if (item.dataset.section === sectionId) {
              item.classList.add('active');
            } else {
              item.classList.remove('active');
            }
          });
        }
      });
    }, options);
    
    sections.forEach(section => observer.observe(section));
  }

  // Smooth Scroll Enhancement
  initializeSmoothScroll() {
    // Handle all internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          const navHeight = document.querySelector('.patch-nav').offsetHeight;
          const mainNavHeight = document.querySelector('.main-nav').offsetHeight;
          const targetPosition = target.offsetTop - navHeight - mainNavHeight - 20;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // Dynamic Stats Counter
  initializeStats() {
    const statCounts = document.querySelectorAll('.stat-count');
    
    statCounts.forEach(stat => {
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
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            updateCounter();
            observer.unobserve(entry.target);
          }
        });
      });
      
      observer.observe(stat);
    });
  }

  // Update visible stats when filtering
  updateVisibleStats() {
    const visibleCards = document.querySelectorAll('.change-card:not([data-hidden="true"])');
    let buffs = 0, nerfs = 0, newItems = 0;
    
    visibleCards.forEach(card => {
      if (card.classList.contains('buff')) buffs++;
      if (card.classList.contains('nerf')) nerfs++;
      if (card.classList.contains('new')) newItems++;
    });
    
    // Update stat displays with animation
    this.animateStatUpdate('.stat-item.buffs .stat-count', buffs);
    this.animateStatUpdate('.stat-item.nerfs .stat-count', nerfs);
    this.animateStatUpdate('.stat-item.new .stat-count', newItems);
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
        element.textContent = Math.round(currentValue + (stepValue * step));
        requestAnimationFrame(update);
      } else {
        element.textContent = newValue;
      }
    };
    
    requestAnimationFrame(update);
  }
}

// Search Functionality
class PatchSearch {
  constructor() {
    this.createSearchUI();
    this.initializeSearch();
  }

  createSearchUI() {
    const filterBar = document.querySelector('.filter-bar');
    
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.innerHTML = `
      <input type="search" 
             class="patch-search" 
             placeholder="Search patches..." 
             aria-label="Search patch notes">
      <button class="search-clear" aria-label="Clear search">×</button>
    `;
    
    filterBar.appendChild(searchContainer);
  }

  initializeSearch() {
    const searchInput = document.querySelector('.patch-search');
    const searchClear = document.querySelector('.search-clear');
    const changeCards = document.querySelectorAll('.change-card');
    
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      
      changeCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(searchTerm) || searchTerm === '') {
          card.style.display = 'block';
          card.dataset.hidden = 'false';
        } else {
          card.style.display = 'none';
          card.dataset.hidden = 'true';
        }
      });
      
      // Show/hide clear button
      searchClear.style.display = searchTerm ? 'block' : 'none';
    });
    
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      searchInput.dispatchEvent(new Event('input'));
    });
  }
}

// Copy Link Functionality
class ShareSystem {
  constructor() {
    this.addShareButtons();
  }

  addShareButtons() {
    const changeCards = document.querySelectorAll('.change-card');
    
    changeCards.forEach((card, index) => {
      const shareButton = document.createElement('button');
      shareButton.className = 'share-button';
      shareButton.innerHTML = '🔗';
      shareButton.title = 'Copy link to this change';
      shareButton.setAttribute('aria-label', 'Share this change');
      
      // Generate unique ID for card if it doesn't have one
      if (!card.id) {
        const weaponName = card.querySelector('.weapon-name')?.textContent || 'change';
        card.id = `${weaponName.toLowerCase().replace(/\s+/g, '-')}-${index}`;
      }
      
      shareButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const url = `${window.location.origin}${window.location.pathname}#${card.id}`;
        
        navigator.clipboard.writeText(url).then(() => {
          shareButton.innerHTML = '✓';
          shareButton.classList.add('success');
          
          setTimeout(() => {
            shareButton.innerHTML = '🔗';
            shareButton.classList.remove('success');
          }, 2000);
        });
      });
      
      card.querySelector('.change-header').appendChild(shareButton);
    });
  }
}

// Add required CSS for search and share
const additionalStyles = `
<style>
  /* Search Styles */
  .search-container {
    position: relative;
    margin-left: auto;
  }
  
  .patch-search {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: var(--space-xs) var(--space-md);
    padding-right: 2rem;
    border-radius: 20px;
    font-family: var(--font-body);
    font-size: 0.875rem;
    width: 200px;
    transition: all var(--transition-fast);
  }
  
  .patch-search:focus {
    outline: none;
    border-color: var(--new-color);
    background: rgba(255, 255, 255, 0.1);
    width: 250px;
  }
  
  .search-clear {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 1.2rem;
    cursor: pointer;
    display: none;
    padding: 0.25rem;
  }
  
  /* Share Button */
  .share-button {
    position: absolute;
    top: var(--space-md);
    right: var(--space-md);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 0.5rem;
    font-size: 1rem;
    cursor: pointer;
    transition: all var(--transition-fast);
    color: var(--text-secondary);
  }
  
  .share-button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }
  
  .share-button.success {
    background: var(--buff-color);
    color: var(--bg-primary);
    border-color: var(--buff-color);
  }
  
  /* Mobile adjustments */
  @media (max-width: 768px) {
    .search-container {
      width: 100%;
      margin-top: var(--space-sm);
    }
    
    .patch-search {
      width: 100%;
    }
    
    .patch-search:focus {
      width: 100%;
    }
  }
</style>
`;

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Add additional styles
  document.head.insertAdjacentHTML('beforeend', additionalStyles);
  
  // Initialize systems
  new PatchNotesApp();
  new PatchSearch();
  new ShareSystem();
  
  // Handle direct links
  if (window.location.hash) {
    setTimeout(() => {
      const target = document.querySelector(window.location.hash);
      if (target) {
        const navHeight = document.querySelector('.patch-nav').offsetHeight;
        const mainNavHeight = document.querySelector('.main-nav').offsetHeight;
        const targetPosition = target.offsetTop - navHeight - mainNavHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        // Highlight the target
        target.classList.add('highlight');
        setTimeout(() => target.classList.remove('highlight'), 2000);
      }
    }, 100);
  }
});

// Add highlight animation
const highlightStyle = `
<style>
  @keyframes highlight {
    0% { background: rgba(0, 212, 255, 0.2); }
    100% { background: var(--bg-card); }
  }
  
  .change-card.highlight {
    animation: highlight 2s ease-out;
  }
</style>
`;

document.head.insertAdjacentHTML('beforeend', highlightStyle);