import React, { useState, useRef, useEffect } from 'react';
import styles from './PullToRefresh.module.css';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  refreshText?: string;
  pullingText?: string;
  releaseText?: string;
}

/**
 * Pull-to-refresh component for mobile devices
 * Provides iOS/Android-style refresh functionality
 */
const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  threshold = 80,
  refreshText = 'Refreshing...',
  pullingText = 'Pull to refresh',
  releaseText = 'Release to refresh'
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setTouchStart(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === 0 || isRefreshing) return;
    
    const touchY = e.touches[0].clientY;
    const distance = touchY - touchStart;
    
    if (distance > 0 && window.scrollY === 0) {
      // Prevent default scroll behavior
      e.preventDefault();
      
      // Apply resistance to pull
      const resistance = 2.5;
      const actualDistance = Math.min(distance / resistance, threshold * 1.5);
      setPullDistance(actualDistance);
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold);
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(20);
      }
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
    
    setTouchStart(0);
  };

  // Determine status text
  const getStatusText = () => {
    if (isRefreshing) return refreshText;
    if (pullDistance > threshold) return releaseText;
    if (pullDistance > 20) return pullingText;
    return '';
  };

  const progress = Math.min((pullDistance / threshold) * 100, 100);

  return (
    <div
      ref={containerRef}
      className={styles.pullRefreshContainer}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => {
        setPullDistance(0);
        setTouchStart(0);
      }}
    >
      {/* Pull indicator */}
      <div
        className={`${styles.pullIndicator} ${pullDistance > 0 ? styles.visible : ''}`}
        style={{
          transform: `translateY(${pullDistance}px)`,
          opacity: pullDistance > 0 ? Math.min(pullDistance / threshold, 1) : 0
        }}
      >
        <div className={styles.pullIndicatorContent}>
          {/* Spinner */}
          <div className={`${styles.spinner} ${isRefreshing ? styles.spinning : ''}`}>
            <svg
              className="w-6 h-6"
              style={{
                transform: `rotate(${progress * 3.6}deg)`,
                transition: isRefreshing ? 'none' : 'transform 0.2s'
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          
          {/* Status text */}
          <span className={styles.statusText}>{getStatusText()}</span>
        </div>
      </div>

      {/* Main content */}
      <div
        className={styles.pullContent}
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 ? 'transform 0.3s' : 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;