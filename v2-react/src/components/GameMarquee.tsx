import React from 'react';

/**
 * Universal animated marquee for all mini-games.
 * Height is locked to ~1 inch (96 px at 96 dpi).
 * Enhanced with cyberpunk Vegas styling
 */
interface GameMarqueeProps {
  title: 'Spin Selector' | 'Class Call' | 'Loadout Lock-in' | 'Loadout Locked-In';
  info: string; // e.g. "2 Spins Available" or "Light Class — 3 Spins Remaining"
}

export default function GameMarquee({ title, info }: GameMarqueeProps) {
  return (
    <div className="marquee-wrapper w-full flex justify-center mt-2 pointer-events-none">
      <div
        className="marquee-inner animate-marqueePulse"
        style={{
          height: '96px',
          maxWidth: '480px',
          width: '100%',
          borderRadius: '0.75rem',
          border: '3px solid #FFD700',
          background: 'linear-gradient(to bottom, #111111E6, #222222E6)',
          opacity: 0.9,
          backdropFilter: 'blur(12px)',
          color: 'white',
          textAlign: 'center',
          letterSpacing: '0.025em',
          boxShadow: '0 0 30px rgba(255, 215, 0, 0.4), 0 0 60px rgba(255, 215, 0, 0.2), inset 0 0 20px rgba(255, 215, 0, 0.1)',
          display: 'grid',
          placeItems: 'center',
          gap: '0.25rem'
        }}
      >
        <span className="text-5xl md:text-6xl font-extrabold gradient-text uppercase" style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', whiteSpace: 'nowrap' }}>
          {title}
        </span>
        <span className="text-xl md:text-2xl font-medium" style={{ fontSize: 'clamp(1.125rem, 3vw, 1.5rem)' }}>
          {info}
        </span>
      </div>
    </div>
  );
}