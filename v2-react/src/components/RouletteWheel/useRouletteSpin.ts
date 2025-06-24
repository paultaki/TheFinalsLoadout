import { useState, useRef, useCallback } from 'react';
import type { ClassType } from '../../types';
import { useSound } from '../../utils/audio';
import { SOUNDS } from '../../constants/sounds';

interface Segment {
  text: ClassType;
  color: string;
}

/**
 * Hook to manage roulette wheel spin logic
 * Extracted from RouletteWheel component for better organization
 */
export const useRouletteSpin = (segments: Segment[]) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<ClassType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const wheelRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  
  const playTabbyTune = useSound(SOUNDS.tabbyTune, { volume: 0.7 });

  /**
   * Generate wheel with conic gradient and labels
   */
  const generateWheel = useCallback(() => {
    if (!wheelRef.current) return;
    
    const wheel = wheelRef.current;
    const slice = 360 / segments.length;
    
    // Build conic-gradient string - start from top (0deg)
    let stops = '';
    segments.forEach((s, i) => {
      const start = i * slice;
      const end = start + slice;
      stops += `${s.color} ${start}deg ${end}deg,`;
    });
    wheel.style.background = `conic-gradient(from 0deg, ${stops.slice(0, -1)})`;
    
    // Clear old labels if we re-spin
    wheel.innerHTML = '';
    
    // Add labels
    segments.forEach((s, i) => {
      const slice = 360 / segments.length;
      const mid = i * slice + slice / 2; // centre angle of this wedge
      const flip = (mid > 90 && mid < 270) ? 180 : 0; // flip lower-half text

      /* wrapper: rotates to the slice direction */
      const wrap = document.createElement('div');
      wrap.className = 'wedge-wrap';
      wrap.style.transform = `rotate(${mid - 90}deg)`; // -90 so 0° points right

      /* label: shove it out the radius, then rotate baseline */
      const lbl = document.createElement('span');
      lbl.className = 'seg-label';
      lbl.textContent = s.text.toUpperCase();
      lbl.style.transform = `translateX(110px) rotate(${flip}deg)`; // moved much closer to center to avoid rim clipping

      wrap.appendChild(lbl);
      wheel.appendChild(wrap);
    });
  }, [segments]);

  /**
   * Spin the wheel
   */
  const spin = useCallback(() => {
    if (isSpinning || isProcessing) return;
    
    setIsSpinning(true);
    setShowModal(false);
    setResult(null);
    
    if (!wheelRef.current || !ballRef.current) return;
    
    const wheel = wheelRef.current;
    const ball = ballRef.current;
    
    // Reset positions
    wheel.style.transform = 'rotate(0deg)';
    ball.style.transform = 'translateY(-190px)';
    ball.classList.remove('spinning', 'spiraling');
    
    // Start ball spinning fast
    setTimeout(() => {
      ball.classList.add('spinning');
    }, 50);
    
    // Random spin amount (3-5 full rotations plus random angle)
    const spins = 3 + Math.random() * 2;
    const randomAngle = Math.random() * 360;
    const totalRotation = spins * 360 + randomAngle;
    
    // Start wheel spinning in opposite direction
    setTimeout(() => {
      wheel.style.transform = `rotate(-${totalRotation}deg)`;
    }, 500);
    
    // Start ball spiraling inward
    setTimeout(() => {
      ball.classList.remove('spinning');
      ball.classList.add('spiraling');
    }, 1500);
    
    // Calculate result after animation completes
    setTimeout(() => {
      // Calculate which segment the ball landed on
      // Account for opposite rotation
      const normalizedAngle = (totalRotation % 360) % 360;
      const segmentAngle = 360 / segments.length;
      const segmentIndex = Math.floor(normalizedAngle / segmentAngle);
      const landedSegment = segments[segmentIndex];
      
      // Set result and show modal
      setResult(landedSegment.text);
      setIsSpinning(false);
      setIsProcessing(true);
      
      
      // Show modal after brief pause
      setTimeout(() => {
        setShowModal(true);
        playTabbyTune(); // Play the tabby tune when the modal appears
      }, 500);
    }, 4500);
  }, [isSpinning, isProcessing, segments, playTabbyTune]);

  return {
    isSpinning,
    result,
    isProcessing,
    showModal,
    wheelRef,
    ballRef,
    generateWheel,
    spin,
    setShowModal,
    setIsProcessing
  };
};