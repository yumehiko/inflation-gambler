import type { Decision, DecisionContext } from './brain.types';
import type { Card } from '../../core/card/card.types';

type StrategyAction = 'H' | 'S' | 'D' | 'Dh' | 'P' | 'Ph' | 'Rh' | 'Rs' | 'Rp';
type DealerCard = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'A';

const actionMap: Record<StrategyAction, { primary: Decision; fallback?: Decision }> = {
  H: { primary: 'hit' },
  S: { primary: 'stand' },
  D: { primary: 'double', fallback: 'hit' },
  Dh: { primary: 'double', fallback: 'hit' },
  P: { primary: 'split' },
  Ph: { primary: 'split', fallback: 'hit' },
  Rh: { primary: 'surrender', fallback: 'hit' },
  Rs: { primary: 'surrender', fallback: 'stand' },
  Rp: { primary: 'surrender', fallback: 'split' },
};

const hardStrategy: Record<number, Record<DealerCard, StrategyAction>> = {
  8: { '2': 'H', '3': 'H', '4': 'H', '5': 'H', '6': 'H', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
  9: { '2': 'H', '3': 'Dh', '4': 'Dh', '5': 'Dh', '6': 'Dh', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
  10: { '2': 'Dh', '3': 'Dh', '4': 'Dh', '5': 'Dh', '6': 'Dh', '7': 'Dh', '8': 'Dh', '9': 'Dh', '10': 'H', 'A': 'H' },
  11: { '2': 'Dh', '3': 'Dh', '4': 'Dh', '5': 'Dh', '6': 'Dh', '7': 'Dh', '8': 'Dh', '9': 'Dh', '10': 'Dh', 'A': 'H' },
  12: { '2': 'H', '3': 'H', '4': 'S', '5': 'S', '6': 'S', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
  13: { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
  14: { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
  15: { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'H', '8': 'H', '9': 'H', '10': 'Rh', 'A': 'Rh' },
  16: { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'H', '8': 'H', '9': 'Rh', '10': 'Rh', 'A': 'Rh' },
  17: { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'S', '8': 'S', '9': 'S', '10': 'S', 'A': 'S' },
  18: { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'S', '8': 'S', '9': 'S', '10': 'S', 'A': 'S' },
  19: { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'S', '8': 'S', '9': 'S', '10': 'S', 'A': 'S' },
  20: { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'S', '8': 'S', '9': 'S', '10': 'S', 'A': 'S' },
  21: { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'S', '8': 'S', '9': 'S', '10': 'S', 'A': 'S' },
};

const softStrategy: Record<number, Record<DealerCard, StrategyAction>> = {
  13: { '2': 'H', '3': 'H', '4': 'H', '5': 'Dh', '6': 'Dh', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
  14: { '2': 'H', '3': 'H', '4': 'H', '5': 'Dh', '6': 'Dh', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
  15: { '2': 'H', '3': 'H', '4': 'Dh', '5': 'Dh', '6': 'Dh', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
  16: { '2': 'H', '3': 'H', '4': 'Dh', '5': 'Dh', '6': 'Dh', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
  17: { '2': 'H', '3': 'Dh', '4': 'Dh', '5': 'Dh', '6': 'Dh', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
  18: { '2': 'S', '3': 'Dh', '4': 'Dh', '5': 'Dh', '6': 'Dh', '7': 'S', '8': 'S', '9': 'H', '10': 'H', 'A': 'H' },
  19: { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'S', '8': 'S', '9': 'S', '10': 'S', 'A': 'S' },
  20: { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'S', '8': 'S', '9': 'S', '10': 'S', 'A': 'S' },
  21: { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'S', '8': 'S', '9': 'S', '10': 'S', 'A': 'S' },
};

const pairStrategy: Record<string, Record<DealerCard, StrategyAction>> = {
  'A': { '2': 'P', '3': 'P', '4': 'P', '5': 'P', '6': 'P', '7': 'P', '8': 'P', '9': 'P', '10': 'P', 'A': 'P' },
  '10': { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'S', '8': 'S', '9': 'S', '10': 'S', 'A': 'S' },
  '9': { '2': 'P', '3': 'P', '4': 'P', '5': 'P', '6': 'P', '7': 'S', '8': 'P', '9': 'P', '10': 'S', 'A': 'S' },
  '8': { '2': 'P', '3': 'P', '4': 'P', '5': 'P', '6': 'P', '7': 'P', '8': 'P', '9': 'P', '10': 'P', 'A': 'P' },
  '7': { '2': 'P', '3': 'P', '4': 'P', '5': 'P', '6': 'P', '7': 'P', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
  '6': { '2': 'Ph', '3': 'P', '4': 'P', '5': 'P', '6': 'P', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
  '5': { '2': 'Dh', '3': 'Dh', '4': 'Dh', '5': 'Dh', '6': 'Dh', '7': 'Dh', '8': 'Dh', '9': 'Dh', '10': 'H', 'A': 'H' },
  '4': { '2': 'H', '3': 'H', '4': 'H', '5': 'Ph', '6': 'Ph', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
  '3': { '2': 'Ph', '3': 'Ph', '4': 'P', '5': 'P', '6': 'P', '7': 'P', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
  '2': { '2': 'Ph', '3': 'Ph', '4': 'P', '5': 'P', '6': 'P', '7': 'P', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
};

const getDealerCardValue = (card: Card): DealerCard => {
  if (card.rank === 'A') return 'A';
  if (['K', 'Q', 'J'].includes(card.rank)) return '10';
  return card.rank as DealerCard;
};

const isPair = (context: DecisionContext): boolean => {
  const { hand } = context;
  if (hand.cards.length !== 2) return false;
  return hand.cards[0].rank === hand.cards[1].rank;
};

const isSoftHand = (context: DecisionContext): boolean => {
  return context.hand.softValue !== undefined;
};

export const getBasicStrategyDecision = (context: DecisionContext): Decision => {
  const dealerCard = getDealerCardValue(context.dealerUpCard);

  // Check for pairs first
  if (context.canSplit && isPair(context)) {
    const pairRank = context.hand.cards[0].rank;
    const pairKey = ['K', 'Q', 'J'].includes(pairRank) ? '10' : pairRank;
    const action = pairStrategy[pairKey]?.[dealerCard];
    
    if (action) {
      const { primary, fallback } = actionMap[action];
      if (primary === 'split' && context.canSplit) {
        return primary;
      }
      if (fallback) {
        return fallback;
      }
    }
  }

  // Check for soft hands
  if (isSoftHand(context)) {
    const softValue = context.hand.softValue || context.hand.value;
    const action = softStrategy[softValue]?.[dealerCard];
    
    if (action) {
      const { primary, fallback } = actionMap[action];
      if (primary === 'double' && context.canDouble) {
        return primary;
      }
      if (fallback) {
        return fallback;
      }
      return primary;
    }
  }

  // Hard hand strategy
  const handValue = context.hand.value;
  let action: StrategyAction | undefined;

  if (handValue <= 8) {
    action = 'H';
  } else if (handValue >= 17) {
    action = 'S';
  } else {
    action = hardStrategy[handValue]?.[dealerCard];
  }

  if (action) {
    const { primary, fallback } = actionMap[action];
    
    if (primary === 'double' && !context.canDouble && fallback) {
      return fallback;
    }
    if (primary === 'surrender' && !context.canSurrender && fallback) {
      return fallback;
    }
    
    return primary;
  }

  // Default to stand if no strategy found
  return 'stand';
};

export const createBasicStrategyTable = () => ({
  hard: hardStrategy,
  soft: softStrategy,
  pairs: pairStrategy,
});