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

// Sound manager
const overlayAudio = {
  beep: new Audio('/sounds/beep.mp3'),
  ding: new Audio('/sounds/ding.mp3'),
  dingDing: new Audio('/sounds/ding-ding.mp3'),
  spinning: new Audio('/sounds/spinning.mp3'),
  transition: new Audio('/sounds/transition.mp3'),
  roulette: new Audio('/sounds/roulette.mp3'),
  finalSound: new Audio('/sounds/pop-pour-perform.mp3')
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
    } else {
      overlayAudio.ding.currentTime = 0;
      overlayAudio.ding.play();
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
      wheelList.style.transform = `translateY(${-normalizedDistance}px)`;
    };
    
    // Handle ticker animation
    const animateTickerCollision = () => {
      // Play beep sound
      overlayAudio.beep.currentTime = 0;
      overlayAudio.beep.play();
      
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
      } else {
        overlayAudio.ding.currentTime = 0;
        overlayAudio.ding.play();
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
  spinDuration: 4000, // Total spin time in ms
  minRotations: 5, // Minimum full rotations
  maxRotations: 7, // Maximum full rotations
  ballDuration: 3800, // Ball animation duration
  ballRadius: 140, // Ball orbit radius
  wheelRadius: 160  // Wheel visual radius
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

// Easing function for realistic spin
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
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
      
      // Create 6 segments (double the original 3)
      if (availableClasses.length === 1) {
        // All segments are the same class
        for (let i = 0; i < 6; i++) {
          segments.push({
            ...availableClasses[0],
            angle: i * 60,
            endAngle: (i + 1) * 60
          });
        }
      } else {
        // Alternate between available classes
        for (let i = 0; i < 6; i++) {
          const classIndex = i % availableClasses.length;
          segments.push({
            ...availableClasses[classIndex],
            angle: i * 60,
            endAngle: (i + 1) * 60
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
              </defs>
              
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
                  const labelAngle = seg.angle + 30; // Center of 60-degree segment
                  const labelRadius = 100;
                  const x = 200 + labelRadius * Math.cos(labelAngle * Math.PI / 180);
                  const y = 200 + labelRadius * Math.sin(labelAngle * Math.PI / 180);
                  
                  return `
                    <text 
                      x="${x}" 
                      y="${y}" 
                      text-anchor="middle" 
                      dominant-baseline="middle"
                      class="wheel-label"
                      transform="rotate(${labelAngle} ${x} ${y})"
                    >
                      ${seg.name.toUpperCase()}
                    </text>
                  `;
                }).join('')}
              </g>
              
              <!-- Center hub -->
              <circle cx="200" cy="200" r="40" fill="#222" stroke="#FFD700" stroke-width="3"/>
              <circle cx="200" cy="200" r="30" fill="#333" stroke="#AB47BC" stroke-width="2"/>
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
    
    // Reset state
    rouletteState = {
      isSpinning: false,
      wheelRotation: 0,
      ballRotation: 0,
      totalBallRotation: 0,
      animationId: null,
      startTime: 0,
      targetRotation: 0,
      selectedClass: null
    };
    
    // Calculate winner based on ball position relative to wheel
    const calculateWinner = () => {
      // Get final positions
      const wheelAngle = rouletteState.wheelRotation % 360;
      
      // Get ball's final position (negative rotation, counter-clockwise)
      // Normalize to positive angle
      const ballAngle = (((-rouletteState.totalBallRotation) % 360) + 360) % 360;
      
      // Calculate which segment the ball is over
      // Ball position minus wheel rotation gives us the segment
      const relativeAngle = ((ballAngle - wheelAngle + 360) % 360);
      
      // Find which segment this angle falls into
      const segmentIndex = Math.floor(relativeAngle / 60);
      const winningSegment = segments[segmentIndex];
      
      console.log('🎯 Winner calculation:', {
        totalBallRotation: rouletteState.totalBallRotation,
        ballAngle,
        wheelAngle,
        relativeAngle,
        segmentIndex,
        winner: winningSegment.name
      });
      
      return winningSegment.name;
    };
    
    // Animate the spin
    const animateSpin = (timestamp) => {
      if (!rouletteState.startTime) {
        rouletteState.startTime = timestamp;
      }
      
      const elapsed = timestamp - rouletteState.startTime;
      const progress = Math.min(elapsed / ROULETTE_CONFIG.spinDuration, 1);
      
      // Apply easing
      const easedProgress = easeOutCubic(progress);
      
      // Update wheel rotation (clockwise)
      rouletteState.wheelRotation = rouletteState.targetRotation * easedProgress;
      wheel.style.transform = `rotate(${rouletteState.wheelRotation}deg)`;
      
      // Update ball rotation (counter-clockwise, slowing down)
      const ballProgress = Math.min(elapsed / ROULETTE_CONFIG.ballDuration, 1);
      const ballEased = easeOutCubic(ballProgress);
      
      // Ball rotates counter-clockwise (negative degrees)
      // Total rotation decreases from fast to slow
      const totalBallRotations = 8; // Ball makes 8 full rotations
      const finalBallPosition = Math.random() * 360; // Random final position
      
      // Calculate total ball rotation (negative for counter-clockwise)
      rouletteState.totalBallRotation = -(totalBallRotations * 360 + finalBallPosition) * ballEased;
      
      // Convert to radians for position calculation
      const ballAngleRad = rouletteState.totalBallRotation * Math.PI / 180;
      
      // Keep ball at edge of wheel
      const ballX = Math.cos(ballAngleRad) * ROULETTE_CONFIG.ballRadius;
      const ballY = Math.sin(ballAngleRad) * ROULETTE_CONFIG.ballRadius;
      
      ball.style.transform = `translate(${ballX}px, ${ballY}px)`;
      ball.style.opacity = '1';
      
      // Add ticking sound effect during spin
      if (elapsed < ROULETTE_CONFIG.ballDuration && elapsed % 100 < 16) {
        overlayAudio.beep.currentTime = 0;
        overlayAudio.beep.volume = 0.3;
        overlayAudio.beep.play();
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
      
      rouletteState.isSpinning = true;
      
      // Calculate target rotation
      const rotations = ROULETTE_CONFIG.minRotations + 
        Math.random() * (ROULETTE_CONFIG.maxRotations - ROULETTE_CONFIG.minRotations);
      const finalAngle = Math.random() * 360;
      rouletteState.targetRotation = rotations * 360 + finalAngle;
      
      // Play spin sound
      overlayAudio.roulette.currentTime = 0;
      overlayAudio.roulette.volume = 0.5;
      overlayAudio.roulette.play();
      
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