import type { GameState } from '../types';
import type { GameAction } from './gameActions';
import { GameActionTypes } from './gameActions';

export const initialState: GameState = {
  spinsLeft: 0,
  chosenClass: null,
  stage: 'SPIN',
  history: [],
};

/**
 * Reducer function that manages game state transitions based on actions
 */
export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case GameActionTypes.START_SPIN:
      return { ...state, stage: 'SPIN' };

    case GameActionTypes.FINISH_SPIN:
      if (action.payload === 'JACKPOT') {
        // Stay on SPIN stage to show jackpot modal
        return { ...state, spinsLeft: 3, stage: 'SPIN' };
      } else {
        // Normal result - go to roulette
        return { ...state, spinsLeft: action.payload as number, stage: 'ROULETTE' };
      }

    case GameActionTypes.FINISH_ROULETTE:
      return { ...state, chosenClass: action.payload, stage: 'SLOTS' };

    case GameActionTypes.RUN_SLOT:
      const newSpinsLeft = Math.max(0, state.spinsLeft - 1);
      // Stay on SLOTS stage even when spins are done
      return { ...state, spinsLeft: newSpinsLeft };

    case GameActionTypes.ADD_TO_HISTORY:
      return { ...state, history: [...state.history, action.payload] };

    case GameActionTypes.SET_CLASS:
      return { ...state, chosenClass: action.payload };

    case GameActionTypes.SET_SPINS:
      return { ...state, spinsLeft: action.payload };

    case GameActionTypes.RESET_GAME:
      return initialState;

    default:
      return state;
  }
};
