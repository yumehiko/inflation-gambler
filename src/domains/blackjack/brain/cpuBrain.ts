import type { Brain, BetContext, BrainType, Decision, DecisionContext } from './brain.types';
import { getBasicStrategyDecision } from './basicStrategy';
import { getAvailableDecisions } from './brain.utils';

/**
 * Creates an easy CPU brain that makes random but somewhat sensible decisions
 */
export const createEasyCpuBrain = (): Brain => ({
  type: 'cpu-easy',
  makeDecision: async (context: DecisionContext): Promise<Decision> => {
    const availableDecisions = getAvailableDecisions(context);
    
    // Bias towards safe plays based on hand value
    if (context.hand.value >= 19) {
      // Strong bias towards standing on good hands
      const weights = availableDecisions.map(d => d === 'stand' ? 20 : 1);
      return weightedRandomChoice(availableDecisions, weights);
    } else if (context.hand.value <= 11) {
      // Bias towards hitting on low hands
      const weights = availableDecisions.map(d => {
        if (d === 'hit') return 5;
        if (d === 'double') return 2;
        return 1;
      });
      return weightedRandomChoice(availableDecisions, weights);
    }
    
    // Random choice for middle values
    return availableDecisions[Math.floor(Math.random() * availableDecisions.length)];
  },
  decideBet: async (context: BetContext): Promise<number> => {
    // Easy CPU always bets the minimum
    return context.minBet;
  },
});

/**
 * Creates a normal CPU brain that follows basic strategy
 */
export const createNormalCpuBrain = (): Brain => ({
  type: 'cpu-normal',
  makeDecision: async (context: DecisionContext): Promise<Decision> => {
    return getBasicStrategyDecision(context);
  },
  decideBet: async (context: BetContext): Promise<number> => {
    // Normal CPU bets 10-20% of chips
    const betPercentage = 0.1 + Math.random() * 0.1;
    const suggestedBet = Math.floor(context.chips * betPercentage);
    
    // Ensure bet is within limits
    return Math.max(context.minBet, Math.min(suggestedBet, context.maxBet));
  },
});

/**
 * Creates a hard CPU brain that uses card counting hints and deviations.
 * Accepts an optional RNG function for deterministic testing.
 */
export const createHardCpuBrain = (rng: () => number = Math.random): Brain => ({
  type: 'cpu-hard',
  makeDecision: async (context: DecisionContext): Promise<Decision> => {
    // Simulate card counting with random value (in real game, this would track actual cards)
    const count = rng() * 2 - 1; // Range from -1 to 1
    
    // High positive count means deck is rich in high cards (10s and Aces)
    // Negative count means deck is rich in low cards
    
    // Insurance deviation: take insurance with very high count
    if (context.canInsurance && count > 0.8) {
      return 'insurance';
    }
    
    // 16 vs 10 deviation: stand with positive count
    if (context.hand.value === 16 && 
        context.dealerUpCard.rank === '10' && 
        count > 0.3 &&
        !context.hand.softValue) {
      if (context.canSurrender && count > 0.5) {
        return 'surrender';
      }
      return 'stand';
    }
    
    // 12 vs 3 deviation: hit with negative count
    if (context.hand.value === 12 && 
        context.dealerUpCard.rank === '3' && 
        count < -0.3 &&
        !context.hand.softValue) {
      return 'hit';
    }
    
    // 10 vs 10 deviation: double with high count
    if (context.hand.value === 10 && 
        context.dealerUpCard.rank === '10' && 
        count > 0.6 &&
        context.canDouble) {
      return 'double';
    }
    
    // Otherwise follow basic strategy
    return getBasicStrategyDecision(context);
  },
  decideBet: async (context: BetContext): Promise<number> => {
    // Hard CPU varies bet based on simulated count
    const count = rng() * 2 - 1; // Range from -1 to 1
    
    // Bet more when count is high (favorable deck)
    let betMultiplier: number;
    if (count > 0.5) {
      betMultiplier = 0.3; // Bet 30% of chips
    } else if (count > 0) {
      betMultiplier = 0.2; // Bet 20% of chips
    } else {
      betMultiplier = 0.1; // Bet 10% of chips
    }
    
    const suggestedBet = Math.floor(context.chips * betMultiplier);
    return Math.max(context.minBet, Math.min(suggestedBet, context.maxBet));
  },
});

/**
 * Factory function to create CPU brains
 */
export const createCpuBrain = (type: BrainType): Brain => {
  switch (type) {
    case 'cpu-easy':
      return createEasyCpuBrain();
    case 'cpu-normal':
      return createNormalCpuBrain();
    case 'cpu-hard':
      return createHardCpuBrain();
    default:
      throw new Error(`Invalid CPU brain type: ${type}. Valid types are: cpu-easy, cpu-normal, cpu-hard`);
  }
};

/**
 * Helper function for weighted random choice
 */
const weightedRandomChoice = <T>(choices: T[], weights: number[]): T => {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < choices.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return choices[i];
    }
  }
  
  // Fallback to last choice
  return choices[choices.length - 1];
};