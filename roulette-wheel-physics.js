// Realistic Roulette Wheel Animation with Physics
class RealisticRouletteWheel {
  constructor() {
    this.wheelRadius = 200;
    this.outerTrackRadius = 240; // New outer track for ball
    this.innerTrackRadius = 180; // Inner boundary before pockets
    this.ballRadius = 8;
    this.pocketCount = 37; // 0-36 like a real roulette wheel
    this.isSpinning = false;

    // Physics constants
    this.physics = {
      wheelFriction: 0.997, // Slower wheel deceleration
      ballFriction: 0.996, // Gradual ball deceleration for natural slowing
      gravity: 0.2, // Gravity for fall
      bounceDamping: 0.65, // Bounce damping
      minBallSpeed: 1, // Min speed before stopping
      minWheelSpeed: 0.1,
      fallThreshold: 4, // Ball speed threshold to start falling
    };

    // State
    this.wheelAngle = 0;
    this.wheelVelocity = 0;
    this.ballAngle = 0;
    this.ballVelocity = 0;
    this.ballRadialPosition = this.outerTrackRadius; // Start on outer track
    this.ballHeight = 0;
    this.phase = "idle"; // idle, spinning, falling, settling, complete
    this.bounceCount = 0; // Track number of bounces

    // Canvas setup
    this.canvas = null;
    this.ctx = null;
    this.animationId = null;

    // Results mapping (map pockets to rage quit items)
    this.setupPocketMappings();
  }

  setupPocketMappings() {
    // Map 37 pockets to different rage quit outcomes
    this.pocketMappings = {
      0: {
        type: "jackpot",
        name: "MEGA RAGE",
        desc: "All worst items + max handicap",
      },
      // Light weapons (1-12)
      1: { type: "weapon", class: "Light", item: "Throwing Knives" },
      2: { type: "weapon", class: "Light", item: "V9S" },
      3: { type: "weapon", class: "Light", item: "XP-54" },
      4: { type: "weapon", class: "Light", item: "Dagger" },
      5: { type: "weapon", class: "Light", item: "Recurve Bow" },
      6: { type: "gadget", class: "Light", item: "Breach Charge" },
      7: { type: "gadget", class: "Light", item: "Thermal Bore" },
      8: { type: "gadget", class: "Light", item: "Vanishing Bomb" },
      9: { type: "gadget", class: "Light", item: "Glitch Grenade" },
      10: { type: "gadget", class: "Light", item: "Tracking Dart" },
      11: { type: "gadget", class: "Light", item: "Flashbang" },
      12: { type: "spec", class: "Light", item: "Cloaking Device" },
      // Medium weapons (13-24)
      13: { type: "weapon", class: "Medium", item: "Model 1887" },
      14: { type: "weapon", class: "Medium", item: "R.357" },
      15: { type: "weapon", class: "Medium", item: "Riot Shield" },
      16: { type: "weapon", class: "Medium", item: "Dual Blades" },
      17: { type: "weapon", class: "Medium", item: "CB-01 Repeater" },
      18: { type: "gadget", class: "Medium", item: "APS Turret" },
      19: { type: "gadget", class: "Medium", item: "Data Reshaper" },
      20: { type: "gadget", class: "Medium", item: "Jump Pad" },
      21: { type: "gadget", class: "Medium", item: "Zipline" },
      22: { type: "gadget", class: "Medium", item: "Glitch Trap" },
      23: { type: "gadget", class: "Medium", item: "Smoke Grenade" },
      24: { type: "spec", class: "Medium", item: "Guardian Turret" },
      // Heavy weapons (25-36)
      25: { type: "weapon", class: "Heavy", item: "KS-23" },
      26: { type: "weapon", class: "Heavy", item: "Spear" },
      27: { type: "weapon", class: "Heavy", item: "M60" },
      28: { type: "weapon", class: "Heavy", item: "Sledgehammer" },
      29: { type: "gadget", class: "Heavy", item: "Anti-Gravity Cube" },
      30: { type: "gadget", class: "Heavy", item: "Dome Shield" },
      31: { type: "gadget", class: "Heavy", item: "Lockbolt Launcher" },
      32: { type: "gadget", class: "Heavy", item: "Pyro Mine" },
      33: { type: "gadget", class: "Heavy", item: "Gas Grenade" },
      34: { type: "gadget", class: "Heavy", item: "C4" },
      35: { type: "spec", class: "Heavy", item: "Mesh Shield" },
      36: { type: "spec", class: "Heavy", item: "Goo Gun" },
    };
  }

  init(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error("Container not found:", containerId);
      return;
    }

    // Create canvas
    this.canvas = document.createElement("canvas");

    // Dynamic canvas size based on device - Phase 1 optimization
    const isMobile =
      window.state?.isMobile ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    const canvasSize = isMobile ? 300 : 600; // 300px on mobile, 600px on desktop

    this.canvas.width = canvasSize;
    this.canvas.height = canvasSize;
    this.canvas.style.cssText = `
      width: 100%;
      max-width: ${canvasSize}px;
      height: auto;
      display: block;
      margin: 0 auto;
    `;

    // Ball trail for visual feedback
    this.ballTrail = [];
    this.maxTrailLength = isMobile ? 10 : 20; // Shorter trail on mobile

    container.innerHTML = "";
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");

    // Set canvas rendering optimization hints
    if (isMobile) {
      this.ctx.imageSmoothingEnabled = false; // Disable smoothing for performance
      this.ctx.imageSmoothingQuality = "low";
    }

    // Start render loop
    this.render();
  }

  spin(wheelSpeed = 12, ballSpeed = -20) {
    if (this.isSpinning) return;

    this.isSpinning = true;
    this.phase = "spinning";

    // Set initial velocities (wheel and ball spin in opposite directions)
    this.wheelVelocity = wheelSpeed + Math.random() * 3;
    this.ballVelocity = ballSpeed - Math.random() * 5;

    // Reset ball position to outer track
    this.ballRadialPosition = this.outerTrackRadius;
    this.ballHeight = 0;
    this.bounceCount = 0;

    // Start physics simulation
    this.simulate();
  }

  simulate() {
    if (this.phase === "complete") {
      this.isSpinning = false;
      return;
    }

    // Update wheel rotation
    this.wheelAngle += this.wheelVelocity;
    this.wheelVelocity *= this.physics.wheelFriction;

    // Update ball trail
    const ballX = Math.cos(this.ballAngle) * this.ballRadialPosition;
    const ballY = Math.sin(this.ballAngle) * this.ballRadialPosition;
    this.ballTrail.push({ x: ballX, y: ballY, height: this.ballHeight });
    if (this.ballTrail.length > this.maxTrailLength) {
      this.ballTrail.shift();
    }

    // Update ball based on phase
    switch (this.phase) {
      case "spinning":
        this.simulateSpinningPhase();
        break;
      case "falling":
        this.simulateFallingPhase();
        break;
      case "settling":
        this.simulateSettlingPhase();
        break;
    }

    // Continue simulation
    requestAnimationFrame(() => this.simulate());
  }

  simulateSpinningPhase() {
    // Ball spins on outer track
    this.ballAngle += this.ballVelocity;

    // Natural deceleration with slight exponential curve for realism
    const speedRatio = Math.abs(this.ballVelocity) / 20; // Normalize speed
    const frictionMultiplier = 0.994 + 0.004 * speedRatio; // Higher friction at lower speeds
    this.ballVelocity *= Math.min(
      frictionMultiplier,
      this.physics.ballFriction
    );

    // Keep ball on the outer track edge (not floating above)
    this.ballRadialPosition = this.outerTrackRadius - 10; // Inside the track rim

    // Add very subtle wobble only at high speeds
    if (Math.abs(this.ballVelocity) > 10) {
      const wobble = Math.sin(Date.now() * 0.003) * 0.5;
      this.ballRadialPosition += wobble;
    }

    // Check if ball has slowed enough to fall
    if (Math.abs(this.ballVelocity) < this.physics.fallThreshold) {
      this.phase = "falling";
      this.ballHeight = 0;
      this.ballFallVelocity = 0;
      console.log("Ball starting to fall at velocity:", this.ballVelocity);
    }
  }

  simulateFallingPhase() {
    // Apply gravity
    this.ballFallVelocity += this.physics.gravity;
    this.ballHeight += this.ballFallVelocity;

    // Move ball inward from outer track to pocket area
    const targetRadius = this.wheelRadius * 0.8; // Target radius for pockets
    const inwardSpeed = 2;

    if (this.ballRadialPosition > targetRadius) {
      this.ballRadialPosition -= inwardSpeed;
    } else {
      this.ballRadialPosition = targetRadius;
    }

    // Continue ball rotation but gradually slower
    this.ballAngle += this.ballVelocity * 0.8;
    this.ballVelocity *= 0.98;

    // Check for bounce on pockets
    if (this.ballRadialPosition <= targetRadius && this.ballHeight > 10) {
      // Bounce effect
      if (this.ballFallVelocity > 0.5 || this.bounceCount < 2) {
        this.ballFallVelocity *= -this.physics.bounceDamping;
        this.ballHeight = Math.max(0, this.ballHeight);
        this.bounceCount++;

        // Add some randomness to bounce direction
        const bounceRandomness =
          (Math.random() - 0.5) * (2 - this.bounceCount * 0.5);
        this.ballVelocity += bounceRandomness;

        // Play bounce sound
        this.playBounceSound();

        // Occasionally bounce to adjacent pocket
        if (Math.random() < 0.2 && this.bounceCount === 1) {
          this.ballAngle += (Math.random() - 0.5) * 0.3;
        }
      } else {
        // Ball has settled
        this.phase = "settling";
        this.ballHeight = 0;
        console.log("Ball settling after", this.bounceCount, "bounces");
      }
    }
  }

  simulateSettlingPhase() {
    // Ball rolls with the wheel
    const relativeVelocity = this.ballVelocity - this.wheelVelocity;

    // Gradually match wheel speed
    if (Math.abs(relativeVelocity) > 0.1) {
      this.ballVelocity -= relativeVelocity * 0.1;
    } else {
      // Ball has settled into a pocket
      this.ballVelocity = this.wheelVelocity;

      // Check if wheel has stopped
      if (Math.abs(this.wheelVelocity) < this.physics.minWheelSpeed) {
        this.phase = "complete";
        this.onComplete();
      }
    }

    // Keep ball in pocket
    const pocketAngle = this.getNearestPocketAngle();
    const angleDiff = this.normalizeAngle(pocketAngle - this.ballAngle);
    this.ballAngle += angleDiff * 0.2;
  }

  getNearestPocketAngle() {
    const pocketSize = (Math.PI * 2) / this.pocketCount;
    const pocketIndex = Math.round(this.ballAngle / pocketSize);
    return pocketIndex * pocketSize;
  }

  normalizeAngle(angle) {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
  }

  render() {
    const ctx = this.ctx;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    // Clear canvas with dark green felt background
    ctx.fillStyle = "#0a3d0a";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Add subtle vignette effect
    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      300
    );
    gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.4)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw wheel
    this.drawWheel(ctx, centerX, centerY);

    // Draw ball
    this.drawBall(ctx, centerX, centerY);

    // Draw speed indicator during spinning phase
    if (this.phase === "spinning" && Math.abs(this.ballVelocity) > 0) {
      this.drawSpeedIndicator(ctx);
    }

    // Continue render loop
    this.animationId = requestAnimationFrame(() => this.render());
  }

  drawWheel(ctx, centerX, centerY) {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(this.wheelAngle);

    // Draw outer track (where ball spins)
    // Track bowl shape
    ctx.beginPath();
    ctx.arc(0, 0, this.outerTrackRadius + 10, 0, Math.PI * 2);
    ctx.strokeStyle = "#4a3c28"; // Dark wood
    ctx.lineWidth = 20;
    ctx.stroke();

    // Track surface
    ctx.beginPath();
    ctx.arc(0, 0, this.outerTrackRadius, 0, Math.PI * 2);
    ctx.strokeStyle = "#8b7355"; // Light wood
    ctx.lineWidth = 20;
    ctx.stroke();

    // Inner edge of track
    ctx.beginPath();
    ctx.arc(0, 0, this.outerTrackRadius - 20, 0, Math.PI * 2);
    ctx.strokeStyle = "#5d4e37"; // Medium brown
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw main wheel rim
    ctx.beginPath();
    ctx.arc(0, 0, this.wheelRadius, 0, Math.PI * 2);
    ctx.strokeStyle = "#8b0000";
    ctx.lineWidth = 15;
    ctx.stroke();

    // Draw pockets
    const pocketSize = (Math.PI * 2) / this.pocketCount;
    for (let i = 0; i < this.pocketCount; i++) {
      const angle = i * pocketSize;
      const isRed = i % 2 === 0 && i !== 0;

      ctx.save();
      ctx.rotate(angle);

      // Draw pocket
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, this.wheelRadius - 15, -pocketSize / 2, pocketSize / 2);
      ctx.closePath();

      ctx.fillStyle = i === 0 ? "#00ff00" : isRed ? "#dc143c" : "#1a1a1a";
      ctx.fill();

      ctx.strokeStyle = "#ffd700";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw pocket number
      ctx.save();
      ctx.rotate(0);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(i.toString(), 0, -this.wheelRadius * 0.75);
      ctx.restore();

      // Draw divider (fret)
      ctx.beginPath();
      ctx.moveTo(this.wheelRadius * 0.5, 0);
      ctx.lineTo(this.wheelRadius - 15, 0);
      ctx.strokeStyle = "#ffd700";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw fret base (small diamond)
      ctx.beginPath();
      ctx.moveTo(this.wheelRadius - 15, 0);
      ctx.lineTo(this.wheelRadius - 10, -3);
      ctx.lineTo(this.wheelRadius - 5, 0);
      ctx.lineTo(this.wheelRadius - 10, 3);
      ctx.closePath();
      ctx.fillStyle = "#ffd700";
      ctx.fill();

      ctx.restore();
    }

    // Draw center
    ctx.beginPath();
    ctx.arc(0, 0, this.wheelRadius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = "#2a2a2a";
    ctx.fill();
    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
  }

  drawBall(ctx, centerX, centerY) {
    ctx.save();
    ctx.translate(centerX, centerY);

    // Draw ball trail for motion blur effect
    if (this.ballTrail.length > 1 && Math.abs(this.ballVelocity) > 3) {
      const trailLength = Math.min(this.ballTrail.length, 10); // Shorter trail
      for (
        let i = this.ballTrail.length - trailLength;
        i < this.ballTrail.length - 1;
        i++
      ) {
        if (i < 0) continue;
        const alpha =
          ((i - (this.ballTrail.length - trailLength)) / trailLength) * 0.2;
        ctx.globalAlpha = alpha;
        const trail = this.ballTrail[i];

        ctx.beginPath();
        ctx.arc(
          trail.x,
          trail.y - trail.height,
          this.ballRadius * 0.7,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = "#ffffff";
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Calculate ball position
    const x = Math.cos(this.ballAngle) * this.ballRadialPosition;
    const y = Math.sin(this.ballAngle) * this.ballRadialPosition;

    // Draw ball shadow (if falling)
    if (this.phase === "falling" && this.ballHeight > 2) {
      ctx.beginPath();
      ctx.arc(
        x,
        y + this.ballHeight / 2,
        this.ballRadius * 0.8,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.fill();
    }

    // Draw ball
    ctx.beginPath();
    ctx.arc(x, y - this.ballHeight, this.ballRadius, 0, Math.PI * 2);

    // Gradient for 3D effect
    const gradient = ctx.createRadialGradient(
      x - 3,
      y - this.ballHeight - 3,
      0,
      x,
      y - this.ballHeight,
      this.ballRadius
    );
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.5, "#e0e0e0");
    gradient.addColorStop(1, "#808080");

    ctx.fillStyle = gradient;
    ctx.fill();

    // Ball outline
    ctx.strokeStyle = "#404040";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  onComplete() {
    // Calculate winning pocket
    const pocketSize = (Math.PI * 2) / this.pocketCount;
    const normalizedBallAngle =
      ((this.ballAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const pocketIndex = Math.floor(normalizedBallAngle / pocketSize);
    const result = this.pocketMappings[pocketIndex];

    console.log(`Roulette result: Pocket ${pocketIndex}`, result);

    // Trigger result event
    const event = new CustomEvent("rouletteComplete", {
      detail: { pocket: pocketIndex, result: result },
    });
    document.dispatchEvent(event);
  }

  playBounceSound() {
    // Create a simple bounce sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Vary pitch based on bounce count for realism
      const basePitch = 600 + this.bounceCount * 100;
      oscillator.frequency.value = basePitch + Math.random() * 200;
      oscillator.type = "sine";

      // Quieter volume for later bounces
      const volume = 0.06 - this.bounceCount * 0.015;
      gainNode.gain.setValueAtTime(
        Math.max(0.05, volume),
        audioContext.currentTime
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.08
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.08);
    } catch (e) {
      // Silently fail if audio context not available
    }
  }

  drawSpeedIndicator(ctx) {
    // Draw speed bar at bottom of canvas
    const barWidth = 200;
    const barHeight = 10;
    const x = (this.canvas.width - barWidth) / 2;
    const y = this.canvas.height - 40;

    // Background
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(x - 2, y - 2, barWidth + 4, barHeight + 4);

    // Speed bar
    const speedPercent = Math.min(Math.abs(this.ballVelocity) / 20, 1);
    const barFillWidth = barWidth * speedPercent;

    // Gradient from green to yellow to red
    const gradient = ctx.createLinearGradient(x, y, x + barWidth, y);
    gradient.addColorStop(0, "#00ff00");
    gradient.addColorStop(0.5, "#ffff00");
    gradient.addColorStop(1, "#ff0000");

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, barFillWidth, barHeight);

    // Border
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, barWidth, barHeight);

    // Label
    ctx.fillStyle = "#ffffff";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Ball Speed", this.canvas.width / 2, y - 8);
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

// Export for use
if (typeof window !== "undefined") {
  window.RealisticRouletteWheel = RealisticRouletteWheel;
}
