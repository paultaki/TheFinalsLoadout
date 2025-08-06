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
};

// Preload all sounds
Object.values(overlayAudio).forEach((audio) => {
  audio.preload = "auto";
});

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
  const spins = 3; // Always 3 spins
  return {
    value: "JACKPOT",
    spins: spins,
    label: `JACKPOT!\n${spins} SPINS\n+ FREE RESPIN`,
    className: "card-special jackpot",
    isJackpot: true,
  };
}

// Card configuration
const SPIN_CARDS = [
  { value: "1", spins: 1, label: "1", className: "card-1" },
  { value: "2", spins: 2, label: "2", className: "card-2" },
  makeJackpotCard(), // SPREAD: First jackpot card at position 3
  { value: "3", spins: 3, label: "3", className: "card-3" },
  { value: "4", spins: 4, label: "4", className: "card-4" },
  { value: "2", spins: 2, label: "2", className: "card-2" },
  makeJackpotCard(), // SPREAD: Second jackpot card at position 7
  { value: "4", spins: 4, label: "4", className: "card-4" },
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
      // Play tick sound only if enabled
      if (window.state && window.state.soundEnabled) {
        try {
          overlayAudio.beep.currentTime = 0;
          overlayAudio.beep.playbackRate = Math.min(2, 0.5 + velocity / 1000);
          overlayAudio.beep.play().catch((err) => {
            console.warn("Failed to play beep sound:", err);
          });
        } catch (e) {
          console.warn("Beep sound error:", e);
        }
      }

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

      // Find winner
      const { card: winningCard, result } = findWinningCard();

      // Highlight winning card
      const cards = wheelList.querySelectorAll(".card");
      cards.forEach((card) => card.classList.remove("winner"));
      if (winningCard) {
        winningCard.classList.add("winner");

        // Add grow animation to winning card
        winningCard.style.transition = "transform 0.5s ease-out";
        winningCard.style.transform = "scale(1.2)";
      }

      // Play sound only if enabled
      if (window.state && window.state.soundEnabled) {
        if (result.isJackpot) {
          overlayAudio.dingDing.currentTime = 0;
          overlayAudio.dingDing.play();
          // Stop jackpot sound after 1.5s
          setTimeout(() => {
            overlayAudio.dingDing.pause();
            overlayAudio.dingDing.currentTime = 0;
          }, 1500);
        }
      }

      // Add glow effect
      wheelFrame.classList.add("glowing");

      // Create confetti
      createSpinConfetti();

      // Handle jackpot
      if (result.isJackpot) {
        console.log("🎰 JACKPOT DETECTED! Result:", result);

        // Extra confetti for jackpot
        setTimeout(() => createSpinConfetti(), 300);
        setTimeout(() => createSpinConfetti(), 600);

        // Show jackpot modal after a short delay
        setTimeout(() => {
          console.log(
            "🎰 About to show jackpot popup with spins:",
            result.spins
          );
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
        }, 2000); // Standard 2 second delay for jackpot
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
        }, 3000); // Extra 1 second pause to show winning card
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

      // Play spin sound only if enabled
      if (window.state && window.state.soundEnabled) {
        try {
          overlayAudio.spinning.currentTime = 0;
          overlayAudio.spinning.volume = 0.3;
          overlayAudio.spinning.play().catch(() => {});
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
  spinDuration: 8000, // 8 seconds for wheel
  minRotations: 8, // More rotations for visible spinning
  maxRotations: 12, // Maximum full rotations
  ballDuration: 7500, // 7.5 seconds for ball
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
  return new Promise((resolve) => {
    const { backdrop, content } = createOverlayStructure();

    // Get available classes from filters using global function
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

      // If no classes selected, show error
      if (available.length === 0) {
        alert(
          "Please select at least one class in the filters before spinning!"
        );
        return null;
      }

      return available;
    };

    // Generate wheel segments
    const generateSegments = () => {
      const availableClasses = getAvailableClassesForRoulette();

      if (!availableClasses) {
        return null;
      }
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
            endAngle: (i + 1) * segmentAngle,
          });
        }
      } else {
        // Alternate between available classes for visual variety
        for (let i = 0; i < segmentCount; i++) {
          const classIndex = i % availableClasses.length;
          segments.push({
            ...availableClasses[classIndex],
            angle: i * segmentAngle,
            endAngle: (i + 1) * segmentAngle,
          });
        }
      }

      return segments;
    };

    const segments = generateSegments();

    // If no classes available, exit early
    if (!segments) {
      clearOverlay();
      resolve(null);
      return;
    }

    console.log("🎯 Generated segments:", segments);

    // Create roulette container
    const rouletteContainer = document.createElement("div");
    rouletteContainer.className = "roulette-overlay";
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
            <svg class="wheel-svg" viewBox="0 0 400 400" width="400" height="400" preserveAspectRatio="xMidYMid meet">
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
                  ${segments
                    .map((seg, i) => {
                      const startAngle = (seg.angle * Math.PI) / 180;
                      const endAngle = (seg.endAngle * Math.PI) / 180;
                      const radius = ROULETTE_CONFIG.wheelRadius;
                      const x1 = 200 + radius * Math.cos(startAngle);
                      const y1 = 200 + radius * Math.sin(startAngle);
                      const x2 = 200 + radius * Math.cos(endAngle);
                      const y2 = 200 + radius * Math.sin(endAngle);

                      return `
                      <path
                        d="M 200 200 L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z"
                        fill="${seg.color}"
                        stroke="#FFD700"
                        stroke-width="2"
                        class="wheel-segment"
                        data-class="${seg.name}"
                      />
                    `;
                    })
                    .join("")}
                </g>

                <!-- Class labels -->
                <g class="wheel-labels">
                  ${segments
                    .map((seg) => {
                      const segmentAngle = seg.endAngle - seg.angle;
                      const labelAngle = seg.angle + segmentAngle / 2; // Center of segment
                      const labelRadius = 100;
                      const x =
                        200 +
                        labelRadius * Math.cos((labelAngle * Math.PI) / 180);
                      const y =
                        200 +
                        labelRadius * Math.sin((labelAngle * Math.PI) / 180);
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
                    })
                    .join("")}
                </g>
              </g>

              <!-- Static center hub with logo -->
              <g class="wheel-static-center">
                <circle cx="200" cy="200" r="40" fill="#222" stroke="#FFD700" stroke-width="3"/>
                <image href="images/the-finals.webp"
                       x="172.5" y="172.5"
                       width="55" height="55"
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
            ${Array(12)
              .fill(0)
              .map(
                (_, i) => `
              <div class="light" style="transform: rotate(${
                i * 30
              }deg) translateY(-200px); animation-delay: ${i * 0.1}s"></div>
            `
              )
              .join("")}
          </div>
        </div>
      </div>
    `;

    content.appendChild(rouletteContainer);

    // Get elements
    const wheel = document.getElementById("roulette-wheel");
    const ball = document.getElementById("roulette-ball");
    const rotatingGroup = document.getElementById("wheel-rotating-group");

    // Debug log
    console.log("🎲 Roulette elements:", {
      wheel: !!wheel,
      ball: !!ball,
      rotatingGroup: !!rotatingGroup,
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
      rotatingGroup: rotatingGroup, // Cache the element
    };

    // Calculate winner based on ball position relative to wheel
    const calculateWinner = () => {
      // Get final wheel position (positive rotation)
      const wheelAngle = rouletteState.wheelRotation % 360;

      // Get ball's final position (ball rotates counter-clockwise, so positive angle)
      const ballAngle = ((rouletteState.totalBallRotation % 360) + 360) % 360;

      // The ball is at the top (0 degrees) of the display
      // We need to find which segment is at the top position when the wheel stops
      // Since the wheel rotates clockwise, we need to find which segment moved TO the top
      const topPositionOnWheel = (360 - wheelAngle) % 360;

      // Now adjust for where the ball landed
      const ballPositionOnWheel = (topPositionOnWheel + ballAngle) % 360;

      // Find which segment this position falls into
      const segmentAngle = 360 / segments.length;
      let segmentIndex = Math.floor(ballPositionOnWheel / segmentAngle);

      // Ensure index is within bounds
      if (segmentIndex < 0) segmentIndex += segments.length;
      if (segmentIndex >= segments.length)
        segmentIndex = segmentIndex % segments.length;

      const winningSegment = segments[segmentIndex];

      console.log("🎯 Winner calculation:", {
        wheelRotation: rouletteState.wheelRotation,
        wheelAngle: wheelAngle,
        ballRotation: rouletteState.totalBallRotation,
        ballAngle: ballAngle,
        topPositionOnWheel: topPositionOnWheel,
        ballPositionOnWheel: ballPositionOnWheel,
        segmentAngle: segmentAngle,
        segmentIndex: segmentIndex,
        totalSegments: segments.length,
        winner: winningSegment.name,
        allSegments: segments.map((s) => s.name),
      });

      return winningSegment.name;
    };

    // Animate the spin
    const animateSpin = (timestamp) => {
      if (!rouletteState.startTime) {
        rouletteState.startTime = timestamp;
        console.log("🎲 Animation started");
      }

      const elapsed = timestamp - rouletteState.startTime;
      const progress = Math.min(elapsed / ROULETTE_CONFIG.spinDuration, 1);

      // Apply easing
      const easedProgress = easeOutQuart(progress); // Smoother deceleration

      // Update wheel rotation (clockwise)
      rouletteState.wheelRotation =
        rouletteState.targetRotation * easedProgress;

      // Log every 30 frames
      if (Math.floor(timestamp / 500) !== Math.floor((timestamp - 16) / 500)) {
        console.log("🎲 Wheel rotation:", {
          rotation: rouletteState.wheelRotation.toFixed(2),
          progress: progress.toFixed(2),
          easedProgress: easedProgress.toFixed(2),
        });
      }

      // Use cached rotating group element or find it
      let rotatingGroup = rouletteState.rotatingGroup;

      if (!rotatingGroup) {
        rotatingGroup = document.getElementById("wheel-rotating-group");
        if (rotatingGroup) {
          rouletteState.rotatingGroup = rotatingGroup;
          console.log("🎲 Found rotating group");
        } else {
          console.error("Could not find wheel-rotating-group element!");
          return;
        }
      }

      // Add subtle wheel vibration during high speed
      if (progress < 0.5) {
        const vibration = Math.sin(elapsed * 0.1) * 0.5;
        const rotation = rouletteState.wheelRotation + vibration;
        // Fixed SVG transform syntax - comma separators
        rotatingGroup.setAttribute(
          "transform",
          `rotate(${rotation}, 200, 200)`
        );
      } else {
        // Fixed SVG transform syntax - comma separators
        rotatingGroup.setAttribute(
          "transform",
          `rotate(${rouletteState.wheelRotation}, 200, 200)`
        );
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
      const ballAngleRad = (rouletteState.ballAngularPosition * Math.PI) / 180;

      // Calculate radius based on physics
      let currentRadius =
        ROULETTE_CONFIG.outerRadius -
        (ROULETTE_CONFIG.outerRadius - ROULETTE_CONFIG.ballRadius) *
          (1 - physics.radius);

      // If settling, move to final position on segment
      if (physics.settling) {
        const targetRadius = ROULETTE_CONFIG.finalRadius;
        currentRadius =
          currentRadius -
          (currentRadius - targetRadius) * physics.settleProgress;

        // Also slow down angular movement when settling
        if (physics.settleProgress > 0.5) {
          // Start snapping to nearest segment center
          const segmentAngle = 360 / segments.length;
          const currentSegment = Math.round(
            (-rouletteState.ballAngularPosition % 360) / segmentAngle
          );
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
      ball.style.opacity = "1";

      // Apply blur effect during high speed
      if (physics.blur) {
        ball.classList.add("high-speed");
      } else {
        ball.classList.remove("high-speed");
      }

      // Store final position for winner calculation
      rouletteState.totalBallRotation = rouletteState.ballAngularPosition;

      // Dynamic sound effects based on physics phase
      if (physics.speed > 0.1 && window.state && window.state.soundEnabled) {
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
      if (
        ballProgress > 0.7 &&
        ballProgress < 0.72 &&
        !rouletteState.dropSoundPlayed &&
        window.state &&
        window.state.soundEnabled
      ) {
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
      console.log("🎲 [DEBUG] handleSpinComplete called");
      rouletteState.isSpinning = false;

      // Calculate winner based on where ball landed
      const winner = calculateWinner();
      rouletteState.selectedClass = winner;

      // Play win sound only if enabled
      if (window.state && window.state.soundEnabled) {
        overlayAudio.ding.currentTime = 0;
        overlayAudio.ding.play();
      }

      // Add landed class to ball
      ball.classList.add("landed");

      // Highlight winning segment
      const segments = rouletteContainer.querySelectorAll(".wheel-segment");
      segments.forEach((segment) => {
        if (segment.dataset.class === winner) {
          segment.classList.add("winner");
        }
      });

      // Add glow effect
      wheel.classList.add("complete");

      // Wait then resolve
      setTimeout(() => {
        // Animate out
        rouletteContainer.classList.remove("active");
        backdrop.classList.remove("active");

        setTimeout(() => {
          clearOverlay();
          console.log(
            "🎲 [DEBUG] Resolving roulette overlay with winner:",
            winner
          );
          resolve(winner);
        }, 300);
      }, 2000); // Extra 0.5 seconds pause to show winning class
    };

    // Start the spin
    const startSpin = () => {
      if (rouletteState.isSpinning) return;

      console.log("🎲 Starting roulette spin");
      rouletteState.isSpinning = true;

      // Calculate target rotation
      const rotations =
        ROULETTE_CONFIG.minRotations +
        Math.random() *
          (ROULETTE_CONFIG.maxRotations - ROULETTE_CONFIG.minRotations);
      const finalAngle = Math.random() * 360;
      rouletteState.targetRotation = rotations * 360 + finalAngle;

      console.log("🎲 Target rotation:", rouletteState.targetRotation);

      // Play spin sound only if enabled
      if (window.state && window.state.soundEnabled) {
        try {
          overlayAudio.roulette.currentTime = 0;
          overlayAudio.roulette.volume = 0.5;
          overlayAudio.roulette.play().catch((err) => {
            console.warn("Failed to play roulette sound:", err);
          });
        } catch (e) {
          console.warn("Roulette sound error:", e);
        }
      }

      // Start animation
      rouletteState.animationId = requestAnimationFrame(animateSpin);
    };

    // Animate in
    requestAnimationFrame(() => {
      backdrop.classList.add("active");
      rouletteContainer.classList.add("active");

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

          // Function to update overlay countdown
          const updateOverlayCountdown = (spinsLeft, selectedClass) => {
            const spinInfoElement = document.querySelector(
              ".slot-overlay-header .spin-info"
            );
            if (spinInfoElement) {
              if (spinsLeft === 1) {
                spinInfoElement.textContent = "FINAL SPIN";
              } else if (spinsLeft > 1) {
                spinInfoElement.textContent = `${spinsLeft} ${
                  spinsLeft === 1 ? "Spin" : "Spins"
                } Remaining`;
              }
            }
          };

          // Monkey patch finalizeSpin to handle overlay completion
          const originalFinalizeSpin = window.finalizeSpin;
          let hasHandledFinalSpin = false;

          window.finalizeSpin = function (columns) {
            // Call original function
            if (originalFinalizeSpin) {
              originalFinalizeSpin.call(this, columns);
            }

            // Update countdown display if we're not on the final spin
            if (window.state && window.state.spinsLeft > 0) {
              updateOverlayCountdown(window.state.spinsLeft, selectedClass);
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
// FINAL LOADOUT CHOICE MODAL (RESPIN SYSTEM)
// =====================================

function showFinalLoadoutChoiceModal(loadout) {
  return new Promise((resolve) => {
    // Check if respin feature is enabled
    if (!window.FEATURE_FLAGS?.JACKPOT_RESPIN) {
      window.debugRespin &&
        window.debugRespin("Respin feature disabled, auto-keeping loadout");
      resolve("keep");
      return;
    }

    // Check if respin is available
    const respinAvailable = window.isRespinAvailable
      ? window.isRespinAvailable()
      : false;
    window.debugRespin &&
      window.debugRespin(
        `Showing final loadout choice. Respin available: ${respinAvailable}`
      );

    // Track analytics
    window.trackRespinEvent &&
      window.trackRespinEvent(
        window.ANALYTICS_EVENTS?.RESPIN_CHOICE_SHOWN || "respin_choice_shown",
        { respinAvailable }
      );

    // Set state to block other interactions
    if (window.state) {
      window.state.isWaitingForUserChoice = true;
      window.state.currentFinalLoadout = loadout;
    }

    const { backdrop, content } = createOverlayStructure();
    backdrop.classList.add("final-choice-backdrop");

    // Create mobile-first modal
    const modal = document.createElement("div");
    modal.className = "final-choice-modal";

    // Build loadout summary for preview
    const loadoutPreview = `
      <div class="loadout-preview">
        <div class="preview-title">🎊 Your Final Loadout</div>
        <div class="preview-class">${loadout.classType.toUpperCase()}</div>
        <div class="preview-items">
          <div class="preview-item">
            <img src="images/${loadout.weapon.name.replace(
              / /g,
              "_"
            )}.webp" alt="${loadout.weapon.name}" loading="lazy" />
            <span>${loadout.weapon.name}</span>
          </div>
          <div class="preview-item">
            <img src="images/${loadout.specialization.name.replace(
              / /g,
              "_"
            )}.webp" alt="${loadout.specialization.name}" loading="lazy" />
            <span>${loadout.specialization.name}</span>
          </div>
          ${loadout.gadgets
            .map(
              (gadget) => `
            <div class="preview-item">
              <img src="images/${gadget.name.replace(/ /g, "_")}.webp" alt="${
                gadget.name
              }" loading="lazy" />
              <span>${gadget.name}</span>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;

    // Create buttons based on respin availability
    const respinButton = respinAvailable
      ? `<button class="choice-button respin-button" data-choice="respin">
           <span class="button-icon">🎰</span>
           <span class="button-text">USE FREE RESPIN</span>
         </button>`
      : `<button class="choice-button respin-button disabled" disabled>
           <span class="button-icon">🚫</span>
           <span class="button-text">NO RESPINS AVAILABLE</span>
         </button>`;

    modal.innerHTML = `
      <div class="choice-header">
        <h2 class="choice-title">🎯 FINAL SPIN COMPLETE!</h2>
        <p class="choice-subtitle">What would you like to do?</p>
      </div>

      ${loadoutPreview}

      <div class="choice-buttons">
        <button class="choice-button keep-button" data-choice="keep">
          <span class="button-icon">💾</span>
          <span class="button-text">KEEP LOADOUT</span>
        </button>
        ${respinButton}
      </div>

      <div class="choice-info">
        ${
          respinAvailable
            ? '<span class="respin-info">🎫 You have a free respin from your jackpot!</span>'
            : '<span class="no-respin-info">💡 Earn respins by hitting jackpots on the spin wheel</span>'
        }
      </div>
    `;

    content.appendChild(modal);

    // Auto-timeout after 30 seconds
    const timeoutId = setTimeout(() => {
      window.debugRespin &&
        window.debugRespin("Choice modal timed out, auto-keeping loadout");
      window.trackRespinEvent &&
        window.trackRespinEvent(
          window.ANALYTICS_EVENTS?.RESPIN_ERROR || "respin_error",
          { reason: "timeout" }
        );
      cleanup();
      resolve("keep");
    }, window.RESPIN_CONFIG?.CHOICE_TIMEOUT || 30000);

    // Animate in
    requestAnimationFrame(() => {
      backdrop.classList.add("active");
      modal.classList.add("active");
    });

    // Handle button clicks
    const handleChoice = (choice) => {
      clearTimeout(timeoutId);

      // Track analytics
      const eventName =
        choice === "respin"
          ? window.ANALYTICS_EVENTS?.RESPIN_CHOSEN || "respin_chosen"
          : window.ANALYTICS_EVENTS?.LOADOUT_KEPT || "loadout_kept";

      window.trackRespinEvent &&
        window.trackRespinEvent(eventName, {
          loadoutClass: loadout.classType,
          weapon: loadout.weapon.name,
          respinAvailable,
          sessionRespinCount: window.state?.respinSessionCount || 0,
        });

      window.debugRespin && window.debugRespin(`User chose: ${choice}`);
      cleanup();
      resolve(choice);
    };

    const cleanup = () => {
      backdrop.classList.remove("active");
      modal.classList.remove("active");

      // Reset state
      if (window.state) {
        window.state.isWaitingForUserChoice = false;
      }

      setTimeout(() => {
        clearOverlay();
      }, 300);
    };

    // Add event listeners
    modal.addEventListener("click", (e) => {
      const button = e.target.closest(".choice-button");
      if (button && !button.disabled) {
        const choice = button.dataset.choice;

        // Add visual feedback
        button.style.transform = "scale(0.95)";
        button.classList.add("clicked");

        // Play sound if enabled
        if (window.state?.soundEnabled) {
          const clickSound = document.getElementById("clickSound");
          if (clickSound) {
            clickSound.currentTime = 0;
            clickSound.volume = 0.3;
            clickSound.play().catch(() => {});
          }
        }

        setTimeout(() => {
          handleChoice(choice);
        }, 150);
      }
    });

    // Add touch feedback for mobile
    modal.addEventListener("touchstart", (e) => {
      const button = e.target.closest(".choice-button");
      if (button && !button.disabled) {
        button.style.transform = "scale(0.98)";
      }
    });

    // Prevent accidental dismissal by clicking backdrop
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        // Show a gentle reminder instead of closing
        modal.classList.add("shake");
        setTimeout(() => {
          modal.classList.remove("shake");
        }, 500);
      }
    });
  });
}

// Export the new function for global access
window.showFinalLoadoutChoiceModal = showFinalLoadoutChoiceModal;

// =====================================
// SLOT MACHINE INTEGRATION
// ====================================="

function startSlotMachine(selectedClass, spinCount) {
  console.log("🎰 startSlotMachine called with:", { selectedClass, spinCount });

  // Update global state for slot machine
  if (window.state) {
    window.state.selectedClass = selectedClass;
    window.state.totalSpins = spinCount;
    window.state.currentSpin = spinCount;
    window.state.spinsLeft = spinCount;
    console.log("🎰 Updated window.state:", window.state);
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

    // Call the actual slot machine function - USE MULTI-SPIN SEQUENCE
    console.log("🎰 Available functions:", {
      startSlotMachine: typeof window.startSlotMachine,
      displayLoadout: typeof window.displayLoadout,
      executeSpinSequence: typeof window.executeSpinSequence,
    });

    if (typeof window.executeSpinSequence === "function") {
      console.log(
        "🎰 Starting slot machine sequence with executeSpinSequence:",
        selectedClass,
        spinCount
      );
      window.executeSpinSequence(selectedClass, spinCount);
    } else if (spinCount > 1 && typeof window.displayLoadout === "function") {
      console.log(
        "🎰 Multi-spin sequence: Starting manual sequence with displayLoadout:",
        selectedClass,
        spinCount
      );
      // Manual multi-spin sequence
      window.executeManualSpinSequence(selectedClass, spinCount);
    } else if (typeof window.displayLoadout === "function") {
      console.log(
        "🎰 Single spin: Starting slot machine with displayLoadout:",
        selectedClass
      );
      window.displayLoadout(selectedClass);
    } else {
      console.error("❌ No suitable slot machine function found!");
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

// Manual multi-spin sequence handler (fallback)
// Generate loadout data for respin (same format as main slot machine)
function generateLoadoutForRespin(classType) {
  // Get the filtered loadouts
  const filteredLoadouts = window.getFilteredLoadouts();
  const loadout = filteredLoadouts[classType];

  if (!loadout) {
    console.error("No loadout data for class:", classType);
    return null;
  }

  // Select random items with error checking
  let selectedWeapon, selectedSpec;

  if (loadout.weapons && loadout.weapons.length > 0) {
    selectedWeapon = window.getRandomUniqueItems(loadout.weapons, 1)[0];
  } else {
    console.error("No weapons available for", classType);
    selectedWeapon = { name: "Default Weapon" };
  }

  if (loadout.specializations && loadout.specializations.length > 0) {
    selectedSpec = window.getRandomUniqueItems(loadout.specializations, 1)[0];
  } else {
    console.error("No specializations available for", classType);
    selectedSpec = { name: "Default Spec" };
  }

  const selectedGadgets = window.getUniqueGadgets(classType, loadout);

  // Create loadout object (same format as executeSpinSequence)
  const loadoutData = {
    classType: classType,
    weapons: selectedWeapon.name || selectedWeapon,
    specializations: selectedSpec.name || selectedSpec,
    gadgets: selectedGadgets.map((g) =>
      typeof g === "string" ? g : g.name || g
    ),
    spinsRemaining: 0, // This is a respin, so 0 remaining
    allItems: {
      weapons: loadout.weapons
        ? loadout.weapons.map((w) => (typeof w === "string" ? w : w.name || w))
        : [],
      specializations: loadout.specializations
        ? loadout.specializations.map((s) =>
            typeof s === "string" ? s : s.name || s
          )
        : [],
      gadgets: loadout.gadgets
        ? loadout.gadgets.map((g) => (typeof g === "string" ? g : g.name || g))
        : [],
    },
    // Store original objects for finalizeSpin
    weaponObject: selectedWeapon,
    specObject: selectedSpec,
    gadgetObjects: selectedGadgets,
  };

  console.log("Generated respin loadout:", loadoutData);
  return loadoutData;
}

window.executeManualSpinSequence = async function (selectedClass, totalSpins) {
  console.log(
    `🎰 Starting manual spin sequence: ${totalSpins} spins for ${selectedClass}`
  );

  for (let spinNum = 1; spinNum <= totalSpins; spinNum++) {
    console.log(`🎰 Manual sequence - spin ${spinNum} of ${totalSpins}`);

    // Update state
    if (window.state) {
      window.state.currentSpin = totalSpins - spinNum + 1;
      window.state.spinsLeft = totalSpins - spinNum + 1;
    }

    // Update spin counter display
    const spinsRemaining = totalSpins - spinNum + 1;
    window.updateSpinCount && window.updateSpinCount(spinsRemaining);

    // Execute the spin
    await new Promise((resolve) => {
      // Store original finalizeSpin
      const originalFinalizeSpin = window.finalizeSpin;

      // Create temporary finalizeSpin for this spin
      window.finalizeSpin = function (columns) {
        console.log(`🎰 Manual sequence - spin ${spinNum} completed`);

        if (spinNum < totalSpins) {
          // Not the final spin - continue sequence
          console.log(`🎰 Manual sequence - continuing to spin ${spinNum + 1}`);
          resolve();
        } else {
          // Final spin - restore original and handle completion
          console.log(`🎰 Manual sequence - final spin completed`);
          window.finalizeSpin = originalFinalizeSpin;
          if (originalFinalizeSpin) {
            originalFinalizeSpin.call(this, columns);
          }
          resolve();
        }
      };

      // Start the spin
      if (typeof window.displayLoadout === "function") {
        window.displayLoadout(selectedClass);
      }
    });

    // Wait between spins (except after final spin)
    if (spinNum < totalSpins) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  console.log(`🎰 Manual spin sequence completed for ${selectedClass}`);
};

// =====================================
// INITIALIZATION
// =====================================

// Alternative to modal - show buttons inline below slot machine
function showFinalLoadoutChoiceButtons(loadout) {
  console.log("🎰 showFinalLoadoutChoiceButtons called");
  window.debugRespin &&
    window.debugRespin("Showing final loadout choice buttons", { loadout });

  return new Promise((resolve) => {
    // Check if respin feature is enabled
    if (!window.FEATURE_FLAGS?.JACKPOT_RESPIN) {
      window.debugRespin &&
        window.debugRespin("Respin feature disabled, auto-keeping loadout");
      resolve("keep");
      return;
    }

    // Check if respin is available
    const respinAvailable = window.isRespinAvailable
      ? window.isRespinAvailable()
      : false;
    window.debugRespin &&
      window.debugRespin(
        `Showing final loadout choice buttons. Respin available: ${respinAvailable}`
      );

    // Track analytics
    window.trackRespinEvent &&
      window.trackRespinEvent(
        window.ANALYTICS_EVENTS?.RESPIN_CHOICE_SHOWN || "respin_choice_shown"
      );

    // Find the slot machine output container and slot items
    const outputContainer = document.getElementById("output");
    const slotMachineItems = outputContainer?.querySelector(
      ".slot-machine-items"
    );

    if (!outputContainer || !slotMachineItems) {
      window.debugRespin &&
        window.debugRespin(
          "No slot machine structure found, auto-keeping loadout"
        );
      resolve("keep");
      return;
    }

    // CRITICAL FIX: Ensure output container and slot machine are visible
    outputContainer.style.display = "block";
    outputContainer.style.opacity = "1";
    outputContainer.style.visibility = "visible";

    // Ensure slot machine items remain visible
    slotMachineItems.style.display = "block";
    slotMachineItems.style.opacity = "1";
    slotMachineItems.style.visibility = "visible";

    console.log("🎰 Slot machine loadout kept visible for choice buttons");

    // Create choice buttons container
    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "final-choice-buttons";

    // Add defensive styling to ensure visibility
    buttonsContainer.style.cssText = `
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      position: relative !important;
      z-index: 10000 !important;
      margin: 20px auto !important;
      padding: 20px !important;
      background: rgba(0, 0, 0, 0.8) !important;
      border-radius: 12px !important;
      border: 2px solid rgba(123, 47, 227, 0.5) !important;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5) !important;
      text-align: center !important;
      max-width: 400px !important;
    `;

    buttonsContainer.innerHTML = `
      <div class="choice-message" style="margin-bottom: 16px;">
        <h3 style="color: #fff; margin: 0 0 8px 0; font-size: 1.2rem;">🎊 Final Loadout Ready!</h3>
        <p style="color: #ccc; margin: 0; font-size: 0.9rem;">Keep this loadout or spin again?</p>
      </div>

      <div class="choice-buttons-row" style="display: flex; gap: 12px; justify-content: center;">
        <button class="choice-button keep-button" data-choice="keep" style="
          flex: 1;
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          background: linear-gradient(135deg, #4CAF50, #45a049);
          color: white;
          font-weight: bold;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        ">
          <span class="button-icon">✓</span>
          <span class="button-text">KEEP LOADOUT</span>
        </button>

        <button class="choice-button respin-button ${
          respinAvailable ? "" : "disabled"
        }" data-choice="respin" ${respinAvailable ? "" : "disabled"} style="
          flex: 1;
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          background: ${
            respinAvailable
              ? "linear-gradient(135deg, #7b2fe3, #6a28d9)"
              : "rgba(100, 100, 100, 0.5)"
          };
          color: ${respinAvailable ? "white" : "#888"};
          font-weight: bold;
          font-size: 0.9rem;
          cursor: ${respinAvailable ? "pointer" : "not-allowed"};
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        ">
          <span class="button-icon">🎯</span>
          <span class="button-text">RESPIN</span>
          ${
            respinAvailable
              ? ""
              : '<span class="button-subtitle" style="display: block; font-size: 0.7rem; opacity: 0.7;">No respins available</span>'
          }
        </button>
      </div>
    `;

    // Insert buttons AFTER the slot machine items but still within output container
    // This positions them below the 5 loadout boxes
    if (slotMachineItems.nextSibling) {
      outputContainer.insertBefore(
        buttonsContainer,
        slotMachineItems.nextSibling
      );
    } else {
      outputContainer.appendChild(buttonsContainer);
    }

    console.log("🎰 Choice buttons positioned below slot machine boxes");

    // Handle choice buttons
    const handleChoice = (choice) => {
      window.debugRespin && window.debugRespin(`User chose: ${choice}`);

      // Track analytics
      if (choice === "keep") {
        window.trackRespinEvent &&
          window.trackRespinEvent(
            window.ANALYTICS_EVENTS?.LOADOUT_KEPT || "loadout_kept"
          );
      } else if (choice === "respin") {
        window.trackRespinEvent &&
          window.trackRespinEvent(
            window.ANALYTICS_EVENTS?.RESPIN_CHOSEN || "respin_chosen"
          );

        // FIXED: Restart the same slot machine instead of creating new format
        if (choice === "respin" && window.slotMachineInstance) {
          console.log("🎰 Starting respin with same slot machine format");

          // Get the current class from the loadout or use saved class
          const currentClass =
            loadout?.classType || window.state?.selectedClass || "Light";

          // Generate new loadout for respin using the same method as the main flow
          const newLoadoutData = generateLoadoutForRespin(currentClass);

          if (newLoadoutData) {
            // Remove buttons first
            if (buttonsContainer.parentNode) {
              buttonsContainer.parentNode.removeChild(buttonsContainer);
            }

            // Display the new loadout structure
            window.slotMachineInstance.displayLoadout(newLoadoutData);

            // Start animation with callback to handle completion
            setTimeout(() => {
              window.slotMachineInstance.animateSlots(newLoadoutData, () => {
                console.log("🎰 Respin animation complete");

                // Call finalizeSpin with the new items if available
                if (typeof window.finalizeSpin === "function") {
                  const items = [
                    newLoadoutData.weaponObject,
                    newLoadoutData.specObject,
                    ...newLoadoutData.gadgetObjects,
                  ];
                  window.finalizeSpin(items);
                }
              });
            }, 200);

            return; // Exit early - don't resolve the promise yet
          }
        }
      }

      // Remove buttons
      if (buttonsContainer.parentNode) {
        buttonsContainer.parentNode.removeChild(buttonsContainer);
      }

      resolve(choice);
    };

    // Add event listeners with visual feedback
    const buttons = buttonsContainer.querySelectorAll(".choice-button");
    buttons.forEach((button) => {
      // Add hover effects
      button.addEventListener("mouseenter", (e) => {
        if (!e.target.disabled) {
          e.target.style.transform = "translateY(-2px) scale(1.05)";
          e.target.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.4)";
        }
      });

      button.addEventListener("mouseleave", (e) => {
        if (!e.target.disabled) {
          e.target.style.transform = "translateY(0) scale(1)";
          e.target.style.boxShadow = "none";
        }
      });

      // Add click handler
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const choice = e.currentTarget.dataset.choice;

        if (choice === "respin" && !respinAvailable) {
          window.debugRespin &&
            window.debugRespin("Respin not available, ignoring click");
          return;
        }

        console.log(`🎰 User clicked: ${choice.toUpperCase()}`);

        // Add click animation
        e.target.style.transform = "translateY(0) scale(0.95)";
        setTimeout(() => {
          e.target.style.transform = "translateY(0) scale(1)";
        }, 150);

        handleChoice(choice);
      });
    });

    // Auto-timeout after 30 seconds
    const timeout = setTimeout(() => {
      window.debugRespin &&
        window.debugRespin("Choice timeout, auto-keeping loadout");
      handleChoice("keep");
    }, window.RESPIN_CONFIG?.CHOICE_TIMEOUT || 30000);

    // Clear timeout on choice
    const originalResolve = resolve;
    resolve = (choice) => {
      clearTimeout(timeout);
      originalResolve(choice);
    };

    // Animate buttons in and scroll into view
    requestAnimationFrame(() => {
      buttonsContainer.classList.add("active");

      // Scroll into view to ensure visibility
      setTimeout(() => {
        buttonsContainer.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
        console.log("🎰 Choice buttons scrolled into view");
      }, 100);
    });
  });
}

// Export for global access
window.overlayManager = {
  startLoadoutGeneration,
  showRevealCard,
  showSpinWheelOverlay,
  showClassRouletteOverlay,
  showClassPickerOverlay,
  showSlotMachineOverlay,
  showFinalLoadoutChoiceModal,
  showFinalLoadoutChoiceButtons,
  overlayState,
  overlayAudio,
};

// Also expose directly on window for finalizeSpin function
window.showFinalLoadoutChoiceButtons = showFinalLoadoutChoiceButtons;

// Test function for debugging - can be called from console
window.testRespinButtons = function () {
  console.log("🧪 Testing respin buttons with dummy loadout");
  window.earnFreeRespin(); // First earn a free respin
  const testLoadout = {
    class: "Light",
    weapon: { name: "Test Weapon" },
    specialization: { name: "Test Spec" },
    gadgets: [
      { name: "Test Gadget 1" },
      { name: "Test Gadget 2" },
      { name: "Test Gadget 3" },
    ],
  };
  return showFinalLoadoutChoiceButtons(testLoadout);
};

// Test the entire flow
window.testRespinFlow = function () {
  console.log("🧪 Testing complete respin flow");
  console.log("Step 1: Earn free respin");
  window.earnFreeRespin();
  console.log("Step 2: Check if respin is available");
  console.log("Respin available:", window.isRespinAvailable());
  console.log("Step 3: Try to show buttons");
  window.testRespinButtons();
};

console.log("✅ Overlay Manager loaded");
console.log("🔍 overlayManager functions available:", {
  startLoadoutGeneration: typeof window.overlayManager?.startLoadoutGeneration,
  showSpinWheelOverlay: typeof window.overlayManager?.showSpinWheelOverlay,
  showClassRouletteOverlay:
    typeof window.overlayManager?.showClassRouletteOverlay,
});
