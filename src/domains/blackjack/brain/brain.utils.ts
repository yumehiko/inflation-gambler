import type { Brain, BetContext, Decision, DecisionContext, HumanResolver } from './brain.types';

export const createHumanBrain = (resolver?: HumanResolver): Brain => ({
  type: 'human',
  makeDecision: async (context: DecisionContext): Promise<Decision> => {
    if (!resolver) {
      throw new Error('Human resolver not provided');
    }
    return resolver.waitForDecision(context);
  },
  decideBet: async (context: BetContext): Promise<number> => {
    if (!resolver) {
      throw new Error('Human resolver not provided');
    }
    return resolver.waitForBet(context);
  },
});

export const createRandomBrain = (): Brain => {
  return {
    type: 'random',
    makeDecision: async (context: DecisionContext): Promise<Decision> => {
      const availableDecisions = getAvailableDecisions(context);
      const randomIndex = Math.floor(Math.random() * availableDecisions.length);
      return availableDecisions[randomIndex];
    },
    decideBet: async (context: BetContext): Promise<number> => {
      const { minBet, maxBet, chips } = context;
      const maxAffordable = Math.min(maxBet, chips);
      const minAffordable = Math.min(minBet, chips);
      
      if (minAffordable > chips) {
        return 0; // Can't afford minimum bet
      }
      
      // Random bet between min and max affordable
      return Math.floor(Math.random() * (maxAffordable - minAffordable + 1)) + minAffordable;
    },
  };
};

export const createBasicStrategyBrain = (): Brain => {
  return {
    type: 'basic',
    makeDecision: async (context: DecisionContext): Promise<Decision> => {
      const { hand, dealerUpCard } = context;
      const playerTotal = hand.value;
      const dealerValue = dealerUpCard.rank === 'A' ? 11 : 
                          ['K', 'Q', 'J'].includes(dealerUpCard.rank) ? 10 : 
                          parseInt(dealerUpCard.rank);
      
      // Basic blackjack strategy
      if (hand.softValue !== undefined) {
        // Soft hand strategy
        if (playerTotal >= 19) return 'stand';
        if (playerTotal === 18) {
          return dealerValue >= 9 ? 'hit' : 'stand';
        }
        return 'hit';
      } else {
        // Hard hand strategy
        if (playerTotal >= 17) return 'stand';
        if (playerTotal >= 13 && dealerValue <= 6) return 'stand';
        if (playerTotal === 12 && dealerValue >= 4 && dealerValue <= 6) return 'stand';
        return 'hit';
      }
    },
    decideBet: async (context: BetContext): Promise<number> => {
      const { minBet, maxBet, chips } = context;
      // Basic strategy: bet conservatively
      const betAmount = Math.min(minBet * 2, maxBet, chips);
      return betAmount;
    },
  };
};

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