/**
 * Confetti System for The Finals Loadout
 * Adapted from confetti.html button example
 * Pink/Purple theme matching the slot machine
 */

class ConfettiSystem {
  constructor() {
    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'confetti-canvas';
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      pointer-events: none;
      z-index: 9999;
    `;
    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // Confetti arrays
    this.confetti = [];
    this.sequins = [];

    // Colors - Pink/Purple Vegas theme
    this.colors = [
      { front: '#ff3366', back: '#cc2952' }, // Hot pink
      { front: '#ff6699', back: '#cc5277' }, // Light pink
      { front: '#9c27b0', back: '#7b1f8c' }, // Purple
      { front: '#e91e63', back: '#ba184f' }, // Magenta
      { front: '#ffd700', back: '#ccac00' }  // Gold accent
    ];

    // Physics
    this.gravityConfetti = 0.15;  // Faster fall with stronger gravity
    this.gravitySequins = 0.25;   // Faster fall with stronger gravity
    this.dragConfetti = 0.075;
    this.dragSequins = 0.02;
    this.terminalVelocity = 5.0;  // Higher max fall speed

    // Handle window resize
    window.addEventListener('resize', () => this.resizeCanvas());

    // Start render loop
    this.render();

    console.log('🎊 Confetti system initialized!');
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  // Helper to get random number in range
  randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Get initial velocity for confetti with directional bias
  initConfettoVelocity(xRange, yRange, direction = 'up') {
    let x = this.randomRange(xRange[0], xRange[1]);

    // Apply directional bias with 2x more force
    if (direction === 'left') {
      x = this.randomRange(-22, -6); // 2x stronger leftward bias
    } else if (direction === 'right') {
      x = this.randomRange(6, 22); // 2x stronger rightward bias
    } else {
      x = this.randomRange(xRange[0] * 2, xRange[1] * 2); // 2x default spread
    }

    const range = yRange[1] - yRange[0] + 1;
    let y = yRange[1] - Math.abs(this.randomRange(0, range) + this.randomRange(0, range) - range);
    if (y >= yRange[1] - 1) {
      y += (Math.random() < 0.25) ? this.randomRange(2, 6) : 0; // 2x extra boost
    }
    return { x: x, y: -y * 2 }; // 2x upward velocity
  }

  // Confetto class
  createConfetto(x, y, direction = 'up') {
    return {
      randomModifier: this.randomRange(0, 99),
      color: this.colors[Math.floor(this.randomRange(0, this.colors.length))],
      dimensions: {
        x: this.randomRange(5, 9),
        y: this.randomRange(8, 15),
      },
      position: { x, y },
      rotation: this.randomRange(0, 2 * Math.PI),
      scale: { x: 1, y: 1 },
      velocity: this.initConfettoVelocity([-9, 9], [6, 11], direction),
      update: function(system) {
        this.velocity.x -= this.velocity.x * system.dragConfetti;
        this.velocity.y = Math.min(this.velocity.y + system.gravityConfetti, system.terminalVelocity);
        this.velocity.x += Math.random() > 0.5 ? Math.random() : -Math.random();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.scale.y = Math.cos((this.position.y + this.randomModifier) * 0.09);
      }
    };
  }

  // Sequin class (sparkly circles)
  createSequin(x, y, direction = 'up') {
    let velocityX = this.randomRange(-12, 12); // 2x horizontal spread

    // Apply directional bias with 2x force
    if (direction === 'left') {
      velocityX = this.randomRange(-16, -4); // 2x stronger
    } else if (direction === 'right') {
      velocityX = this.randomRange(4, 16); // 2x stronger
    }

    return {
      color: this.colors[Math.floor(this.randomRange(0, this.colors.length))].back,
      radius: this.randomRange(1, 2),
      position: { x, y },
      velocity: {
        x: velocityX,
        y: this.randomRange(-16, -24) // 2x upward velocity
      },
      update: function(system) {
        this.velocity.x -= this.velocity.x * system.dragSequins;
        this.velocity.y = this.velocity.y + system.gravitySequins;
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
      }
    };
  }

  // Burst confetti from a specific position with direction
  burst(x, y, confettiCount = 20, sequinCount = 10, direction = 'up') {
    console.log(`🎊 Bursting confetti at (${x}, ${y}) direction: ${direction}`);

    for (let i = 0; i < confettiCount; i++) {
      this.confetti.push(this.createConfetto(x, y, direction));
    }
    for (let i = 0; i < sequinCount; i++) {
      this.sequins.push(this.createSequin(x, y, direction));
    }
  }

  // Main render loop
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw confetti
    this.confetti.forEach((confetto) => {
      const width = confetto.dimensions.x * confetto.scale.x;
      const height = confetto.dimensions.y * confetto.scale.y;

      this.ctx.translate(confetto.position.x, confetto.position.y);
      this.ctx.rotate(confetto.rotation);
      confetto.update(this);
      this.ctx.fillStyle = confetto.scale.y > 0 ? confetto.color.front : confetto.color.back;
      this.ctx.fillRect(-width / 2, -height / 2, width, height);
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    });

    // Draw sequins
    this.sequins.forEach((sequin) => {
      this.ctx.translate(sequin.position.x, sequin.position.y);
      sequin.update(this);
      this.ctx.fillStyle = sequin.color;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, sequin.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    });

    // Remove offscreen particles
    this.confetti = this.confetti.filter(c => c.position.y < this.canvas.height);
    this.sequins = this.sequins.filter(s => s.position.y < this.canvas.height);

    requestAnimationFrame(() => this.render());
  }
}

// Initialize confetti system globally
window.confettiSystem = new ConfettiSystem();
