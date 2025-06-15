import React from 'react';
import type { ClassType } from '../../types';
import './ResultBanner.css';

interface ResultBannerProps {
  classType: ClassType | null;
}

const ResultBanner: React.FC<ResultBannerProps> = ({ classType }) => {
  if (!classType) return null;

  const getClassStyle = (cls: ClassType) => {
    switch (cls.toLowerCase()) {
      case 'light':
        return { backgroundColor: '#2e8cff' };
      case 'medium':
        return { backgroundColor: '#49b76d' };
      case 'heavy':
        return { backgroundColor: '#e94d4d' };
      default:
        return { backgroundColor: '#666666' };
    }
  };

  const classNameStr = `banner ${classType.toLowerCase()}`;

  return <div className={classNameStr}>{classType.toUpperCase()}</div>;
};

export default ResultBanner;
