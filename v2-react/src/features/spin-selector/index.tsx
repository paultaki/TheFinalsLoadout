import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useGameDispatch } from '../../hooks/useGameState';
import { useSound } from '../../utils/audio';
import ResultModal from '../../components/ResultModal';
import PullSpinButton from './PullSpinButton';
import { animateTickerCollision } from './animations';
import type { SpinCountWheelProps, ModalResult } from './types';
import { INFINITE_CARDS, createConfetti, getCardHeight, getWinnerText } from './helpers';
import {
  PHYSICS_CONFIG,
  type AnimationRefs,
  findWinningCard,
  applyInfiniteScroll,
  animateCabinetShake,
} from './physics';
import { easeOutExpo } from '../../utils/animationMath';
import './styles.css';
import styles from './SpinSelector.module.css';

/**
 * Spin count selector wheel component with peg physics
 */
const SpinCountWheel: React.FC<SpinCountWheelProps> = ({ onSpinComplete }) => {
  const { setClass, setSpins, finishRoulette } = useGameDispatch();
  const playBeep = useSound('/sounds/beep.mp3', { volume: 0.2 });
  const playDing = useSound('/sounds/ding.mp3', { volume: 0.6 });
  const playDingDing = useSound('/sounds/ding-ding.mp3', { volume: 0.7 });
  const [isSpinning, setIsSpinning] = useState(false);
  const [showWinnerBanner, setShowWinnerBanner] = useState(false);
  const [winnerText, setWinnerText] = useState('');
  const [isFrameGlowing, setIsFrameGlowing] = useState(false);
  const [particles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [modalResult, setModalResult] = useState<ModalResult | null>(null);

  // Refs
  const wheelRef = useRef<HTMLUListElement>(null);
  const wheelFrameRef = useRef<HTMLDivElement>(null);
  const pointerArmRef = useRef<HTMLDivElement>(null);
  const spinBtnRef = useRef<HTMLButtonElement>(null);

  // Animation state
  const animationIdRef = useRef<number | undefined>(undefined);
  const idleAnimationIdRef = useRef<number | undefined>(undefined);
  const isSpinningRef = useRef(false);
  const animationRefs = useRef<AnimationRefs>({
    currentDistance: 0,
    currentVelocity: 0,
    lastTime: 0,
    lastTickIndex: 0,
    lastPegIndex: -1,
    isDecelerating: false,
    decelerateStartTime: 0,
    decelerateStartDistance: 0,
    decelerateStartVelocity: 0,
  });


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
      animateCabinetShake(wheelFrameRef, velocity);
    },
    [playBeep]
  );

  // Handle stop
  const handleStop = useCallback(() => {
    setIsSpinning(false);
    isSpinningRef.current = false;
    animationRefs.current.isDecelerating = false;
    if (spinBtnRef.current) {
      spinBtnRef.current.disabled = false;
    }

    // Cancel animation frame
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = undefined;
    }

    // Find which card is in the center of viewport
    const { card: winningCard, result } = findWinningCard(wheelFrameRef, wheelRef);
    const cards = wheelRef.current?.querySelectorAll('.card');
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 Winning result:', result);
      console.log('🎯 Is jackpot?', result.isJackpot);
    }

    // Highlight winning card
    cards?.forEach((card) => card.classList.remove('winner'));
    if (winningCard) {
      winningCard.classList.add('winner');
    }

    // Play appropriate sound
    if (result.isJackpot) {
      playDingDing();
      // Stop the jackpot sound after 1.5 seconds (half the usual duration)
      setTimeout(() => {
        const audio = document.querySelector('audio[src*="ding-ding"]') as HTMLAudioElement;
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      }, 1500);
    } else {
      playDing();
    }

    // Show winner banner only for non-jackpot
    if (!result.isJackpot) {
      setWinnerText(getWinnerText(result));
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
    const modalData = {
      variant: result.isJackpot ? 'jackpot' : 'number',
      value: result.value,
      spins: result.spins,
    };
    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 Setting modal:', modalData);
    }
    setModalResult(modalData);

    // Fire callback is now handled by modal onClose

    // Restart idle animation
    setTimeout(() => {
      startIdleAnimation();
    }, 1000);
  }, [onSpinComplete, playDing, playDingDing]);

  // Physics update
  const updatePhysics = useCallback(
    (timestamp: number) => {
      if (!isSpinningRef.current) return;

      const refs = animationRefs.current;

      if (refs.lastTime === 0) {
        refs.lastTime = timestamp;
        animationIdRef.current = requestAnimationFrame(updatePhysics);
        return;
      }

      const deltaTime = (timestamp - refs.lastTime) / 1000;
      refs.lastTime = timestamp;

      const cardHeight = getCardHeight(wheelRef);

      if (!refs.isDecelerating) {
        // Normal spinning
        refs.currentDistance += refs.currentVelocity * deltaTime;
        refs.currentVelocity *= Math.pow(PHYSICS_CONFIG.friction, deltaTime * 60);

        // Check for tick
        const tickIndex = Math.floor(refs.currentDistance / cardHeight);
        if (tickIndex !== refs.lastTickIndex) {
          handlePointerTick(refs.currentVelocity);
          refs.lastTickIndex = tickIndex;
        }

        // Start deceleration when velocity is low enough
        if (refs.currentVelocity < PHYSICS_CONFIG.decelerationThreshold) {
          refs.isDecelerating = true;
          refs.decelerateStartTime = timestamp;
          refs.decelerateStartDistance = refs.currentDistance;
          refs.decelerateStartVelocity = refs.currentVelocity;
        }
      } else {
        // Smooth deceleration
        const decelerateElapsed = (timestamp - refs.decelerateStartTime) / PHYSICS_CONFIG.decelerationDuration;
        const progress = Math.min(1, decelerateElapsed);
        const eased = easeOutExpo(progress);

        refs.currentDistance += refs.currentVelocity * deltaTime;
        refs.currentVelocity = refs.decelerateStartVelocity * (1 - eased);

        // Slower ticks during deceleration
        const tickIndex = Math.floor(refs.currentDistance / cardHeight);
        if (tickIndex !== refs.lastTickIndex && refs.currentVelocity > PHYSICS_CONFIG.minTickVelocity) {
          handlePointerTick(refs.currentVelocity);
          refs.lastTickIndex = tickIndex;
        }

        if (progress >= 1) {
          handleStop();
          return;
        }
      }

      // Apply infinite scroll
      applyInfiniteScroll(refs.currentDistance, cardHeight, wheelRef);

      animationIdRef.current = requestAnimationFrame(updatePhysics);
    },
    [handlePointerTick, handleStop]
  );

  // Idle animation
  const startIdleAnimation = useCallback(() => {
    const idleAnimate = (): void => {
      if (!isSpinningRef.current) {
        animationRefs.current.currentDistance += PHYSICS_CONFIG.idleSpeed;

        const cardHeight = getCardHeight(wheelRef);
        applyInfiniteScroll(animationRefs.current.currentDistance, cardHeight, wheelRef);
        idleAnimationIdRef.current = requestAnimationFrame(idleAnimate);
      }
    };
    idleAnimate();
  }, []);

  const stopIdleAnimation = (): void => {
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
    const refs = animationRefs.current;
    refs.currentVelocity = PHYSICS_CONFIG.initialVelocity.min + Math.random() * (PHYSICS_CONFIG.initialVelocity.max - PHYSICS_CONFIG.initialVelocity.min);
    refs.lastTime = 0;
    refs.lastTickIndex = 0;
    refs.lastPegIndex = -1;
    refs.isDecelerating = false;

    animationIdRef.current = requestAnimationFrame(updatePhysics);
  }, [isSpinning]);


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
    <div className={`spin-count-wheel ${styles.spinSelectorWrapper}`}>
      <div className="wheel-container">
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

        <div className={styles.pullButtonWrapper}>
          <PullSpinButton onSpin={spin} disabled={isSpinning} />
        </div>
      </div>

      <div className={`winner-banner ${showWinnerBanner ? 'show' : ''}`}>{winnerText}</div>

      {/* Particle effects container */}
      <div className="particle-container">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: particle.x,
              top: particle.y,
            }}
          />
        ))}
      </div>

      {modalResult && (
        <ResultModal
            variant={modalResult.variant}
            value={modalResult.value}
            spins={modalResult.spins}
          onSelectClass={(cls) => {
            // Set class and spins
            setClass(cls);
            setSpins(modalResult.spins);
            // Finish roulette to go to slots
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
            } else if (modalResult.variant === 'jackpot') {
              // For jackpot, fire the callback to continue game flow
              onSpinComplete({
                value: modalResult.value,
                spins: modalResult.spins,
                isJackpot: true,
              });
            }
          }}
        />
      )}
    </div>
  );
};

export default SpinCountWheel;
