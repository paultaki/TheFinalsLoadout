import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type LoadoutRecord = {
  timestamp: number;
  class: 'Light' | 'Medium' | 'Heavy';
  weapon: string;
  gadget1: string;
  gadget2: string;
  gadget3: string;
  specialization: string;
  analysis?: string;
};

interface LoadoutHistoryContextType {
  history: LoadoutRecord[];
  addLoadout: (loadout: LoadoutRecord) => void;
  updateLatestAnalysis: (analysis: string) => void;
}

const LoadoutHistoryContext = createContext<LoadoutHistoryContextType | undefined>(undefined);

const STORAGE_KEY = 'tflg-loadout-history';

/**
 * Context provider that manages loadout history with localStorage persistence
 */
export const LoadoutHistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<LoadoutRecord[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
      } catch (e) {
        console.error('Failed to parse loadout history:', e);
      }
    }
  }, []);

  const addLoadout = (loadout: LoadoutRecord) => {
    setHistory((prev) => {
      const newHistory = [loadout, ...prev].slice(0, 5);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const updateLatestAnalysis = (analysis: string) => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      // Find the most recent loadout without an analysis
      const indexToUpdate = updated.findIndex(item => !item.analysis);
      if (indexToUpdate !== -1) {
        updated[indexToUpdate] = { ...updated[indexToUpdate], analysis };
      } else {
        // If all have analysis, update the most recent one
        updated[0] = { ...updated[0], analysis };
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <LoadoutHistoryContext.Provider value={{ history, addLoadout, updateLatestAnalysis }}>
      {children}
    </LoadoutHistoryContext.Provider>
  );
};

/**
 * Hook to access loadout history and add new loadouts
 */
export const useLoadoutHistory = () => {
  const context = useContext(LoadoutHistoryContext);
  if (!context) {
    throw new Error('useLoadoutHistory must be used within LoadoutHistoryProvider');
  }
  return context;
};
