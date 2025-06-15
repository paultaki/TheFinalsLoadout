import React from 'react';
import { ClassButtonConfig } from './types';
import { getButtonStyles, buttonHoverStyles } from './styles';

interface ClassButtonProps {
  config: ClassButtonConfig;
  onClick: () => void;
}

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
      className="relative py-4 px-10 font-bold text-lg uppercase tracking-wider overflow-hidden group"
      style={getButtonStyles(config)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {config.label}
    </button>
  );
};

export default ClassButton;