import { CardData } from './types';

// Helper to create jackpot cards with random spins
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

// Card configuration
export const CARD_DATA: CardData[] = [
  { value: '1', spins: 1, label: '1', className: 'card-1' },
  makeJackpotCard(),
  { value: '2', spins: 2, label: '2', className: 'card-2' },
  { value: '3', spins: 3, label: '3', className: 'card-3' },
  { value: '4', spins: 4, label: '4', className: 'card-4' },
  makeJackpotCard(),
  { value: '5', spins: 5, label: '5', className: 'card-5' },
];

// Triple for infinite scroll
export const INFINITE_CARDS = [...CARD_DATA, ...CARD_DATA, ...CARD_DATA];

// Create confetti particles
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

// Calculate dynamic card height
export const getCardHeight = (wheelRef: React.RefObject<HTMLUListElement>): number => {
  const card = wheelRef.current?.querySelector('.card');
  return card ? card.getBoundingClientRect().height + 16 : 90; // 16 = margin
};

// Get winner text for banner
export const getWinnerText = (result: CardData): string => {
  return `🎯 ${result.label} SPIN${result.value !== '1' ? 'S' : ''}! 🎯`;
};