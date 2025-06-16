/**
 * spin-wheel-revamped.js - Casino-style spin count wheel with CHOOSE CLASS option
 * Revamped for thefinalsloadout.com gaming experience
 */

class SpinWheelRevamped {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    
    // Interleaved segment configuration with CHOOSE CLASS options
    this.segments = [
      { value: 1, type: 'number', color: '#ffffff', label: '1 SPIN' },
      { value: 'choose', type: 'special', color: 'rainbow', label: '⭐ CHOOSE CLASS ⭐' },
      { value: 2, type: 'number', color: '#4FC3F7', label: '2 SPINS' },
      { value: 3, type: 'number', color: '#66BB6A', label: '3 SPINS' },
      { value: 1, type: 'number', color: '#ffffff', label: '1 SPIN' },
      { value: 'choose', type: 'special', color: 'rainbow', label: '⭐ CHOOSE CLASS ⭐' },
      { value: 4, type: 'number', color: '#AB47BC', label: '4 SPINS' },
      { value: 2, type: 'number', color: '#4FC3F7', label: '2 SPINS' },
      { value: 5, type: 'number', color: '#FFD700', label: '5 SPINS' },
      { value: 1, type: 'number', color: '#ffffff', label: '1 SPIN' },
      { value: 3, type: 'number', color: '#66BB6A', label: '3 SPINS' },
      { value: 2, type: 'number', color: '#4FC3F7', label: '2 SPINS' },
      { value: 'choose', type: 'special', color: 'rainbow', label: '⭐ CHOOSE CLASS ⭐' },
      { value: 1, type: 'number', color: '#ffffff', label: '1 SPIN' },
      { value: 4, type: 'number', color: '#AB47BC', label: '4 SPINS' },
      { value: 3, type: 'number', color: '#66BB6A', label: '3 SPINS' },
      { value: 2, type: 'number', color: '#4FC3F7', label: '2 SPINS' },
      { value: 1, type: 'number', color: '#ffffff', label: '1 SPIN' },
      { value: 5, type: 'number', color: '#FFD700', label: '5 SPINS' },
      { value: 2, type: 'number', color: '#4FC3F7', label: '2 SPINS' }
    ];
    
    this.totalSegments = this.segments.length;
    this.currentRotation = 0;
    this.isSpinning = false;
    this.selectedValue = null;
    this.lastTickSegment = 0;
    
    // Animation settings
    this.friction = options.friction || 0.985;
    this.initialVelocity = options.initialVelocity || 40;
    
    // Sound configuration
    this.sounds = {
      tick: options.sounds?.tick || null,
      specialWin: options.sounds?.specialWin || null,
      normalWin: options.sounds?.normalWin || null
    };
    
    this.init();
  }
  
  init() {
    if (!this.container) {
      console.error('SpinWheelRevamped: Container not found');
      return;
    }
    
    // Create wheel structure
    this.container.innerHTML = `
      <div class="spin-wheel-revamped">
        <div class="wheel-3d-container">
          <div class="wheel-perspective">
            <div class="wheel-inner" id="wheel-inner">
              ${this.createSegments()}
            </div>
            <div class="wheel-overlay-top"></div>
            <div class="wheel-overlay-bottom"></div>
          </div>
          <div class="wheel-pointer">
            <div class="pointer-arrow"></div>
            <div class="pointer-base"></div>
          </div>
        </div>
        <div class="spin-controls">
          <button class="pull-to-spin" id="pull-to-spin">
            <span class="button-text">PULL TO SPIN</span>
            <div class="button-glow"></div>
          </button>
        </div>
        <div class="spin-result" id="spin-result"></div>
      </div>
    `;
    
    // Cache elements
    this.wheel = document.getElementById('wheel-inner');
    this.spinButton = document.getElementById('pull-to-spin');
    this.resultDisplay = document.getElementById('spin-result');
    
    // Debug check
    if (!this.wheel) {
      console.error('Wheel element not found!');
      return;
    }
    
    // Setup interactions
    this.setupInteractions();
    
    // Start idle animation
    this.startIdleAnimation();
  }
  
  createSegments() {
    let html = '';
    const cardHeight = 80; // Fixed height in pixels
    const cardGap = 10;
    const totalHeight = cardHeight + cardGap;
    
    // Create three sets for seamless scrolling
    for (let set = 0; set < 3; set++) {
      this.segments.forEach((segment, index) => {
        const yPosition = (set * this.totalSegments + index) * totalHeight;
        const isPrizeCard = segment.type === 'special';
        
        html += `
          <div class="wheel-card ${isPrizeCard ? 'card-special' : `card-value-${segment.value}`}" 
               style="top: ${yPosition}px;"
               data-index="${set * this.totalSegments + index}">
            <div class="card-inner">
              <div class="card-content">
                ${isPrizeCard ? 
                  `<div class="special-stars">
                    <span class="star star-1">⭐</span>
                    <span class="star star-2">⭐</span>
                    <span class="star star-3">⭐</span>
                  </div>
                  <div class="special-text">${segment.label}</div>
                  <div class="rainbow-shimmer"></div>` :
                  `<div class="card-number">${segment.value}</div>
                  <div class="card-label">${segment.label}</div>`
                }
              </div>
              <div class="card-edge"></div>
            </div>
          </div>
        `;
      });
    }
    
    return html;
  }
  
  setupInteractions() {
    let isDragging = false;
    let startY = 0;
    let pullDistance = 0;
    
    // Mouse events for pull-down
    this.spinButton.addEventListener('mousedown', (e) => {
      if (!this.isSpinning) {
        isDragging = true;
        startY = e.clientY;
        this.spinButton.classList.add('pulling');
        e.preventDefault();
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
        this.spinButton.classList.remove('pulling');
        if (pullDistance > 50) {
          this.pullDown(pullDistance);
        } else {
          this.resetPull();
        }
        pullDistance = 0;
      }
    });
    
    // Touch events for mobile
    this.spinButton.addEventListener('touchstart', (e) => {
      if (!this.isSpinning) {
        isDragging = true;
        startY = e.touches[0].clientY;
        this.spinButton.classList.add('pulling');
        e.preventDefault();
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
        this.spinButton.classList.remove('pulling');
        if (pullDistance > 50) {
          this.pullDown(pullDistance);
        } else {
          this.resetPull();
        }
        pullDistance = 0;
      }
    });
    
    // Also keep click as fallback
    this.spinButton.addEventListener('click', (e) => {
      if (!isDragging && !this.isSpinning) {
        this.spin();
      }
    });
  }
  
  updatePullVisual(distance) {
    const maxPull = 200;
    const pullPercent = Math.min(distance / maxPull, 1);
    
    // Move button down
    this.spinButton.style.transform = `translateY(${distance * 0.5}px)`;
    
    // Scale button slightly
    const scale = 1 - (pullPercent * 0.1);
    this.spinButton.style.transform += ` scale(${scale})`;
  }
  
  resetPull() {
    this.spinButton.style.transform = '';
  }
  
  pullDown(pullDistance) {
    this.resetPull();
    
    // More pull = more initial velocity
    const maxPull = 200;
    const pullPercent = Math.min(pullDistance / maxPull, 1);
    const bonusVelocity = pullPercent * 20;
    
    this.spin(bonusVelocity);
  }
  
  spin(bonusVelocity = 0) {
    if (this.isSpinning) return Promise.resolve(this.selectedValue);
    
    return new Promise((resolve) => {
      this.isSpinning = true;
      this.spinButton.disabled = true;
      this.spinButton.classList.add('spinning');
      
      // Stop idle animation
      this.stopIdleAnimation();
      
      // Clear previous result
      this.resultDisplay.classList.remove('show');
      
      // Calculate target
      const targetIndex = Math.floor(Math.random() * this.totalSegments);
      const cardHeight = 90; // Total height including gap
      const targetPosition = targetIndex * cardHeight + cardHeight / 2;
      
      // Add extra rotations for excitement
      const extraRotations = 3 + Math.floor(Math.random() * 2);
      const totalDistance = (extraRotations * this.totalSegments * cardHeight) + targetPosition;
      
      // Start animation with bonus velocity from pull
      this.animateSpin(totalDistance, targetIndex, resolve, bonusVelocity);
    });
  }
  
  animateSpin(targetDistance, targetIndex, resolve, bonusVelocity = 0) {
    let velocity = (this.initialVelocity + bonusVelocity) * 10; // Scale up for pixels
    let currentPosition = 0;
    let lastTime = 0;
    let lastTickPosition = 0;
    const cardHeight = 90;
    const totalHeight = this.totalSegments * cardHeight;
    
    // Debug log
    console.log('Starting spin:', { velocity, targetDistance, targetIndex });
    
    const animate = (timestamp) => {
      // Initialize lastTime on first frame
      if (lastTime === 0) {
        lastTime = timestamp;
        requestAnimationFrame(animate);
        return;
      }
      
      // Calculate delta time
      const deltaTime = (timestamp - lastTime) / 1000;
      lastTime = timestamp;
      
      if (velocity > 5 && currentPosition < targetDistance) {
        // Update position based on velocity and time
        currentPosition += velocity * deltaTime;
        
        // Apply transform with wrapping for infinite scroll
        const wrapPosition = currentPosition % (totalHeight * 3);
        // Keep in middle set range
        const normalizedPosition = wrapPosition % totalHeight + totalHeight;
        this.wheel.style.transform = `translateY(-${normalizedPosition}px)`;
        
        // Check for tick sounds
        const currentSegment = Math.floor(currentPosition / cardHeight);
        if (currentSegment !== lastTickPosition) {
          this.playTickSound(velocity / 10);
          lastTickPosition = currentSegment;
          
          // Add pointer wiggle
          this.animatePointer(velocity / 10);
        }
        
        // Apply friction based on time
        velocity *= Math.pow(this.friction, deltaTime * 60);
        
        // Additional slowdown near target
        const remaining = targetDistance - currentPosition;
        if (remaining < 500 && velocity > 20) {
          velocity *= Math.pow(0.95, deltaTime * 60);
        }
        
        requestAnimationFrame(animate);
      } else {
        // Calculate final position in middle set
        const finalPosition = totalHeight + (targetIndex * cardHeight) - 180; // Center it
        this.wheel.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)';
        this.wheel.style.transform = `translateY(-${finalPosition}px)`;
        
        // Clear transition after animation
        setTimeout(() => {
          this.wheel.style.transition = 'none';
        }, 600);
        
        // Get result
        const segment = this.segments[targetIndex];
        this.selectedValue = segment.value;
        
        // Wait for animation to complete before showing result
        setTimeout(() => {
          // Play final sound
          if (segment.type === 'special') {
            this.playSpecialWinSound();
          } else {
            this.playNormalWinSound();
          }
          
          // Show result after a brief pause
          setTimeout(() => {
            this.showResult(segment);
            this.isSpinning = false;
            this.spinButton.disabled = false;
            this.spinButton.classList.remove('spinning');
            
            // Emit event
            this.container.dispatchEvent(new CustomEvent('spinComplete', {
              detail: { 
                value: segment.value,
                type: segment.type,
                label: segment.label
              }
            }));
            
            resolve(segment.value);
            
            // Restart idle animation after delay
            setTimeout(() => {
              if (!this.isSpinning) {
                this.startIdleAnimation();
              }
            }, 3000);
          }, 500);
        }, 300);
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  updateCardPerspectives(translateY) {
    const cards = this.wheel.querySelectorAll('.wheel-card');
    const viewportHeight = 100; // Total viewport height in percentage
    const viewportCenter = 50; // Center of viewport
    const segmentHeight = 100 / this.totalSegments;
    
    cards.forEach((card) => {
      const cardTop = parseFloat(card.style.top);
      const cardCenter = cardTop + segmentHeight / 2;
      // Adjust for the wheel's position
      const cardViewPosition = ((cardCenter + translateY) % 200 + 200) % 200;
      
      // Calculate distance from center (0-100 scale)
      let distanceFromCenter = Math.abs(cardViewPosition - viewportCenter);
      if (distanceFromCenter > 100) {
        distanceFromCenter = 200 - distanceFromCenter;
      }
      
      // Create smooth scaling curve
      const normalizedDistance = distanceFromCenter / 50; // 0 to 1
      const scaleFactor = Math.cos(normalizedDistance * Math.PI / 2); // Cosine curve for smooth scaling
      
      // Apply transformations
      const scale = 0.7 + (scaleFactor * 0.3); // Scale from 0.7 to 1.0
      const opacity = 0.6 + (scaleFactor * 0.4); // Opacity from 0.6 to 1.0
      const blur = (1 - scaleFactor) * 2; // Blur from 0 to 2px
      const translateZ = scaleFactor * 50; // Z translation for depth
      
      card.style.transform = `scale(${scale}) translateZ(${translateZ}px)`;
      card.style.opacity = opacity;
      card.style.filter = `blur(${blur}px)`;
      card.style.zIndex = Math.floor(scaleFactor * 10);
    });
  }
  
  animatePointer(velocity) {
    const pointer = this.container.querySelector('.pointer-arrow');
    const wiggleAmount = Math.min(velocity / 10, 15);
    
    pointer.style.transform = `rotate(${wiggleAmount}deg)`;
    
    setTimeout(() => {
      pointer.style.transform = 'rotate(0deg)';
    }, 100);
  }
  
  playTickSound(velocity) {
    // Create tick sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Vary pitch based on speed
    const pitch = 400 + (velocity * 10);
    oscillator.frequency.value = pitch;
    oscillator.type = 'sine';
    
    // Quick tick envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
  }
  
  playSpecialWinSound() {
    // Fanfare for CHOOSE CLASS
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 - major chord
    
    notes.forEach((freq, i) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      
      const startTime = audioContext.currentTime + (i * 0.1);
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.4, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.5);
    });
  }
  
  playNormalWinSound() {
    // Simple ding
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 880; // A5
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  }
  
  showResult(segment) {
    const isPrizeCard = segment.type === 'special';
    
    this.resultDisplay.innerHTML = `
      <div class="result-content ${isPrizeCard ? 'result-special' : ''}">
        ${isPrizeCard ? 
          `<div class="result-stars">⭐ ⭐ ⭐</div>
           <div class="result-text">${segment.label}</div>` :
          `<div class="result-number">${segment.value}</div>
           <div class="result-text">${segment.label}</div>`
        }
      </div>
    `;
    
    this.resultDisplay.classList.add('show');
    
    if (isPrizeCard) {
      this.createSpecialEffects();
    }
  }
  
  createSpecialEffects() {
    // Rainbow particles
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'rainbow-particle';
      particle.style.cssText = `
        left: ${50 + (Math.random() - 0.5) * 100}%;
        top: 50%;
        --tx: ${(Math.random() - 0.5) * 200}px;
        --ty: ${-Math.random() * 200}px;
        animation-delay: ${Math.random() * 0.5}s;
      `;
      
      this.container.appendChild(particle);
      setTimeout(() => particle.remove(), 2000);
    }
  }
  
  startIdleAnimation() {
    // Set initial position to middle set
    const cardHeight = 90;
    const totalHeight = this.totalSegments * cardHeight;
    this.currentRotation = totalHeight; // Start at middle set
    this.wheel.style.transform = `translateY(-${this.currentRotation}px)`;
    
    let lastTime = 0;
    const idleAnimate = (timestamp) => {
      if (!this.isSpinning) {
        if (lastTime === 0) {
          lastTime = timestamp;
        }
        
        const deltaTime = (timestamp - lastTime) / 1000;
        lastTime = timestamp;
        
        // Slow continuous movement
        this.currentRotation += 30 * deltaTime; // 30 pixels per second
        
        // Wrap around to keep in middle range
        if (this.currentRotation > totalHeight * 2) {
          this.currentRotation -= totalHeight;
        }
        
        this.wheel.style.transform = `translateY(-${this.currentRotation}px)`;
        
        this.idleAnimationId = requestAnimationFrame(idleAnimate);
      }
    };
    
    this.idleAnimationId = requestAnimationFrame(idleAnimate);
  }
  
  stopIdleAnimation() {
    if (this.idleAnimationId) {
      cancelAnimationFrame(this.idleAnimationId);
      this.idleAnimationId = null;
    }
  }
  
  reset() {
    this.selectedValue = null;
    this.resultDisplay.classList.remove('show');
  }
  
  getResult() {
    return this.selectedValue;
  }
}

// Export for use
window.SpinWheelRevamped = SpinWheelRevamped;