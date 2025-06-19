import type { CardData } from './types';
import { CARD_DATA } from './helpers';
// import { easeOutExpo } from '../../utils/animationMath';

// Physics constants
export const PHYSICS_CONFIG = {
  initialVelocity: { min: 4800, max: 5600 }, // Doubled for faster initial spin
  friction: 0.985, // Slightly less friction for longer spin
  decelerationThreshold: 600,
  decelerationDuration: 600, // Longer deceleration for smoother stop
  idleSpeed: 0.3,
  minTickVelocity: 50,
} as const;

// Animation refs interface for physics calculations
export interface AnimationRefs {
  currentDistance: number;
  currentVelocity: number;
  lastTime: number;
  lastTickIndex: number;
  lastPegIndex: number;
  isDecelerating: boolean;
  decelerateStartTime: number;
  decelerateStartDistance: number;
  decelerateStartVelocity: number;
}

/**
 * Finds the winning card based on which card is centered in the viewport
 */
export const findWinningCard = (
  wheelFrameRef: React.RefObject<HTMLDivElement | null>,
  wheelRef: React.RefObject<HTMLUListElement | null>
): { card: Element | null; result: CardData } => {
  if (!wheelFrameRef.current || !wheelRef.current) {
    return { card: null, result: CARD_DATA[0] };
  }

  const frameRect = wheelFrameRef.current.getBoundingClientRect();
  const frameCenter = frameRect.top + frameRect.height / 2;

  const cards = wheelRef.current.querySelectorAll('.card');
  let winningCard: Element | null = null;
  let result: CardData | null = null;

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const rect = card.getBoundingClientRect();
    const cardCenter = rect.top + rect.height / 2;

    if (Math.abs(cardCenter - frameCenter) < rect.height / 2) {
      winningCard = card;
      const dataIndex = parseInt(card.getAttribute('data-index') || '0') % CARD_DATA.length;
      result = CARD_DATA[dataIndex];
      break;
    }
  }

  return {
    card: winningCard,
    result: result || CARD_DATA[0],
  };
};

/**
 * Applies infinite scroll transform to the wheel element
 */
export const applyInfiniteScroll = (
  distance: number,
  cardHeight: number,
  wheelRef: React.RefObject<HTMLUListElement | null>
): void => {
  let normalizedDistance = distance % (CARD_DATA.length * cardHeight * 3);
  if (normalizedDistance > CARD_DATA.length * cardHeight * 2) {
    normalizedDistance -= CARD_DATA.length * cardHeight;
  }

  if (wheelRef.current) {
    wheelRef.current.style.transform = `translateY(${-normalizedDistance}px)`;
  }
};

/**
 * Animates a cabinet shake effect when ticker hits pegs
 */
export const animateCabinetShake = (
  wheelFrameRef: React.RefObject<HTMLDivElement | null>,
  velocity: number
): void => {
  if (!wheelFrameRef.current) return;

  wheelFrameRef.current.animate(
    [
      { transform: 'translateX(-2px)' },
      { transform: 'translateX(2px)' },
      { transform: 'translateX(0)' },
    ],
    {
      duration: 90,
      iterations: 1,
    }
  );

  // Heartbeat effect for slow speeds
  if (velocity < 120) {
    wheelFrameRef.current.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.015)' }, { transform: 'scale(1)' }],
      {
        duration: 300,
        easing: 'ease-out',
      }
    );
  }
};