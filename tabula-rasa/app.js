// ============================================
// TABULA RASA - COMING SOON PAGE JAVASCRIPT
// ============================================

// Countdown Timer
function initCountdown() {
  // Set launch date to January 31st, 2025 at 11:59 PM PST
  const launchDate = new Date('2025-02-01T07:59:00.000Z'); // UTC time for 11:59 PM PST
  
  // Show loading animation first
  const loadingElement = document.getElementById('countdown-loading');
  const timerElement = document.getElementById('countdown-timer');
  
  // Simulate initialization delay
  setTimeout(() => {
    loadingElement.style.display = 'none';
    timerElement.style.display = 'flex';
    timerElement.style.animation = 'fadeIn 0.8s ease-out';
    
    // Start the actual countdown
    startCountdown();
  }, 2000);
  
  function startCountdown() {
    function updateCountdown() {
      const now = new Date().getTime();
      const distance = launchDate - now;
      
      if (distance < 0) {
        // Launch day!
        document.querySelector('.countdown-title').textContent = 'NOW AVAILABLE!';
        document.querySelector('.countdown-timer').style.display = 'none';
        return;
      }
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      // Update display with leading zeros
      document.getElementById('days').textContent = String(days).padStart(2, '0');
      document.getElementById('hours').textContent = String(hours).padStart(2, '0');
      document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
      document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
      
      // Add pulse effect on each second
      const secondsElement = document.getElementById('seconds');
      secondsElement.style.transform = 'scale(1.1)';
      setTimeout(() => {
        secondsElement.style.transform = 'scale(1)';
      }, 100);
    }
    
    // Update immediately and then every second
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }
}

// Email Signup Handler
function initEmailSignup() {
  const form = document.getElementById('signup-form');
  const submitBtn = form.querySelector('.submit-btn');
  const successDiv = document.getElementById('signup-success');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = form.querySelector('input[type="email"]').value;
    
    // Add loading state
    submitBtn.classList.add('loading');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Show success message
    form.style.display = 'none';
    successDiv.classList.add('show');
    
    // Store in localStorage (for demo purposes)
    const signups = JSON.parse(localStorage.getItem('tabulaRasaSignups') || '[]');
    signups.push({
      email: email,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('tabulaRasaSignups', JSON.stringify(signups));
    
    // Log for demo
    console.log('Email signup:', email);
  });
}

// Matrix Rain Effect Enhancement
function enhanceMatrixEffect() {
  const matrixBg = document.querySelector('.matrix-bg');
  
  // Create countdown particle effect
  createCountdownParticles();
  
  // Create multiple layers for depth
  for (let i = 0; i < 5; i++) {
    const layer = document.createElement('div');
    layer.className = 'matrix-layer';
    layer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: ${0.08 - i * 0.015};
      animation: matrixRain ${15 + i * 3}s linear infinite;
      animation-delay: ${i * 1.5}s;
      pointer-events: none;
    `;
    
    // Create falling characters with more variety
    for (let j = 0; j < 30; j++) {
      const char = document.createElement('span');
      const chars = ['0', '1', '⚡', '🎲', '●', '▲', '♦'];
      char.textContent = chars[Math.floor(Math.random() * chars.length)];
      char.style.cssText = `
        position: absolute;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        color: var(--primary-green);
        font-family: 'Orbitron', monospace;
        font-size: ${8 + Math.random() * 12}px;
        text-shadow: 0 0 8px currentColor;
        animation: fall ${10 + Math.random() * 15}s linear infinite;
        animation-delay: ${Math.random() * 5}s;
      `;
      layer.appendChild(char);
    }
    
    matrixBg.appendChild(layer);
  }
}

// Countdown Particle Effect
function createCountdownParticles() {
  const countdownContainer = document.querySelector('.countdown-container');
  
  // Create floating particles around countdown
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'countdown-particle';
    particle.style.cssText = `
      position: absolute;
      width: 4px;
      height: 4px;
      background: var(--primary-green);
      border-radius: 50%;
      box-shadow: 0 0 10px var(--primary-green);
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: float ${3 + Math.random() * 4}s ease-in-out infinite;
      animation-delay: ${Math.random() * 2}s;
      pointer-events: none;
    `;
    countdownContainer.appendChild(particle);
  }
}

// Glitch Effect on Hover
function initGlitchHover() {
  const glitchText = document.querySelector('.glitch-text');
  let glitchInterval;
  
  glitchText.addEventListener('mouseenter', () => {
    glitchText.style.animation = 'none';
    glitchInterval = setInterval(() => {
      const rand = Math.random();
      if (rand < 0.1) {
        glitchText.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;
      } else {
        glitchText.style.transform = 'translate(0, 0)';
      }
    }, 50);
  });
  
  glitchText.addEventListener('mouseleave', () => {
    clearInterval(glitchInterval);
    glitchText.style.transform = 'translate(0, 0)';
    glitchText.style.animation = 'flicker 2s infinite alternate';
  });
}

// Preview Image Loading Simulation
function initPreviewImages() {
  const skeletons = document.querySelectorAll('.skeleton');
  
  // Simulate loading after 2 seconds
  setTimeout(() => {
    skeletons.forEach((skeleton, index) => {
      setTimeout(() => {
        skeleton.classList.remove('skeleton');
        skeleton.classList.add('loading-shimmer');
        skeleton.innerHTML = `
          <div style="
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            color: var(--primary-green);
            opacity: 0.3;
          ">
            🔒
          </div>
        `;
      }, index * 300);
    });
  }, 2000);
}

// Smooth Scroll for Navigation
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Add Parallax Effect
function initParallax() {
  const heroSection = document.querySelector('.hero-section');
  const matrixBg = document.querySelector('.matrix-bg');
  
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    
    if (heroSection.getBoundingClientRect().bottom > 0) {
      matrixBg.style.transform = `translateY(${rate}px)`;
    }
  });
}

// Feature Cards Animation on Scroll
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, index * 100);
      }
    });
  }, observerOptions);
  
  // Observe feature cards
  document.querySelectorAll('.feature-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.6s ease';
    observer.observe(card);
  });
}

// Add Console Easter Egg
function addConsoleEasterEgg() {
  console.log('%c🎮 TABULA RASA 🎮', 'font-size: 30px; color: #00ff88; text-shadow: 0 0 10px #00ff88;');
  console.log('%cComing Soon...', 'font-size: 16px; color: #888;');
  console.log('%cWant early access? You know what to do 😉', 'font-size: 12px; color: #00cc66;');
}

// Keyboard Easter Egg
function initKeyboardEasterEgg() {
  let konamiCode = [];
  const secretCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  
  document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join(',') === secretCode.join(',')) {
      activateEasterEgg();
    }
  });
}

function activateEasterEgg() {
  document.body.style.animation = 'matrixMode 2s ease';
  
  const message = document.createElement('div');
  message.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: var(--font-display);
    font-size: 2rem;
    color: var(--primary-green);
    text-shadow: 0 0 20px currentColor;
    z-index: 10000;
    pointer-events: none;
  `;
  message.textContent = 'ACCESS GRANTED';
  document.body.appendChild(message);
  
  setTimeout(() => {
    message.remove();
    document.body.style.animation = '';
  }, 3000);
}

// Initialize Everything
document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initEmailSignup();
  enhanceMatrixEffect();
  initGlitchHover();
  initPreviewImages();
  initSmoothScroll();
  initParallax();
  initScrollAnimations();
  addConsoleEasterEgg();
  initKeyboardEasterEgg();
  
  // Add loaded class for animations
  document.body.classList.add('loaded');
});

// Performance optimization: Throttle scroll events
function throttle(func, wait) {
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

// Apply throttling to scroll events
window.addEventListener('scroll', throttle(() => {
  // Add any scroll-based animations here
}, 100));