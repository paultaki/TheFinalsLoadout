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
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
      {/* Logo pulse animation */}
      <div className="mb-8 relative">
        <div className="relative overflow-hidden">
          <img 
            src="/images/the-finals-logo.webp" 
            alt="Loading" 
            className="h-16 w-auto opacity-50 animate-pulse"
          />
        </div>
      </div>

      {/* Progress bar */}
      {showProgress && (
        <div className="w-[200px] mb-4">
          <div className="h-1 bg-white/10 rounded-sm overflow-hidden mb-2">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-yellow-500 transition-all duration-300 rounded-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="block text-center text-sm text-purple-400">{Math.round(progress)}%</span>
        </div>
      )}

      {/* Loading text */}
      <p className="text-gray-400 text-base mb-8 animate-pulse">{text}</p>

      {/* Skeleton screens for better perceived performance */}
      <div className="grid gap-4 w-full max-w-[400px]">
        <div className="h-20 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-lg animate-pulse" />
        <div className="h-20 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-lg animate-pulse" />
        <div className="h-20 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-lg animate-pulse" />
      </div>
    </div>
  );
};

export default MobileLoader;