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
};

interface LoadoutHistoryContextType {
  history: LoadoutRecord[];
  addLoadout: (loadout: LoadoutRecord) => void;
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

  return (
    <LoadoutHistoryContext.Provider value={{ history, addLoadout }}>
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
