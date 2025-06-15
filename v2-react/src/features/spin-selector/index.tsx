import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useGameDispatch } from '../../hooks/useGameState';
import { playSound } from '../../utils/sound';
import { useSound } from '../../utils/audio';
import ResultModal from '../../components/ResultModal';
import { animateTickerCollision } from './animations';
import './styles.css';

interface SpinResult {
  value: string;
  spins: number;
  isJackpot: boolean;
}

interface SpinCountWheelProps {
  onSpinComplete: (result: SpinResult) => void;
}

interface CardData {
  value: string;
  spins: number;
  label: string;
  className: string;
  isJackpot?: boolean;
}

// Helper to create jackpot cards with random spins
const makeJackpotCard = (): CardData => {
  const spins = 2 + Math.floor(Math.random() * 3); // 2, 3, or 4
  return {
    value: 'JACKPOT',
    spins: spins,
    label: `Jackpot!\nChoose Class\n${spins} Spins`,
    className: 'card-special jackpot',
    isJackpot: true,
  };
};

// Card configuration
const CARD_DATA: CardData[] = [
  { value: '1', spins: 1, label: '1', className: 'card-1' },
  makeJackpotCard(),
  { value: '2', spins: 2, label: '2', className: 'card-2' },
  { value: '3', spins: 3, label: '3', className: 'card-3' },
  { value: '4', spins: 4, label: '4', className: 'card-4' },
  makeJackpotCard(),
  { value: '5', spins: 5, label: '5', className: 'card-5' },
];

// Triple for infinite scroll
const INFINITE_CARDS = [...CARD_DATA, ...CARD_DATA, ...CARD_DATA];

/**
 * Spin count selector wheel component with peg physics
 * @param onSpinComplete - Callback when spin animation completes
 */
const SpinCountWheel: React.FC<SpinCountWheelProps> = ({ onSpinComplete }) => {
  const { setClass, setSpins, finishRoulette } = useGameDispatch();
  const playBeep = useSound('/sounds/wheel-beep.mp3', { volume: 0.4 });
  const playDing = useSound('/sounds/ding.mp3', { volume: 0.6 });
  const playDingDing = useSound('/sounds/ding-ding.mp3', { volume: 0.7 });
  const [isSpinning, setIsSpinning] = useState(false);
  const [showWinnerBanner, setShowWinnerBanner] = useState(false);
  const [winnerText, setWinnerText] = useState('');
  const [isFrameGlowing, setIsFrameGlowing] = useState(false);
  const [modalResult, setModalResult] = useState<{
    variant: 'number' | 'jackpot';
    value: string;
    spins: number;
  } | null>(null);

  // Refs
  const wheelRef = useRef<HTMLUListElement>(null);
  const wheelFrameRef = useRef<HTMLDivElement>(null);
  const pointerArmRef = useRef<HTMLDivElement>(null);
  const spinBtnRef = useRef<HTMLButtonElement>(null);

  // Animation state
  const animationIdRef = useRef<number | undefined>(undefined);
  const idleAnimationIdRef = useRef<number | undefined>(undefined);
  const currentDistanceRef = useRef(0);
  const currentVelocityRef = useRef(0);
  const lastTimeRef = useRef(0);
  const lastTickIndexRef = useRef(0);
  const lastPegIndexRef = useRef(-1);
  const isDeceleratingRef = useRef(false);
  const decelerateStartTimeRef = useRef(0);
  const decelerateStartDistanceRef = useRef(0);
  const decelerateStartVelocityRef = useRef(0);
  const isSpinningRef = useRef(false);

  // Calculate dynamic card height
  const getCardHeight = useCallback(() => {
    const card = wheelRef.current?.querySelector('.card');
    return card ? card.getBoundingClientRect().height + 16 : 90; // 16 = margin
  }, []);

  // Easing function
  const easeOutExpo = (t: number) => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  };

  // Handle pointer tick animation with GSAP
  const handlePointerTick = useCallback(
    (velocity: number) => {
      // Play beep sound for peg pass
      playBeep();

      // GSAP ticker animation
      if (window.gsap) {
        animateTickerCollision(pointerArmRef.current, window.gsap);
      }

      // Cabinet shake
      if (wheelFrameRef.current) {
        wheelFrameRef.current.animate(
          [
            { transform: 'translateX(-4px)' },
            { transform: 'translateX(4px)' },
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
            [{ transform: 'scale(1)' }, { transform: 'scale(1.03)' }, { transform: 'scale(1)' }],
            {
              duration: 300,
              easing: 'ease-out',
            }
          );
        }
      }
    },
    [playBeep]
  );

  // Handle stop
  const handleStop = useCallback(() => {
    console.log('HandleStop called');
    setIsSpinning(false);
    isSpinningRef.current = false;
    isDeceleratingRef.current = false;
    if (spinBtnRef.current) {
      spinBtnRef.current.disabled = false;
    }

    // Cancel animation frame
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = undefined;
    }

    // Find which card is in the center of viewport
    if (!wheelFrameRef.current || !wheelRef.current) return;

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

    // Fallback
    if (!result) {
      result = CARD_DATA[0];
    }

    // Highlight winning card
    cards.forEach((card) => card.classList.remove('winner'));
    if (winningCard) {
      winningCard.classList.add('winner');
    }

    // Play appropriate sound
    if (result.isJackpot) {
      playDingDing();
    } else {
      playDing();
    }

    // Show winner banner only for non-jackpot
    if (!result.isJackpot) {
      const excitingText = `🎯 ${result.label} SPIN${result.value !== '1' ? 'S' : ''}! 🎯`;
      setWinnerText(excitingText);
      setShowWinnerBanner(true);
      setIsFrameGlowing(true);
    }

    // Confetti for all results
    createConfetti();

    // Extra effects for CHOOSE CLASS
    if (result.value === 'JACKPOT') {
      setTimeout(() => createConfetti(), 300);
      setTimeout(() => createConfetti(), 600);
    }

    // Hide banner after 3 seconds (only if shown)
    if (!result.isJackpot) {
      setTimeout(() => {
        setShowWinnerBanner(false);
        setIsFrameGlowing(false);
      }, 3000);
    }

    // Show modal
    setModalResult({
      variant: result.isJackpot ? 'jackpot' : 'number',
      value: result.value,
      spins: result.spins,
    });

    // Fire callback is now handled by modal onClose

    // Restart idle animation
    setTimeout(() => {
      startIdleAnimation();
    }, 1000);
  }, [getCardHeight, onSpinComplete, playDing, playDingDing]);

  // Physics update
  const updatePhysics = useCallback(
    (timestamp: number) => {
      if (!isSpinningRef.current) return;

      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
        animationIdRef.current = requestAnimationFrame(updatePhysics);
        return;
      }

      const deltaTime = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      const cardHeight = getCardHeight();

      if (!isDeceleratingRef.current) {
        // Normal spinning
        currentDistanceRef.current += currentVelocityRef.current * deltaTime;
        currentVelocityRef.current *= Math.pow(0.988, deltaTime * 60);

        // Check for tick
        const tickIndex = Math.floor(currentDistanceRef.current / cardHeight);
        if (tickIndex !== lastTickIndexRef.current) {
          handlePointerTick(currentVelocityRef.current);
          lastTickIndexRef.current = tickIndex;
        }

        // Start deceleration when velocity is low enough
        if (currentVelocityRef.current < 600) {
          isDeceleratingRef.current = true;
          decelerateStartTimeRef.current = timestamp;
          decelerateStartDistanceRef.current = currentDistanceRef.current;
          decelerateStartVelocityRef.current = currentVelocityRef.current;
        }
      } else {
        // Smooth deceleration
        const decelerateElapsed = (timestamp - decelerateStartTimeRef.current) / 400;
        const progress = Math.min(1, decelerateElapsed);
        const eased = easeOutExpo(progress);

        currentDistanceRef.current += currentVelocityRef.current * deltaTime;
        currentVelocityRef.current = decelerateStartVelocityRef.current * (1 - eased);

        // Slower ticks during deceleration
        const tickIndex = Math.floor(currentDistanceRef.current / cardHeight);
        if (tickIndex !== lastTickIndexRef.current && currentVelocityRef.current > 50) {
          handlePointerTick(currentVelocityRef.current);
          lastTickIndexRef.current = tickIndex;
        }

        if (progress >= 1) {
          handleStop();
          return;
        }
      }

      // Apply infinite scroll
      let normalizedDistance = currentDistanceRef.current % (CARD_DATA.length * cardHeight * 3);
      if (normalizedDistance > CARD_DATA.length * cardHeight * 2) {
        normalizedDistance -= CARD_DATA.length * cardHeight;
      }

      if (wheelRef.current) {
        wheelRef.current.style.transform = `translateY(${-normalizedDistance}px)`;
      }

      animationIdRef.current = requestAnimationFrame(updatePhysics);
    },
    [getCardHeight, handlePointerTick, handleStop, playBeep]
  );

  // Idle animation
  const startIdleAnimation = useCallback(() => {
    const idleAnimate = () => {
      if (!isSpinningRef.current) {
        currentDistanceRef.current += 0.3;

        const cardHeight = getCardHeight();
        let normalizedDistance = currentDistanceRef.current % (CARD_DATA.length * cardHeight * 3);
        if (normalizedDistance > CARD_DATA.length * cardHeight * 2) {
          normalizedDistance -= CARD_DATA.length * cardHeight;
        }

        if (wheelRef.current) {
          wheelRef.current.style.transform = `translateY(${-normalizedDistance}px)`;
        }
        idleAnimationIdRef.current = requestAnimationFrame(idleAnimate);
      }
    };
    idleAnimate();
  }, [getCardHeight]);

  const stopIdleAnimation = () => {
    if (idleAnimationIdRef.current) {
      cancelAnimationFrame(idleAnimationIdRef.current);
      idleAnimationIdRef.current = undefined;
    }
  };

  // Spin function
  const spin = useCallback(() => {
    if (isSpinning) return;

    stopIdleAnimation();
    setIsSpinning(true);
    isSpinningRef.current = true;
    if (spinBtnRef.current) {
      spinBtnRef.current.disabled = true;
    }

    // Reset state
    if (wheelRef.current) {
      wheelRef.current.style.transition = 'none';
    }
    currentVelocityRef.current = 2400 + Math.random() * 400;
    lastTimeRef.current = 0;
    lastTickIndexRef.current = 0;
    lastPegIndexRef.current = -1;
    isDeceleratingRef.current = false;

    animationIdRef.current = requestAnimationFrame(updatePhysics);
  }, [isSpinning]);

  // Create confetti
  const createConfetti = () => {
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-particle';
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.backgroundColor = ['#f59e0b', '#ec4899', '#3b82f6', '#10b981'][
        Math.floor(Math.random() * 4)
      ];
      confetti.style.animationDelay = `${Math.random()}s`;
      confetti.style.animationDuration = `${2 + Math.random()}s`;
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 3000);
    }
  };

  // Initialize idle animation
  useEffect(() => {
    startIdleAnimation();

    return () => {
      stopIdleAnimation();
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  return (
    <div className="spin-count-wheel">
      <div className="wheel-container">
        <h1>SPIN COUNT SELECTOR</h1>

        <div className={`wheel-frame ${isFrameGlowing ? 'glowing' : ''}`} ref={wheelFrameRef}>
          <div className="fade-top" />
          <div className="fade-bottom" />

          <div className="ticker" ref={pointerArmRef}>
            <div className="ticker-triangle" />
          </div>

          <div className="wheel-track">
            <ul className="wheel-list" ref={wheelRef}>
              {INFINITE_CARDS.map((card, index) => (
                <li
                  key={index}
                  className={`card ${card.className}`}
                  data-index={index}
                  data-spins={card.spins}
                >
                  {card.label.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < card.label.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                  <span className="peg" />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <button className="spin-button" ref={spinBtnRef} onClick={spin} disabled={isSpinning}>
          {isSpinning ? 'Spinning…' : 'Pull to Spin'}
        </button>
      </div>

      <div className={`winner-banner ${showWinnerBanner ? 'show' : ''}`}>{winnerText}</div>

      {modalResult && (
        <ResultModal
          variant={modalResult.variant}
          value={modalResult.value}
          spins={modalResult.spins}
          onSelectClass={(cls) => {
            // Set class and spins
            setClass(cls);
            setSpins(modalResult.spins);
            // Transition directly to slots
            finishRoulette(cls);
            // Close modal
            setModalResult(null);
          }}
          onClose={() => {
            setModalResult(null);
            // For number results, fire the callback
            if (modalResult.variant === 'number') {
              onSpinComplete({
                value: modalResult.value,
                spins: modalResult.spins,
                isJackpot: false,
              });
            }
          }}
        />
      )}
    </div>
  );
};

export default SpinCountWheel;
