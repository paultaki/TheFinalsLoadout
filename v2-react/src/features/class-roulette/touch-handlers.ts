import { THRESHOLDS } from '../../constants/physics';

export interface TouchHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export const createTouchHandlers = (
  touchStartY: React.MutableRefObject<number>,
  lastTouchTime: React.MutableRefObject<number>,
  isSpinning: boolean,
  onSpin: () => void
): TouchHandlers => {
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    lastTouchTime.current = Date.now();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY.current - touchEndY;
    const deltaTime = Date.now() - lastTouchTime.current;
    const velocity = Math.abs(deltaY) / deltaTime;

    // Swipe up/down with sufficient velocity triggers spin
    if (
      Math.abs(deltaY) > THRESHOLDS.swipe.minDistance &&
      velocity > THRESHOLDS.swipe.minVelocity &&
      !isSpinning
    ) {
      onSpin();
    }
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
};