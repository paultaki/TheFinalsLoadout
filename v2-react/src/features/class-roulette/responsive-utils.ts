import React from 'react';
import { DIMENSIONS } from '../../constants/physics';

/**
 * Calculates responsive wheel size based on viewport dimensions
 */
export const calculateWheelSize = (): number => {
  const vw = window.innerWidth;
  const size = Math.max(
    DIMENSIONS.responsive.minWheelSize,
    Math.min(vw * DIMENSIONS.responsive.maxWheelSizeRatio, DIMENSIONS.responsive.maxWheelSize)
  );
  return size;
};

/**
 * Hook that provides responsive wheel size and updates on window resize
 */
export const useWheelSize = () => {
  const [wheelSize, setWheelSize] = React.useState(0);

  React.useEffect(() => {
    const updateSize = () => {
      setWheelSize(calculateWheelSize());
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return wheelSize;
};