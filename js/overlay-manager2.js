// =====================================
// OVERLAY MANAGER - ASYNC FLOW CONTROLLER
// =====================================

// Global overlay state
const overlayState = {
  isActive: false,
  currentOverlay: null,
  spinCount: 0,
  selectedClass: null,
  isJackpot: false,
};

// Sound manager with relative paths
const overlayAudio = {
  beep: new Audio("sounds/beep.mp3"),
  ding: new Audio("sounds/ding.mp3"),
  dingDing: new Audio("sounds/ding-ding.mp3"),
  spinning: new Audio("sounds/spinning.mp3"),
  transition: new Audio("sounds/transition.mp3"),
  roulette: new Audio("sounds/roulette.mp3"),
  finalSound: new Audio("sounds/pop-pour-perform.mp3"),
  wheelTickLoop: new Audio("sounds/wheel-tick-loop.mp3"),
};

// Preload all sounds
Object.values(overlayAudio).forEach((audio) => {
  audio.preload = "auto";
});

// Set the wheel tick loop to loop
overlayAudio.wheelTickLoop.loop = true;

// =====================================
// OVERLAY CONTAINER MANAGEMENT
// =====================================

function getOverlayRoot() {
  return document.getElementById("overlay-root");
}

function createOverlayStructure() {
  const root = getOverlayRoot();

  // Clear any existing content
  root.innerHTML = "";

  // Create backdrop
  const backdrop = document.createElement("div");
  backdrop.className = "overlay-backdrop";
  backdrop.id = "overlay-backdrop";

  // Create content wrapper
  const content = document.createElement("div");
  content.className = "overlay-content";
  content.id = "overlay-content";

  root.appendChild(backdrop);
  root.appendChild(content);

  // Enable pointer events on root
  root.style.pointerEvents = "auto";

  return { backdrop, content };
}

function clearOverlay() {
  const root = getOverlayRoot();
  root.innerHTML = "";
  root.style.pointerEvents = "none";
  overlayState.currentOverlay = null;

  // Remove overlay-active class from body
  document.body.classList.remove("overlay-active");

  // Clear valid spin sequence flag
  window.isValidSpinSequence = false;
}

// =====================================
// REVEAL CARD FUNCTIONS
// =====================================

function showRevealCard(options) {
  return new Promise((resolve) => {
    const { title, subtitle, duration = 2000, isJackpot = false } = options;

    const { backdrop, content } = createOverlayStructure();

    // Create reveal card
    const card = document.createElement("div");
    card.className = `reveal-card ${isJackpot ? "jackpot" : ""}`;

    card.innerHTML = `
      <h1>${title}</h1>
      ${subtitle ? `<p>${subtitle}</p>` : ""}
      ${isJackpot ? '<p class="sub-text">Choose Your Class!</p>' : ""}
    `;

    content.appendChild(card);

    // Animate in
    requestAnimationFrame(() => {
      backdrop.classList.add("active");
      card.classList.add("active");
    });

    // Play sound only if enabled
    if (window.state && window.state.soundEnabled) {
      if (isJackpot) {
        overlayAudio.dingDing.currentTime = 0;
        window.safePlay(overlayAudio.dingDing);
        // Stop jackpot sound after 1.5s
        setTimeout(() => {
          overlayAudio.dingDing.pause();
          overlayAudio.dingDing.currentTime = 0;
        }, 1500);
      } else {
        overlayAudio.ding.currentTime = 0;
        window.safePlay(overlayAudio.ding);
      }
    }

    // Auto dismiss
    setTimeout(() => {
      card.classList.remove("active");
      backdrop.classList.remove("active");

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

// Jackpot card factory
function makeJackpotCard() {
  const spins = 3; // Always 3 spins for jackpot
  return {
    value: "JACKPOT",
    spins: spins,
    label: `Jackpot!\nChoose Class\n${spins} Spins`,
    className: "card-special jackpot",
    isJackpot: true,
  };
}

// Card configuration
const SPIN_CARDS = [
  { value: "1", spins: 1, label: "1", className: "card-1" },
  makeJackpotCard(),
  { value: "2", spins: 2, label: "2", className: "card-2" },
  { value: "3", spins: 3, label: "3", className: "card-3" },
  { value: "4", spins: 4, label: "4", className: "card-4" },
  makeJackpotCard(),
  { value: "5", spins: 5, label: "5", className: "card-5" },
];

// Triple for infinite scroll effect
const INFINITE_CARDS = [...SPIN_CARDS, ...SPIN_CARDS, ...SPIN_CARDS];

// Physics configuration
const SPIN_PHYSICS = {
  initialVelocity: { min: 2400, max: 2800 },
  friction: 0.988,
  decelerationThreshold: 600,
  decelerationDuration: 400,
  idleSpeed: 0.3,
  minTickVelocity: 50,
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
  lastPegIndex: -1,
  isDecelerating: false,
  decelerateStartTime: 0,
  decelerateStartDistance: 0,
  decelerateStartVelocity: 0,
};

// Easing function
function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

// Create confetti particles
function createSpinConfetti() {
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti-particle";
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.backgroundColor = [
      "#f59e0b",
      "#ec4899",
      "#3b82f6",
      "#10b981",
    ][Math.floor(Math.random() * 4)];
    confetti.style.animationDelay = `${Math.random()}s`;
    confetti.style.animationDuration = `${2 + Math.random()}s`;
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 3000);
  }
}

// Main spin wheel overlay function
async function showSpinWheelOverlay() {
  console.log("🎰 Showing spin wheel overlay...");

  // Ensure INFINITE_CARDS is properly created
  const infiniteCards = [...SPIN_CARDS, ...SPIN_CARDS, ...SPIN_CARDS];
  console.log("📊 SPIN_CARDS:", SPIN_CARDS);
  console.log("📊 infiniteCards length:", infiniteCards.length);

  return new Promise((resolve) => {
    const { backdrop, content } = createOverlayStructure();

    // Create spin wheel container
    const wheelContainer = document.createElement("div");
    wheelContainer.className = "spin-wheel-overlay";

    // Create cards HTML separately for debugging
    let cardsHtml = "";
    try {
      cardsHtml = infiniteCards
        .map((card, index) => {
          if (!card || !card.label) {
            console.error(`❌ Card at index ${index} has no label:`, card);
            return "";
          }

          const labelHtml = card.label.includes("\n")
            ? card.label.split("\n").join("<br>")
            : card.label;

          return `
          <li class="card ${card.className || ""}"
              data-index="${index}"
              data-spins="${card.spins || 1}"
              data-value="${card.value || ""}">
            <div class="card-content">${labelHtml}</div>
          </li>
        `;
        })
        .join("");
    } catch (error) {
      console.error("❌ Error generating cards HTML:", error);
      cardsHtml = '<li class="card">Error loading cards</li>';
    }

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

            <div class="pointer" id="spin-pointer">
              <div class="pointer-arm" id="pointer-arm">
                <div class="pointer-tip"></div>
              </div>
            </div>

            <!-- Pegs will be generated dynamically -->

            <div class="wheel-track">
              <ul class="wheel-list" id="spin-wheel-list">
                ${cardsHtml}
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;

    content.appendChild(wheelContainer);

    // Get elements
    const wheelFrame = document.getElementById("spin-wheel-frame");
    const wheelList = document.getElementById("spin-wheel-list");
    const pointer = document.getElementById("spin-pointer");
    const pointerArm = document.getElementById("pointer-arm");

    // Create pegs dynamically
    const createPegs = () => {
      const pegCount = 9;
      const pegSpacing = 100 / (pegCount + 1);

      for (let i = 0; i < pegCount; i++) {
        const peg = document.createElement("div");
        peg.className = "peg";
        peg.style.top = `${pegSpacing * (i + 1)}%`;
        wheelFrame.appendChild(peg);
      }
    };
    createPegs();

    // Debug: Check if elements exist and cards are created
    console.log("🔍 Debug - Wheel elements:", {
      wheelFrame: !!wheelFrame,
      wheelList: !!wheelList,
      pointer: !!pointer,
      pointerArm: !!pointerArm,
      cardCount: wheelList ? wheelList.querySelectorAll(".card").length : 0,
      infiniteCardsLength: infiniteCards.length,
    });

    // Debug: Log first few cards
    if (wheelList) {
      const cards = wheelList.querySelectorAll(".card");
      console.log(
        "🎴 All cards content:",
        Array.from(cards).map((card, idx) => ({
          index: idx,
          text: card.textContent.trim(),
          innerHTML: card.innerHTML,
          className: card.className,
          dataValue: card.getAttribute("data-value"),
          hasContent: card.textContent.trim().length > 0,
        }))
      );

      // Log infiniteCards for comparison
      console.log(
        "📋 infiniteCards labels:",
        infiniteCards.map((card, idx) => ({
          index: idx,
          label: card.label,
          value: card.value,
        }))
      );
    }

    // Get card height
    const getCardHeight = () => {
      const card = wheelList.querySelector(".card");
      return card ? card.getBoundingClientRect().height + 10 : 110;
    };

    // Apply transform for infinite scroll
    const applyInfiniteScroll = (distance) => {
      const cardHeight = getCardHeight();
      const baseCardCount = 7; // Number of unique cards (SPIN_CARDS.length)
      let normalizedDistance = distance % (baseCardCount * cardHeight * 3);
      if (normalizedDistance > baseCardCount * cardHeight * 2) {
        normalizedDistance -= baseCardCount * cardHeight;
      }
      // Use negative to spin upward (items move up)
      wheelList.style.transform = `translateY(${-normalizedDistance}px)`;

      // Ensure transform is applied
      if (!wheelList) {
        console.error("wheelList is null!");
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
      lastPegIndex: -1,
      isDecelerating: false,
      decelerateStartTime: 0,
      decelerateStartDistance: 0,
      decelerateStartVelocity: 0,
    };

    // Ensure wheel list has initial position at the top for downward spin
    if (wheelList) {
      // Start with a small offset so cards are visible
      const cardHeight = getCardHeight();
      const baseCardCount = 7; // Number of unique cards
      const initialOffset = cardHeight * baseCardCount; // Start at middle of triple list
      spinWheelState.currentDistance = initialOffset; // Set initial distance
      applyInfiniteScroll(spinWheelState.currentDistance);

      // Force visibility
      wheelList.style.visibility = "visible";
      wheelList.style.opacity = "1";
      wheelFrame.style.visibility = "visible";
      wheelFrame.style.opacity = "1";
    }

    // Handle pointer tick animation
    const handlePointerTick = (velocity) => {
      // No longer play individual tick sounds - using looped track instead

      // Pointer bend
      const bendAmount = Math.min(velocity / 100, 20);
      pointerArm.style.transform = `rotate(${bendAmount}deg)`;
      setTimeout(() => {
        pointerArm.style.transform = "rotate(0deg)";
      }, 80);

      // Peg hit animation
      const cardHeight = getCardHeight();
      const currentPegIndex = Math.floor(
        (spinWheelState.currentDistance % (cardHeight * 10)) / cardHeight
      );
      if (currentPegIndex !== spinWheelState.lastPegIndex) {
        spinWheelState.lastPegIndex = currentPegIndex;
        const pegs = wheelFrame.querySelectorAll(".peg");
        const peg = pegs[currentPegIndex % pegs.length];
        if (peg) {
          peg.style.transform = "scale(1.3)";
          setTimeout(() => {
            peg.style.transform = "scale(1)";
          }, 50);
        }

        // Cabinet shake - reduced by half
        wheelFrame.animate(
          [
            { transform: "translateX(-2px)" },
            { transform: "translateX(2px)" },
            { transform: "translateX(0)" },
          ],
          {
            duration: 90,
            iterations: 1,
          }
        );

        // Heartbeat effect for slow speeds
        if (velocity < 120) {
          wheelFrame.animate(
            [
              { transform: "scale(1)" },
              { transform: "scale(1.03)" },
              { transform: "scale(1)" },
            ],
            {
              duration: 300,
              easing: "ease-out",
            }
          );
        }
      }
    };

    // Find winning card
    const findWinningCard = () => {
      const frameRect = wheelFrame.getBoundingClientRect();
      const frameCenter = frameRect.top + frameRect.height / 2;

      const cards = wheelList.querySelectorAll(".card");
      let winningCard = null;
      let result = null;

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.top + rect.height / 2;

        if (Math.abs(cardCenter - frameCenter) < rect.height / 2) {
          winningCard = card;
          const baseCardCount = 7; // Number of unique cards
          const dataIndex =
            parseInt(card.getAttribute("data-index")) % baseCardCount;
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

      // Stop all spinning sounds
      try {
        overlayAudio.spinning.pause();
        overlayAudio.spinning.currentTime = 0;
        overlayAudio.wheelTickLoop.pause();
        overlayAudio.wheelTickLoop.currentTime = 0;
      } catch (e) {
        // Sound not available
      }

      // Find winner
      const { card: winningCard, result } = findWinningCard();

      // Highlight winning card
      const cards = wheelList.querySelectorAll(".card");
      cards.forEach((card) => card.classList.remove("winner"));
      if (winningCard) {
        winningCard.classList.add("winner");
      }

      // Play sound only if enabled
      if (window.state && window.state.soundEnabled) {
        if (result.isJackpot) {
          overlayAudio.dingDing.currentTime = 0;
          window.safePlay(overlayAudio.dingDing);
          // Stop jackpot sound after 1.5s
          setTimeout(() => {
            overlayAudio.dingDing.pause();
            overlayAudio.dingDing.currentTime = 0;
          }, 1500);
        } else {
          overlayAudio.ding.currentTime = 0;
          window.safePlay(overlayAudio.ding);
        }
      }

      // Add glow effect
      wheelFrame.classList.add("glowing");

      // Create confetti
      createSpinConfetti();

      // Handle jackpot
      if (result.isJackpot) {
        // Extra confetti for jackpot
        setTimeout(() => createSpinConfetti(), 300);
        setTimeout(() => createSpinConfetti(), 600);

        // Show jackpot modal after a short delay
        setTimeout(() => {
          showJackpotModal(result.spins).then(() => {
            // Stop idle animation
            if (spinWheelState.idleAnimationId) {
              cancelAnimationFrame(spinWheelState.idleAnimationId);
            }

            // Animate out
            wheelContainer.classList.remove("active");
            backdrop.classList.remove("active");

            setTimeout(() => {
              clearOverlay();
              resolve({
                value: result.value,
                spins: result.spins,
                isJackpot: true,
                classWeight: null, // No class selection - will proceed to roulette
              });
            }, 300);
          });
        }, 2000);
      } else {
        // Cleanup and resolve after delay for non-jackpot
        setTimeout(() => {
          // Stop idle animation
          if (spinWheelState.idleAnimationId) {
            cancelAnimationFrame(spinWheelState.idleAnimationId);
          }

          // Animate out
          wheelContainer.classList.remove("active");
          backdrop.classList.remove("active");

          setTimeout(() => {
            clearOverlay();
            resolve({
              value: result.value,
              spins: result.spins,
              isJackpot: false,
            });
          }, 300);
        }, 2000);
      }
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
        spinWheelState.currentDistance +=
          spinWheelState.currentVelocity * deltaTime;
        spinWheelState.currentVelocity *= Math.pow(
          SPIN_PHYSICS.friction,
          deltaTime * 60
        );

        // Ensure minimum movement for visibility
        if (
          spinWheelState.currentDistance < 10 &&
          spinWheelState.currentVelocity > 1000
        ) {
          // Force initial movement
          spinWheelState.currentDistance = 10;
        }

        // Check for tick
        const tickIndex = Math.floor(
          spinWheelState.currentDistance / cardHeight
        );
        if (tickIndex !== spinWheelState.lastTickIndex) {
          handlePointerTick(spinWheelState.currentVelocity);
          spinWheelState.lastTickIndex = tickIndex;
        }

        // Start deceleration
        if (
          spinWheelState.currentVelocity < SPIN_PHYSICS.decelerationThreshold
        ) {
          spinWheelState.isDecelerating = true;
          spinWheelState.decelerateStartTime = timestamp;
          spinWheelState.decelerateStartDistance =
            spinWheelState.currentDistance;
          spinWheelState.decelerateStartVelocity =
            spinWheelState.currentVelocity;
        }
      } else {
        // Smooth deceleration
        const decelerateElapsed =
          (timestamp - spinWheelState.decelerateStartTime) /
          SPIN_PHYSICS.decelerationDuration;
        const progress = Math.min(1, decelerateElapsed);
        const eased = easeOutExpo(progress);

        spinWheelState.currentDistance +=
          spinWheelState.currentVelocity * deltaTime;
        spinWheelState.currentVelocity =
          spinWheelState.decelerateStartVelocity * (1 - eased);

        // Slower ticks during deceleration
        const tickIndex = Math.floor(
          spinWheelState.currentDistance / cardHeight
        );
        if (
          tickIndex !== spinWheelState.lastTickIndex &&
          spinWheelState.currentVelocity > SPIN_PHYSICS.minTickVelocity
        ) {
          handlePointerTick(spinWheelState.currentVelocity);
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
      spinWheelState.currentVelocity =
        SPIN_PHYSICS.initialVelocity.min +
        Math.random() *
          (SPIN_PHYSICS.initialVelocity.max - SPIN_PHYSICS.initialVelocity.min);
      spinWheelState.lastTime = 0;
      spinWheelState.lastTickIndex = 0;
      spinWheelState.lastPegIndex = -1;
      spinWheelState.isDecelerating = false;

      // Play spin sound and wheel tick loop only if enabled
      if (window.state && window.state.soundEnabled) {
        try {
          // Start spinning sound
          overlayAudio.spinning.currentTime = 0;
          overlayAudio.spinning.volume = 0.02;
          window.safePlay(overlayAudio.spinning);

          // Start wheel tick loop
          overlayAudio.wheelTickLoop.currentTime = 0;
          overlayAudio.wheelTickLoop.volume = 0.04;
          window.safePlay(overlayAudio.wheelTickLoop);
        } catch (e) {
          // Sound not available
        }
      }

      // Remove glow
      wheelFrame.classList.remove("glowing");

      // Start physics
      spinWheelState.animationId = requestAnimationFrame(updatePhysics);
    };

    // Animate in
    requestAnimationFrame(() => {
      backdrop.classList.add("active");
      wheelContainer.classList.add("active");

      // Auto-start spin after 1 second
      setTimeout(() => {
        console.log("🎰 Auto-starting spin wheel after 1 second delay...");
        spin();
      }, 1000);
    });

    // Start idle animation
    startIdleAnimation();

    // Ensure the wheel is visible
    requestAnimationFrame(() => {
      const wheelFrame = document.getElementById("spin-wheel-frame");
      if (wheelFrame) {
        wheelFrame.style.visibility = "visible";
        wheelFrame.style.opacity = "1";
      }
      const wheelList = document.getElementById("spin-wheel-list");
      if (wheelList) {
        wheelList.style.visibility = "visible";
        wheelList.style.opacity = "1";
      }
    });
  });
}

// =====================================
// JACKPOT MODAL
// =====================================

function showJackpotModal(spins) {
  return new Promise((resolve) => {
    // Earn free respin immediately when jackpot hits
    const respinEarned = window.earnFreeRespin
      ? window.earnFreeRespin()
      : false;
    console.log("🎰 Jackpot hit! Respin earned:", respinEarned);
    window.debugRespin &&
      window.debugRespin(`Jackpot hit! Respin earned: ${respinEarned}`);

    const { backdrop, content } = createOverlayStructure();

    // Create jackpot modal - simple popup without class selection
    const modal = document.createElement("div");
    modal.className = "jackpot-modal-content";

    // Simple jackpot message without class selection
    modal.innerHTML = `
      <div class="jackpot-title">JACKPOT!</div>
      <div class="jackpot-message">${spins} SPINS</div>
      <div class="jackpot-respin-bonus">+ FREE RESPIN</div>
    `;

    // Debug logging
    window.debugRespin &&
      window.debugRespin("Showing jackpot popup", { spins, respinEarned });

    content.appendChild(modal);

    // Animate in
    requestAnimationFrame(() => {
      backdrop.classList.add("active");
      modal.classList.add("active");
    });

    // Auto-proceed after showing the jackpot message
    setTimeout(() => {
        modal.classList.remove("active");
        backdrop.classList.remove("active");

        setTimeout(() => {
          clearOverlay();
          resolve(null); // No class selected - will proceed to roulette
        }, 300);
    }, 2500); // Show jackpot message for 2.5 seconds, then auto-proceed
  });
}

// =====================================
// CLASS ROULETTE OVERLAY - CASINO WHEEL
// =====================================

// Roulette configuration
const ROULETTE_CONFIG = {
  baseClasses: [
    { name: "Light", color: "#4FC3F7" },
    { name: "Medium", color: "#AB47BC" },
    { name: "Heavy", color: "#FF1744" },
  ],
  spinDuration: window.state?.isMobile ? 4000 : 8000, // 4 seconds on mobile, 8 on desktop
  minRotations: window.state?.isMobile ? 4 : 8, // Fewer rotations on mobile
  maxRotations: window.state?.isMobile ? 6 : 12, // Fewer max rotations on mobile
  ballDuration: window.state?.isMobile ? 3500 : 7500, // 3.5 seconds on mobile, 7.5 on desktop
  ballRadius: 140, // Ball orbit radius when moving
  finalRadius: 100, // Ball final position on segment (closer to center)
  wheelRadius: 180, // Wheel visual radius - increased to fill SVG better
  outerRadius: 185, // Ball starting radius (outer track)
  // More realistic physics phases
  phases: {
    launch: 0.15, // 15% - initial momentum
    coast: 0.35, // 35% - steady high speed
    decelerate: 0.25, // 25% - gradual slowdown
    spiral: 0.15, // 15% - drop to inner track
    bounce: 0.07, // 7% - bouncing between pockets
    settle: 0.03, // 3% - final settling
  },
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
  selectedClass: null,
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
      blur: true,
    };
  } else if (progress < phases.launch + phases.coast) {
    // Phase 2: Coast - maintain speed
    return {
      speed: 1.0, // Maintain full speed
      radius: 1.0,
      wobble: 0,
      blur: true,
    };
  } else if (progress < phases.launch + phases.coast + phases.decelerate) {
    // Phase 3: Decelerate - gradual slowdown
    const p = (progress - phases.launch - phases.coast) / phases.decelerate;
    return {
      speed: 1.0 - p * 0.5, // Linear deceleration from 100% to 50%
      radius: 1.0,
      wobble: p * 0.01,
      blur: p < 0.3,
    };
  } else if (
    progress <
    phases.launch + phases.coast + phases.decelerate + phases.spiral
  ) {
    // Phase 4: Spiral - drop to inner track
    const p =
      (progress - phases.launch - phases.coast - phases.decelerate) /
      phases.spiral;
    const speedCurve = 1 - p * 0.7; // Linear slowdown
    return {
      speed: 0.5 * speedCurve, // From 50% to 15%
      radius: 1.0 - p * 0.25, // Move inward
      wobble: 0.01 + p * 0.02,
      blur: false,
    };
  } else if (
    progress <
    phases.launch +
      phases.coast +
      phases.decelerate +
      phases.spiral +
      phases.bounce
  ) {
    // Phase 5: Bounce - ball hits dividers
    const p =
      (progress -
        phases.launch -
        phases.coast -
        phases.decelerate -
        phases.spiral) /
      phases.bounce;
    const bounceWave = Math.sin(p * Math.PI * 4) * (1 - p);
    return {
      speed: 0.15 - p * 0.13, // Slow from 15% to 2%
      radius: 0.75 + bounceWave * 0.03,
      wobble: 0.03 + bounceWave * 0.01,
      blur: false,
    };
  } else {
    // Phase 6: Settle - final rest on segment
    const p =
      (progress -
        phases.launch -
        phases.coast -
        phases.decelerate -
        phases.spiral -
        phases.bounce) /
      phases.settle;
    return {
      speed: 0.02 * (1 - p),
      radius: 0.75 - p * 0.15, // Move further inward to rest on segment
      wobble: 0,
      blur: false,
      settling: true,
      settleProgress: p,
    };
  }
}

// Easing function for wheel rotation - less aggressive slowdown
function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 2.5); // Changed from 4 to 2.5 for more visible spinning
}

// Main class roulette overlay function
async function showClassRouletteOverlay() {
  console.log("🎲 [DEBUG] Entered showClassRouletteOverlay");

  // Check if mobile and should use DOM rendering
  if (window.state?.isMobile || window.state?.isLowEndDevice) {
    console.log("📱 Using DOM-based roulette for mobile");
    return showClassRouletteOverlayDOM();
  }

  // Desktop path - use SVG-based wheel
  return showClassRouletteOverlaySVG();
}

// NEW: DOM-based roulette for mobile
async function showClassRouletteOverlayDOM() {
  console.log("🎲 Starting DOM-based roulette overlay");
  return new Promise((resolve) => {
    const { backdrop, content } = createOverlayStructure();

    // Get available classes
    const getAvailableClassesForRoulette = () => {
      const availableClasses = window.getAvailableClasses
        ? window.getAvailableClasses()
        : ["Light", "Medium", "Heavy"];

      const classConfigs = {
        Light: { name: "Light", color: "#4FC3F7" },
        Medium: { name: "Medium", color: "#AB47BC" },
        Heavy: { name: "Heavy", color: "#FF1744" },
      };

      const available = availableClasses.map((cls) => classConfigs[cls]);

      if (available.length === 0) {
        alert(
          "Please select at least one class in the filters before spinning!"
        );
        return null;
      }

      return available;
    };

    const classes = getAvailableClassesForRoulette();
    if (!classes) {
      clearOverlay();
      resolve(null);
      return;
    }

    // Create DOM roulette container
    const rouletteContainer = document.createElement("div");
    rouletteContainer.className = "roulette-overlay mobile-dom";
    rouletteContainer.innerHTML = `
      <div class="roulette-container">
        <div class="roulette-title">
          <h2>SELECTING CLASS</h2>
          <p>Fate decides your build...</p>
        </div>
        <div class="dom-roulette-wheel-container"></div>
      </div>
    `;

    content.appendChild(rouletteContainer);

    // Create DOM wheel
    const wheelContainer = rouletteContainer.querySelector(
      ".dom-roulette-wheel-container"
    );
    const wheelWrapper = document.createElement("div");
    wheelWrapper.className = "dom-wheel-wrapper";
    wheelWrapper.style.cssText = `
      width: 300px;
      height: 300px;
      margin: 0 auto;
      position: relative;
      border-radius: 50%;
      overflow: hidden;
      box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
    `;

    // Create rotating wheel
    const wheel = document.createElement("div");
    wheel.className = "dom-wheel-rotating";
    wheel.style.cssText = `
      width: 100%;
      height: 100%;
      position: absolute;
      border-radius: 50%;
      background: #222;
      transition: transform 3.5s cubic-bezier(0.17, 0.67, 0.12, 0.99);
    `;

    // Create segments
    const segmentCount = 12;
    const segmentAngle = 360 / segmentCount;

    for (let i = 0; i < segmentCount; i++) {
      const classIndex = i % classes.length;
      const classConfig = classes[classIndex];

      const segment = document.createElement("div");
      segment.className = "dom-wheel-segment";
      segment.dataset.class = classConfig.name;
      // Calculate proper skew angle for pie segments
      const skewAngle = 90 - 180 / segmentCount;

      segment.style.cssText = `
        position: absolute;
        width: 50%;
        height: 50%;
        right: 0;
        bottom: 0;
        transform-origin: 0% 100%;
        transform: rotate(${i * segmentAngle}deg) skewY(${skewAngle}deg);
        background: ${classConfig.color};
        border: 1px solid rgba(255, 255, 255, 0.2);
        overflow: hidden;
      `;

      const label = document.createElement("div");
      label.textContent = classConfig.name.toUpperCase();
      label.style.cssText = `
        position: absolute;
        top: 20%;
        left: 20%;
        transform: skewY(${-skewAngle}deg) rotate(${segmentAngle / 2}deg);
        color: white;
        font-weight: bold;
        font-size: 12px;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
      `;
      segment.appendChild(label);
      wheel.appendChild(segment);
    }

    // Create center hub
    const centerHub = document.createElement("div");
    centerHub.style.cssText = `
      position: absolute;
      width: 80px;
      height: 80px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #222;
      border-radius: 50%;
      border: 3px solid #ffd700;
      z-index: 10;
    `;

    // Create pointer
    const pointer = document.createElement("div");
    pointer.style.cssText = `
      position: absolute;
      top: -15px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 15px solid transparent;
      border-right: 15px solid transparent;
      border-top: 30px solid #ffd700;
      z-index: 20;
    `;

    // Create simplified ball
    const ball = document.createElement("div");
    ball.className = "dom-roulette-ball";
    ball.style.cssText = `
      position: absolute;
      width: 16px;
      height: 16px;
      background: radial-gradient(circle at 30% 30%, #fff, #ccc);
      border-radius: 50%;
      top: 15px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 15;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
      opacity: 0;
    `;

    wheelWrapper.appendChild(wheel);
    wheelWrapper.appendChild(centerHub);
    wheelWrapper.appendChild(pointer);
    wheelWrapper.appendChild(ball);
    wheelContainer.appendChild(wheelWrapper);

    // Animate in
    requestAnimationFrame(() => {
      backdrop.classList.add("active");
      rouletteContainer.classList.add("active");
    });

    // Start spin after delay
    setTimeout(() => {
      // Calculate winner
      const winningIndex = Math.floor(Math.random() * segmentCount);
      const winningClassIndex = winningIndex % classes.length;
      const winner = classes[winningClassIndex].name;

      // Calculate rotation
      const rotations = 3 + Math.random() * 2;
      const finalAngle = (segmentCount - winningIndex) * segmentAngle;
      const totalRotation = rotations * 360 + finalAngle;

      // Spin wheel
      wheel.style.transform = `rotate(${totalRotation}deg)`;

      // Animate ball with easing
      setTimeout(() => {
        ball.style.opacity = "1";
        ball.style.transition = "all 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        ball.style.transform = `translateX(-50%) translateY(100px)`;
      }, 200);

      // Play sound
      if (window.state?.soundEnabled) {
        try {
          overlayAudio.roulette.currentTime = 0;
          overlayAudio.roulette.volume = 0.05;
          overlayAudio.roulette.play().catch(() => {});
        } catch (e) {}
      }

      // Handle completion
      setTimeout(() => {
        // Highlight winner
        const segments = wheel.querySelectorAll(".dom-wheel-segment");
        segments.forEach((seg) => {
          if (seg.dataset.class === winner) {
            seg.style.filter = "brightness(1.5)";
          } else {
            seg.style.opacity = "0.5";
          }
        });

        // Clean up and resolve
        setTimeout(() => {
          backdrop.classList.remove("active");
          rouletteContainer.classList.remove("active");

          setTimeout(() => {
            clearOverlay();
            resolve(winner);
          }, 300);
        }, 1000);
      }, 3500);
    }, 1000);
  });
}

// Rename existing function to showClassRouletteOverlaySVG
async function showClassRouletteOverlaySVG() {
  console.log("🎲 [DEBUG] Using SVG-based roulette for desktop");

  return new Promise((resolve) => {
    const { backdrop, content } = createOverlayStructure();

    // Use roulette-animations function
    if (window.animateClassSelection) {
      console.log("🎰 Using roulette-animations.js for class selection");

      // Show backdrop
      requestAnimationFrame(() => {
        backdrop.classList.add("active");
      });

      // Call the roulette animation function which returns a promise
      window
        .animateClassSelection()
        .then((selectedClass) => {
          console.log("✅ Class selected from roulette:", selectedClass);

          // Clean up
          setTimeout(() => {
            backdrop.classList.remove("active");
            setTimeout(() => {
              clearOverlay();
              resolve(selectedClass);
            }, 300);
          }, 500);
        })
        .catch((error) => {
          console.error("❌ Error in roulette animation:", error);
          clearOverlay();
          resolve(null);
        });
    } else {
      console.error("❌ animateClassSelection function not found!");
      // Fallback to DOM version
      return showClassRouletteOverlayDOM().then(resolve);
    }
  });
}

// =====================================
// CLASS ROULETTE OVERLAY
// =====================================

// Class picker overlay for jackpot
async function showClassPickerOverlay() {
  return new Promise((resolve) => {
    const { backdrop, content } = createOverlayStructure();

    // Create class picker
    const picker = document.createElement("div");
    picker.className = "class-picker";

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
      backdrop.classList.add("active");
      picker.classList.add("active");
    });

    // Handle class selection
    const buttons = picker.querySelectorAll(".class-picker-button");
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const selectedClass = button.dataset.class;

        // Play sound only if enabled
        if (window.state && window.state.soundEnabled) {
          overlayAudio.transition.currentTime = 0;
          overlayAudio.transition.play();
        }

        // Highlight selected button
        button.classList.add("selected");
        buttons.forEach((b) => {
          if (b !== button) b.style.opacity = "0.3";
        });

        // Wait a moment to show selection, then animate out
        setTimeout(() => {
          picker.classList.remove("active");
          backdrop.classList.remove("active");

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
  console.log("🚀 Starting loadout generation flow...");
  console.log("📍 Overlay state:", overlayState);
  console.log(
    "📍 Overlay root exists:",
    !!document.getElementById("overlay-root")
  );

  // Check if any classes are available
  const availableClasses = window.getAvailableClasses
    ? window.getAvailableClasses()
    : ["Light", "Medium", "Heavy"];
  if (availableClasses.length === 0) {
    alert("Please select at least one class in the filters before spinning!");
    return;
  }

  try {
    // Set valid spin sequence flag
    window.isValidSpinSequence = true;

    // Clear any existing static slot machine from main page
    const mainOutput = document.getElementById("output");
    if (mainOutput) {
      mainOutput.innerHTML = "";
      mainOutput.style.display = "none";
      mainOutput.style.opacity = "0";
      mainOutput.classList.remove("final-result");
    }

    // Disable main button during flow
    const mainButton = document.getElementById("main-spin-button");
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

    // Step 2: Handle class selection - both jackpot and normal go through roulette
    if (spinResult.isJackpot) {
      console.log("🎰 Jackpot detected, proceeding to class roulette");
      // Show jackpot reveal first
      await showRevealCard({
        title: "JACKPOT!",
        subtitle: `${spinResult.spins} SPINS + FREE RESPIN`,
        duration: 2000,
        isJackpot: true,
      });
    } else {
      // Normal path - show spin count reveal first
      await showRevealCard({
        title: spinResult.value,
        subtitle: `${spinResult.spins} ${
          spinResult.spins === 1 ? "SPIN" : "SPINS"
        }!`,
        duration: 2000,
        isJackpot: false,
      });
    }

    // Both jackpot and normal proceed to roulette
    overlayState.selectedClass = await showClassRouletteOverlay();

    // Check if roulette was cancelled (no classes available)
    if (!overlayState.selectedClass) {
      console.log("❌ No class selected, cancelling flow");
      return;
    }

    // Show class reveal
    await showRevealCard({
      title: overlayState.selectedClass.toUpperCase(),
      subtitle: "CLASS SELECTED!",
      duration: 2000,
    });

    // Step 4: Show slot machine overlay
    console.log("🎰 Starting slot machine overlay with:", {
      class: overlayState.selectedClass,
      spins: overlayState.spinCount,
    });

    // Show slot machine in overlay
    await showSlotMachineOverlay(
      overlayState.selectedClass,
      overlayState.spinCount
    );
  } catch (error) {
    console.error("❌ Error in loadout generation flow:", error);
  } finally {
    // Re-enable main button
    const mainButton = document.getElementById("main-spin-button");
    if (mainButton) {
      mainButton.disabled = false;
    }

    overlayState.isActive = false;

    // Clear valid spin sequence flag
    window.isValidSpinSequence = false;
  }
}

// =====================================
// SLOT MACHINE OVERLAY
// =====================================

async function showSlotMachineOverlay(selectedClass, spinCount) {
  console.log("🎰 Showing slot machine overlay...");

  // Add class to body to hide duplicate text on desktop
  document.body.classList.add("overlay-active");

  return new Promise((resolve) => {
    const { backdrop, content } = createOverlayStructure();

    // Create slot machine overlay container
    const slotContainer = document.createElement("div");
    slotContainer.className = "slot-machine-overlay";
    slotContainer.innerHTML = `
      <div class="slot-overlay-wrapper">
        <div class="slot-overlay-header">
          <h2>${selectedClass.toUpperCase()} CLASS</h2>
          <p class="spin-info">${spinCount} ${
      spinCount === 1 ? "Spin" : "Spins"
    } Remaining</p>
        </div>
        <div class="slot-machine-container" id="overlay-slot-output">
          <!-- Slot machine will be rendered here -->
        </div>
      </div>
    `;

    content.appendChild(slotContainer);

    // Animate in
    requestAnimationFrame(() => {
      backdrop.classList.add("active");
      slotContainer.classList.add("active");
    });

    // Wait a moment then start the slot machine
    setTimeout(() => {
      // Set up state for slot machine
      if (window.state) {
        window.state.selectedClass = selectedClass;
        window.state.totalSpins = spinCount;
        window.state.currentSpin = spinCount;
        window.state.spinsLeft = spinCount;
        window.state.isSpinning = false; // Reset spinning state
      }

      // Create a temporary slot machine instance for the overlay
      const overlayOutput = document.getElementById("overlay-slot-output");

      if (overlayOutput) {
        // Create a new slot machine instance for the overlay
        const overlaySlotMachine = new SlotMachine("overlay-slot-output");
        overlaySlotMachine.init();

        // Store the original instance temporarily
        const originalSlotMachine = window.slotMachineInstance;
        window.slotMachineInstance = overlaySlotMachine;

        console.log("🎰 Starting slot machine in overlay with:", selectedClass);

        // Start the slot machine
        if (typeof window.startSlotMachine === "function") {
          window.startSlotMachine(selectedClass, spinCount);

          // Monkey patch finalizeSpin to handle overlay completion
          const originalFinalizeSpin = window.finalizeSpin;
          let hasHandledFinalSpin = false;

          window.finalizeSpin = function (columns) {
            // Call original function
            if (originalFinalizeSpin) {
              originalFinalizeSpin.call(this, columns);
            }

            // Check if this was the final spin (only handle once)
            if (
              window.state &&
              window.state.spinsLeft === 0 &&
              !hasHandledFinalSpin
            ) {
              hasHandledFinalSpin = true;
              // Auto-close overlay after animations complete
              // Total time: ~7s for final column + 3s celebration = 10s total
              // We'll wait 2s after that for a clean transition
              setTimeout(() => {
                // Copy the final slot machine content to the main page
                const overlayOut = document.getElementById("output");
                const originalOut = document.getElementById("output-backup");

                if (overlayOut && originalOut) {
                  // Clone the slot machine content
                  const finalContent = overlayOut.innerHTML;

                  // Create a wrapper for the smaller final slot machine
                  const wrapper = document.createElement("div");
                  wrapper.className = "final-slot-machine-wrapper";
                  wrapper.innerHTML = finalContent;

                  // Add final glow effect to all item containers
                  const itemContainers = wrapper.querySelectorAll(".slot-item");
                  itemContainers.forEach((container) => {
                    container.classList.add("final-glow");
                  });

                  // Copy to main page output with wrapper
                  originalOut.innerHTML = wrapper.outerHTML;
                  originalOut.style.display = "block";
                  originalOut.style.opacity = "1";
                  originalOut.classList.add("final-result");

                  // Restore IDs
                  overlayOut.id = "overlay-slot-output";
                  originalOut.id = "output";
                }

                // Restore original finalizeSpin
                window.finalizeSpin = originalFinalizeSpin;

                // Animate out overlay
                slotContainer.classList.remove("active");
                backdrop.classList.remove("active");

                setTimeout(() => {
                  clearOverlay();
                  resolve();
                }, 300);
              }, 2000); // Wait 2 seconds after animation completes
            }

            // Restore the original slot machine instance after completion
            window.slotMachineInstance = originalSlotMachine;
          };
        } else {
          console.error("❌ startSlotMachine function not found!");
        }
      } else {
        console.error("❌ Overlay output container not found!");
        setTimeout(() => {
          clearOverlay();
          resolve();
        }, 1000);
      }
    }, 500);
  });
}

// =====================================
// SLOT MACHINE INTEGRATION
// ====================================="

function startSlotMachine(selectedClass, spinCount) {
  // Update global state for slot machine
  if (window.state) {
    window.state.selectedClass = selectedClass;
    window.state.totalSpins = spinCount;
    window.state.currentSpin = spinCount;
    window.state.spinsLeft = spinCount;
  }

  // Clear any existing output
  const output = document.getElementById("output");
  if (output) {
    output.innerHTML = "";
    output.style.opacity = "0";
    output.style.display = "none";
  }

  // Update the selection display
  updateSelectionDisplay(selectedClass, spinCount);

  // Wait a moment for overlays to clear, then start slot machine
  setTimeout(() => {
    // Show the output container
    if (output) {
      output.style.display = "block";
      output.style.opacity = "1";
    }

    // Call the actual slot machine function
    if (typeof window.displayLoadout === "function") {
      console.log(
        "🎰 Starting slot machine with displayLoadout:",
        selectedClass
      );
      window.displayLoadout(selectedClass);
    } else if (typeof window.startSlotMachineSequence === "function") {
      console.log(
        "🎰 Starting slot machine sequence with:",
        selectedClass,
        spinCount
      );
      window.startSlotMachineSequence(selectedClass, spinCount);
    } else {
      console.error(
        "❌ Neither displayLoadout nor startSlotMachineSequence function found!"
      );
    }
  }, 500); // Give time for overlay to clear
}

// Update the selection display above the slot machine
function updateSelectionDisplay(selectedClass, spinsRemaining) {
  const selectionDisplay = document.getElementById("selection-display");
  if (selectionDisplay) {
    selectionDisplay.classList.add("visible");

    const classSpan = selectionDisplay.querySelector(".selection-class");
    const spinsSpan = selectionDisplay.querySelector(".selection-spins");

    if (classSpan) {
      classSpan.textContent = selectedClass.toUpperCase();
      classSpan.className = `selection-class ${selectedClass.toLowerCase()}`;
    }

    if (spinsSpan) {
      const spinsText = spinsRemaining === 1 ? "Spin" : "Spins";
      spinsSpan.innerHTML = `<span class="spin-count">${spinsRemaining}</span> ${spinsText} Remaining`;
    }
  }
}

// Export the update function for use during spins
window.updateSpinCount = function (spinsRemaining) {
  const spinsSpan = document.querySelector(".selection-spins");
  if (spinsSpan) {
    const spinsText = spinsRemaining === 1 ? "Spin" : "Spins";
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
  showSlotMachineOverlay,
  overlayState,
  overlayAudio,
};

console.log("✅ Overlay Manager loaded");
console.log("🔍 overlayManager functions available:", {
  startLoadoutGeneration: typeof window.overlayManager?.startLoadoutGeneration,
  showSpinWheelOverlay: typeof window.overlayManager?.showSpinWheelOverlay,
  showClassRouletteOverlay:
    typeof window.overlayManager?.showClassRouletteOverlay,
});
