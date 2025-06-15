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
      <div className="max-w-7xl mx-auto">
        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <h2
            className="text-center text-2xl font-bold mb-6"
            style={{
              color: '#ffd36d',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontSize: '1.125rem',
              fontVariant: 'small-caps',
            }}
          >
            Loadout History
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {history.map((loadout, index) => (
              <div
                key={`${loadout.timestamp}-${index}`}
                className="bg-gray-900/60 rounded-lg p-4 border border-gray-700/50 hover:border-gray-600/50 transition-colors"
              >
                <div className="space-y-2">
                  {/* Class */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs uppercase">Class</span>
                    <span className={`font-bold ${getClassColor(loadout.class)}`}>
                      {loadout.class}
                    </span>
                  </div>

                  {/* Weapon */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs uppercase">Weapon</span>
                    <span className="text-yellow-400 text-sm font-medium">
                      {loadout.weapon.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Specialization */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs uppercase">Spec</span>
                    <span className="text-purple-400 text-sm">
                      {loadout.specialization.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Gadgets */}
                  <div className="border-t border-gray-700/50 pt-2 mt-2">
                    <span className="text-gray-500 text-xs uppercase">Gadgets</span>
                    <div className="mt-1 space-y-1">
                      <div className="text-cyan-400 text-xs">
                        {loadout.gadget1.replace(/_/g, ' ')}
                      </div>
                      <div className="text-cyan-400 text-xs">
                        {loadout.gadget2.replace(/_/g, ' ')}
                      </div>
                      <div className="text-cyan-400 text-xs">
                        {loadout.gadget3.replace(/_/g, ' ')}
                      </div>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="text-center text-gray-600 text-xs pt-2 border-t border-gray-700/50">
                    {formatTime(loadout.timestamp)}
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
