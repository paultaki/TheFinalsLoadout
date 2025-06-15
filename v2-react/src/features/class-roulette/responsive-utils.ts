import React from 'react';
import { DIMENSIONS } from '../../constants/physics';

// Calculate responsive wheel size based on viewport
export const calculateWheelSize = (): number => {
  const vw = window.innerWidth;
  const size = Math.max(
    DIMENSIONS.responsive.minWheelSize,
    Math.min(vw * DIMENSIONS.responsive.maxWheelSizeRatio, DIMENSIONS.responsive.maxWheelSize)
  );
  return size;
};

// Create a hook for responsive wheel size
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