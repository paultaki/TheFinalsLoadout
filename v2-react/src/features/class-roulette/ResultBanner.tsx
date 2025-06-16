import React from 'react';
import type { ClassType } from '../../types';
import './ResultBanner.css';

interface ResultBannerProps {
  classType: ClassType | null;
}

/**
 * Banner component that displays the selected class during roulette spin
 */
const ResultBanner: React.FC<ResultBannerProps> = ({ classType }) => {
  if (!classType) return null;

  const classNameStr = `banner ${classType.toLowerCase()}`;

  return <div className={classNameStr}>{classType.toUpperCase()}</div>;
};

export default ResultBanner;
