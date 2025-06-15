export const SOUNDS = {
  click: '/sounds/click.mp3',
  tick: '/sounds/click.mp3',
  win: '/sounds/Tabby Tune.mp3',
  jackpot: '/sounds/ding-ding.mp3',
  spin: '/sounds/spinning.mp3',
  spinning: '/sounds/spinning.mp3',
  transition: '/sounds/transition.mp3',
  finalSound: '/sounds/final-sound.mp3',
  spinStart: '/sounds/start-spin.mp3',
  columnStop: '/sounds/click.mp3',
  chang: '/sounds/chang.mp3',
  whoosh: '/sounds/spinning.mp3',
  victory: '/sounds/chang.mp3',
  tabbyTune: '/sounds/Tabby Tune.mp3',
  wheelBeep: '/sounds/beep.mp3',
  ding: '/sounds/ding.mp3',
  dingDing: '/sounds/ding-ding.mp3',
} as const;

export type SoundType = keyof typeof SOUNDS;
export const SOUND_PATHS = SOUNDS; // for backward compatibility
