import type { CardData } from './types';

/**
 * Creates a jackpot card with random spin count (2-4)
 */
export const makeJackpotCard = (): CardData => {
  const spins = 2 + Math.floor(Math.random() * 3); // 2, 3, or 4
  return {
    value: 'JACKPOT',
    spins: spins,
    label: `Jackpot!\nChoose Class\n${spins} Spins`,
    className: 'card-special jackpot',
    isJackpot: true,
  };
};

// Card configuration with static jackpot cards
export const CARD_DATA: CardData[] = [
  { value: '1', spins: 1, label: '1', className: 'card-1' },
  { value: 'JACKPOT', spins: 3, label: 'Jackpot!\nChoose Class\n3 Spins', className: 'card-special jackpot', isJackpot: true },
  { value: '2', spins: 2, label: '2', className: 'card-2' },
  { value: '3', spins: 3, label: '3', className: 'card-3' },
  { value: '4', spins: 4, label: '4', className: 'card-4' },
  { value: 'JACKPOT', spins: 3, label: 'Jackpot!\nChoose Class\n3 Spins', className: 'card-special jackpot', isJackpot: true },
  { value: '5', spins: 5, label: '5', className: 'card-5' },
];

// Triple for infinite scroll
export const INFINITE_CARDS = [...CARD_DATA, ...CARD_DATA, ...CARD_DATA];

/**
 * Creates animated confetti particles for celebrations
 */
export const createConfetti = (): void => {
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

/**
 * Calculates the height of a card element including margins
 */
export const getCardHeight = (wheelRef: React.RefObject<HTMLUListElement | null>): number => {
  const card = wheelRef.current?.querySelector('.card');
  return card ? card.getBoundingClientRect().height + 16 : 90; // 16 = margin
};

/**
 * Generates the winner text displayed in the result banner
 */
export const getWinnerText = (result: CardData): string => {
  return `🎯 ${result.label} SPIN${result.value !== '1' ? 'S' : ''}! 🎯`;
};