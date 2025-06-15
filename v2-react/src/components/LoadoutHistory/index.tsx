import React from 'react';
import { useLoadoutHistory } from '../../context/LoadoutHistoryContext';

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
      <div className="max-w-7xl mx-auto" style={{ width: '90%' }}>
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
                  {/* Header row */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: '1.2rem' }}>
                        {loadout.class === 'Light' ? '⚡' : loadout.class === 'Medium' ? '🛡️' : '💪'}
                      </span>
                      <span className="font-bold">{loadout.class.toUpperCase()}</span>
                    </div>
                    <span className="text-cyan-400 text-[11px] font-bold">
                      {formatTime(loadout.timestamp)}
                    </span>
                  </div>
                  
                  {/* Body rows */}
                  <div className="space-y-1 text-sm">
                    <div className="text-gray-300">
                      <span className="text-gray-500">Weapon:</span> {loadout.weapon.replace(/_/g, ' ')}
                    </div>
                    <div className="text-gray-300">
                      <span className="text-gray-500">Spec:</span> {loadout.specialization.replace(/_/g, ' ')}
                    </div>
                    <div className="text-gray-300">
                      <span className="text-gray-500">Gadgets:</span>{' '}
                      <span style={{ color: '#FF27E7' }}>
                        {[loadout.gadget1, loadout.gadget2, loadout.gadget3]
                          .map(g => g.replace(/_/g, ' '))
                          .join(' • ')}
                      </span>
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