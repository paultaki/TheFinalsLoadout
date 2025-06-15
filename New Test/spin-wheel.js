/**
 * spin-wheel.js - Price is Right style vertical wheel for spin count selection
 * Creates an interactive wheel with weighted segments for 1-5 spins
 */

class SpinWheel {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    
    // Segment configuration
    this.segments = [
      { value: 1, weight: 6, color: '#ffffff', label: '1 SPIN' },
      { value: 2, weight: 5, color: '#4FC3F7', label: '2 SPINS' },
      { value: 3, weight: 4, color: '#66BB6A', label: '3 SPINS' },
      { value: 4, weight: 3, color: '#AB47BC', label: '4 SPINS' },
      { value: 5, weight: 2, color: '#FFD700', label: '5 SPINS', special: true }
    ];
    
    // Build full segment array based on weights
    this.fullSegments = [];
    this.segments.forEach(segment => {
      for (let i = 0; i < segment.weight; i++) {
        this.fullSegments.push({ ...segment });
      }
    });
    
    this.totalSegments = this.fullSegments.length; // 20 total
    this.currentRotation = 0;
    this.isSpinning = false;
    this.spinForce = 0;
    this.selectedValue = null;
    
    // Physics
    this.friction = options.friction || 0.985;
    this.minSpinDuration = options.minSpinDuration || 3000;
    this.maxSpinDuration = options.maxSpinDuration || 6000;
    
    // Sound configuration
    this.sounds = {
      spin: options.sounds?.spin || 'sounds/spinning.mp3',
      tick: options.sounds?.tick || 'sounds/tick.mp3',
      slowTick: options.sounds?.slowTick || 'sounds/click.mp3',
      land1: options.sounds?.land1 || 'sounds/tick.mp3',
      land2: options.sounds?.land2 || 'sounds/tick.mp3',
      land3: options.sounds?.land3 || 'sounds/tick.mp3',
      land4: options.sounds?.land4 || 'sounds/tick.mp3',
      land5: options.sounds?.land5 || 'sounds/final-sound.mp3'
    };
    
    this.init();
  }
  
  init() {
    if (!this.container) {
      console.error('SpinWheel: Container not found');
      return;
    }
    
    // Create wheel structure
    this.container.innerHTML = `
      <div class="spin-wheel-container">
        <div class="wheel-frame">
          <div class="wheel-track">
            <div class="wheel-segments">
              ${this.createSegments()}
            </div>
          </div>
          <div class="wheel-center-hub">
            <div class="hub-inner"></div>
          </div>
          <div class="wheel-pegs">${this.createPegs()}</div>
          <div class="wheel-pointer">
            <div class="pointer-arm"></div>
            <div class="pointer-tip"></div>
          </div>
        </div>
        <div class="spin-controls">
          <div class="pull-handle" id="pull-handle">
            <div class="handle-grip"></div>
            <div class="handle-text">PULL DOWN TO SPIN</div>
          </div>
        </div>
        <div class="spin-result" id="spin-result"></div>
      </div>
    `;
    
    // Cache elements
    this.wheel = this.container.querySelector('.wheel-segments');
    this.wheelCircle = this.container.querySelector('.wheel-circle');
    this.wheelVertical = this.container.querySelector('.wheel-vertical');
    this.pointer = this.container.querySelector('.wheel-pointer');
    this.pointerArm = this.container.querySelector('.pointer-arm');
    this.handle = this.container.querySelector('.pull-handle');
    this.resultDisplay = this.container.querySelector('.spin-result');
    
    // Setup interactions
    this.setupInteractions();
    
    // Start idle animation
    this.startIdleAnimation();
  }
  
  createSegments() {
    let html = '';
    const segmentHeight = 100 / this.totalSegments;
    
    // Create a circular wheel container
    html += '<div class="wheel-circle">';
    
    // Create circular segments
    const segmentAngle = 360 / this.totalSegments;
    this.fullSegments.forEach((segment, index) => {
      const rotation = index * segmentAngle;
      html += `
        <div class="wheel-segment-circular value-${segment.value}" 
             style="transform: rotate(${rotation}deg); --segment-index: ${index}; --segment-angle: ${segmentAngle}deg">
          <div class="segment-inner-circular" style="background: ${segment.color}">
            <div class="segment-content-circular">
              <span class="segment-number">${segment.value}</span>
              <span class="segment-label">${segment.label}</span>
              ${segment.special ? '<div class="sparkle-effect"></div>' : ''}
            </div>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    
    // Keep vertical segments for the scrolling animation
    html += '<div class="wheel-vertical" style="display: none;">';
    this.fullSegments.forEach((segment, index) => {
      const yPosition = index * segmentHeight;
      html += `
        <div class="wheel-segment value-${segment.value}" 
             style="top: ${yPosition}%; height: ${segmentHeight}%; background: ${segment.color}">
          <div class="segment-content">
            <span class="segment-number">${segment.value}</span>
            <span class="segment-label">${segment.label}</span>
            ${segment.special ? '<div class="sparkle-effect"></div>' : ''}
          </div>
        </div>
      `;
    });
    
    // Add duplicate segments for seamless scrolling
    this.fullSegments.forEach((segment, index) => {
      const yPosition = (index + this.totalSegments) * segmentHeight;
      html += `
        <div class="wheel-segment value-${segment.value}" 
             style="top: ${yPosition}%; height: ${segmentHeight}%; background: ${segment.color}">
          <div class="segment-content">
            <span class="segment-number">${segment.value}</span>
            <span class="segment-label">${segment.label}</span>
            ${segment.special ? '<div class="sparkle-effect"></div>' : ''}
          </div>
        </div>
      `;
    });
    html += '</div>';
    
    return html;
  }
  
  createPegs() {
    let html = '';
    for (let i = 0; i < this.totalSegments; i++) {
      const yPosition = (i + 0.5) * (100 / this.totalSegments);
      html += `<div class="wheel-peg" style="top: ${yPosition}%; --peg-index: ${i}"></div>`;
    }
    return html;
  }
  
  setupInteractions() {
    let isDragging = false;
    let startY = 0;
    let pullDistance = 0;
    
    // Mouse events
    this.handle.addEventListener('mousedown', (e) => {
      if (!this.isSpinning) {
        isDragging = true;
        startY = e.clientY;
        this.handle.classList.add('pulling');
      }
    });
    
    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        pullDistance = Math.max(0, e.clientY - startY);
        this.updatePullVisual(pullDistance);
      }
    });
    
    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        this.handle.classList.remove('pulling');
        if (pullDistance > 50) {
          this.pullDown(pullDistance);
        } else {
          this.resetHandle();
        }
        pullDistance = 0;
      }
    });
    
    // Touch events
    this.handle.addEventListener('touchstart', (e) => {
      if (!this.isSpinning) {
        isDragging = true;
        startY = e.touches[0].clientY;
        this.handle.classList.add('pulling');
      }
    });
    
    document.addEventListener('touchmove', (e) => {
      if (isDragging) {
        pullDistance = Math.max(0, e.touches[0].clientY - startY);
        this.updatePullVisual(pullDistance);
      }
    });
    
    document.addEventListener('touchend', () => {
      if (isDragging) {
        isDragging = false;
        this.handle.classList.remove('pulling');
        if (pullDistance > 50) {
          this.pullDown(pullDistance);
        } else {
          this.resetHandle();
        }
        pullDistance = 0;
      }
    });
  }
  
  updatePullVisual(distance) {
    const maxPull = 200;
    const pullPercent = Math.min(distance / maxPull, 1);
    
    // Move handle down
    this.handle.style.transform = `translateY(${distance}px)`;
    
    // Bend pointer based on pull
    const pointerBend = pullPercent * 15; // Max 15 degrees
    this.pointerArm.style.transform = `rotate(${pointerBend}deg)`;
  }
  
  resetHandle() {
    this.handle.style.transform = 'translateY(0)';
    this.pointerArm.style.transform = 'rotate(0)';
  }
  
  pullDown(pullDistance) {
    if (this.isSpinning) return Promise.resolve(this.selectedValue);
    
    return new Promise((resolve) => {
      this.isSpinning = true;
      this.resetHandle();
      
      // Calculate spin force based on pull distance
      const maxPull = 200;
      const pullPercent = Math.min(pullDistance / maxPull, 1);
      this.spinForce = 15 + pullPercent * 35; // 15-50 speed range
      
      // Stop idle animation
      this.stopIdleAnimation();
      
      // Play spin sound
      this.playSound('spin');
      
      // Start the spin animation
      this.animateSpin(resolve);
    });
  }
  
  animateSpin(resolve) {
    let velocity = this.spinForce;
    let lastTickPosition = 0;
    const segmentAngle = 360 / this.totalSegments;
    
    // Switch to circular display
    if (this.wheelCircle) {
      this.wheelCircle.style.display = 'block';
      this.wheelVertical.style.display = 'none';
    }
    
    const animate = () => {
      if (velocity > 0.1) {
        // Update rotation angle
        this.currentRotation += velocity;
        
        // Apply transform to circular wheel
        if (this.wheelCircle) {
          this.wheelCircle.style.transform = `rotate(${this.currentRotation}deg)`;
        }
        
        // Check for peg hits based on angle
        const currentSegment = Math.floor((this.currentRotation % 360) / segmentAngle);
        if (currentSegment !== lastTickPosition) {
          this.hitPeg(velocity);
          lastTickPosition = currentSegment;
        }
        
        // Apply friction
        velocity *= this.friction;
        
        // Pointer physics
        this.updatePointerPhysics(velocity);
        
        requestAnimationFrame(animate);
      } else {
        // Spin complete
        this.onSpinComplete(resolve);
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  hitPeg(velocity) {
    // Play tick sound with varying pitch
    const audio = new Audio(velocity > 5 ? this.sounds.tick : this.sounds.slowTick);
    audio.playbackRate = 0.5 + Math.min(velocity / 20, 1);
    audio.volume = 0.3 + Math.min(velocity / 30, 0.5);
    audio.play().catch(() => {});
    
    // Pointer flex animation
    const flexAmount = Math.min(velocity / 2, 15);
    this.pointerArm.style.transform = `rotate(-${flexAmount}deg)`;
    
    setTimeout(() => {
      this.pointerArm.style.transform = 'rotate(0)';
    }, 100);
    
    // Haptic feedback
    if ('vibrate' in navigator && velocity < 10) {
      navigator.vibrate(Math.min(velocity * 2, 20));
    }
  }
  
  updatePointerPhysics(velocity) {
    // Subtle vibration when slow
    if (velocity < 2) {
      const vibration = Math.sin(Date.now() / 100) * 2;
      this.pointer.style.transform = `translateX(${vibration}px)`;
    } else {
      this.pointer.style.transform = 'translateX(0)';
    }
  }
  
  onSpinComplete(resolve) {
    this.isSpinning = false;
    
    // Stop spin sound
    this.stopSound('spin');
    
    // Calculate final position based on angle
    const segmentAngle = 360 / this.totalSegments;
    const normalizedRotation = this.currentRotation % 360;
    // Pointer is at top, so winning segment is at 0 degrees
    const pointerAngle = 0;
    const winningAngle = (360 - normalizedRotation + pointerAngle) % 360;
    const finalSegmentIndex = Math.floor(winningAngle / segmentAngle);
    const segment = this.fullSegments[finalSegmentIndex];
    
    this.selectedValue = segment.value;
    
    // Snap to exact position
    const snapAngle = finalSegmentIndex * segmentAngle;
    const snapRotation = (360 - snapAngle) % 360;
    this.currentRotation = Math.floor(this.currentRotation / 360) * 360 + snapRotation;
    if (this.wheelCircle) {
      this.wheelCircle.style.transform = `rotate(${this.currentRotation}deg)`;
    }
    
    // Play landing sound based on value
    this.playSound(`land${segment.value}`);
    
    // Show result
    this.showResult(segment);
    
    // Special effects for high values
    if (segment.value >= 4) {
      this.createSpecialEffects(segment.value);
    }
    
    // Emit event
    this.container.dispatchEvent(new CustomEvent('spinComplete', {
      detail: { spins: segment.value }
    }));
    
    // Restart idle animation after delay
    setTimeout(() => {
      if (!this.isSpinning) {
        this.startIdleAnimation();
      }
    }, 3000);
    
    resolve(segment.value);
  }
  
  showResult(segment) {
    this.resultDisplay.innerHTML = `
      <div class="result-number value-${segment.value}">${segment.value}</div>
      <div class="result-text">${segment.label}</div>
    `;
    this.resultDisplay.classList.add('show');
    
    // Highlight winning segment in circular wheel
    const segments = this.wheel.querySelectorAll('.wheel-segment-circular');
    segments.forEach(seg => seg.classList.remove('winner'));
    const winningSegments = this.wheel.querySelectorAll(`.wheel-segment-circular.value-${segment.value}`);
    winningSegments.forEach(seg => seg.classList.add('winner'));
  }
  
  createSpecialEffects(value) {
    if (value === 5) {
      // Jackpot effects
      this.createConfetti();
      this.container.classList.add('jackpot');
      
      // Screen shake
      document.body.classList.add('screen-shake');
      setTimeout(() => {
        document.body.classList.remove('screen-shake');
        this.container.classList.remove('jackpot');
      }, 1000);
    } else if (value === 4) {
      // Mini celebration
      this.createSparkles();
    }
  }
  
  createConfetti() {
    const colors = ['#FFD700', '#FF69B4', '#00CED1', '#32CD32', '#FF4500'];
    
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.cssText = `
        left: ${Math.random() * 100}%;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        animation-delay: ${Math.random() * 0.5}s;
        animation-duration: ${2 + Math.random()}s;
      `;
      
      this.container.appendChild(confetti);
      setTimeout(() => confetti.remove(), 3000);
    }
  }
  
  createSparkles() {
    const rect = this.pointer.getBoundingClientRect();
    
    for (let i = 0; i < 10; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      sparkle.style.cssText = `
        left: ${rect.left + rect.width / 2}px;
        top: ${rect.top + rect.height / 2}px;
        --angle: ${(360 / 10) * i}deg;
      `;
      
      document.body.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 1000);
    }
  }
  
  startIdleAnimation() {
    this.idleInterval = setInterval(() => {
      if (!this.isSpinning) {
        this.currentRotation += 0.1;
        if (this.wheelCircle) {
          this.wheelCircle.style.transform = `rotate(${this.currentRotation}deg)`;
        }
      }
    }, 50);
  }
  
  stopIdleAnimation() {
    if (this.idleInterval) {
      clearInterval(this.idleInterval);
      this.idleInterval = null;
    }
  }
  
  playSound(type) {
    const audio = new Audio(this.sounds[type]);
    audio.play().catch(() => {});
  }
  
  stopSound(type) {
    // For continuous sounds, would need to track audio instances
  }
  
  // Public methods
  reset() {
    this.selectedValue = null;
    this.resultDisplay.classList.remove('show');
    const segments = this.wheel.querySelectorAll('.wheel-segment');
    segments.forEach(seg => seg.classList.remove('winner'));
  }
  
  getResult() {
    return this.selectedValue;
  }
}

// Export for use
window.SpinWheel = SpinWheel;