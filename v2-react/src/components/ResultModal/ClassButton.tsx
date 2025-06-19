import React from 'react';
import type { ClassButtonConfig } from './types';
import { getButtonStyles, buttonHoverStyles } from './styles';

interface ClassButtonProps {
  config: ClassButtonConfig;
  onClick: () => void;
}

/**
 * Button component for selecting a class in the jackpot modal
 */
const ClassButton: React.FC<ClassButtonProps> = ({ config, onClick }) => {
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    target.style.transform = buttonHoverStyles.enter.transform;
    target.style.boxShadow = config.shadow.hover;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    target.style.transform = buttonHoverStyles.leave.transform;
    target.style.boxShadow = config.shadow.default;
  };

  return (
    <button
      onClick={onClick}
      className="relative py-5 px-12 font-bold text-xl uppercase tracking-wider overflow-hidden group mx-2 sm:mx-0 min-w-[120px]"
      style={getButtonStyles(config)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {config.label}
    </button>
  );
};

export default ClassButton;