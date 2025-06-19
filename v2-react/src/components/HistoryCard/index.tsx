import React from 'react';
import './HistoryCard.css';

interface HistoryCardProps {
  loadout: {
    class: 'Light' | 'Medium' | 'Heavy';
    weapon: string;
    specialization: string;
    gadget1: string;
    gadget2: string;
    gadget3: string;
    timestamp: number;
    analysis?: string;
  };
  index: number;
}

const HistoryCard: React.FC<HistoryCardProps> = ({ loadout }) => {
  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return 'Just Now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getClassIcon = (className: string) => {
    switch (className) {
      case 'Light': return '⚡';
      case 'Medium': return '🛡️';
      case 'Heavy': return '💪';
      default: return '❓';
    }
  };

  const formatItemName = (name: string) => {
    return name.replace(/_/g, ' ');
  };

  return (
    <div className="history-card">
      {/* Header with class and time */}
      <div className="flex items-center justify-between mb-3">
        <div className={`class-badge ${loadout.class.toLowerCase()}`}>
          <span>{getClassIcon(loadout.class)}</span>
          <span>{loadout.class}</span>
        </div>
        <span className="time-ago">{getTimeAgo(loadout.timestamp)}</span>
      </div>

      {/* Analysis text if available */}
      {loadout.analysis && (
        <div className="analysis-text">
          "{loadout.analysis}"
        </div>
      )}

      {/* Loadout details */}
      <div className="loadout-details">
        <div className="loadout-detail-row">
          <span className="loadout-icon text-pink-400">🔫</span>
          <span className="loadout-label text-pink-400">Weapon:</span>
          <span className="loadout-value">{formatItemName(loadout.weapon)}</span>
        </div>
        <div className="loadout-detail-row">
          <span className="loadout-icon text-cyan-400">⚙️</span>
          <span className="loadout-label text-cyan-400">Spec:</span>
          <span className="loadout-value">{formatItemName(loadout.specialization)}</span>
        </div>
        <div className="loadout-detail-row">
          <span className="loadout-icon text-yellow-400">🎯</span>
          <span className="loadout-label text-yellow-400">Gadgets:</span>
          <span className="loadout-value">
            {formatItemName(loadout.gadget1)}, {formatItemName(loadout.gadget2)}, {formatItemName(loadout.gadget3)}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="history-card-buttons">
        <button onClick={() => navigator.clipboard.writeText(
          `${loadout.class} Class\nWeapon: ${formatItemName(loadout.weapon)}\nSpec: ${formatItemName(loadout.specialization)}\nGadgets: ${formatItemName(loadout.gadget1)}, ${formatItemName(loadout.gadget2)}, ${formatItemName(loadout.gadget3)}`
        )}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </button>
        
        <button onClick={() => {
          // TODO: Implement meme card generation
        }}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Meme
        </button>
        
        <button onClick={() => {
          // TODO: Implement re-roast functionality
        }}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Re-Roast
        </button>
      </div>
    </div>
  );
};

export default HistoryCard;