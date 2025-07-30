import { Card, Rank } from '../../core/card/card.types';
import { Hand } from './hand.types';

const BLACKJACK_VALUE = 21;
const ACE_HIGH_VALUE = 11;
const ACE_LOW_VALUE = 1;
const FACE_CARD_VALUE = 10;
const ACE_ADJUSTMENT = 10;
const BLACKJACK_CARD_COUNT = 2;

const getRankValue = (rank: Rank): number => {
  switch (rank) {
    case 'A':
      return ACE_HIGH_VALUE;
    case 'J':
    case 'Q':
    case 'K':
      return FACE_CARD_VALUE;
    default:
      return parseInt(rank, 10);
  }
};

export const calculateHandValue = (cards: Card[]): number => {
  if (cards.length === 0) {
    return 0;
  }

  let value = 0;
  let aceCount = 0;

  for (const card of cards) {
    value += getRankValue(card.rank);
    if (card.rank === 'A') {
      aceCount++;
    }
  }

  while (value > BLACKJACK_VALUE && aceCount > 0) {
    value -= ACE_ADJUSTMENT;
    aceCount--;
  }

  return value;
};

export const isBust = (cards: Card[]): boolean => {
  return calculateHandValue(cards) > BLACKJACK_VALUE;
};

export const isBlackjack = (cards: Card[]): boolean => {
  if (cards.length !== BLACKJACK_CARD_COUNT) {
    return false;
  }

  const value = calculateHandValue(cards);
  if (value !== BLACKJACK_VALUE) {
    return false;
  }

  const hasAce = cards.some(card => card.rank === 'A');
  const hasTenValue = cards.some(card => ['10', 'J', 'Q', 'K'].includes(card.rank));

  return hasAce && hasTenValue;
};

const calculateSoftValue = (cards: Card[]): number | undefined => {
  const hasAce = cards.some(card => card.rank === 'A');
  if (!hasAce) {
    return undefined;
  }

  let value = 0;
  for (const card of cards) {
    if (card.rank === 'A') {
      value += ACE_LOW_VALUE;
    } else {
      value += getRankValue(card.rank);
    }
  }

  return value <= BLACKJACK_VALUE ? value : undefined;
};

export const createHand = (cards: Card[]): Hand => {
  const value = calculateHandValue(cards);
  return {
    cards,
    value,
    softValue: calculateSoftValue(cards),
    isBust: value > BLACKJACK_VALUE,
    isBlackjack: isBlackjack(cards),
  };
};

export const addCardToHand = (hand: Hand, card: Card): Hand => {
  const newCards = [...hand.cards, card];
  return createHand(newCards);
};

export const calculateVisibleValue = (cards: Card[]): number => {
  const visibleCards = cards.filter(card => card.faceUp);
  return calculateHandValue(visibleCards);
};