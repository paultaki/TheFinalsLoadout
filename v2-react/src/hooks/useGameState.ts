import { useGame } from '../context/GameProvider';

/**
 * Hook to access game state
 */
export const useGameState = () => {
  const { state } = useGame();
  return state;
};

/**
 * Hook to access game dispatch functions
 */
export const useGameDispatch = () => {
  const {
    startSpin,
    finishSpin,
    finishRoulette,
    runSlot,
    resetGame,
    addToHistory,
    setClass,
    setSpins,
    showAnalysis,
    hideAnalysis,
    setLatestLoadout,
  } = useGame();

  return {
    startSpin,
    finishSpin,
    finishRoulette,
    runSlot,
    resetGame,
    addToHistory,
    setClass,
    setSpins,
    showAnalysis,
    hideAnalysis,
    setLatestLoadout,
  };
};
