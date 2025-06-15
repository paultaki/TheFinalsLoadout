import React from 'react';
import type { ClassType } from '../../types';
import { COLORS_EXTENDED } from '../../constants/styles';
import './ResultBanner.css';

interface ResultBannerProps {
  classType: ClassType | null;
}

/**
 * Banner component that displays the selected class during roulette spin
 */
const ResultBanner: React.FC<ResultBannerProps> = ({ classType }) => {
  if (!classType) return null;

  const getClassStyle = (cls: ClassType) => {
    const defaultColor = '#666666';
    switch (cls.toLowerCase()) {
      case 'light':
        return { backgroundColor: '#2e8cff' }; // Note: Using different shade for banner
      case 'medium':
        return { backgroundColor: '#49b76d' }; // Note: Using different shade for banner
      case 'heavy':
        return { backgroundColor: '#e94d4d' }; // Note: Using different shade for banner
      default:
        return { backgroundColor: defaultColor };
    }
  };

  const classNameStr = `banner ${classType.toLowerCase()}`;

  return <div className={classNameStr}>{classType.toUpperCase()}</div>;
};

export default ResultBanner;
