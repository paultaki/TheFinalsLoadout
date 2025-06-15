import React from 'react';
import type { Loadout } from '../types';

interface HistoryProps {
  loadouts: Loadout[];
}

const History: React.FC<HistoryProps> = ({ loadouts }) => {
  if (loadouts.length === 0) return null;

  const recentLoadouts = loadouts.slice(-5).reverse();

  return (
    <div className="fixed bottom-4 left-4 bg-gray-900/90 rounded-lg p-4 max-w-sm">
      <h3 className="text-sm font-bold mb-2 text-gray-400">Recent Loadouts</h3>
      <div className="space-y-2 text-xs">
        {recentLoadouts.map((loadout, index) => (
          <div key={index} className="bg-gray-800 rounded p-2">
            <div className="text-yellow-400">{loadout.weapon.name}</div>
            <div className="text-blue-400">{loadout.specialization.name}</div>
            <div className="text-gray-300">
              {loadout.gadget1.name}, {loadout.gadget2.name}, {loadout.gadget3.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;