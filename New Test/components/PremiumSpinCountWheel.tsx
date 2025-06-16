import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useSpinPhysics } from '../utils/spinPhysics';
import confetti from 'canvas-confetti';

interface PremiumSpinCountWheelProps {
  onSelect: (value: string) => void;
}

const CARD_DATA = [
  { id: 1, value: '1', label: '1 SPIN', color: 'bg-white' },
  { id: 2, value: 'CHOOSE CLASS', label: '⭐ CHOOSE CLASS ⭐', color: 'bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-500' },
  { id: 3, value: '2', label: '2 SPINS', color: 'bg-blue-500' },
  { id: 4, value: '3', label: '3 SPINS', color: 'bg-green-500' },
  { id: 5, value: '4', label: '4 SPINS', color: 'bg-purple-500' },
  { id: 6, value: 'CHOOSE CLASS', label: '⭐ CHOOSE CLASS ⭐', color: 'bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500' },
  { id: 7, value: '5', label: '5 SPINS', color: 'bg-yellow-500' }
];

// Triple the array for seamless scrolling
const INFINITE_CARDS = [...CARD_DATA, ...CARD_DATA, ...CARD_DATA];
const CARD_HEIGHT = 120; // px
const VISIBLE_CARDS = 5;
const RESET_THRESHOLD = CARD_DATA.length * CARD_HEIGHT;

export default function PremiumSpinCountWheel({ onSelect }: PremiumSpinCountWheelProps) {
  const wheelRef = useRef<HTMLUListElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const currentPositionRef = useRef(0);
  const animationIdRef = useRef<number | null>(null);
  
  // Audio refs (hydration-safe)
  const tickSoundRef = useRef<HTMLAudioElement | null>(null);
  const dingSoundRef = useRef<HTMLAudioElement | null>(null);
  const confettiSoundRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Create audio elements client-side only
    if (typeof window !== 'undefined') {
      tickSoundRef.current = new Audio('/sfx/tick.mp3');
      dingSoundRef.current = new Audio('/sfx/ding.mp3');
      confettiSoundRef.current = new Audio('/sfx/confetti.mp3');
      
      tickSoundRef.current.volume = 0.3;
      dingSoundRef.current.volume = 0.5;
      confettiSoundRef.current.volume = 0.4;
    }
  }, []);
  
  const { startSpin, stopSpin, getVelocity, getDistance, isActive } = useSpinPhysics({
    friction: 0.985,
    minVelocity: 40,
    onTick: (distance) => {
      // Play tick sound when crossing card boundaries
      const cardIndex = Math.floor(Math.abs(distance) / CARD_HEIGHT);
      const lastCardIndex = Math.floor(Math.abs(currentPositionRef.current) / CARD_HEIGHT);
      
      if (cardIndex !== lastCardIndex && tickSoundRef.current) {
        tickSoundRef.current.currentTime = 0;
        tickSoundRef.current.playbackRate = Math.min(2, 0.5 + getVelocity() / 1000);
        tickSoundRef.current.play().catch(() => {});
      }
    }
  });
  
  const animate = useCallback(() => {
    if (!isActive() || !wheelRef.current) {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
      return;
    }
    
    const distance = getDistance();
    currentPositionRef.current = distance;
    
    // Apply infinite scroll logic
    let normalizedDistance = distance % (CARD_DATA.length * CARD_HEIGHT * 3);
    if (normalizedDistance > RESET_THRESHOLD) {
      normalizedDistance -= CARD_DATA.length * CARD_HEIGHT;
    }
    
    // Apply transform
    wheelRef.current.style.transform = `translateY(${-normalizedDistance}px)`;
    
    // Check if stopped
    if (getVelocity() < 40) {
      handleSpinComplete(normalizedDistance);
    } else {
      animationIdRef.current = requestAnimationFrame(animate);
    }
  }, [isActive, getDistance, getVelocity]);
  
  const handleSpinComplete = (finalDistance: number) => {
    stopSpin();
    
    // Calculate selected card
    const centerPosition = finalDistance + (VISIBLE_CARDS / 2) * CARD_HEIGHT;
    const selectedIdx = Math.round(centerPosition / CARD_HEIGHT) % CARD_DATA.length;
    const selectedCard = CARD_DATA[selectedIdx];
    
    setSelectedIndex(selectedIdx);
    setIsSpinning(false);
    
    // Snap to exact position with easing
    if (wheelRef.current) {
      const snapPosition = selectedIdx * CARD_HEIGHT - (VISIBLE_CARDS / 2 - 0.5) * CARD_HEIGHT;
      wheelRef.current.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      wheelRef.current.style.transform = `translateY(${-snapPosition}px)`;
      
      setTimeout(() => {
        if (wheelRef.current) {
          wheelRef.current.style.transition = 'none';
        }
      }, 500);
    }
    
    // Play celebration effects
    setTimeout(() => {
      if (dingSoundRef.current) dingSoundRef.current.play().catch(() => {});
      
      if (selectedCard.value === 'CHOOSE CLASS') {
        // Extra special effects for CHOOSE CLASS
        if (confettiSoundRef.current) confettiSoundRef.current.play().catch(() => {});
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FF69B4', '#00CED1', '#32CD32', '#FF4500']
        });
      }
      
      console.log(`Spin stopped on: ${selectedCard.value}`);
      onSelect(selectedCard.value);
    }, 600);
  };
  
  const handleSpin = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setSelectedIndex(null);
    
    // Reset transition
    if (wheelRef.current) {
      wheelRef.current.style.transition = 'none';
    }
    
    // Start physics simulation with random initial velocity
    const initialVelocity = 2200 + Math.random() * 400; // 2200-2600 px/s
    startSpin(initialVelocity);
    
    // Start animation loop
    animationIdRef.current = requestAnimationFrame(animate);
  };
  
  return (
    <div className="flex flex-col items-center gap-8 p-8 bg-gradient-to-b from-gray-900 to-black rounded-3xl shadow-2xl">
      <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-600">
        SPIN COUNT SELECTOR
      </h2>
      
      {/* Wheel Container */}
      <div className="relative w-80 h-[600px] bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-inner overflow-hidden">
        {/* Top/Bottom Fade */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-gray-900 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-gray-900 to-transparent z-10 pointer-events-none" />
        
        {/* Pointer (Right Side Peg) */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20">
          <div className="w-0 h-0 border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent border-r-[30px] border-r-yellow-500 filter drop-shadow-lg" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-yellow-500 rounded-full -mr-4" />
        </div>
        
        {/* Wheel */}
        <ul 
          ref={wheelRef}
          className="absolute inset-x-4 top-0 space-y-2"
          style={{ transform: 'translateY(0)' }}
        >
          {INFINITE_CARDS.map((card, index) => (
            <li
              key={`${card.id}-${index}`}
              className={`
                h-[112px] rounded-xl flex items-center justify-center text-2xl font-bold
                transform transition-all duration-300 shadow-lg
                ${card.color}
                ${selectedIndex === (index % CARD_DATA.length) ? 'scale-105 ring-4 ring-yellow-400' : ''}
                ${card.value === 'CHOOSE CLASS' ? 'animate-pulse text-white' : 'text-gray-900'}
              `}
            >
              <span className={card.value === 'CHOOSE CLASS' ? 'text-shadow-lg' : ''}>
                {card.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Spin Button */}
      <button
        onClick={handleSpin}
        disabled={isSpinning}
        className={`
          px-12 py-6 text-2xl font-bold rounded-full transition-all duration-300
          ${isSpinning 
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-yellow-500 to-red-500 text-white hover:from-yellow-600 hover:to-red-600 transform hover:scale-105 active:scale-95'
          }
          shadow-xl
        `}
      >
        {isSpinning ? 'Spinning…' : 'Pull to Spin'}
      </button>
    </div>
  );
}