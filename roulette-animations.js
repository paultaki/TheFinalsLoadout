// Roulette Animation System
class RouletteAnimationSystem {
  constructor() {
    this.classOptions = ['Light', 'Medium', 'Heavy'];
    this.spinOptions = [1, 2, 3, 4, 5];
    this.selectedClass = null;
    this.selectedSpins = null;
    this.animating = false;
    
    // Animation timing configurations
    this.classAnimationConfig = {
      initialSpeed: 50,      // 50ms between cycles initially
      finalSpeed: 800,       // 800ms at the end
      totalDuration: 3000,   // 3 seconds total
      decelerationStart: 0.4 // Start decelerating at 40% through
    };
    
    this.spinAnimationConfig = {
      initialSpeed: 50,      // 50ms between cycles initially
      finalSpeed: 600,       // 600ms at the end
      totalDuration: 2000,   // 2 seconds total
      decelerationStart: 0.5 // Start decelerating at 50% through
    };
  }
  
  // Main entry point for the full animation sequence
  async startFullSequence() {
    if (this.animating) return;
    
    this.animating = true;
    
    // Hide main UI elements
    document.querySelector('.selection-container').style.display = 'none';
    document.getElementById('output').style.display = 'none';
    
    // Show roulette container
    const rouletteContainer = document.getElementById('roulette-container');
    rouletteContainer.classList.remove('hidden');
    
    // Prevent body scrolling during animation
    document.body.style.overflow = 'hidden';
    
    // Phase 1: Class Selection
    await this.animateClassSelection();
    
    // Brief pause between phases
    await this.delay(500);
    
    // Phase 2: Spin Count Selection
    await this.animateSpinSelection();
    
    // Brief pause before starting the actual slot machine
    await this.delay(500);
    
    // Hide roulette container
    rouletteContainer.classList.add('hidden');
    
    // Restore body scrolling
    document.body.style.overflow = '';
    
    // Show the selection display
    this.showSelectionDisplay();
    
    // Show the main container and output
    document.querySelector('.selection-container').style.display = 'block';
    document.getElementById('output').style.display = 'block';
    
    // Set the state for the original system
    window.state.selectedClass = this.selectedClass;
    window.state.totalSpins = this.selectedSpins;
    
    this.animating = false;
    
    // Trigger the original spin mechanism
    window.spinLoadout();
  }
  
  // Animate class selection roulette
  async animateClassSelection() {
    const classSection = document.getElementById('class-roulette');
    classSection.classList.remove('hidden');
    
    const classElements = document.querySelectorAll('.class-option');
    let currentIndex = 0;
    const startTime = Date.now();
    
    // Randomly select the winner
    const winnerIndex = Math.floor(Math.random() * this.classOptions.length);
    this.selectedClass = this.classOptions[winnerIndex];
    
    return new Promise((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        
        // Stop at exactly 3 seconds
        if (elapsed >= this.classAnimationConfig.totalDuration) {
          // Final selection
          classElements.forEach(el => el.classList.remove('active'));
          classElements[winnerIndex].classList.add('active', 'winner');
          
          // Add screen shake effect to roulette container only
          const rouletteContainer = document.getElementById('roulette-container');
          rouletteContainer.classList.add('screen-shake');
          setTimeout(() => rouletteContainer.classList.remove('screen-shake'), 500);
          
          // Play class win sound
          this.playClassWinSound();
          
          // Add flash effect
          this.createFlashEffect();
          
          setTimeout(() => {
            classSection.classList.add('hidden');
            resolve();
          }, 500);
          return; // Exit the animation
        }
        
        // Clear all active states
        classElements.forEach(el => el.classList.remove('active'));
        
        // Set current active
        classElements[currentIndex].classList.add('active');
        
        // Play tick sound if available
        this.playTickSound();
        
        // Calculate speed based on progress (exponential slowdown)
        const progress = elapsed / this.classAnimationConfig.totalDuration;
        let speed = this.classAnimationConfig.initialSpeed;
        
        if (progress > this.classAnimationConfig.decelerationStart) {
          const decelerationProgress = (progress - this.classAnimationConfig.decelerationStart) / 
                                     (1 - this.classAnimationConfig.decelerationStart);
          speed = this.classAnimationConfig.initialSpeed + 
                  (this.classAnimationConfig.finalSpeed - this.classAnimationConfig.initialSpeed) * 
                  Math.pow(decelerationProgress, 2);
        }
        
        // If we're in the last 500ms, make sure we land on the winner
        if (elapsed >= this.classAnimationConfig.totalDuration - 500) {
          currentIndex = winnerIndex;
          speed = 500; // Final delay
        } else {
          // Continue cycling
          currentIndex = (currentIndex + 1) % this.classOptions.length;
        }
        
        // Schedule next frame
        setTimeout(animate, speed);
      };
      
      animate();
    });
  }
  
  // Animate spin count selection
  async animateSpinSelection() {
    const spinSection = document.getElementById('spin-roulette');
    spinSection.classList.remove('hidden');
    
    const spinElements = document.querySelectorAll('.spin-option');
    let currentIndex = 0;
    const startTime = Date.now();
    
    // Randomly select the winner
    const winnerIndex = Math.floor(Math.random() * this.spinOptions.length);
    this.selectedSpins = this.spinOptions[winnerIndex];
    
    return new Promise((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        
        // Stop at exactly 2 seconds
        if (elapsed >= this.spinAnimationConfig.totalDuration) {
          // Final selection
          spinElements.forEach(el => el.classList.remove('active'));
          spinElements[winnerIndex].classList.add('active', 'winner');
          
          // Add effects to roulette container only
          const rouletteContainer = document.getElementById('roulette-container');
          rouletteContainer.classList.add('screen-shake');
          setTimeout(() => rouletteContainer.classList.remove('screen-shake'), 500);
          
          this.playSpinWinSound();
          this.createFlashEffect();
          
          // Update status
          const statusEl = document.getElementById('spinStatus');
          statusEl.textContent = `${this.selectedSpins} SPIN${this.selectedSpins > 1 ? 'S' : ''} SELECTED!`;
          statusEl.classList.add('neon-cycle');
          
          setTimeout(() => {
            spinSection.classList.add('hidden');
            statusEl.textContent = '';
            resolve();
          }, 500);
          return; // Exit the animation
        }
        
        // Clear all active states
        spinElements.forEach(el => el.classList.remove('active'));
        
        // Set current active with neon effect
        spinElements[currentIndex].classList.add('active');
        
        // Create particle effect (less frequent to avoid overwhelming)
        if (elapsed % 100 < 50) {
          this.createParticleEffect(spinElements[currentIndex]);
        }
        
        // Play tick sound
        this.playTickSound();
        
        // Calculate speed based on progress
        const progress = elapsed / this.spinAnimationConfig.totalDuration;
        let speed = this.spinAnimationConfig.initialSpeed;
        
        if (progress > this.spinAnimationConfig.decelerationStart) {
          const decelerationProgress = (progress - this.spinAnimationConfig.decelerationStart) / 
                                     (1 - this.spinAnimationConfig.decelerationStart);
          speed = this.spinAnimationConfig.initialSpeed + 
                  (this.spinAnimationConfig.finalSpeed - this.spinAnimationConfig.initialSpeed) * 
                  Math.pow(decelerationProgress, 2);
        }
        
        // If we're in the last 400ms, make sure we land on the winner
        if (elapsed >= this.spinAnimationConfig.totalDuration - 400) {
          currentIndex = winnerIndex;
          speed = 400; // Final delay
        } else {
          // Continue cycling
          currentIndex = (currentIndex + 1) % this.spinOptions.length;
        }
        
        // Schedule next frame
        setTimeout(animate, speed);
      };
      
      animate();
    });
  }
  
  // Visual effects
  createFlashEffect() {
    const flash = document.createElement('div');
    flash.className = 'flash-overlay';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 500);
  }
  
  createParticleEffect(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    document.body.appendChild(particlesContainer);
    
    for (let i = 0; i < 10; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = centerX + 'px';
      particle.style.top = centerY + 'px';
      
      // Random direction
      const angle = (Math.PI * 2 * i) / 10;
      const distance = 100 + Math.random() * 100;
      particle.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
      particle.style.setProperty('--ty', Math.sin(angle) * distance + 'px');
      
      particlesContainer.appendChild(particle);
    }
    
    setTimeout(() => particlesContainer.remove(), 1000);
  }
  
  // Sound effects (placeholders - implement with actual audio files)
  playTickSound() {
    // Check if sound is enabled
    if (!window.state || !window.state.soundEnabled) return;
    
    // Create a tick sound using Web Audio API or play an audio file
    const audio = document.getElementById('tickSound');
    if (audio && !this._lastTickTime || Date.now() - this._lastTickTime > 30) {
      this._lastTickTime = Date.now();
      audio.currentTime = 0;
      audio.volume = 0.2;
      audio.playbackRate = 2.0;
      audio.play().catch(() => {});
    }
  }
  
  playClassWinSound() {
    // Check if sound is enabled
    if (!window.state || !window.state.soundEnabled) return;
    
    // Play chang.mp3 for class selection
    const audio = document.getElementById('classWinSound');
    if (audio) {
      audio.currentTime = 0;
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }
  }
  
  playSpinWinSound() {
    // Check if sound is enabled
    if (!window.state || !window.state.soundEnabled) return;
    
    // Play Tabby Tune.mp3 for spin selection
    const audio = document.getElementById('spinWinSound');
    if (audio) {
      audio.currentTime = 0;
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }
  }
  
  // Show selection display
  showSelectionDisplay() {
    const selectionDisplay = document.getElementById('selection-display');
    const classSpan = selectionDisplay.querySelector('.selection-class');
    const spinsSpan = selectionDisplay.querySelector('.selection-spins');
    
    // Set the class with appropriate color
    classSpan.textContent = this.selectedClass.toUpperCase();
    classSpan.className = `selection-class ${this.selectedClass.toLowerCase()}`;
    
    // Set the spins text
    spinsSpan.textContent = `${this.selectedSpins} SPIN${this.selectedSpins > 1 ? 'S' : ''}`;
    
    // Show the display
    selectionDisplay.classList.remove('hidden');
    
    // Hide it after the slot machine starts
    setTimeout(() => {
      selectionDisplay.classList.add('hidden');
    }, 5000);
  }
  
  // Utility
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export for use in main app.js
window.RouletteAnimationSystem = RouletteAnimationSystem;