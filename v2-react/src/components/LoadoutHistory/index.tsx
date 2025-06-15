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
    <div className="w-full px-4 py-12">
      <div className="max-w-7xl mx-auto" style={{ width: '90%' }}>
        <div className="relative">
          {/* Premium background effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-blue-900/10 blur-3xl" />
          
          <div className="relative cyber-card p-8 shadow-2xl" style={{
            background: 'linear-gradient(135deg, rgba(123, 31, 162, 0.05) 0%, rgba(41, 182, 246, 0.02) 100%), rgba(18, 18, 26, 0.9)',
            border: '1px solid rgba(171, 71, 188, 0.2)'
          }}>
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
                className="premium-button py-2 px-6 text-xs"
              >
                Clear History
              </button>
            )}
          </div>

          <div className="space-y-3">
            {history.map((loadout, index) => (
              <div
                key={`${loadout.timestamp}-${index}`}
                className="group relative overflow-hidden rounded-xl transition-all duration-500 hover:transform hover:scale-[1.02]"
                style={{
                  background: index % 2 === 0 
                    ? 'linear-gradient(90deg, rgba(123, 31, 162, 0.08) 0%, rgba(123, 31, 162, 0.03) 100%)' 
                    : 'linear-gradient(90deg, rgba(41, 182, 246, 0.08) 0%, rgba(41, 182, 246, 0.03) 100%)',
                  border: '1px solid',
                  borderColor: index % 2 === 0 ? 'rgba(171, 71, 188, 0.2)' : 'rgba(79, 195, 247, 0.2)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                }}
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: index % 2 === 0 
                      ? 'radial-gradient(circle at center, rgba(171, 71, 188, 0.1) 0%, transparent 70%)'
                      : 'radial-gradient(circle at center, rgba(79, 195, 247, 0.1) 0%, transparent 70%)'
                  }}
                />
                
                <div className="relative p-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                  {/* Class Badge */}
                  <div className="md:col-span-1">
                    <div className={`inline-flex items-center justify-center px-4 py-2 rounded-lg font-bold text-lg ${getClassColor(loadout.class)}`}
                      style={{
                        background: loadout.class === 'Light' ? 'rgba(79, 195, 247, 0.1)' :
                                   loadout.class === 'Medium' ? 'rgba(171, 71, 188, 0.1)' :
                                   'rgba(255, 23, 68, 0.1)',
                        border: '1px solid',
                        borderColor: loadout.class === 'Light' ? 'rgba(79, 195, 247, 0.3)' :
                                    loadout.class === 'Medium' ? 'rgba(171, 71, 188, 0.3)' :
                                    'rgba(255, 23, 68, 0.3)',
                        boxShadow: loadout.class === 'Light' ? '0 0 20px rgba(79, 195, 247, 0.2)' :
                                  loadout.class === 'Medium' ? '0 0 20px rgba(171, 71, 188, 0.2)' :
                                  '0 0 20px rgba(255, 23, 68, 0.2)'
                      }}
                    >
                      <span className="mr-2" style={{ fontSize: '1.5rem' }}>
                        {loadout.class === 'Light' ? '⚡' : loadout.class === 'Medium' ? '🛡️' : '💪'}
                      </span>
                      {loadout.class.toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {formatTime(loadout.timestamp)}
                    </div>
                  </div>

                  {/* Weapon & Specialization */}
                  <div className="md:col-span-1 space-y-3">
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Weapon</div>
                      <div className="text-accent-gold font-medium flex items-center gap-2">
                        <span style={{ filter: 'brightness(1.5)' }}>🔫</span>
                        {loadout.weapon.replace(/_/g, ' ')}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Specialization</div>
                      <div className="text-purple-400 font-medium flex items-center gap-2">
                        <span>⚡</span>
                        {loadout.specialization.replace(/_/g, ' ')}
                      </div>
                    </div>
                  </div>

                  {/* Gadgets */}
                  <div className="md:col-span-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Gadgets</div>
                    <div className="flex flex-wrap gap-2">
                      {[loadout.gadget1, loadout.gadget2, loadout.gadget3].map((gadget, idx) => (
                        <span 
                          key={idx}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105"
                          style={{
                            background: 'linear-gradient(135deg, rgba(41, 182, 246, 0.15) 0%, rgba(79, 195, 247, 0.1) 100%)',
                            border: '1px solid rgba(79, 195, 247, 0.3)',
                            color: '#4FC3F7',
                            boxShadow: '0 2px 10px rgba(79, 195, 247, 0.2)'
                          }}
                        >
                          {gadget.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadoutHistory;
