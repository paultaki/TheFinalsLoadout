import React, { useState } from 'react';
import type { Loadout } from '../../types';

interface ReRoastBtnProps {
  loadout: Loadout;
  onNewAnalysis: (analysis: string) => void;
}

const ReRoastBtn: React.FC<ReRoastBtnProps> = ({ loadout, onNewAnalysis }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleReRoast = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class: loadout.class,
          weapon: loadout.weapon,
          specialization: loadout.specialization,
          gadgets: [loadout.gadget1, loadout.gadget2, loadout.gadget3]
        })
      });

      const data = await response.json();
      onNewAnalysis(data.roast || 'Analysis unavailable. 0/10');
    } catch (error) {
      console.error('Failed to fetch new analysis:', error);
      onNewAnalysis('Analysis system overloaded. Try again! 5/10');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleReRoast}
      disabled={isLoading}
      className="inline-flex items-center gap-1.5 rounded bg-slate-800/70 px-4 py-1 text-xs 
                 uppercase tracking-wide hover:bg-slate-700 transition-colors disabled:opacity-50 min-w-[90px] justify-center"
    >
      {isLoading ? (
        <div className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )}
      <span>Re-Roast</span>
    </button>
  );
};

export default ReRoastBtn;