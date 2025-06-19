import React, { useState, useEffect, useRef } from 'react';
import { useLoadoutHistory } from '../../context/LoadoutHistoryContext';
import { useGameState } from '../../hooks/useGameState';
import { getAIAnalysis } from '../../utils/aiAnalysis';
import type { Loadout } from '../../types';

interface AIAnalysisBoxProps {
  loadout: Loadout | null;
  onClose: () => void;
}

const AIAnalysisBox: React.FC<AIAnalysisBoxProps> = ({ loadout, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const { updateLatestAnalysis } = useLoadoutHistory();
  const state = useGameState();
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!loadout || !loadout.id) return;

    const fetchAnalysis = async () => {
      try {
        // Use the centralized utility with proper error handling
        const analysisText = await getAIAnalysis(loadout);
        setAnalysis(analysisText);
        setIsLoading(false);
        
        // Only update history if we got a real analysis (not a fallback)
        if (!analysisText.includes('??/10') && !analysisText.includes('404/10')) {
          updateLatestAnalysis(analysisText);
        }
      } catch (error) {
        // This should rarely happen as getAIAnalysis handles errors internally
        console.error('Unexpected error in fetchAnalysis:', error);
        setAnalysis('Critical system failure. Reboot required! 0/10');
        setIsLoading(false);
      }
    };

    fetchAnalysis();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loadout?.id]);

  // Typewriter effect
  useEffect(() => {
    if (!analysis || isLoading) return;

    let index = 0;
    setDisplayedText('');

    intervalRef.current = setInterval(() => {
      if (index < analysis.length) {
        setDisplayedText(prev => prev + analysis[index]);
        index++;
      } else {
        clearInterval(intervalRef.current);
        // Auto-dismiss after 5 seconds when typewriter completes
        if (onClose) {
          setTimeout(onClose, 5000);
        }
      }
    }, 30);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [analysis, isLoading, onClose]);

  if (!loadout) {
    return null;
  }
  
  if (!state.latestLoadout) {
    return null;
  }

  return (
    <aside className="w-full max-w-[800px] mx-auto mt-6 animate-fadeIn">
      <div className="backdrop-blur-lg bg-slate-900/70 border border-cyan-400/40 rounded-xl p-6 shadow-2xl"
           style={{
             boxShadow: '0 0 40px rgba(0, 212, 255, 0.3), 0 0 80px rgba(0, 212, 255, 0.1)',
           }}>
          
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text 
                         bg-gradient-to-r from-purple-400 to-pink-400 uppercase tracking-wide">
              AI Analysis
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="min-h-[80px] flex items-center justify-center px-6 py-4 md:px-10 overflow-y-auto max-h-[200px]">
            {isLoading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400" />
            ) : (
              <p className={`text-white text-base sm:text-lg leading-relaxed text-center break-words max-w-full whitespace-pre-line ${
                analysis.includes('??/10') || analysis.includes('404/10') ? 'text-sm italic opacity-90' : ''
              }`}>
                {displayedText || 'Analyzing…'}
                {displayedText.length < analysis.length && (
                  <span className="inline-block w-1 h-5 bg-purple-400 animate-pulse ml-1" />
                )}
              </p>
            )}
          </div>

          {!isLoading && displayedText === analysis && (
            <div className="mt-4 flex justify-center">
              <a
                href="/social/loadout-social-card.webp"
                download="the-finals-loadout.webp"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 
                         rounded-lg text-sm font-semibold transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Share Card
              </a>
            </div>
          )}
        </div>
    </aside>
  );
};

export default AIAnalysisBox;