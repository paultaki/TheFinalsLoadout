import React, { useRef, useState } from 'react';
import { gsap } from 'gsap';
import styles from './PullSpinButton.module.css';

interface PullSpinButtonProps {
  onSpin: () => void;
  disabled?: boolean;
}

const PullSpinButton: React.FC<PullSpinButtonProps> = ({ onSpin, disabled = false }) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [isPulling, setIsPulling] = useState(false);
  const startYRef = useRef(0);
  const pullDistance = 20;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsPulling(true);
    startYRef.current = e.clientY;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPulling || disabled) return;
    
    const deltaY = e.clientY - startYRef.current;
    const dy = Math.max(0, Math.min(pullDistance, deltaY));
    
    if (btnRef.current) {
      gsap.set(btnRef.current, { y: dy });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPulling || disabled) return;
    
    setIsPulling(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    if (btnRef.current) {
      gsap.to(btnRef.current, {
        y: 0,
        duration: 0.25,
        ease: "elastic.out(1, 0.4)",
        onComplete: onSpin,
      });
    }
  };

  const handleClick = () => {
    if (disabled || isPulling) return;
    
    // Simple click triggers spin immediately
    if (btnRef.current) {
      gsap.to(btnRef.current, {
        y: pullDistance,
        duration: 0.1,
        ease: "power2.in",
        onComplete: () => {
          gsap.to(btnRef.current, {
            y: 0,
            duration: 0.25,
            ease: "elastic.out(1, 0.4)",
            onComplete: onSpin,
          });
        }
      });
    }
  };

  return (
    <button
      ref={btnRef}
      className={`${styles.btn} ${disabled ? styles.disabled : ''}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleClick}
      disabled={disabled}
    >
      PULL DOWN TO SPIN
    </button>
  );
};

export default PullSpinButton;