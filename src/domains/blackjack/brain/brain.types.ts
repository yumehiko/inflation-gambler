import type { Card } from '../../core/card/card.types';
import type { Hand } from '../hand/hand.types';

export type Decision = 'hit' | 'stand' | 'double' | 'split' | 'surrender' | 'insurance';

export type BrainType = 'human' | 'cpu-easy' | 'cpu-normal' | 'cpu-hard';

export type DecisionContext = {
  hand: Hand;
  dealerUpCard: Card;
  canDouble: boolean;
  canSplit: boolean;
  canSurrender: boolean;
  canInsurance: boolean;
};

export type Brain = {
  type: BrainType;
  makeDecision: (context: DecisionContext) => Decision;
};

export type DecisionHistory = {
  context: DecisionContext;
  decision: Decision;
  timestamp: number;
};