import React from 'react';
import { useLoadoutHistory } from '../../context/LoadoutHistoryContext';
import HistoryCard from '../HistoryCard';

/**
 * Displays the loadout generation history stored in localStorage
 */
const LoadoutHistory: React.FC = () => {
  const { history } = useLoadoutHistory();

  // Temporarily show the panel even if empty for debugging
  // if (history.length === 0) {
  //   return null;
  // }

  return (
    <div className="w-full py-4">
      <div style={{ maxWidth: '672px', margin: '0 auto', width: '100%' }}>
        <div className="relative backdrop-blur-[6px] bg-white/5 rounded-[10px] p-6" 
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(6px)',
            border: '1px solid transparent',
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.05), rgba(255,255,255,0.05)), linear-gradient(90deg, rgba(0,229,255,0.4), rgba(255,39,231,0.4))',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box'
          }}>
          <div className="flex flex-col items-center mb-4">
            <h2 className="text-xl font-bold gradient-text uppercase tracking-wide mb-3" style={{ textAlign: 'center' }}>
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

          <div className="flex flex-col space-y-4">
            {history.length === 0 ? (
              <p className="text-center text-gray-400 py-8">
                No loadouts generated yet. Generate your first loadout above!
              </p>
            ) : (
              history.map((loadout, index) => (
              <div 
                key={`${loadout.timestamp}-${index}`}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}>
                <HistoryCard loadout={loadout} index={index} />
                {index < history.length - 1 && (
                  <div className="my-6">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
                  </div>
                )}
              </div>
            ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadoutHistory;