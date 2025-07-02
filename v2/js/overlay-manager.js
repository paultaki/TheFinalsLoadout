// =====================================
// OVERLAY MANAGER - ASYNC FLOW CONTROLLER
// =====================================

// Global overlay state
const overlayState = {
  isActive: false,
  currentOverlay: null,
  spinCount: 0,
  selectedClass: null,
  isJackpot: false
};

// Sound manager with relative paths
const overlayAudio = {
  beep: new Audio('sounds/beep.mp3'),
  ding: new Audio('sounds/ding.mp3'),
  dingDing: new Audio('sounds/ding-ding.mp3'),
  spinning: new Audio('sounds/spinning.mp3'),
  transition: new Audio('sounds/transition.mp3'),
  roulette: new Audio('sounds/roulette.mp3'),
  finalSound: new Audio('sounds/pop-pour-perform.mp3')
};

// Preload all sounds
Object.values(overlayAudio).forEach(audio => {
  audio.preload = 'auto';
});

// =====================================
// OVERLAY CONTAINER MANAGEMENT
// =====================================

function getOverlayRoot() {
  return document.getElementById('overlay-root');
}

function createOverlayStructure() {
  const root = getOverlayRoot();
  
  // Clear any existing content
  root.innerHTML = '';
  
  // Create backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'overlay-backdrop';
  backdrop.id = 'overlay-backdrop';
  
  // Create content wrapper
  const content = document.createElement('div');
  content.className = 'overlay-content';
  content.id = 'overlay-content';
  
  root.appendChild(backdrop);
  root.appendChild(content);
  
  // Enable pointer events on root
  root.style.pointerEvents = 'auto';
  
  return { backdrop, content };
}

function clearOverlay() {
  const root = getOverlayRoot();
  root.innerHTML = '';
  root.style.pointerEvents = 'none';
  overlayState.currentOverlay = null;
}

// =====================================
// REVEAL CARD FUNCTIONS
// =====================================

function showRevealCard(options) {
  return new Promise((resolve) => {
    const { title, subtitle, duration = 2000, isJackpot = false } = options;
    
    const { backdrop, content } = createOverlayStructure();
    
    // Create reveal card
    const card = document.createElement('div');
    card.className = `reveal-card ${isJackpot ? 'jackpot' : ''}`;
    
    card.innerHTML = `
      <h1>${title}</h1>
      ${subtitle ? `<p>${subtitle}</p>` : ''}
      ${isJackpot ? '<p class="sub-text">Choose Your Class!</p>' : ''}
    `;
    
    content.appendChild(card);
    
    // Animate in
    requestAnimationFrame(() => {
      backdrop.classList.add('active');
      card.classList.add('active');
    });
    
    // Play sound
    if (isJackpot) {
      overlayAudio.dingDing.currentTime = 0;
      overlayAudio.dingDing.play();
      // Stop jackpot sound after 1.5s
      setTimeout(() => {
        overlayAudio.dingDing.pause();
        overlayAudio.dingDing.currentTime = 0;
      }, 1500);
    }
    
    // Auto dismiss
    setTimeout(() => {
      card.classList.remove('active');
      backdrop.classList.remove('active');
      
      setTimeout(() => {
        clearOverlay();
        resolve();
      }, 300);
    }, duration);
  });
}

// =====================================
// OVERLAY STUBS (TO BE IMPLEMENTED)
// =====================================

// =====================================
// SPIN WHEEL OVERLAY - PRICE IS RIGHT STYLE
// =====================================

// Card configuration
const SPIN_CARDS = [
  { value: '1', spins: 1, label: '1', className: 'card-1' },
  { value: 'JACKPOT', spins: 3, label: 'Jackpot!\nChoose Class\n3 Spins', className: 'card-special jackpot', isJackpot: true },
  { value: '2', spins: 2, label: '2', className: 'card-2' },
  { value: '3', spins: 3, label: '3', className: 'card-3' },
  { value: '4', spins: 4, label: '4', className: 'card-4' },
  { value: 'JACKPOT', spins: 3, label: 'Jackpot!\nChoose Class\n3 Spins', className: 'card-special jackpot', isJackpot: true },
  { value: '5', spins: 5, label: '5', className: 'card-5' }
];

// Triple for infinite scroll effect
const INFINITE_CARDS = [...SPIN_CARDS, ...SPIN_CARDS, ...SPIN_CARDS];

// Physics configuration
const SPIN_PHYSICS = {
  initialVelocity: { min: 4800, max: 5600 },
  friction: 0.985,
  decelerationThreshold: 600,
  decelerationDuration: 600,
  idleSpeed: 0.3,
  minTickVelocity: 50
};

// Animation state
let spinWheelState = {
  isSpinning: false,
  animationId: null,
  idleAnimationId: null,
  currentDistance: 0,
  currentVelocity: 0,
  lastTime: 0,
  lastTickIndex: 0,
  isDecelerating: false,
  decelerateStartTime: 0,
  decelerateStartDistance: 0,
  decelerateStartVelocity: 0
};

// Easing function
function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

// Create confetti particles
function createSpinConfetti() {
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-particle';
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.backgroundColor = ['#f59e0b', '#ec4899', '#3b82f6', '#10b981'][
      Math.floor(Math.random() * 4)
    ];
    confetti.style.animationDelay = `${Math.random()}s`;
    confetti.style.animationDuration = `${2 + Math.random()}s`;
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 3000);
  }
}

// Main spin wheel overlay function
async function showSpinWheelOverlay() {
  console.log('🎰 Showing spin wheel overlay...');
  
  return new Promise((resolve) => {
    const { backdrop, content } = createOverlayStructure();
    
    // Create spin wheel container
    const wheelContainer = document.createElement('div');
    wheelContainer.className = 'spin-wheel-overlay';
    wheelContainer.innerHTML = `
      <div class="spin-count-wheel">
        <div class="spin-wheel-title">
          <h2>SPIN SELECTOR</h2>
          <p>Determining your fate...</p>
        </div>
        <div class="wheel-container">
          <div class="wheel-frame" id="spin-wheel-frame">
            <div class="fade-top"></div>
            <div class="fade-bottom"></div>
            
            <div class="ticker" id="spin-ticker">
              <div class="ticker-triangle"></div>
            </div>
            
            <div class="wheel-track">
              <ul class="wheel-list" id="spin-wheel-list">
                ${INFINITE_CARDS.map((card, index) => `
                  <li class="card ${card.className}" 
                      data-index="${index}" 
                      data-spins="${card.spins}"
                      data-value="${card.value}">
                    ${card.label.split('\n').map(line => `${line}`).join('<br>')}
                    <span class="peg"></span>
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
    
    content.appendChild(wheelContainer);
    
    // Get elements
    const wheelFrame = document.getElementById('spin-wheel-frame');
    const wheelList = document.getElementById('spin-wheel-list');
    const ticker = document.getElementById('spin-ticker');
    
    // Get card height
    const getCardHeight = () => {
      const card = wheelList.querySelector('.card');
      return card ? card.getBoundingClientRect().height + 16 : 90;
    };
    
    // Apply transform for infinite scroll
    const applyInfiniteScroll = (distance) => {
      const cardHeight = getCardHeight();
      let normalizedDistance = distance % (SPIN_CARDS.length * cardHeight * 3);
      if (normalizedDistance > SPIN_CARDS.length * cardHeight * 2) {
        normalizedDistance -= SPIN_CARDS.length * cardHeight;
      }
      // Changed from negative to positive to spin downward
      wheelList.style.transform = `translateY(${normalizedDistance}px)`;
      
      // Ensure transform is applied
      if (!wheelList) {
        console.error('wheelList is null!');
        return;
      }
    };
    
    // Reset animation state
    spinWheelState = {
      isSpinning: false,
      animationId: null,
      idleAnimationId: null,
      currentDistance: 0,
      currentVelocity: 0,
      lastTime: 0,
      lastTickIndex: 0,
      isDecelerating: false,
      decelerateStartTime: 0,
      decelerateStartDistance: 0,
      decelerateStartVelocity: 0
    };
    
    // Ensure wheel list has initial position at the top for downward spin
    if (wheelList) {
      // Start with a small offset so cards are visible
      const cardHeight = getCardHeight();
      const initialOffset = cardHeight * SPIN_CARDS.length; // Start at middle of triple list
      spinWheelState.currentDistance = initialOffset; // Set initial distance
      applyInfiniteScroll(spinWheelState.currentDistance);
    }
    
    // Handle ticker animation
    const animateTickerCollision = () => {
      // Play beep sound
      try {
        overlayAudio.beep.currentTime = 0;
        overlayAudio.beep.play().catch(err => {
          console.warn('Failed to play beep sound:', err);
        });
      } catch (e) {
        console.warn('Beep sound error:', e);
      }
      
      // Animate ticker rotation
      ticker.animate([
        { transform: 'translateY(-50%) rotate(0deg)' },
        { transform: 'translateY(-50%) rotate(-15deg)' },
        { transform: 'translateY(-50%) rotate(0deg)' }
      ], {
        duration: 150,
        easing: 'ease-out'
      });
      
      // Cabinet shake effect
      wheelFrame.animate([
        { transform: 'translateX(-2px)' },
        { transform: 'translateX(2px)' },
        { transform: 'translateX(0)' }
      ], {
        duration: 90
      });
    };
    
    // Find winning card
    const findWinningCard = () => {
      const frameRect = wheelFrame.getBoundingClientRect();
      const frameCenter = frameRect.top + frameRect.height / 2;
      
      const cards = wheelList.querySelectorAll('.card');
      let winningCard = null;
      let result = null;
      
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.top + rect.height / 2;
        
        if (Math.abs(cardCenter - frameCenter) < rect.height / 2) {
          winningCard = card;
          const dataIndex = parseInt(card.getAttribute('data-index')) % SPIN_CARDS.length;
          result = SPIN_CARDS[dataIndex];
          break;
        }
      }
      
      return { card: winningCard, result: result || SPIN_CARDS[0] };
    };
    
    // Handle spin stop
    const handleStop = () => {
      spinWheelState.isSpinning = false;
      
      // Cancel animation
      if (spinWheelState.animationId) {
        cancelAnimationFrame(spinWheelState.animationId);
        spinWheelState.animationId = null;
      }
      
      // Find winner
      const { card: winningCard, result } = findWinningCard();
      
      // Highlight winning card
      const cards = wheelList.querySelectorAll('.card');
      cards.forEach(card => card.classList.remove('winner'));
      if (winningCard) {
        winningCard.classList.add('winner');
      }
      
      // Play sound
      if (result.isJackpot) {
        overlayAudio.dingDing.currentTime = 0;
        overlayAudio.dingDing.play();
        // Stop jackpot sound after 1.5s
        setTimeout(() => {
          overlayAudio.dingDing.pause();
          overlayAudio.dingDing.currentTime = 0;
        }, 1500);
      }
      
      // Add glow effect
      wheelFrame.classList.add('glowing');
      
      // Create confetti
      createSpinConfetti();
      
      // Extra confetti for jackpot
      if (result.isJackpot) {
        setTimeout(() => createSpinConfetti(), 300);
        setTimeout(() => createSpinConfetti(), 600);
      }
      
      // Cleanup and resolve after delay
      setTimeout(() => {
        // Stop idle animation
        if (spinWheelState.idleAnimationId) {
          cancelAnimationFrame(spinWheelState.idleAnimationId);
        }
        
        // Animate out
        wheelContainer.classList.remove('active');
        backdrop.classList.remove('active');
        
        setTimeout(() => {
          clearOverlay();
          resolve({
            value: result.value,
            spins: result.spins,
            isJackpot: result.isJackpot || false
          });
        }, 300);
      }, 2000);
    };
    
    // Physics update
    const updatePhysics = (timestamp) => {
      if (!spinWheelState.isSpinning) return;
      
      if (spinWheelState.lastTime === 0) {
        spinWheelState.lastTime = timestamp;
        spinWheelState.animationId = requestAnimationFrame(updatePhysics);
        return;
      }
      
      const deltaTime = (timestamp - spinWheelState.lastTime) / 1000;
      spinWheelState.lastTime = timestamp;
      
      const cardHeight = getCardHeight();
      
      if (!spinWheelState.isDecelerating) {
        // Normal spinning
        spinWheelState.currentDistance += spinWheelState.currentVelocity * deltaTime;
        spinWheelState.currentVelocity *= Math.pow(SPIN_PHYSICS.friction, deltaTime * 60);
        
        // Ensure minimum movement for visibility
        if (spinWheelState.currentDistance < 10 && spinWheelState.currentVelocity > 1000) {
          // Force initial movement
          spinWheelState.currentDistance = 10;
        }
        
        // Check for tick
        const tickIndex = Math.floor(spinWheelState.currentDistance / cardHeight);
        if (tickIndex !== spinWheelState.lastTickIndex) {
          animateTickerCollision();
          spinWheelState.lastTickIndex = tickIndex;
        }
        
        // Start deceleration
        if (spinWheelState.currentVelocity < SPIN_PHYSICS.decelerationThreshold) {
          spinWheelState.isDecelerating = true;
          spinWheelState.decelerateStartTime = timestamp;
          spinWheelState.decelerateStartDistance = spinWheelState.currentDistance;
          spinWheelState.decelerateStartVelocity = spinWheelState.currentVelocity;
        }
      } else {
        // Smooth deceleration
        const decelerateElapsed = (timestamp - spinWheelState.decelerateStartTime) / SPIN_PHYSICS.decelerationDuration;
        const progress = Math.min(1, decelerateElapsed);
        const eased = easeOutExpo(progress);
        
        spinWheelState.currentDistance += spinWheelState.currentVelocity * deltaTime;
        spinWheelState.currentVelocity = spinWheelState.decelerateStartVelocity * (1 - eased);
        
        // Slower ticks during deceleration
        const tickIndex = Math.floor(spinWheelState.currentDistance / cardHeight);
        if (tickIndex !== spinWheelState.lastTickIndex && spinWheelState.currentVelocity > SPIN_PHYSICS.minTickVelocity) {
          animateTickerCollision();
          spinWheelState.lastTickIndex = tickIndex;
        }
        
        if (progress >= 1) {
          handleStop();
          return;
        }
      }
      
      // Apply transform
      applyInfiniteScroll(spinWheelState.currentDistance);
      
      spinWheelState.animationId = requestAnimationFrame(updatePhysics);
    };
    
    // Start idle animation
    const startIdleAnimation = () => {
      const idleAnimate = () => {
        if (!spinWheelState.isSpinning) {
          spinWheelState.currentDistance += SPIN_PHYSICS.idleSpeed;
          applyInfiniteScroll(spinWheelState.currentDistance);
          spinWheelState.idleAnimationId = requestAnimationFrame(idleAnimate);
        }
      };
      idleAnimate();
    };
    
    // Spin function
    const spin = () => {
      if (spinWheelState.isSpinning) return;
      
      // Stop idle animation
      if (spinWheelState.idleAnimationId) {
        cancelAnimationFrame(spinWheelState.idleAnimationId);
        spinWheelState.idleAnimationId = null;
      }
      
      spinWheelState.isSpinning = true;
      
      // Reset state
      spinWheelState.currentVelocity = SPIN_PHYSICS.initialVelocity.min + 
        Math.random() * (SPIN_PHYSICS.initialVelocity.max - SPIN_PHYSICS.initialVelocity.min);
      spinWheelState.lastTime = 0;
      spinWheelState.lastTickIndex = 0;
      spinWheelState.isDecelerating = false;
      
      // Play spin sound
      try {
        overlayAudio.spinning.currentTime = 0;
        overlayAudio.spinning.volume = 0.3;
        overlayAudio.spinning.play().catch(() => {});
      } catch (e) {
        // Sound not available
      }
      
      // Remove glow
      wheelFrame.classList.remove('glowing');
      
      // Start physics
      spinWheelState.animationId = requestAnimationFrame(updatePhysics);
    };
    
    // Animate in
    requestAnimationFrame(() => {
      backdrop.classList.add('active');
      wheelContainer.classList.add('active');
      
      // Auto-start spin after 1 second
      setTimeout(() => {
        console.log('🎰 Auto-starting spin wheel after 1 second delay...');
        spin();
      }, 1000);
    });
    
    // Start idle animation
    startIdleAnimation();
  });
}

// =====================================
// CLASS ROULETTE OVERLAY - CASINO WHEEL
// =====================================

// Roulette configuration
const ROULETTE_CONFIG = {
  baseClasses: [
    { name: 'Light', color: '#4FC3F7' },
    { name: 'Medium', color: '#AB47BC' },
    { name: 'Heavy', color: '#FF1744' }
  ],
  spinDuration: 8000, // 8 seconds for wheel
  minRotations: 8, // More rotations for visible spinning
  maxRotations: 12, // Maximum full rotations
  ballDuration: 7500, // 7.5 seconds for ball
  ballRadius: 140, // Ball orbit radius when moving
  finalRadius: 100, // Ball final position on segment (closer to center)
  wheelRadius: 160, // Wheel visual radius
  outerRadius: 185, // Ball starting radius (outer track)
  // More realistic physics phases
  phases: {
    launch: 0.15,      // 15% - initial momentum
    coast: 0.35,       // 35% - steady high speed
    decelerate: 0.25,  // 25% - gradual slowdown
    spiral: 0.15,      // 15% - drop to inner track
    bounce: 0.07,      // 7% - bouncing between pockets
    settle: 0.03       // 3% - final settling
  }
};

// Animation state for roulette
let rouletteState = {
  isSpinning: false,
  wheelRotation: 0,
  ballRotation: 0,
  totalBallRotation: 0,
  animationId: null,
  startTime: 0,
  targetRotation: 0,
  selectedClass: null
};

// Realistic physics simulation for roulette ball
function getRoulettePhysics(progress) {
  const phases = ROULETTE_CONFIG.phases;
  
  if (progress < phases.launch) {
    // Phase 1: Launch - constant initial speed
    return {
      speed: 1.0, // Full speed from start
      radius: 1.0,
      wobble: 0,
      blur: true
    };
  } else if (progress < phases.launch + phases.coast) {
    // Phase 2: Coast - maintain speed
    return {
      speed: 1.0, // Maintain full speed
      radius: 1.0,
      wobble: 0,
      blur: true
    };
  } else if (progress < phases.launch + phases.coast + phases.decelerate) {
    // Phase 3: Decelerate - gradual slowdown
    const p = (progress - phases.launch - phases.coast) / phases.decelerate;
    return {
      speed: 1.0 - (p * 0.5), // Linear deceleration from 100% to 50%
      radius: 1.0,
      wobble: p * 0.01,
      blur: p < 0.3
    };
  } else if (progress < phases.launch + phases.coast + phases.decelerate + phases.spiral) {
    // Phase 4: Spiral - drop to inner track
    const p = (progress - phases.launch - phases.coast - phases.decelerate) / phases.spiral;
    const speedCurve = 1 - p * 0.7; // Linear slowdown
    return {
      speed: 0.5 * speedCurve, // From 50% to 15%
      radius: 1.0 - (p * 0.25), // Move inward
      wobble: 0.01 + p * 0.02,
      blur: false
    };
  } else if (progress < phases.launch + phases.coast + phases.decelerate + phases.spiral + phases.bounce) {
    // Phase 5: Bounce - ball hits dividers
    const p = (progress - phases.launch - phases.coast - phases.decelerate - phases.spiral) / phases.bounce;
    const bounceWave = Math.sin(p * Math.PI * 4) * (1 - p);
    return {
      speed: 0.15 - (p * 0.13), // Slow from 15% to 2%
      radius: 0.75 + bounceWave * 0.03,
      wobble: 0.03 + bounceWave * 0.01,
      blur: false
    };
  } else {
    // Phase 6: Settle - final rest on segment
    const p = (progress - phases.launch - phases.coast - phases.decelerate - phases.spiral - phases.bounce) / phases.settle;
    return {
      speed: 0.02 * (1 - p),
      radius: 0.75 - (p * 0.15), // Move further inward to rest on segment
      wobble: 0,
      blur: false,
      settling: true,
      settleProgress: p
    };
  }
}

// Easing function for wheel rotation - less aggressive slowdown
function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 2.5); // Changed from 4 to 2.5 for more visible spinning
}

// Main class roulette overlay function
async function showClassRouletteOverlay() {
  console.log('🎲 Showing class roulette overlay...');
  
  return new Promise((resolve) => {
    const { backdrop, content } = createOverlayStructure();
    
    // Get available classes from filters
    const getAvailableClasses = () => {
      const light = localStorage.getItem('includeLight') !== 'false';
      const medium = localStorage.getItem('includeMedium') !== 'false';
      const heavy = localStorage.getItem('includeHeavy') !== 'false';
      
      const available = [];
      if (light) available.push({ name: 'Light', color: '#4FC3F7' });
      if (medium) available.push({ name: 'Medium', color: '#AB47BC' });
      if (heavy) available.push({ name: 'Heavy', color: '#FF1744' });
      
      // If no classes selected, default to all
      if (available.length === 0) {
        return ROULETTE_CONFIG.baseClasses;
      }
      
      return available;
    };
    
    // Generate wheel segments
    const generateSegments = () => {
      const availableClasses = getAvailableClasses();
      const segments = [];
      
      // Create 12 segments for more visual excitement
      const segmentCount = 12;
      const segmentAngle = 360 / segmentCount;
      
      if (availableClasses.length === 1) {
        // All segments are the same class
        for (let i = 0; i < segmentCount; i++) {
          segments.push({
            ...availableClasses[0],
            angle: i * segmentAngle,
            endAngle: (i + 1) * segmentAngle
          });
        }
      } else {
        // Alternate between available classes for visual variety
        for (let i = 0; i < segmentCount; i++) {
          const classIndex = i % availableClasses.length;
          segments.push({
            ...availableClasses[classIndex],
            angle: i * segmentAngle,
            endAngle: (i + 1) * segmentAngle
          });
        }
      }
      
      return segments;
    };
    
    const segments = generateSegments();
    console.log('🎯 Generated segments:', segments);
    
    // Create roulette container
    const rouletteContainer = document.createElement('div');
    rouletteContainer.className = 'roulette-overlay';
    rouletteContainer.innerHTML = `
      <div class="roulette-container">
        <div class="roulette-title">
          <h2>SELECTING CLASS</h2>
          <p>Fate decides your build...</p>
        </div>
        
        <div class="roulette-wheel-wrapper">
          <div class="roulette-wheel" id="roulette-wheel">
            <!-- Outer decorative ring -->
            <div class="wheel-outer-ring"></div>
            
            <!-- Main wheel with segments -->
            <svg class="wheel-svg" viewBox="0 0 400 400" width="400" height="400">
              <defs>
                <filter id="wheelShadow">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                  <feOffset dx="0" dy="2" result="offsetblur"/>
                  <feFlood flood-color="#000000" flood-opacity="0.5"/>
                  <feComposite in2="offsetblur" operator="in"/>
                  <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <clipPath id="centerClip">
                  <circle cx="200" cy="200" r="35"/>
                </clipPath>
              </defs>
              
              <!-- Rotating group containing segments and labels -->
              <g class="wheel-rotating-group" id="wheel-rotating-group">
                <!-- Segments -->
                <g class="wheel-segments" filter="url(#wheelShadow)">
                  ${segments.map((seg, i) => {
                    const startAngle = seg.angle * Math.PI / 180;
                    const endAngle = seg.endAngle * Math.PI / 180;
                    const x1 = 200 + 160 * Math.cos(startAngle);
                    const y1 = 200 + 160 * Math.sin(startAngle);
                    const x2 = 200 + 160 * Math.cos(endAngle);
                    const y2 = 200 + 160 * Math.sin(endAngle);
                    
                    return `
                      <path 
                        d="M 200 200 L ${x1} ${y1} A 160 160 0 0 1 ${x2} ${y2} Z"
                        fill="${seg.color}"
                        stroke="#FFD700"
                        stroke-width="3"
                        class="wheel-segment"
                        data-class="${seg.name}"
                      />
                    `;
                  }).join('')}
                </g>
                
                <!-- Class labels -->
                <g class="wheel-labels">
                  ${segments.map((seg) => {
                    const segmentAngle = seg.endAngle - seg.angle;
                    const labelAngle = seg.angle + segmentAngle / 2; // Center of segment
                    const labelRadius = 100;
                    const x = 200 + labelRadius * Math.cos(labelAngle * Math.PI / 180);
                    const y = 200 + labelRadius * Math.sin(labelAngle * Math.PI / 180);
                    const fontSize = segments.length > 6 ? 18 : 24; // Smaller text for 12 segments
                    
                    return `
                      <text 
                        x="${x}" 
                        y="${y}" 
                        text-anchor="middle" 
                        dominant-baseline="middle"
                        class="wheel-label"
                        font-size="${fontSize}"
                        transform="rotate(${labelAngle} ${x} ${y})"
                      >
                        ${seg.name.toUpperCase()}
                      </text>
                    `;
                  }).join('')}
                </g>
              </g>
              
              <!-- Static center hub with logo -->
              <g class="wheel-static-center">
                <circle cx="200" cy="200" r="40" fill="#222" stroke="#FFD700" stroke-width="3"/>
                <image href="images/the-finals.webp" 
                       x="165" y="165" 
                       width="70" height="70" 
                       clip-path="url(#centerClip)"
                       opacity="0.9"/>
              </g>
            </svg>
            
            <!-- Ball -->
            <div class="roulette-ball" id="roulette-ball">
              <div class="ball-inner"></div>
            </div>
          </div>
          
          <!-- Decorative lights -->
          <div class="roulette-lights">
            ${Array(12).fill(0).map((_, i) => `
              <div class="light" style="transform: rotate(${i * 30}deg) translateY(-200px); animation-delay: ${i * 0.1}s"></div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    
    content.appendChild(rouletteContainer);
    
    // Get elements
    const wheel = document.getElementById('roulette-wheel');
    const ball = document.getElementById('roulette-ball');
    const rotatingGroup = document.getElementById('wheel-rotating-group');
    
    // Debug log
    console.log('🎲 Roulette elements:', {
      wheel: !!wheel,
      ball: !!ball,
      rotatingGroup: !!rotatingGroup
    });
    
    // Reset state
    rouletteState = {
      isSpinning: false,
      wheelRotation: 0,
      ballRotation: 0,
      totalBallRotation: 0,
      animationId: null,
      startTime: 0,
      targetRotation: 0,
      selectedClass: null,
      rotatingGroup: rotatingGroup // Cache the element
    };
    
    // Calculate winner based on ball position relative to wheel
    const calculateWinner = () => {
      // Get final wheel position (positive rotation)
      const wheelAngle = rouletteState.wheelRotation % 360;
      
      // Get ball's final position
      const ballAngle = ((-rouletteState.totalBallRotation % 360) + 360) % 360;
      
      // Calculate relative position of ball on wheel
      // Ball angle minus wheel angle gives us position on the wheel
      const relativeAngle = ((ballAngle - wheelAngle) + 360) % 360;
      
      // Find which segment this relative angle falls into
      const segmentAngle = 360 / segments.length;
      let segmentIndex = Math.floor(relativeAngle / segmentAngle);
      
      // Ensure index is within bounds
      if (segmentIndex < 0) segmentIndex += segments.length;
      if (segmentIndex >= segments.length) segmentIndex = segmentIndex % segments.length;
      
      const winningSegment = segments[segmentIndex];
      
      console.log('🎯 Winner calculation:', {
        wheelRotation: rouletteState.wheelRotation,
        wheelAngle: wheelAngle,
        ballRotation: rouletteState.totalBallRotation,
        ballAngle: ballAngle,
        relativeAngle: relativeAngle,
        segmentAngle: segmentAngle,
        segmentIndex: segmentIndex,
        totalSegments: segments.length,
        winner: winningSegment.name,
        allSegments: segments.map(s => s.name)
      });
      
      return winningSegment.name;
    };
    
    // Animate the spin
    const animateSpin = (timestamp) => {
      if (!rouletteState.startTime) {
        rouletteState.startTime = timestamp;
        console.log('🎲 Animation started');
      }
      
      const elapsed = timestamp - rouletteState.startTime;
      const progress = Math.min(elapsed / ROULETTE_CONFIG.spinDuration, 1);
      
      // Apply easing
      const easedProgress = easeOutQuart(progress); // Smoother deceleration
      
      // Update wheel rotation (clockwise)
      rouletteState.wheelRotation = rouletteState.targetRotation * easedProgress;
      
      // Log every 30 frames
      if (Math.floor(timestamp / 500) !== Math.floor((timestamp - 16) / 500)) {
        console.log('🎲 Wheel rotation:', {
          rotation: rouletteState.wheelRotation.toFixed(2),
          progress: progress.toFixed(2),
          easedProgress: easedProgress.toFixed(2)
        });
      }
      
      // Use cached rotating group element or find it
      let rotatingGroup = rouletteState.rotatingGroup;
      
      if (!rotatingGroup) {
        rotatingGroup = document.getElementById('wheel-rotating-group');
        if (rotatingGroup) {
          rouletteState.rotatingGroup = rotatingGroup;
          console.log('🎲 Found rotating group');
        } else {
          console.error('Could not find wheel-rotating-group element!');
          return;
        }
      }
      
      // Add subtle wheel vibration during high speed
      if (progress < 0.5) {
        const vibration = Math.sin(elapsed * 0.1) * 0.5;
        const rotation = rouletteState.wheelRotation + vibration;
        // Fixed SVG transform syntax - comma separators
        rotatingGroup.setAttribute('transform', `rotate(${rotation}, 200, 200)`);
      } else {
        // Fixed SVG transform syntax - comma separators
        rotatingGroup.setAttribute('transform', `rotate(${rouletteState.wheelRotation}, 200, 200)`);
      }
      
      // Update ball using realistic physics
      const ballProgress = Math.min(elapsed / ROULETTE_CONFIG.ballDuration, 1);
      const physics = getRoulettePhysics(ballProgress);
      
      // Calculate total rotations based on physics speed
      const totalBallRotations = 10; // More rotations for realism
      const finalBallPosition = Math.random() * 360;
      
      // Accumulate rotation based on physics speed curve
      if (!rouletteState.ballAngularPosition) {
        rouletteState.ballAngularPosition = 0;
      }
      
      // Update angular position based on current speed
      const deltaTime = 16; // Approximate frame time in ms
      const maxAngularVelocity = 8; // Maximum degrees per frame (was 15)
      const angularVelocity = physics.speed * maxAngularVelocity;
      rouletteState.ballAngularPosition -= angularVelocity;
      
      // Calculate current position
      const ballAngleRad = rouletteState.ballAngularPosition * Math.PI / 180;
      
      // Calculate radius based on physics
      let currentRadius = ROULETTE_CONFIG.outerRadius - 
        (ROULETTE_CONFIG.outerRadius - ROULETTE_CONFIG.ballRadius) * (1 - physics.radius);
      
      // If settling, move to final position on segment
      if (physics.settling) {
        const targetRadius = ROULETTE_CONFIG.finalRadius;
        currentRadius = currentRadius - (currentRadius - targetRadius) * physics.settleProgress;
        
        // Also slow down angular movement when settling
        if (physics.settleProgress > 0.5) {
          // Start snapping to nearest segment center
          const segmentAngle = 360 / segments.length;
          const currentSegment = Math.round((-rouletteState.ballAngularPosition % 360) / segmentAngle);
          const targetAngle = currentSegment * segmentAngle;
          const currentAngle = -rouletteState.ballAngularPosition % 360;
          const angleDiff = targetAngle - currentAngle;
          
          // Smoothly interpolate to segment center
          const snapStrength = (physics.settleProgress - 0.5) * 2; // 0 to 1
          rouletteState.ballAngularPosition += angleDiff * snapStrength * 0.1;
        }
      }
      
      // Add wobble for realism
      const wobbleX = Math.sin(elapsed * 0.02) * physics.wobble * 5;
      const wobbleY = Math.cos(elapsed * 0.02) * physics.wobble * 5;
      
      // Calculate position with wobble
      const ballX = Math.cos(ballAngleRad) * currentRadius + wobbleX;
      const ballY = Math.sin(ballAngleRad) * currentRadius + wobbleY;
      
      // Apply transform
      ball.style.transform = `translate(${ballX}px, ${ballY}px)`;
      ball.style.opacity = '1';
      
      // Apply blur effect during high speed
      if (physics.blur) {
        ball.classList.add('high-speed');
      } else {
        ball.classList.remove('high-speed');
      }
      
      // Store final position for winner calculation
      rouletteState.totalBallRotation = rouletteState.ballAngularPosition;
      
      // Dynamic sound effects based on physics phase
      if (physics.speed > 0.1 && overlayState.soundEnabled !== false) {
        // Calculate tick interval based on ball speed (faster = more frequent)
        const tickInterval = Math.max(50, 200 * (1 - physics.speed));
        
        if (elapsed % tickInterval < 16) {
          try {
            overlayAudio.beep.currentTime = 0;
            overlayAudio.beep.volume = 0.2 + physics.speed * 0.3; // Volume based on speed
            overlayAudio.beep.playbackRate = 0.8 + physics.speed * 0.4; // Pitch based on speed
            overlayAudio.beep.play().catch(() => {}); // Silently fail if sound not available
          } catch (e) {
            // Sound not available
          }
        }
      }
      
      // Special sound when ball drops to inner track
      if (ballProgress > 0.7 && ballProgress < 0.72 && !rouletteState.dropSoundPlayed && overlayState.soundEnabled !== false) {
        try {
          overlayAudio.transition.currentTime = 0;
          overlayAudio.transition.play().catch(() => {});
          rouletteState.dropSoundPlayed = true;
        } catch (e) {
          // Sound not available
        }
      }
      
      if (progress < 1) {
        rouletteState.animationId = requestAnimationFrame(animateSpin);
      } else {
        // Spin complete - stop sounds
        overlayAudio.roulette.pause();
        overlayAudio.roulette.currentTime = 0;
        handleSpinComplete();
      }
    };
    
    // Handle spin completion
    const handleSpinComplete = () => {
      rouletteState.isSpinning = false;
      
      // Calculate winner based on where ball landed
      const winner = calculateWinner();
      rouletteState.selectedClass = winner;
      
      // Play win sound
      overlayAudio.ding.currentTime = 0;
      overlayAudio.ding.play();
      
      // Add landed class to ball
      ball.classList.add('landed');
      
      // Highlight winning segment
      const segments = rouletteContainer.querySelectorAll('.wheel-segment');
      segments.forEach(segment => {
        if (segment.dataset.class === winner) {
          segment.classList.add('winner');
        }
      });
      
      // Add glow effect
      wheel.classList.add('complete');
      
      // Wait then resolve
      setTimeout(() => {
        // Animate out
        rouletteContainer.classList.remove('active');
        backdrop.classList.remove('active');
        
        setTimeout(() => {
          clearOverlay();
          resolve(winner);
        }, 300);
      }, 1500);
    };
    
    // Start the spin
    const startSpin = () => {
      if (rouletteState.isSpinning) return;
      
      console.log('🎲 Starting roulette spin');
      rouletteState.isSpinning = true;
      
      // Calculate target rotation
      const rotations = ROULETTE_CONFIG.minRotations + 
        Math.random() * (ROULETTE_CONFIG.maxRotations - ROULETTE_CONFIG.minRotations);
      const finalAngle = Math.random() * 360;
      rouletteState.targetRotation = rotations * 360 + finalAngle;
      
      console.log('🎲 Target rotation:', rouletteState.targetRotation);
      
      // Play spin sound
      try {
        overlayAudio.roulette.currentTime = 0;
        overlayAudio.roulette.volume = 0.5;
        overlayAudio.roulette.play().catch(err => {
          console.warn('Failed to play roulette sound:', err);
        });
      } catch (e) {
        console.warn('Roulette sound error:', e);
      }
      
      // Start animation
      rouletteState.animationId = requestAnimationFrame(animateSpin);
    };
    
    // Animate in
    requestAnimationFrame(() => {
      backdrop.classList.add('active');
      rouletteContainer.classList.add('active');
      
      // Auto-start after 1 second
      setTimeout(startSpin, 1000);
    });
  });
}

// Class picker overlay for jackpot
async function showClassPickerOverlay() {
  return new Promise((resolve) => {
    const { backdrop, content } = createOverlayStructure();
    
    // Create class picker
    const picker = document.createElement('div');
    picker.className = 'class-picker';
    
    picker.innerHTML = `
      <h2>JACKPOT!</h2>
      <h3>Choose Your Class</h3>
      <div class="class-picker-buttons">
        <button class="class-picker-button light" data-class="Light">
          <img src="/images/light_active.webp" alt="Light">
          <span>LIGHT</span>
        </button>
        <button class="class-picker-button medium" data-class="Medium">
          <img src="/images/medium_active.webp" alt="Medium">
          <span>MEDIUM</span>
        </button>
        <button class="class-picker-button heavy" data-class="Heavy">
          <img src="/images/heavy_active.webp" alt="Heavy">
          <span>HEAVY</span>
        </button>
      </div>
    `;
    
    content.appendChild(picker);
    
    // Animate in
    requestAnimationFrame(() => {
      backdrop.classList.add('active');
      picker.classList.add('active');
    });
    
    // Handle class selection
    const buttons = picker.querySelectorAll('.class-picker-button');
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        const selectedClass = button.dataset.class;
        
        // Play sound
        overlayAudio.transition.currentTime = 0;
        overlayAudio.transition.play();
        
        // Highlight selected button
        button.classList.add('selected');
        buttons.forEach(b => {
          if (b !== button) b.style.opacity = '0.3';
        });
        
        // Wait a moment to show selection, then animate out
        setTimeout(() => {
          picker.classList.remove('active');
          backdrop.classList.remove('active');
          
          setTimeout(() => {
            clearOverlay();
            resolve(selectedClass);
          }, 300);
        }, 500);
      });
    });
  });
}

// =====================================
// MAIN ASYNC FLOW
// =====================================

async function startLoadoutGeneration() {
  console.log('🚀 Starting loadout generation flow...');
  console.log('📍 Overlay state:', overlayState);
  console.log('📍 Overlay root exists:', !!document.getElementById('overlay-root'));
  
  try {
    // Disable main button during flow
    const mainButton = document.getElementById('main-spin-button');
    if (mainButton) {
      mainButton.disabled = true;
    }
    
    // Reset state
    overlayState.isActive = true;
    overlayState.spinCount = 0;
    overlayState.selectedClass = null;
    overlayState.isJackpot = false;
    
    // Step 1: Show spin wheel overlay
    const spinResult = await showSpinWheelOverlay();
    overlayState.spinCount = spinResult.spins;
    overlayState.isJackpot = spinResult.isJackpot;
    
    // Step 2: Show spin count reveal
    await showRevealCard({
      title: spinResult.value,
      subtitle: spinResult.isJackpot ? '' : `${spinResult.spins} ${spinResult.spins === 1 ? 'SPIN' : 'SPINS'}!`,
      duration: 2000,
      isJackpot: spinResult.isJackpot
    });
    
    // Step 3: Handle class selection
    if (spinResult.isJackpot) {
      // Jackpot path - let user pick class
      overlayState.selectedClass = await showClassPickerOverlay();
    } else {
      // Normal path - show roulette
      overlayState.selectedClass = await showClassRouletteOverlay();
      
      // Show class reveal
      await showRevealCard({
        title: overlayState.selectedClass.toUpperCase(),
        subtitle: 'CLASS SELECTED!',
        duration: 2000
      });
    }
    
    // Step 4: Start slot machine with selected values
    console.log('🎰 Starting slot machine with:', {
      class: overlayState.selectedClass,
      spins: overlayState.spinCount
    });
    
    // Pass data to existing slot machine
    startSlotMachine(overlayState.selectedClass, overlayState.spinCount);
    
  } catch (error) {
    console.error('❌ Error in loadout generation flow:', error);
  } finally {
    // Re-enable main button
    const mainButton = document.getElementById('main-spin-button');
    if (mainButton) {
      mainButton.disabled = false;
    }
    
    overlayState.isActive = false;
  }
}

// =====================================
// SLOT MACHINE INTEGRATION
// =====================================

function startSlotMachine(selectedClass, spinCount) {
  // Update global state for slot machine
  if (window.state) {
    window.state.selectedClass = selectedClass;
    window.state.totalSpins = spinCount;
    window.state.currentSpin = spinCount;
    window.state.spinsLeft = spinCount;
  }
  
  // Clear any existing output
  const output = document.getElementById('output');
  if (output) {
    output.innerHTML = '';
  }
  
  // Update the selection display
  updateSelectionDisplay(selectedClass, spinCount);
  
  // Call the actual slot machine function
  if (typeof window.startSlotMachineSequence === 'function') {
    console.log('🎰 Starting slot machine sequence with:', selectedClass, spinCount);
    window.startSlotMachineSequence(selectedClass, spinCount);
  } else if (typeof window.displayLoadout === 'function') {
    console.log('🎰 Falling back to displayLoadout with:', selectedClass);
    window.displayLoadout(selectedClass);
  } else {
    console.error('❌ Neither startSlotMachineSequence nor displayLoadout function found!');
  }
}

// Update the selection display above the slot machine
function updateSelectionDisplay(selectedClass, spinsRemaining) {
  const selectionDisplay = document.getElementById('selection-display');
  if (selectionDisplay) {
    selectionDisplay.classList.add('visible');
    
    const classSpan = selectionDisplay.querySelector('.selection-class');
    const spinsSpan = selectionDisplay.querySelector('.selection-spins');
    
    if (classSpan) {
      classSpan.textContent = selectedClass.toUpperCase();
      classSpan.className = `selection-class ${selectedClass.toLowerCase()}`;
    }
    
    if (spinsSpan) {
      const spinsText = spinsRemaining === 1 ? 'Spin' : 'Spins';
      spinsSpan.innerHTML = `<span class="spin-count">${spinsRemaining}</span> ${spinsText} Remaining`;
    }
  }
}

// Export the update function for use during spins
window.updateSpinCount = function(spinsRemaining) {
  const spinsSpan = document.querySelector('.selection-spins');
  if (spinsSpan) {
    const spinsText = spinsRemaining === 1 ? 'Spin' : 'Spins';
    spinsSpan.innerHTML = `<span class="spin-count">${spinsRemaining}</span> ${spinsText} Remaining`;
  }
};

// =====================================
// INITIALIZATION
// =====================================

// Export for global access
window.overlayManager = {
  startLoadoutGeneration,
  showRevealCard,
  showSpinWheelOverlay,
  showClassRouletteOverlay,
  showClassPickerOverlay,
  overlayState,
  overlayAudio
};

console.log('✅ Overlay Manager loaded');
console.log('🔍 overlayManager functions available:', {
  startLoadoutGeneration: typeof window.overlayManager?.startLoadoutGeneration,
  showSpinWheelOverlay: typeof window.overlayManager?.showSpinWheelOverlay,
  showClassRouletteOverlay: typeof window.overlayManager?.showClassRouletteOverlay
});