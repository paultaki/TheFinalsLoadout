import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { ClassType, GameState, Loadout } from '../types';
import { gameReducer, initialState } from './gameReducer';
import { GameActionTypes } from './gameActions';

interface GameContextType {
  state: GameState;
  startSpin: (cardValues: Array<number | 'JACKPOT'>) => void;
  finishSpin: (result: number | 'JACKPOT') => void;
  finishRoulette: (clazz: ClassType) => void;
  runSlot: () => void;
  resetGame: () => void;
  addToHistory: (loadout: Loadout) => void;
  setClass: (clazz: ClassType) => void;
  setSpins: (spins: number) => void;
  showAnalysis: (loadout: Loadout) => void;
  hideAnalysis: () => void;
  setLatestLoadout: (loadout: Loadout) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

/**
 * Hook to access game context containing state and dispatch functions
 */
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

/**
 * Context provider that manages global game state and actions
 */
export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const contextValue: GameContextType = {
    state,
    startSpin: (cardValues: Array<number | 'JACKPOT'>) => {
      dispatch({ type: GameActionTypes.START_SPIN, payload: cardValues });
    },
    finishSpin: (result: number | 'JACKPOT') => {
      dispatch({ type: GameActionTypes.FINISH_SPIN, payload: result });
    },
    finishRoulette: (clazz: ClassType) => {
      dispatch({ type: GameActionTypes.FINISH_ROULETTE, payload: clazz });
    },
    runSlot: () => {
      dispatch({ type: GameActionTypes.RUN_SLOT });
    },
    addToHistory: (loadout: Loadout) => {
      dispatch({ type: GameActionTypes.ADD_TO_HISTORY, payload: loadout });
    },
    setClass: (clazz: ClassType) => {
      dispatch({ type: GameActionTypes.SET_CLASS, payload: clazz });
    },
    setSpins: (spins: number) => {
      dispatch({ type: GameActionTypes.SET_SPINS, payload: spins });
    },
    resetGame: () => {
      dispatch({ type: GameActionTypes.RESET_GAME });
    },
    showAnalysis: (loadout: Loadout) => {
      dispatch({ type: GameActionTypes.SHOW_ANALYSIS, payload: loadout });
    },
    hideAnalysis: () => {
      dispatch({ type: GameActionTypes.HIDE_ANALYSIS });
    },
    setLatestLoadout: (loadout: Loadout) => {
      dispatch({ type: GameActionTypes.SET_LATEST_LOADOUT, payload: loadout });
    },
  };

  return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
};
