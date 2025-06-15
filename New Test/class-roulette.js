/**
 * class-roulette.js - Casino-style roulette wheel for class selection
 * Creates an interactive roulette wheel with Light, Medium, Heavy classes
 */

class RouletteWheel {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.classes = ['Light', 'Medium', 'Heavy'];
    this.segments = 12; // 4 of each class
    this.spinDuration = options.spinDuration || 4000;
    this.currentRotation = 0;
    this.isSpinning = false;
    this.selectedClass = null;
    
    // Sound options
    this.sounds = {
      spin: options.sounds?.spin || 'sounds/spinning.mp3',
      tick: options.sounds?.tick || 'sounds/tick.mp3',
      victory: options.sounds?.victory || 'sounds/final-sound.mp3'
    };
    
    // Build the wheel
    this.init();
  }
  
  init() {
    if (!this.container) {
      console.error('RouletteWheel: Container not found');
      return;
    }
    
    // Create wheel structure
    this.container.innerHTML = `
      <div class="roulette-container">
        <div class="roulette-pointer"></div>
        <div class="roulette-wheel">
          <div class="roulette-inner">
            ${this.createSegments()}
          </div>
          <div class="wheel-center">
            <div class="center-cap"></div>
          </div>
        </div>
        <button class="spin-button" id="roulette-spin">SPIN</button>
      </div>
    `;
    
    // Cache elements
    this.wheel = this.container.querySelector('.roulette-inner');
    this.pointer = this.container.querySelector('.roulette-pointer');
    this.spinButton = this.container.querySelector('.spin-button');
    
    // Add event listeners
    this.setupEventListeners();
    
    // Add initial pulse animation
    this.wheel.classList.add('ready-pulse');
  }
  
  createSegments() {
    let html = '';
    const segmentAngle = 360 / this.segments;
    
    // Create pie container
    html += '<div class="pie-container">';
    
    for (let i = 0; i < this.segments; i++) {
      const classIndex = i % 3; // Cycles through 0, 1, 2
      const className = this.classes[classIndex];
      const rotation = i * segmentAngle;
      
      html += `
        <div class="wheel-segment ${className.toLowerCase()}" 
             style="transform: rotate(${rotation}deg); --segment-index: ${i}; --segment-angle: ${segmentAngle}deg">
          <div class="segment-inner">
            <div class="segment-content">
              <img src="images/${className.toLowerCase()}_active.webp" 
                   alt="${className}" class="class-icon" onerror="this.style.display='none'">
              <span class="class-name">${className.toUpperCase()}</span>
            </div>
          </div>
        </div>
      `;
    }
    
    html += '</div>';
    return html;
  }
  
  setupEventListeners() {
    // Spin button
    this.spinButton.addEventListener('click', () => this.spin());
    
    // Touch support for mobile
    let touchStartY = 0;
    this.wheel.addEventListener('touchstart', (e) => {
      if (!this.isSpinning) {
        touchStartY = e.touches[0].clientY;
      }
    });
    
    this.wheel.addEventListener('touchend', (e) => {
      if (!this.isSpinning) {
        const touchEndY = e.changedTouches[0].clientY;
        const swipeDistance = touchStartY - touchEndY;
        if (Math.abs(swipeDistance) > 50) { // Minimum swipe distance
          this.spin();
        }
      }
    });
  }
  
  spin(forcedResult = null) {
    if (this.isSpinning) return Promise.resolve(this.selectedClass);
    
    return new Promise((resolve) => {
      this.isSpinning = true;
      this.spinButton.disabled = true;
      this.wheel.classList.remove('ready-pulse');
      this.wheel.classList.add('spinning');
      
      // Play spin sound
      this.playSound('spin');
      
      // Calculate result
      let targetSegment;
      if (forcedResult && this.classes.includes(forcedResult)) {
        // Find a segment with the forced result
        const classIndex = this.classes.indexOf(forcedResult);
        const possibleSegments = [0, 3, 6, 9].map(n => n + classIndex);
        targetSegment = possibleSegments[Math.floor(Math.random() * possibleSegments.length)];
      } else {
        // Random result
        targetSegment = Math.floor(Math.random() * this.segments);
      }
      
      // Calculate rotation
      const segmentAngle = 360 / this.segments;
      const targetAngle = targetSegment * segmentAngle;
      const extraSpins = 5 + Math.floor(Math.random() * 3); // 5-7 full rotations
      const totalRotation = extraSpins * 360 + (360 - targetAngle); // Opposite because wheel spins
      
      // Apply rotation with easing
      this.wheel.style.transition = `transform ${this.spinDuration}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`;
      this.currentRotation += totalRotation;
      this.wheel.style.transform = `rotate(${this.currentRotation}deg)`;
      
      // Start tick sounds
      this.startTickSounds(totalRotation);
      
      // Handle spin completion
      setTimeout(() => {
        this.isSpinning = false;
        this.spinButton.disabled = false;
        this.wheel.classList.remove('spinning');
        this.wheel.classList.add('ready-pulse');
        
        // Get result
        const resultIndex = targetSegment % 3;
        this.selectedClass = this.classes[resultIndex];
        
        // Stop sounds
        this.stopSound('spin');
        
        // Victory effects
        this.playSound('victory');
        this.showVictoryEffects(targetSegment);
        
        // Emit event
        this.container.dispatchEvent(new CustomEvent('classSelected', {
          detail: { class: this.selectedClass }
        }));
        
        resolve(this.selectedClass);
      }, this.spinDuration);
    });
  }
  
  startTickSounds(totalRotation) {
    const segmentAngle = 360 / this.segments;
    const totalSegments = Math.floor(totalRotation / segmentAngle);
    
    // Calculate tick timings with deceleration
    const ticks = [];
    for (let i = 0; i < totalSegments; i++) {
      // Ease out cubic curve for realistic deceleration
      const progress = i / totalSegments;
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const time = easedProgress * this.spinDuration;
      ticks.push(time);
    }
    
    // Play tick sounds
    ticks.forEach((time, index) => {
      setTimeout(() => {
        if (this.isSpinning) {
          this.playTickSound(index / totalSegments);
        }
      }, time);
    });
  }
  
  playTickSound(progress) {
    const audio = new Audio(this.sounds.tick);
    // Adjust pitch based on speed (slower = lower pitch)
    audio.playbackRate = 0.5 + (1 - progress) * 1;
    audio.volume = 0.3 + progress * 0.3; // Louder as it slows
    audio.play().catch(() => {});
  }
  
  showVictoryEffects(segmentIndex) {
    // Highlight winning segment
    const segments = this.wheel.querySelectorAll('.wheel-segment');
    segments[segmentIndex].classList.add('winner');
    
    // Create particle burst
    this.createParticleBurst();
    
    // Scale effect on class name
    const winningSegment = segments[segmentIndex];
    const className = winningSegment.querySelector('.class-name');
    className.style.animation = 'winnerPop 0.6s ease-out';
    
    // Remove effects after animation
    setTimeout(() => {
      segments[segmentIndex].classList.remove('winner');
      className.style.animation = '';
    }, 2000);
  }
  
  createParticleBurst() {
    const rect = this.wheel.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'roulette-particle';
      
      const angle = (Math.PI * 2 * i) / 20;
      const velocity = 100 + Math.random() * 100;
      const duration = 600 + Math.random() * 400;
      
      particle.style.cssText = `
        left: ${centerX}px;
        top: ${centerY}px;
        --tx: ${Math.cos(angle) * velocity}px;
        --ty: ${Math.sin(angle) * velocity}px;
        --duration: ${duration}ms;
      `;
      
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), duration);
    }
  }
  
  playSound(type) {
    const audio = document.getElementById(type + 'Sound');
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } else if (this.sounds[type]) {
      const newAudio = new Audio(this.sounds[type]);
      newAudio.play().catch(() => {});
    }
  }
  
  stopSound(type) {
    const audio = document.getElementById(type + 'Sound');
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }
  
  // Public methods
  reset() {
    this.selectedClass = null;
    this.wheel.classList.add('ready-pulse');
    const segments = this.wheel.querySelectorAll('.wheel-segment');
    segments.forEach(s => s.classList.remove('winner'));
  }
  
  getSelectedClass() {
    return this.selectedClass;
  }
}

// Export for use
window.RouletteWheel = RouletteWheel;