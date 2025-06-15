export const ANIMATION_CONSTANTS = {
  spinSelector: {
    pegOffset: -6,
    tickerRotation: {
      start: -22,
      end: 0,
      duration: 0.07,
      bounceDuration: 0.15,
    },
    physics: {
      cellHeight: 120,
      finalSpinStart: -900,
      normalSpinStart: -720,
      finalOvershoot: 50,
      normalOvershoot: 20,
      scrollSpeedFinal: 25,
      scrollSpeedBase: 30,
      scrollSpeedIncrement: 3,
    },
  },
  classRoulette: {
    segments: 12,
    segmentAngle: 30, // 360/12
    spins: { min: 5, max: 8 },
    duration: {
      accel: 0.4,
      maintain: 1,
      decel: 3,
      bounce: 0.5,
    },
    overshoot: 15,
  },
  slotMachine: {
    timing: {
      finalSpin: {
        spinDuration: 2000,
        stopDuration: 3000,
        staggerDelay: 800,
        finalColumnPause: 200,
      },
      normalSpin: {
        spinDuration: 400,
        stopDuration: 600,
        staggerDelay: 200,
      },
    },
  },
} as const;
