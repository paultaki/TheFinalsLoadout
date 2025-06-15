import React from 'react';

interface MobileLoaderProps {
  text?: string;
  showProgress?: boolean;
  progress?: number;
}

/**
 * Mobile-optimized loading component with skeleton screens
 */
const MobileLoader: React.FC<MobileLoaderProps> = ({ 
  text = 'Loading...', 
  showProgress = false,
  progress = 0 
}) => {
  return (
    <div className="mobile-loader">
      {/* Logo pulse animation */}
      <div className="loader-logo">
        <div className="logo-shimmer">
          <img 
            src="/images/the-finals-logo.webp" 
            alt="Loading" 
            className="h-16 w-auto opacity-50"
          />
        </div>
      </div>

      {/* Progress bar */}
      {showProgress && (
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="progress-text">{Math.round(progress)}%</span>
        </div>
      )}

      {/* Loading text */}
      <p className="loader-text">{text}</p>

      {/* Skeleton screens for better perceived performance */}
      <div className="skeleton-container">
        <div className="skeleton skeleton-card" />
        <div className="skeleton skeleton-card" />
        <div className="skeleton skeleton-card" />
      </div>

      <style jsx>{`
        .mobile-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          padding: 2rem;
        }

        .loader-logo {
          margin-bottom: 2rem;
        }

        .logo-shimmer {
          position: relative;
          overflow: hidden;
        }

        .logo-shimmer::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(168, 85, 247, 0.4) 50%,
            transparent 100%
          );
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        .progress-container {
          width: 200px;
          margin-bottom: 1rem;
        }

        .progress-bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #a855f7 0%, #eab308 100%);
          transition: width 0.3s ease;
          border-radius: 2px;
        }

        .progress-text {
          display: block;
          text-align: center;
          font-size: 0.875rem;
          color: #a855f7;
        }

        .loader-text {
          color: #9ca3af;
          font-size: 1rem;
          margin-bottom: 2rem;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .skeleton-container {
          display: grid;
          gap: 1rem;
          width: 100%;
          max-width: 400px;
        }

        .skeleton {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.05) 25%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0.05) 75%
          );
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s infinite;
          border-radius: 0.5rem;
        }

        .skeleton-card {
          height: 80px;
        }

        @keyframes skeleton-loading {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .logo-shimmer::after,
          .loader-text,
          .skeleton {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default MobileLoader;