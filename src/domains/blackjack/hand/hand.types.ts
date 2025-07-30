import { Card } from '../../core/card/card.types';

export type Hand = {
  cards: Card[];
  value: number;
  softValue?: number;
  isBust: boolean;
  isBlackjack: boolean;
};