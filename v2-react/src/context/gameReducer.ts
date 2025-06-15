import type { GameState } from '../types';
import type { GameAction } from './gameActions';
import { GameActionTypes } from './gameActions';

export const initialState: GameState = {
  spinsLeft: 0,
  chosenClass: null,
  stage: 'SPIN',
  history: [],
};

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case GameActionTypes.START_SPIN:
      console.log('Starting spin wheel');
      return { ...state, stage: 'SPIN' };

    case GameActionTypes.FINISH_SPIN:
      console.log('Spin result:', action.payload);
      if (action.payload === 'JACKPOT') {
        // Stay on SPIN stage to show jackpot modal
        return { ...state, spinsLeft: 3, stage: 'SPIN' };
      } else {
        // Normal result - go to roulette
        return { ...state, spinsLeft: action.payload as number, stage: 'ROULETTE' };
      }

    case GameActionTypes.FINISH_ROULETTE:
      console.log('Roulette result:', action.payload);
      return { ...state, chosenClass: action.payload, stage: 'SLOTS' };

    case GameActionTypes.RUN_SLOT:
      console.log('Running slot, spins left:', state.spinsLeft - 1);
      const newSpinsLeft = Math.max(0, state.spinsLeft - 1);
      // Stay on SLOTS stage even when spins are done
      return { ...state, spinsLeft: newSpinsLeft };

    case GameActionTypes.ADD_TO_HISTORY:
      console.log('Adding to history:', action.payload);
      return { ...state, history: [...state.history, action.payload] };

    case GameActionTypes.SET_CLASS:
      console.log('Setting class:', action.payload);
      return { ...state, chosenClass: action.payload };

    case GameActionTypes.SET_SPINS:
      console.log('Setting spins:', action.payload);
      return { ...state, spinsLeft: action.payload };

    case GameActionTypes.RESET_GAME:
      console.log('Resetting game');
      return initialState;

    default:
      return state;
  }
};
