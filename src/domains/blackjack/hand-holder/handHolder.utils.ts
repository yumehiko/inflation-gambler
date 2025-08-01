import { Card } from '../../core/card/card.types';
import { createHand, addCardToHand } from '../hand/hand.utils';
import {
  HandHolder,
  HandHolderType,
  HandHolderAction,
  ActionAvailability,
} from './handHolder.types';

const INITIAL_CARD_COUNT = 2;

export const createHandHolder = (id: string, type: HandHolderType): HandHolder => {
  return {
    id,
    type,
    hand: createHand([]),
    status: 'waiting',
  };
};

export const updateHandHolderStatus = (holder: HandHolder): HandHolder => {
  if (holder.status === 'stand') {
    return holder;
  }

  if (holder.hand.isBlackjack) {
    return { ...holder, status: 'blackjack' };
  }

  if (holder.hand.isBust) {
    return { ...holder, status: 'bust' };
  }

  return holder;
};

export const canSplit = (cards: Card[]): boolean => {
  if (cards.length !== INITIAL_CARD_COUNT) {
    return false;
  }

  return cards[0].rank === cards[1].rank;
};

export const canDouble = (cards: Card[]): boolean => {
  return cards.length === INITIAL_CARD_COUNT;
};

export const canPerformAction = (holder: HandHolder, action: HandHolderAction): boolean => {
  if (holder.status !== 'active') {
    return false;
  }

  switch (action) {
    case 'hit':
      return !holder.hand.isBust;
    case 'stand':
      return true;
    case 'double':
      return holder.type === 'participant' && canDouble(holder.hand.cards);
    case 'split':
      return holder.type === 'participant' && canSplit(holder.hand.cards);
    default:
      return false;
  }
};

export const getAvailableActions = (holder: HandHolder): ActionAvailability => {
  return {
    canHit: canPerformAction(holder, 'hit'),
    canStand: canPerformAction(holder, 'stand'),
    canDouble: canPerformAction(holder, 'double'),
    canSplit: canPerformAction(holder, 'split'),
  };
};

export const addCardToHandHolder = (holder: HandHolder, card: Card): HandHolder => {
  const newHand = addCardToHand(holder.hand, card);
  const updatedHolder = { ...holder, hand: newHand };
  return updateHandHolderStatus(updatedHolder);
};