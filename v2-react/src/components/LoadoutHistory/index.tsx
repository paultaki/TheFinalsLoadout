import React from 'react';
import { useLoadoutHistory } from '../../context/LoadoutHistoryContext';
import styles from './LoadoutHistory.module.css';

/**
 * Displays the loadout generation history stored in localStorage
 */
const LoadoutHistory: React.FC = () => {
  const { history } = useLoadoutHistory();

  if (history.length === 0) {
    return null;
  }

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return 'Just Now';
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    return `${days} day${days === 1 ? '' : 's'} ago`;
  };

  return (
    <div className="w-full px-3 sm:px-4 py-2 sm:py-0">
      <div className="mx-auto" style={{ maxWidth: '750px' }}>
        <div className="relative backdrop-blur-[6px] bg-white/5 rounded-[10px] p-3 sm:p-3" 
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(6px)',
            border: '1px solid transparent',
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.05), rgba(255,255,255,0.05)), linear-gradient(90deg, rgba(0,229,255,0.4), rgba(255,39,231,0.4))',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box'
          }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold gradient-text uppercase tracking-wide">
              Loadout History
            </h2>
            {history.length > 0 && (
              <button 
                onClick={() => {
                  if (window.confirm('Clear all loadout history?')) {
                    localStorage.removeItem('loadoutHistory');
                    window.location.reload();
                  }
                }}
                className="premium-button py-1 px-4 text-xs"
              >
                Clear History
              </button>
            )}
          </div>

          <div className="space-y-0">
            {history.map((loadout, index) => (
              <div key={`${loadout.timestamp}-${index}`}>
                <div className="flex flex-col p-3">
                  {/* Header row with class and time ago */}
                  <div className="flex items-center justify-between mb-3">
                    <div className={`${styles['class-indicator']} ${styles[loadout.class.toLowerCase()]}`}>
                      <span>{loadout.class === 'Light' ? '⚡' : loadout.class === 'Medium' ? '🛡️' : '💪'}</span>
                      <span>{loadout.class.toUpperCase()}</span>
                    </div>
                    <span className="text-cyan-400 text-[11px] font-medium">
                      {getTimeAgo(loadout.timestamp)}
                    </span>
                  </div>
                  
                  {/* 3 Box Layout */}
                  <div className="flex flex-col gap-2">
                    {/* Row 1: Weapon & Spec */}
                    <div className="flex gap-2 w-full">
                      <div className={`${styles['chip-item']} flex-1 text-center`}>
                        <span className={styles['chip-text']}>
                          <span className="text-gray-400">WEAPON:</span>{' '}
                          <span className="text-white">{loadout.weapon.replace(/_/g, ' ')}</span>
                        </span>
                      </div>
                      <div className={`${styles['chip-item']} flex-1 text-center`}>
                        <span className={styles['chip-text']}>
                          <span className="text-gray-400">SPEC:</span>{' '}
                          <span className="text-white">{loadout.specialization.replace(/_/g, ' ')}</span>
                        </span>
                      </div>
                    </div>
                    
                    {/* Row 2: All Gadgets in one box */}
                    <div className="flex gap-2 w-full">
                      <div className={`${styles['chip-item']} flex-1 text-center`}>
                        <span className={styles['chip-text']}>
                          <span className="text-gray-400">GADGETS:</span>{' '}
                          <span className="text-white">{loadout.gadget1.replace(/_/g, ' ')}, {loadout.gadget2.replace(/_/g, ' ')} & {loadout.gadget3.replace(/_/g, ' ')}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {index < history.length - 1 && (
                  <div className="border-t border-white/10 mt-2" />
                )}
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>
  );
};

export default LoadoutHistory;