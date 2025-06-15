// Unified particle system for The Finals casino theme

export const PARTICLE_CONFIG = {
  colors: ['#AB47BC', '#4FC3F7', '#FFD700', '#FF1744'],
  shapes: ['hexagon', 'triangle', 'circle'] as const,
  count: {
    desktop: 50,
    mobile: 30,
    tablet: 40,
  },
  glitchEffect: true,
  physics: {
    gravity: 0.5,
    velocity: {
      min: 5,
      max: 15,
    },
    lifetime: {
      min: 800,
      max: 1200,
    },
  },
};

export type ParticleShape = (typeof PARTICLE_CONFIG.shapes)[number];

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  shape: ParticleShape;
  size: number;
  lifetime: number;
  created: number;
}

export function createParticle(x: number, y: number): Particle {
  const angle = Math.random() * Math.PI * 2;
  const velocity =
    PARTICLE_CONFIG.physics.velocity.min +
    Math.random() * (PARTICLE_CONFIG.physics.velocity.max - PARTICLE_CONFIG.physics.velocity.min);

  return {
    x,
    y,
    vx: Math.cos(angle) * velocity,
    vy: Math.sin(angle) * velocity,
    color: PARTICLE_CONFIG.colors[Math.floor(Math.random() * PARTICLE_CONFIG.colors.length)],
    shape: PARTICLE_CONFIG.shapes[Math.floor(Math.random() * PARTICLE_CONFIG.shapes.length)],
    size: 4 + Math.random() * 4,
    lifetime:
      PARTICLE_CONFIG.physics.lifetime.min +
      Math.random() * (PARTICLE_CONFIG.physics.lifetime.max - PARTICLE_CONFIG.physics.lifetime.min),
    created: Date.now(),
  };
}

export function updateParticle(particle: Particle, deltaTime: number): boolean {
  const age = Date.now() - particle.created;
  if (age > particle.lifetime) return false;

  // Update position
  particle.x += particle.vx * deltaTime;
  particle.y += particle.vy * deltaTime;

  // Apply gravity
  particle.vy += PARTICLE_CONFIG.physics.gravity * deltaTime;

  // Apply glitch effect
  if (PARTICLE_CONFIG.glitchEffect && Math.random() < 0.05) {
    particle.x += (Math.random() - 0.5) * 10;
    particle.y += (Math.random() - 0.5) * 10;
  }

  return true;
}

export function createParticleBurst(x: number, y: number, count?: number): Particle[] {
  const isMobile = window.innerWidth < 768;
  const particleCount =
    count || (isMobile ? PARTICLE_CONFIG.count.mobile : PARTICLE_CONFIG.count.desktop);

  const particles: Particle[] = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push(createParticle(x, y));
  }

  return particles;
}

// Unified celebration animation
export function unifiedCelebration(type: 'jackpot' | 'win' | 'rare' = 'win') {
  const container = document.createElement('div');
  container.className = 'celebration-container';
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
  `;
  document.body.appendChild(container);

  // Screen flash
  const flash = document.createElement('div');
  flash.className = 'screen-flash';
  flash.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, ${
      type === 'jackpot' ? '#FFD700' : type === 'rare' ? '#FF1744' : '#AB47BC'
    } 0%, transparent 60%);
    animation: screenFlash 0.3s ease-out;
  `;
  container.appendChild(flash);

  // Create particles at center
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const particles = createParticleBurst(centerX, centerY);

  // Render particles
  particles.forEach((particle) => {
    const el = document.createElement('div');
    el.className = `particle particle-${particle.shape}`;
    el.style.cssText = `
      position: absolute;
      left: ${particle.x}px;
      top: ${particle.y}px;
      width: ${particle.size}px;
      height: ${particle.size}px;
      background: ${particle.color};
      box-shadow: 0 0 ${particle.size * 2}px ${particle.color};
      pointer-events: none;
    `;

    if (particle.shape === 'triangle') {
      el.style.width = '0';
      el.style.height = '0';
      el.style.borderLeft = `${particle.size}px solid transparent`;
      el.style.borderRight = `${particle.size}px solid transparent`;
      el.style.borderBottom = `${particle.size * 1.5}px solid ${particle.color}`;
      el.style.background = 'transparent';
    } else if (particle.shape === 'circle') {
      el.style.borderRadius = '50%';
    }

    container.appendChild(el);
  });

  // Animate particles
  let lastTime = Date.now();
  const animate = () => {
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    let activeParticles = 0;
    particles.forEach((particle, index) => {
      const el = container.children[index + 1] as HTMLElement; // +1 to skip flash
      if (el && updateParticle(particle, deltaTime)) {
        el.style.left = `${particle.x}px`;
        el.style.top = `${particle.y}px`;
        el.style.opacity = `${1 - (currentTime - particle.created) / particle.lifetime}`;
        activeParticles++;
      } else if (el) {
        el.style.display = 'none';
      }
    });

    if (activeParticles > 0) {
      requestAnimationFrame(animate);
    } else {
      // Cleanup
      setTimeout(() => container.remove(), 500);
    }
  };

  requestAnimationFrame(animate);

  // Add glitch effect if enabled
  if (PARTICLE_CONFIG.glitchEffect) {
    document.body.classList.add('glitch-transition');
    setTimeout(() => document.body.classList.remove('glitch-transition'), 300);
  }
}
