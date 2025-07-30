import { Card, Suit, Rank } from '../card/card.types';
import { Deck } from './deck.types';

export const createDeck = (): Deck => {
  const suits: Suit[] = ['hearts', 'diamonds', 'spades', 'clubs'];
  const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  
  const deck: Deck = [];
  
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }
  
  return deck;
};

export const shuffleDeck = (deck: Deck): Deck => {
  const shuffled = [...deck];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
};

export const drawCard = (deck: Deck): { card: Card; remainingDeck: Deck } => {
  if (deck.length === 0) {
    throw new Error('Cannot draw from an empty deck');
  }
  
  const [card, ...remainingDeck] = deck;
  
  return {
    card,
    remainingDeck,
  };
};