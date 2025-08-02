import type { Brain, Decision, DecisionContext, DecisionResolver } from './brain.types';

export const createHumanBrain = (resolver: DecisionResolver): Brain => ({
  type: 'human',
  makeDecision: async (context: DecisionContext): Promise<Decision> => {
    return resolver.waitForDecision(context);
  },
});

export const isValidDecision = (decision: Decision, context: DecisionContext): boolean => {
  switch (decision) {
    case 'hit':
    case 'stand':
      return true;
    case 'double':
      return context.canDouble;
    case 'split':
      return context.canSplit;
    case 'surrender':
      return context.canSurrender;
    case 'insurance':
      return context.canInsurance;
    default:
      return false;
  }
};

export const validateDecisionContext = (context: DecisionContext): void => {
  const { hand, dealerUpCard, canSplit, canInsurance } = context;

  if (hand.isBust) {
    throw new Error('Cannot make decision on bust hand');
  }

  if (hand.isBlackjack) {
    throw new Error('Cannot make decision on blackjack hand');
  }

  if (hand.cards.length === 0) {
    throw new Error('Hand must have cards');
  }

  // Validate split: can only split pairs
  if (canSplit && hand.cards.length === 2) {
    const [card1, card2] = hand.cards;
    if (card1.rank !== card2.rank) {
      throw new Error('Invalid context: cannot split non-pair');
    }
  }

  // Validate insurance: only available when dealer shows Ace
  if (canInsurance && dealerUpCard.rank !== 'A') {
    throw new Error('Invalid context: insurance only available with dealer Ace');
  }
};

export const getAvailableDecisions = (context: DecisionContext): Decision[] => {
  const decisions: Decision[] = ['hit', 'stand'];

  if (context.canDouble) {
    decisions.push('double');
  }

  if (context.canSplit) {
    decisions.push('split');
  }

  if (context.canSurrender) {
    decisions.push('surrender');
  }

  if (context.canInsurance) {
    decisions.push('insurance');
  }

  return decisions;
};