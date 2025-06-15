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

  const getClassColor = (classType: string) => {
    switch (classType) {
      case 'Light':
        return 'text-blue-400';
      case 'Medium':
        return 'text-green-400';
      case 'Heavy':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="w-full px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="cyber-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold gradient-text uppercase tracking-wide">
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
                className="cyber-button py-2 px-4 text-sm"
              >
                Clear History
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((loadout, index) => (
              <div
                key={`${loadout.timestamp}-${index}`}
                className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
              >
                <div className="space-y-3">
                  {/* Header with Class and Time */}
                  <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                    <span className={`font-bold text-lg ${getClassColor(loadout.class)}`}>
                      {loadout.class}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(loadout.timestamp)}
                    </span>
                  </div>

                  {/* Weapon with Icon */}
                  <div className="bg-gradient-to-r from-purple-900/20 to-transparent rounded p-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🔫</span>
                      <div>
                        <span className="text-xs text-gray-400 block">Weapon</span>
                        <span className="text-accent-gold font-medium">
                          {loadout.weapon.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Specialization */}
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⚡</span>
                    <div className="flex-1">
                      <span className="text-xs text-gray-400 block">Specialization</span>
                      <span className="text-purple-400 text-sm font-medium">
                        {loadout.specialization.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Gadgets */}
                  <div className="space-y-1">
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Gadgets</span>
                    <div className="flex flex-wrap gap-2">
                      {[loadout.gadget1, loadout.gadget2, loadout.gadget3].map((gadget, idx) => (
                        <span 
                          key={idx}
                          className="text-xs bg-secondary-blue/20 text-secondary-blue px-2 py-1 rounded-full border border-secondary-blue/30"
                        >
                          {gadget.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadoutHistory;
