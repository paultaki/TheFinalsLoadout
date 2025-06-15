import React, { useState, useRef, useEffect } from 'react';

interface TouchWrapperProps {
  children: React.ReactNode;
  className?: string;
  onTap?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  swipeThreshold?: number;
  hapticFeedback?: boolean;
}

/**
 * Touch-optimized wrapper component for mobile interactions
 * Provides tap, swipe detection, and haptic feedback
 */
const TouchWrapper: React.FC<TouchWrapperProps> = ({
  children,
  className = '',
  onTap,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  swipeThreshold = 50,
  hapticFeedback = true
}) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [isTouching, setIsTouching] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  // Haptic feedback helper
  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!hapticFeedback) return;
    
    // Use Vibration API if available
    if ('vibrate' in navigator) {
      const durations = {
        light: 10,
        medium: 20,
        heavy: 30
      };
      navigator.vibrate(durations[style]);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsTouching(true);
    const touch = e.targetTouches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setTouchEnd(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.targetTouches[0];
    setTouchEnd({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = () => {
    setIsTouching(false);
    
    if (!touchStart || !touchEnd) {
      // It was a tap
      if (onTap && touchStart && !touchEnd) {
        triggerHaptic('light');
        onTap();
      }
      return;
    }

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Determine if it's a swipe
    if (absX > swipeThreshold || absY > swipeThreshold) {
      triggerHaptic('medium');
      
      if (absX > absY) {
        // Horizontal swipe
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
    } else if (onTap) {
      // It was a tap (moved less than threshold)
      triggerHaptic('light');
      onTap();
    }

    // Reset
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Add touch-action CSS to prevent default behaviors
  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.style.touchAction = 'manipulation';
      elementRef.current.style.webkitTapHighlightColor = 'transparent';
      elementRef.current.style.webkitTouchCallout = 'none';
      elementRef.current.style.userSelect = 'none';
    }
  }, []);

  return (
    <div
      ref={elementRef}
      className={`touch-wrapper ${className} ${isTouching ? 'touching' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={(e) => {
        // Support mouse for testing
        if (!('ontouchstart' in window)) {
          setIsTouching(true);
          setTouchStart({ x: e.clientX, y: e.clientY });
        }
      }}
      onMouseUp={(e) => {
        // Support mouse for testing
        if (!('ontouchstart' in window) && touchStart && onTap) {
          setIsTouching(false);
          onTap();
          setTouchStart(null);
        }
      }}
    >
      {children}
      <style jsx>{`
        .touch-wrapper {
          position: relative;
          cursor: pointer;
        }
        
        .touch-wrapper.touching {
          transform: scale(0.98);
          opacity: 0.9;
          transition: all 0.1s ease;
        }
        
        /* Prevent text selection on long press */
        .touch-wrapper * {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      `}</style>
    </div>
  );
};

export default TouchWrapper;