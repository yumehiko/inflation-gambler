import { describe, it, expect } from 'vitest';
import { getBasicStrategyDecision, createBasicStrategyTable } from './basicStrategy.utils';
import type { Card } from '../../core/card/card.types';
import type { Hand } from '../hand/hand.types';
import type { DecisionContext } from './brain.types';

describe('basicStrategy', () => {
  const createMockHand = (cards: Card[], value: number, softValue?: number): Hand => ({
    cards,
    value,
    softValue,
    isBust: false,
    isBlackjack: false,
  });

  const createMockCard = (rank: string, suit = 'hearts'): Card => ({
    rank: rank as Card['rank'],
    suit: suit as Card['suit'],
  });

  describe('getBasicStrategyDecision', () => {
    describe('hard hands', () => {
      it('should hit on hard 8 or less', () => {
        const context: DecisionContext = {
          hand: createMockHand([createMockCard('5'), createMockCard('3')], 8),
          dealerUpCard: createMockCard('10'),
          canDouble: true,
          canSplit: false,
          canSurrender: true,
          canInsurance: false,
        };
        expect(getBasicStrategyDecision(context)).toBe('hit');
      });

      it('should double on hard 11 vs dealer 2-10', () => {
        const context: DecisionContext = {
          hand: createMockHand([createMockCard('6'), createMockCard('5')], 11),
          dealerUpCard: createMockCard('7'),
          canDouble: true,
          canSplit: false,
          canSurrender: false,
          canInsurance: false,
        };
        expect(getBasicStrategyDecision(context)).toBe('double');
      });

      it('should hit on hard 11 vs dealer Ace when double not allowed', () => {
        const context: DecisionContext = {
          hand: createMockHand([createMockCard('6'), createMockCard('5')], 11),
          dealerUpCard: createMockCard('A'),
          canDouble: false,
          canSplit: false,
          canSurrender: false,
          canInsurance: false,
        };
        expect(getBasicStrategyDecision(context)).toBe('hit');
      });

      it('should stand on hard 17+ against any dealer card', () => {
        const context: DecisionContext = {
          hand: createMockHand([createMockCard('10'), createMockCard('7')], 17),
          dealerUpCard: createMockCard('A'),
          canDouble: false,
          canSplit: false,
          canSurrender: false,
          canInsurance: false,
        };
        expect(getBasicStrategyDecision(context)).toBe('stand');
      });

      it('should surrender hard 16 vs dealer 9, 10, A when allowed', () => {
        const context: DecisionContext = {
          hand: createMockHand([createMockCard('10'), createMockCard('6')], 16),
          dealerUpCard: createMockCard('10'),
          canDouble: false,
          canSplit: false,
          canSurrender: true,
          canInsurance: false,
        };
        expect(getBasicStrategyDecision(context)).toBe('surrender');
      });

      it('should hit hard 16 vs dealer 10 when surrender not allowed', () => {
        const context: DecisionContext = {
          hand: createMockHand([createMockCard('10'), createMockCard('6')], 16),
          dealerUpCard: createMockCard('10'),
          canDouble: false,
          canSplit: false,
          canSurrender: false,
          canInsurance: false,
        };
        expect(getBasicStrategyDecision(context)).toBe('hit');
      });

      it('should stand on hard 12 vs dealer 4-6', () => {
        const context: DecisionContext = {
          hand: createMockHand([createMockCard('8'), createMockCard('4')], 12),
          dealerUpCard: createMockCard('5'),
          canDouble: false,
          canSplit: false,
          canSurrender: false,
          canInsurance: false,
        };
        expect(getBasicStrategyDecision(context)).toBe('stand');
      });
    });

    describe('soft hands', () => {
      it('should double soft 13-14 (A,2-3) vs dealer 5-6', () => {
        const context: DecisionContext = {
          hand: createMockHand([createMockCard('A'), createMockCard('2')], 13, 13),
          dealerUpCard: createMockCard('6'),
          canDouble: true,
          canSplit: false,
          canSurrender: false,
          canInsurance: false,
        };
        expect(getBasicStrategyDecision(context)).toBe('double');
      });

      it('should hit soft 13-14 vs dealer 5-6 when double not allowed', () => {
        const context: DecisionContext = {
          hand: createMockHand([createMockCard('A'), createMockCard('2')], 13, 13),
          dealerUpCard: createMockCard('6'),
          canDouble: false,
          canSplit: false,
          canSurrender: false,
          canInsurance: false,
        };
        expect(getBasicStrategyDecision(context)).toBe('hit');
      });

      it('should stand on soft 19-21', () => {
        const context: DecisionContext = {
          hand: createMockHand([createMockCard('A'), createMockCard('8')], 19, 19),
          dealerUpCard: createMockCard('10'),
          canDouble: false,
          canSplit: false,
          canSurrender: false,
          canInsurance: false,
        };
        expect(getBasicStrategyDecision(context)).toBe('stand');
      });

      it('should double soft 18 vs dealer 3-6', () => {
        const context: DecisionContext = {
          hand: createMockHand([createMockCard('A'), createMockCard('7')], 18, 18),
          dealerUpCard: createMockCard('4'),
          canDouble: true,
          canSplit: false,
          canSurrender: false,
          canInsurance: false,
        };
        expect(getBasicStrategyDecision(context)).toBe('double');
      });

      it('should hit soft 18 vs dealer 9, 10, A', () => {
        const context: DecisionContext = {
          hand: createMockHand([createMockCard('A'), createMockCard('7')], 18, 18),
          dealerUpCard: createMockCard('A'),
          canDouble: false,
          canSplit: false,
          canSurrender: false,
          canInsurance: false,
        };
        expect(getBasicStrategyDecision(context)).toBe('hit');
      });
    });

    describe('pairs', () => {
      it('should always split Aces', () => {
        const context: DecisionContext = {
          hand: createMockHand([createMockCard('A'), createMockCard('A')], 12, 12),
          dealerUpCard: createMockCard('10'),
          canDouble: false,
          canSplit: true,
          canSurrender: false,
          canInsurance: false,
        };
        expect(getBasicStrategyDecision(context)).toBe('split');
      });

      it('should always split 8s', () => {
        const context: DecisionContext = {
          hand: createMockHand([createMockCard('8'), createMockCard('8')], 16),
          dealerUpCard: createMockCard('A'),
          canDouble: false,
          canSplit: true,
          canSurrender: false,
          canInsurance: false,
        };
        expect(getBasicStrategyDecision(context)).toBe('split');
      });

      it('should never split 10s', () => {
        const context: DecisionContext = {
          hand: createMockHand([createMockCard('10'), createMockCard('10')], 20),
          dealerUpCard: createMockCard('6'),
          canDouble: false,
          canSplit: true,
          canSurrender: false,
          canInsurance: false,
        };
        expect(getBasicStrategyDecision(context)).toBe('stand');
      });

      it('should split 2s and 3s vs dealer 2-7', () => {
        const context: DecisionContext = {
          hand: createMockHand([createMockCard('3'), createMockCard('3')], 6),
          dealerUpCard: createMockCard('5'),
          canDouble: false,
          canSplit: true,
          canSurrender: false,
          canInsurance: false,
        };
        expect(getBasicStrategyDecision(context)).toBe('split');
      });

      it('should not split 2s and 3s vs dealer 8+', () => {
        const context: DecisionContext = {
          hand: createMockHand([createMockCard('3'), createMockCard('3')], 6),
          dealerUpCard: createMockCard('8'),
          canDouble: false,
          canSplit: true,
          canSurrender: false,
          canInsurance: false,
        };
        expect(getBasicStrategyDecision(context)).toBe('hit');
      });

      it('should handle pair strategy when split not allowed', () => {
        const context: DecisionContext = {
          hand: createMockHand([createMockCard('8'), createMockCard('8')], 16),
          dealerUpCard: createMockCard('10'),
          canDouble: false,
          canSplit: false, // Split not allowed
          canSurrender: true,
          canInsurance: false,
        };
        // Should fall back to hard hand strategy (surrender 16 vs 10)
        expect(getBasicStrategyDecision(context)).toBe('surrender');
      });
    });

    describe('insurance', () => {
      it('should never take insurance', () => {
        const context: DecisionContext = {
          hand: createMockHand([createMockCard('10'), createMockCard('10')], 20),
          dealerUpCard: createMockCard('A'),
          canDouble: false,
          canSplit: false,
          canSurrender: false,
          canInsurance: true,
        };
        // Should continue with regular decision
        expect(getBasicStrategyDecision(context)).toBe('stand');
      });
    });
  });

  describe('createBasicStrategyTable', () => {
    it('should create a strategy table object', () => {
      const table = createBasicStrategyTable();
      
      expect(table).toHaveProperty('hard');
      expect(table).toHaveProperty('soft');
      expect(table).toHaveProperty('pairs');
      
      // Check some specific entries
      expect(table.hard[11]).toBeDefined();
      expect(table.soft[18]).toBeDefined();
      expect(table.pairs['A']).toBeDefined();
    });
  });
});