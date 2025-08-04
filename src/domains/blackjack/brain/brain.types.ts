import type { Card } from '../../core/card/card.types';
import type { Hand } from '../hand/hand.types';

export type Decision = 'hit' | 'stand' | 'double' | 'split' | 'surrender' | 'insurance';

export type BrainType = 'human' | 'random' | 'basic' | 'cpu-easy' | 'cpu-normal' | 'cpu-hard';

export type DecisionContext = {
  hand: Hand;
  dealerUpCard: Card;
  canDouble: boolean;
  canSplit: boolean;
  canSurrender: boolean;
  canInsurance: boolean;
};

export type BetContext = {
  chips: number;
  minBet: number;
  maxBet: number;
};

export type Brain = {
  type: BrainType;
  makeDecision: (context: DecisionContext) => Promise<Decision>;
  decideBet: (context: BetContext) => Promise<number>;
};
export type DecisionResolver = {
  waitForDecision: (context: DecisionContext) => Promise<Decision>;
};

export type BetResolver = {
  waitForBet: (context: BetContext) => Promise<number>;
};

export type HumanResolver = DecisionResolver & BetResolver;

export type DecisionHistory = {
  context: DecisionContext;
  decision: Decision;
  timestamp: number;
};