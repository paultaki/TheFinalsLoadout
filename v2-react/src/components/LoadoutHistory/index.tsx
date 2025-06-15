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

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="w-full px-4 py-0">
      <div className="mx-auto" style={{ maxWidth: '750px' }}>
        <div className="relative backdrop-blur-[6px] bg-white/5 rounded-[10px] p-3" 
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
                  {/* Class indicator */}
                  <div className={`${styles['class-indicator']} ${styles[loadout.class.toLowerCase()]} mb-2`}>
                    <span>{loadout.class === 'Light' ? '⚡' : loadout.class === 'Medium' ? '🛡️' : '💪'}</span>
                    <span>{loadout.class.toUpperCase()}</span>
                  </div>
                  
                  {/* Chips Layout */}
                  <div className="flex flex-wrap gap-2">
                    {/* Row 1: Weapon & Spec */}
                    <div className="flex gap-2 w-full">
                      <div className={`${styles['chip-item']} flex-1`}>
                        <span className={styles['chip-icon']}>⚔</span>
                        <span className={styles['chip-text']}>{loadout.weapon.replace(/_/g, ' ')}</span>
                      </div>
                      <div className={`${styles['chip-item']} flex-1`}>
                        <span className={styles['chip-icon']}>⚡</span>
                        <span className={styles['chip-text']}>{loadout.specialization.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                    
                    {/* Row 2: Gadgets */}
                    <div className="flex gap-2 w-full">
                      <div className={`${styles['chip-item']} flex-1`}>
                        <span className={styles['chip-icon']}>🛠</span>
                        <span className={styles['chip-text']}>{loadout.gadget1.replace(/_/g, ' ')}</span>
                      </div>
                      <div className={`${styles['chip-item']} flex-1`}>
                        <span className={styles['chip-icon']}>🛠</span>
                        <span className={styles['chip-text']}>{loadout.gadget2.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                    
                    {/* Row 3: Last gadget & Timestamp */}
                    <div className="flex gap-2 w-full items-center">
                      <div className={`${styles['chip-item']} flex-1`}>
                        <span className={styles['chip-icon']}>🛠</span>
                        <span className={styles['chip-text']}>{loadout.gadget3.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="flex-1 text-right">
                        <span className="text-cyan-400 text-[10px] font-mono">
                          {formatTime(loadout.timestamp)}
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