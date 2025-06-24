import type { ClassType, Loadout } from '../types';

export const GameActionTypes = {
  START_SPIN: 'START_SPIN',
  FINISH_SPIN: 'FINISH_SPIN',
  FINISH_ROULETTE: 'FINISH_ROULETTE',
  RUN_SLOT: 'RUN_SLOT',
  RESET_GAME: 'RESET_GAME',
  ADD_TO_HISTORY: 'ADD_TO_HISTORY',
  SET_CLASS: 'SET_CLASS',
  SET_SPINS: 'SET_SPINS',
  SHOW_ANALYSIS: 'SHOW_ANALYSIS',
  HIDE_ANALYSIS: 'HIDE_ANALYSIS',
  SET_LATEST_LOADOUT: 'SET_LATEST_LOADOUT',
} as const;

export type GameAction =
  | { type: typeof GameActionTypes.START_SPIN; payload: Array<number | 'JACKPOT'> }
  | { type: typeof GameActionTypes.FINISH_SPIN; payload: number | 'JACKPOT' }
  | { type: typeof GameActionTypes.FINISH_ROULETTE; payload: ClassType }
  | { type: typeof GameActionTypes.RUN_SLOT }
  | { type: typeof GameActionTypes.RESET_GAME }
  | { type: typeof GameActionTypes.ADD_TO_HISTORY; payload: Loadout }
  | { type: typeof GameActionTypes.SET_CLASS; payload: ClassType }
  | { type: typeof GameActionTypes.SET_SPINS; payload: number }
  | { type: typeof GameActionTypes.SHOW_ANALYSIS; payload: Loadout }
  | { type: typeof GameActionTypes.HIDE_ANALYSIS }
  | { type: typeof GameActionTypes.SET_LATEST_LOADOUT; payload: Loadout };
