import { describe, it, expect } from 'vitest';
import { createHumanBrain, isValidDecision, validateDecisionContext } from './brain.utils';
import type { Card } from '../../core/card/card.types';
import type { Hand } from '../hand/hand.types';
import type { Decision, DecisionContext } from './brain.types';

describe('brain.utils', () => {
  const createMockHand = (cards: Card[], value: number, isBust = false, isBlackjack = false): Hand => ({
    cards,
    value,
    isBust,
    isBlackjack,
  });

  const createMockCard = (rank: string, suit = 'hearts'): Card => ({
    rank: rank as Card['rank'],
    suit: suit as Card['suit'],
  });

  describe('createHumanBrain', () => {
    it('should create a human brain with correct type', () => {
      const brain = createHumanBrain();
      expect(brain.type).toBe('human');
    });

    it('should have makeDecision function', () => {
      const brain = createHumanBrain();
      expect(typeof brain.makeDecision).toBe('function');
    });

    it('should throw error when makeDecision is called (requires user input)', () => {
      const brain = createHumanBrain();
      const context: DecisionContext = {
        hand: createMockHand([createMockCard('10'), createMockCard('7')], 17),
        dealerUpCard: createMockCard('A'),
        canDouble: true,
        canSplit: false,
        canSurrender: true,
        canInsurance: true,
      };
      
      expect(() => brain.makeDecision(context)).toThrow('Human decision requires user input - use UI interaction to get player decision');
    });
  });

  describe('isValidDecision', () => {
    const context: DecisionContext = {
      hand: createMockHand([createMockCard('10'), createMockCard('10')], 20),
      dealerUpCard: createMockCard('7'),
      canDouble: true,
      canSplit: true,
      canSurrender: true,
      canInsurance: false,
    };

    it('should return true for always valid decisions', () => {
      expect(isValidDecision('hit', context)).toBe(true);
      expect(isValidDecision('stand', context)).toBe(true);
    });

    it('should validate double based on context', () => {
      expect(isValidDecision('double', context)).toBe(true);
      expect(isValidDecision('double', { ...context, canDouble: false })).toBe(false);
    });

    it('should validate split based on context', () => {
      expect(isValidDecision('split', context)).toBe(true);
      expect(isValidDecision('split', { ...context, canSplit: false })).toBe(false);
    });

    it('should validate surrender based on context', () => {
      expect(isValidDecision('surrender', context)).toBe(true);
      expect(isValidDecision('surrender', { ...context, canSurrender: false })).toBe(false);
    });

    it('should validate insurance based on context', () => {
      expect(isValidDecision('insurance', { ...context, canInsurance: true })).toBe(true);
      expect(isValidDecision('insurance', context)).toBe(false);
    });

    it('should return false for invalid decision', () => {
      expect(isValidDecision('invalid' as Decision, context)).toBe(false);
    });
  });

  describe('validateDecisionContext', () => {
    it('should not throw for valid context', () => {
      const context: DecisionContext = {
        hand: createMockHand([createMockCard('10'), createMockCard('7')], 17),
        dealerUpCard: createMockCard('A'),
        canDouble: true,
        canSplit: false,
        canSurrender: true,
        canInsurance: true,
      };

      expect(() => validateDecisionContext(context)).not.toThrow();
    });

    it('should throw for bust hand', () => {
      const context: DecisionContext = {
        hand: createMockHand([createMockCard('10'), createMockCard('10'), createMockCard('5')], 25, true),
        dealerUpCard: createMockCard('A'),
        canDouble: false,
        canSplit: false,
        canSurrender: false,
        canInsurance: false,
      };

      expect(() => validateDecisionContext(context)).toThrow('Cannot make decision on bust hand');
    });

    it('should throw for blackjack hand', () => {
      const context: DecisionContext = {
        hand: createMockHand([createMockCard('A'), createMockCard('K')], 21, false, true),
        dealerUpCard: createMockCard('7'),
        canDouble: false,
        canSplit: false,
        canSurrender: false,
        canInsurance: false,
      };

      expect(() => validateDecisionContext(context)).toThrow('Cannot make decision on blackjack hand');
    });

    it('should throw for empty hand', () => {
      const context: DecisionContext = {
        hand: createMockHand([], 0),
        dealerUpCard: createMockCard('A'),
        canDouble: false,
        canSplit: false,
        canSurrender: false,
        canInsurance: false,
      };

      expect(() => validateDecisionContext(context)).toThrow('Hand must have cards');
    });

    it('should throw for invalid context flags', () => {
      const context: DecisionContext = {
        hand: createMockHand([createMockCard('5'), createMockCard('6')], 11),
        dealerUpCard: createMockCard('A'),
        canDouble: true,
        canSplit: true, // Cannot split non-pair
        canSurrender: false,
        canInsurance: false,
      };

      expect(() => validateDecisionContext(context)).toThrow('Invalid context: cannot split non-pair');
    });

    it('should validate pair for split', () => {
      const context: DecisionContext = {
        hand: createMockHand([createMockCard('8'), createMockCard('8')], 16),
        dealerUpCard: createMockCard('A'),
        canDouble: true,
        canSplit: true, // Valid for pair
        canSurrender: true,
        canInsurance: false,
      };

      expect(() => validateDecisionContext(context)).not.toThrow();
    });

    it('should validate dealer ace for insurance', () => {
      const contextWithInsurance: DecisionContext = {
        hand: createMockHand([createMockCard('10'), createMockCard('7')], 17),
        dealerUpCard: createMockCard('A'),
        canDouble: false,
        canSplit: false,
        canSurrender: false,
        canInsurance: true, // Valid with dealer Ace
      };

      expect(() => validateDecisionContext(contextWithInsurance)).not.toThrow();

      const contextWithoutAce: DecisionContext = {
        ...contextWithInsurance,
        dealerUpCard: createMockCard('7'),
      };

      expect(() => validateDecisionContext(contextWithoutAce)).toThrow('Invalid context: insurance only available with dealer Ace');
    });
  });
});