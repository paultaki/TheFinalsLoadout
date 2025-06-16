import { ANIMATION_CONSTANTS } from '../../constants/animation';

const { tickerRotation } = ANIMATION_CONSTANTS.spinSelector;

/**
 * Animate ticker collision with peg using GSAP
 * @param tickerElement - The ticker DOM element
 * @param gsap - GSAP instance
 */
export const animateTickerCollision = (
  tickerElement: HTMLElement | null,
  gsap: typeof window.gsap
): void => {
  if (!tickerElement) return;

  gsap.fromTo(
    tickerElement,
    { rotation: tickerRotation.start },
    {
      rotation: tickerRotation.end,
      duration: tickerRotation.duration,
      ease: 'power2.out',
      onComplete: () => {
        gsap.to(tickerElement, {
          rotation: tickerRotation.start,
          duration: tickerRotation.bounceDuration,
          ease: 'bounce.out',
        });
      },
    }
  );
};
