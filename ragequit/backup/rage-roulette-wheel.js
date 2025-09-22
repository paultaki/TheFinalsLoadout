// Realistic Roulette Wheel Animation with Physics
class RealisticRouletteWheel {
  constructor() {
    this.wheelRadius = 200;
    this.ballRadius = 8;
    this.pocketCount = 37; // 0-36 like a real roulette wheel
    this.isSpinning = false;
    
    // Physics constants
    this.physics = {
      wheelFriction: 0.995,
      ballFriction: 0.985,
      gravity: 0.3,
      bounceDamping: 0.6,
      minBallSpeed: 0.5,
      minWheelSpeed: 0.1
    };
    
    // State
    this.wheelAngle = 0;
    this.wheelVelocity = 0;
    this.ballAngle = 0;
    this.ballVelocity = 0;
    this.ballRadius = this.wheelRadius - 20; // Start on outer track
    this.ballHeight = 0;
    this.phase = 'idle'; // idle, spinning, falling, settling, complete
    
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
      0: { type: 'jackpot', name: 'MEGA RAGE', desc: 'All worst items + max handicap' },
      // Light weapons (1-12)
      1: { type: 'weapon', class: 'Light', item: 'Throwing Knives' },
      2: { type: 'weapon', class: 'Light', item: 'V9S' },
      3: { type: 'weapon', class: 'Light', item: 'XP-54' },
      4: { type: 'weapon', class: 'Light', item: 'Dagger' },
      5: { type: 'weapon', class: 'Light', item: 'Recurve Bow' },
      6: { type: 'gadget', class: 'Light', item: 'Breach Charge' },
      7: { type: 'gadget', class: 'Light', item: 'Thermal Bore' },
      8: { type: 'gadget', class: 'Light', item: 'Vanishing Bomb' },
      9: { type: 'gadget', class: 'Light', item: 'Glitch Grenade' },
      10: { type: 'gadget', class: 'Light', item: 'Tracking Dart' },
      11: { type: 'gadget', class: 'Light', item: 'Flashbang' },
      12: { type: 'spec', class: 'Light', item: 'Cloaking Device' },
      // Medium weapons (13-24)
      13: { type: 'weapon', class: 'Medium', item: 'Model 1887' },
      14: { type: 'weapon', class: 'Medium', item: 'R.357' },
      15: { type: 'weapon', class: 'Medium', item: 'Riot Shield' },
      16: { type: 'weapon', class: 'Medium', item: 'Dual Blades' },
      17: { type: 'weapon', class: 'Medium', item: 'CB-01 Repeater' },
      18: { type: 'gadget', class: 'Medium', item: 'APS Turret' },
      19: { type: 'gadget', class: 'Medium', item: 'Data Reshaper' },
      20: { type: 'gadget', class: 'Medium', item: 'Jump Pad' },
      21: { type: 'gadget', class: 'Medium', item: 'Zipline' },
      22: { type: 'gadget', class: 'Medium', item: 'Glitch Trap' },
      23: { type: 'gadget', class: 'Medium', item: 'Smoke Grenade' },
      24: { type: 'spec', class: 'Medium', item: 'Guardian Turret' },
      // Heavy weapons (25-36)
      25: { type: 'weapon', class: 'Heavy', item: 'KS-23' },
      26: { type: 'weapon', class: 'Heavy', item: 'Lewis Gun' },
      27: { type: 'weapon', class: 'Heavy', item: 'MGL32' },
      28: { type: 'weapon', class: 'Heavy', item: 'SA1216' },
      29: { type: 'gadget', class: 'Heavy', item: 'Anti-Gravity Cube' },
      30: { type: 'gadget', class: 'Heavy', item: 'Gas Grenade' },
      31: { type: 'gadget', class: 'Heavy', item: 'Flashbang' },
      32: { type: 'gadget', class: 'Heavy', item: 'Explosive Mine' },
      33: { type: 'gadget', class: 'Heavy', item: 'Smoke Grenade' },
      34: { type: 'gadget', class: 'Heavy', item: 'Anti-Gravity Cube' },
      35: { type: 'spec', class: 'Heavy', item: 'Mesh Shield' },
      36: { type: 'spec', class: 'Heavy', item: 'Goo Gun' }
    };
  }
  
  init(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('Container not found:', containerId);
      return;
    }
    
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = 500;
    this.canvas.height = 500;
    this.canvas.style.cssText = `
      width: 100%;
      max-width: 500px;
      height: auto;
      display: block;
      margin: 0 auto;
    `;
    
    container.innerHTML = '';
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    
    // Start render loop
    this.render();
  }
  
  spin(wheelSpeed = 15, ballSpeed = -25) {
    if (this.isSpinning) return;
    
    this.isSpinning = true;
    this.phase = 'spinning';
    
    // Set initial velocities (wheel and ball spin in opposite directions)
    this.wheelVelocity = wheelSpeed + Math.random() * 5;
    this.ballVelocity = ballSpeed - Math.random() * 5;
    
    // Reset ball position to outer track
    this.ballRadius = this.wheelRadius - 20;
    this.ballHeight = 0;
    
    // Start physics simulation
    this.simulate();
  }
  
  simulate() {
    if (this.phase === 'complete') {
      this.isSpinning = false;
      return;
    }
    
    // Update wheel rotation
    this.wheelAngle += this.wheelVelocity;
    this.wheelVelocity *= this.physics.wheelFriction;
    
    // Update ball based on phase
    switch (this.phase) {
      case 'spinning':
        this.simulateSpinningPhase();
        break;
      case 'falling':
        this.simulateFallingPhase();
        break;
      case 'settling':
        this.simulateSettlingPhase();
        break;
    }
    
    // Continue simulation
    requestAnimationFrame(() => this.simulate());
  }
  
  simulateSpinningPhase() {
    // Ball spins on outer track
    this.ballAngle += this.ballVelocity;
    this.ballVelocity *= this.physics.ballFriction;
    
    // Add slight wobble for realism
    const wobble = Math.sin(Date.now() * 0.01) * 2;
    this.ballRadius = this.wheelRadius - 20 + wobble;
    
    // Check if ball has slowed enough to fall
    if (Math.abs(this.ballVelocity) < 8) {
      this.phase = 'falling';
      this.ballHeight = 0;
      this.ballFallVelocity = 0;
    }
  }
  
  simulateFallingPhase() {
    // Apply gravity
    this.ballFallVelocity += this.physics.gravity;
    this.ballHeight += this.ballFallVelocity;
    
    // Move ball inward
    const targetRadius = this.wheelRadius * 0.6; // Inner track radius
    this.ballRadius -= 2;
    
    // Continue ball rotation but slower
    this.ballAngle += this.ballVelocity * 0.5;
    this.ballVelocity *= 0.98;
    
    // Check for bounce on pockets
    if (this.ballRadius <= targetRadius) {
      this.ballRadius = targetRadius;
      
      // Bounce effect
      if (this.ballFallVelocity > 1) {
        this.ballFallVelocity *= -this.physics.bounceDamping;
        this.ballHeight = Math.max(0, this.ballHeight);
        
        // Add some randomness to bounce direction
        this.ballVelocity += (Math.random() - 0.5) * 2;
        
        // Play bounce sound
        this.playBounceSound();
      } else {
        // Ball has settled
        this.phase = 'settling';
        this.ballHeight = 0;
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
        this.phase = 'complete';
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
    
    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw wheel
    this.drawWheel(ctx, centerX, centerY);
    
    // Draw ball
    this.drawBall(ctx, centerX, centerY);
    
    // Continue render loop
    this.animationId = requestAnimationFrame(() => this.render());
  }
  
  drawWheel(ctx, centerX, centerY) {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(this.wheelAngle);
    
    // Draw outer rim
    ctx.beginPath();
    ctx.arc(0, 0, this.wheelRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#8b0000';
    ctx.lineWidth = 20;
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
      ctx.arc(0, 0, this.wheelRadius - 20, -pocketSize/2, pocketSize/2);
      ctx.closePath();
      
      ctx.fillStyle = i === 0 ? '#00ff00' : (isRed ? '#dc143c' : '#1a1a1a');
      ctx.fill();
      
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw pocket number
      ctx.save();
      ctx.rotate(0);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(i.toString(), 0, -this.wheelRadius * 0.75);
      ctx.restore();
      
      // Draw divider
      ctx.beginPath();
      ctx.moveTo(this.wheelRadius * 0.5, 0);
      ctx.lineTo(this.wheelRadius - 20, 0);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.restore();
    }
    
    // Draw center
    ctx.beginPath();
    ctx.arc(0, 0, this.wheelRadius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#2a2a2a';
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.restore();
  }
  
  drawBall(ctx, centerX, centerY) {
    ctx.save();
    ctx.translate(centerX, centerY);
    
    // Calculate ball position
    const x = Math.cos(this.ballAngle) * this.ballRadius;
    const y = Math.sin(this.ballAngle) * this.ballRadius;
    
    // Draw ball shadow (if falling)
    if (this.phase === 'falling' && this.ballHeight > 2) {
      ctx.beginPath();
      ctx.arc(x, y + this.ballHeight/2, this.ballRadius * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fill();
    }
    
    // Draw ball
    ctx.beginPath();
    ctx.arc(x, y - this.ballHeight, this.ballRadius, 0, Math.PI * 2);
    
    // Gradient for 3D effect
    const gradient = ctx.createRadialGradient(
      x - 3, y - this.ballHeight - 3, 0,
      x, y - this.ballHeight, this.ballRadius
    );
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.5, '#e0e0e0');
    gradient.addColorStop(1, '#808080');
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Ball outline
    ctx.strokeStyle = '#404040';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.restore();
  }
  
  onComplete() {
    // Calculate winning pocket
    const pocketSize = (Math.PI * 2) / this.pocketCount;
    const normalizedBallAngle = ((this.ballAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const pocketIndex = Math.floor(normalizedBallAngle / pocketSize);
    const result = this.pocketMappings[pocketIndex];
    
    console.log(`Roulette result: Pocket ${pocketIndex}`, result);
    
    // Trigger result event
    const event = new CustomEvent('rouletteComplete', {
      detail: { pocket: pocketIndex, result: result }
    });
    document.dispatchEvent(event);
  }
  
  playBounceSound() {
    // Create a simple bounce sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800 + Math.random() * 400;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
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
window.RealisticRouletteWheel = RealisticRouletteWheel;