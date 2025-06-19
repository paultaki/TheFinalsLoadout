import type { CSSProperties } from 'react';
import type { ClassButtonConfig } from './types';

// Modal styles
export const modalStyles = {
  modalContainer: {
    maxWidth: 'min(360px, 85vw)',
    background: 'radial-gradient(circle at center, #222 0%, #151515 100%)',
    borderRadius: '20px',
    border: '3px solid #FFD52D',
    padding: '24px',
    position: 'relative',
    zIndex: 10,
    boxShadow: '0 0 50px rgba(255, 215, 0, 0.3), 0 10px 40px rgba(0, 0, 0, 0.8)',
  } as CSSProperties,
};

// Text styles
export const textStyles = {
  jackpotTitle: {
    fontSize: 'clamp(48px, 15vw, 64px)',
    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textShadow: '0 0 40px rgba(255, 215, 0, 0.8), 0 0 80px rgba(255, 165, 0, 0.6)',
    letterSpacing: '3px',
    animation: 'pulseGlow 2s ease-in-out infinite',
  } as CSSProperties,
  
  spinCount: {
    color: '#AB47BC',
    textShadow: '0 0 20px rgba(171, 71, 188, 0.8), 0 0 40px rgba(171, 71, 188, 0.4)',
    letterSpacing: '1px',
    fontSize: '24px',
  } as CSSProperties,
  
  classChoiceHeader: {
    color: '#4FC3F7',
    textShadow: '0 0 15px rgba(79, 195, 247, 0.8)',
    fontWeight: 600,
    letterSpacing: '2px',
  } as CSSProperties,
  
  numberTitle: {
    fontSize: 'clamp(60px, 20vw, 100px)',
    color: '#FFD700',
    textShadow: '0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.4)',
    letterSpacing: '2px',
  } as CSSProperties,
};

// Class button configurations
export const classButtonConfigs: ClassButtonConfig[] = [
  {
    class: 'Light',
    label: 'LIGHT',
    color: '#4FC3F7',
    gradient: 'linear-gradient(135deg, rgba(79, 195, 247, 0.1) 0%, rgba(79, 195, 247, 0.2) 100%)',
    shadow: {
      default: '0 0 20px rgba(79, 195, 247, 0.5), inset 0 0 20px rgba(79, 195, 247, 0.1)',
      hover: '0 0 30px rgba(79, 195, 247, 0.8), inset 0 0 30px rgba(79, 195, 247, 0.2)',
    },
  },
  {
    class: 'Medium',
    label: 'MEDIUM',
    color: '#4CAF50',
    gradient: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.2) 100%)',
    shadow: {
      default: '0 0 20px rgba(76, 175, 80, 0.5), inset 0 0 20px rgba(76, 175, 80, 0.1)',
      hover: '0 0 30px rgba(76, 175, 80, 0.8), inset 0 0 30px rgba(76, 175, 80, 0.2)',
    },
  },
  {
    class: 'Heavy',
    label: 'HEAVY',
    color: '#FF1744',
    gradient: 'linear-gradient(135deg, rgba(255, 23, 68, 0.1) 0%, rgba(255, 23, 68, 0.2) 100%)',
    shadow: {
      default: '0 0 20px rgba(255, 23, 68, 0.5), inset 0 0 20px rgba(255, 23, 68, 0.1)',
      hover: '0 0 30px rgba(255, 23, 68, 0.8), inset 0 0 30px rgba(255, 23, 68, 0.2)',
    },
  },
];

// Get base button styles
export const getButtonStyles = (config: ClassButtonConfig): CSSProperties => ({
  background: config.gradient,
  border: `2px solid ${config.color}`,
  borderRadius: '8px',
  color: config.color,
  boxShadow: config.shadow.default,
  transition: 'all 0.3s ease',
});

// Button hover transform styles
export const buttonHoverStyles = {
  enter: {
    transform: 'translateY(-2px) scale(1.05)',
  },
  leave: {
    transform: 'translateY(0) scale(1)',
  },
};