import { useRef, useCallback } from 'react';

interface SpinPhysicsOptions {
  friction?: number;
  minVelocity?: number;
  onTick?: (distance: number) => void;
}

export function useSpinPhysics({
  friction = 0.985,
  minVelocity = 40,
  onTick
}: SpinPhysicsOptions = {}) {
  const velocityRef = useRef(0);
  const distanceRef = useRef(0);
  const lastTimeRef = useRef(0);
  const isActiveRef = useRef(false);
  
  const update = useCallback((timestamp: number) => {
    if (!isActiveRef.current) return;
    
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp;
      return;
    }
    
    const deltaTime = (timestamp - lastTimeRef.current) / 1000; // Convert to seconds
    lastTimeRef.current = timestamp;
    
    // Update distance based on velocity
    distanceRef.current += velocityRef.current * deltaTime;
    
    // Apply friction
    velocityRef.current *= Math.pow(friction, deltaTime * 60); // Normalize to 60fps
    
    // Trigger tick callback
    if (onTick) {
      onTick(distanceRef.current);
    }
    
    // Check if should stop
    if (velocityRef.current < minVelocity) {
      velocityRef.current = 0;
      isActiveRef.current = false;
    }
  }, [friction, minVelocity, onTick]);
  
  const startSpin = useCallback((initialVelocity: number) => {
    velocityRef.current = initialVelocity;
    distanceRef.current = 0;
    lastTimeRef.current = 0;
    isActiveRef.current = true;
  }, []);
  
  const stopSpin = useCallback(() => {
    velocityRef.current = 0;
    isActiveRef.current = false;
  }, []);
  
  const getVelocity = useCallback(() => velocityRef.current, []);
  const getDistance = useCallback(() => distanceRef.current, []);
  const isActive = useCallback(() => isActiveRef.current, []);
  
  // Export the update function for RAF loop
  const tick = useCallback((timestamp: number) => {
    update(timestamp);
  }, [update]);
  
  return {
    startSpin,
    stopSpin,
    getVelocity,
    getDistance,
    isActive,
    tick
  };
}