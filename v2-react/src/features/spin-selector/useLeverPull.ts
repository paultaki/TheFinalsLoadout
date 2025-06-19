import { useState, useRef, useCallback, useEffect } from 'react';

interface LeverPullState {
  isDragging: boolean;
  pullDistance: number;
}

/**
 * Hook to manage lever pull gesture handling
 * Extracted from SpinSelector component
 */
export const useLeverPull = (onPull: () => void, disabled: boolean) => {
  const [leverState, setLeverState] = useState<LeverPullState>({
    isDragging: false,
    pullDistance: 0,
  });
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const startYRef = useRef<number>(0);
  const maxPullDistance = 100; // Maximum pull distance in pixels
  
  /**
   * Handle mouse/touch start
   */
  const handleStart = useCallback((clientY: number) => {
    if (disabled) return;
    startYRef.current = clientY;
    setLeverState({ isDragging: true, pullDistance: 0 });
  }, [disabled]);
  
  /**
   * Handle mouse/touch move
   */
  const handleMove = useCallback((clientY: number) => {
    if (!leverState.isDragging || disabled) return;
    
    const deltaY = clientY - startYRef.current;
    const pullDistance = Math.max(0, Math.min(deltaY, maxPullDistance));
    
    setLeverState(prev => ({ ...prev, pullDistance }));
  }, [leverState.isDragging, disabled, maxPullDistance]);
  
  /**
   * Handle mouse/touch end
   */
  const handleEnd = useCallback(() => {
    if (!leverState.isDragging) return;
    
    // Trigger pull if pulled beyond threshold
    if (leverState.pullDistance > maxPullDistance * 0.8) {
      onPull();
    }
    
    // Reset lever
    setLeverState({ isDragging: false, pullDistance: 0 });
  }, [leverState.isDragging, leverState.pullDistance, maxPullDistance, onPull]);
  
  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientY);
  }, [handleStart]);
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleMove(e.clientY);
  }, [handleMove]);
  
  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);
  
  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientY);
  }, [handleStart]);
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    handleMove(touch.clientY);
  }, [handleMove]);
  
  const handleTouchEnd = useCallback(() => {
    handleEnd();
  }, [handleEnd]);
  
  // Add global event listeners when dragging
  useEffect(() => {
    if (leverState.isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [leverState.isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);
  
  return {
    buttonRef,
    leverState,
    handleMouseDown,
    handleTouchStart,
  };
};