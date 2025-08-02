import { describe, it, expect } from 'vitest';
import {
  createDefaultRules,
  loadPresetRules,
  validateRules,
  canDouble,
  canSplit,
  canSurrender,
  calculatePayout,
} from './rules.utils';
import type { BlackjackRules } from './rules.types';
import type { HandHolder } from '../hand-holder/handHolder.types';

import type { Card, Suit, Rank } from '../../core/card/card.types';
import { createHand } from '../hand/hand.utils';

// テスト用のcreateCard関数
const createCard = (suit: Suit, rank: Rank, faceUp = true): Card => ({
  suit,
  rank,
  faceUp,
});

describe('rules.utils', () => {
  describe('createDefaultRules', () => {
    it('should create default Vegas rules', () => {
      const rules = createDefaultRules();
      
      expect(rules.deckCount).toBe(6);
      expect(rules.cutCardRatio).toBe(0.75);
      expect(rules.dealerStandsOn).toBe(17);
      expect(rules.dealerHitsSoft17).toBe(true);
      expect(rules.doubleAfterSplit).toBe(true);
      expect(rules.doubleOnAnyTwo).toBe(true);
      expect(rules.maxSplitHands).toBe(4);
      expect(rules.splitAces).toBe(true);
      expect(rules.hitSplitAces).toBe(false);
      expect(rules.surrenderAllowed).toBe(true);
      expect(rules.lateSurrender).toBe(true);
      expect(rules.blackjackPayout).toBe(1.5);
      expect(rules.insurancePayout).toBe(2.0);
      expect(rules.minBet).toBe(5);
      expect(rules.maxBet).toBe(500);
    });
  });

  describe('loadPresetRules', () => {
    it('should load Vegas preset', () => {
      const rules = loadPresetRules('vegas');
      expect(rules.deckCount).toBe(6);
      expect(rules.blackjackPayout).toBe(1.5);
      expect(rules.surrenderAllowed).toBe(true);
    });

    it('should load Atlantic City preset', () => {
      const rules = loadPresetRules('atlantic-city');
      expect(rules.deckCount).toBe(8);
      expect(rules.dealerStandsOn).toBe(17);
      expect(rules.dealerHitsSoft17).toBe(false);
      expect(rules.surrenderAllowed).toBe(true);
      expect(rules.lateSurrender).toBe(true);
    });

    it('should load European preset', () => {
      const rules = loadPresetRules('european');
      expect(rules.deckCount).toBe(6);
      expect(rules.dealerStandsOn).toBe(17);
      expect(rules.dealerHitsSoft17).toBe(false);
      expect(rules.surrenderAllowed).toBe(false);
      expect(rules.doubleAfterSplit).toBe(false);
    });

    it('should return default rules for custom preset', () => {
      const rules = loadPresetRules('custom');
      const defaultRules = createDefaultRules();
      expect(rules).toEqual(defaultRules);
    });
  });

  describe('validateRules', () => {
    it('should validate valid rules', () => {
      const rules = createDefaultRules();
      const errors = validateRules(rules);
      expect(errors).toHaveLength(0);
    });

    it('should detect invalid deck count', () => {
      const rules: BlackjackRules = {
        ...createDefaultRules(),
        deckCount: 0,
      };
      const errors = validateRules(rules);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('deckCount');
      expect(errors[0].message).toContain('1 and 8');
    });

    it('should detect invalid cut card ratio', () => {
      const rules: BlackjackRules = {
        ...createDefaultRules(),
        cutCardRatio: 0.3,
      };
      const errors = validateRules(rules);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('cutCardRatio');
    });

    it('should detect invalid max split hands', () => {
      const rules: BlackjackRules = {
        ...createDefaultRules(),
        maxSplitHands: 5,
      };
      const errors = validateRules(rules);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('maxSplitHands');
    });

    it('should detect invalid payout rates', () => {
      const rules: BlackjackRules = {
        ...createDefaultRules(),
        blackjackPayout: 0.5,
        insurancePayout: 0,
      };
      const errors = validateRules(rules);
      expect(errors).toHaveLength(2);
    });

    it('should detect invalid bet limits', () => {
      const rules: BlackjackRules = {
        ...createDefaultRules(),
        minBet: -1,
        maxBet: 100,
      };
      const errors = validateRules(rules);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('minBet');
    });

    it('should detect when minBet exceeds maxBet', () => {
      const rules: BlackjackRules = {
        ...createDefaultRules(),
        minBet: 1000,
        maxBet: 100,
      };
      const errors = validateRules(rules);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('minBet');
      expect(errors[0].message).toContain('exceed maxBet');
    });
  });

  describe('canDouble', () => {
    const createMockHandHolder = (cards: Card[]): HandHolder => ({
      id: 'test',
      type: 'participant',
      hand: createHand(cards),
      status: 'active',
    });

    it('should allow double on any two cards when enabled', () => {
      const rules: BlackjackRules = {
        ...createDefaultRules(),
        doubleOnAnyTwo: true,
      };
      const handHolder = createMockHandHolder([
        createCard('hearts', '5'),
        createCard('diamonds', '4'),
      ]);
      
      expect(canDouble(handHolder, rules, false)).toBe(true);
    });

    it('should restrict double to 9, 10, 11 when doubleOnAnyTwo is false', () => {
      const rules: BlackjackRules = {
        ...createDefaultRules(),
        doubleOnAnyTwo: false,
      };
      
      // Hand value 9
      const handHolder9 = createMockHandHolder([
        createCard('hearts', '5'),
        createCard('diamonds', '4'),
      ]);
      expect(canDouble(handHolder9, rules, false)).toBe(true);
      
      // Hand value 8
      const handHolder8 = createMockHandHolder([
        createCard('hearts', '5'),
        createCard('diamonds', '3'),
      ]);
      expect(canDouble(handHolder8, rules, false)).toBe(false);
    });

    it('should check doubleAfterSplit rule', () => {
      const handHolder = createMockHandHolder([
        createCard('hearts', '5'),
        createCard('diamonds', '5'),
      ]);
      
      const rulesWithDAS: BlackjackRules = {
        ...createDefaultRules(),
        doubleAfterSplit: true,
      };
      expect(canDouble(handHolder, rulesWithDAS, true)).toBe(true);
      
      const rulesWithoutDAS: BlackjackRules = {
        ...createDefaultRules(),
        doubleAfterSplit: false,
      };
      expect(canDouble(handHolder, rulesWithoutDAS, true)).toBe(false);
    });

    it('should not allow double with more than 2 cards', () => {
      const rules = createDefaultRules();
      const handHolder = createMockHandHolder([
        createCard('hearts', '5'),
        createCard('diamonds', '4'),
        createCard('clubs', '2'),
      ]);
      
      expect(canDouble(handHolder, rules, false)).toBe(false);
    });
  });

  describe('canSplit', () => {
    const createMockHandHolder = (cards: Card[]): HandHolder => ({
      id: 'test',
      type: 'participant',
      hand: createHand(cards),
      status: 'active',
    });

    it('should allow split when cards have same rank', () => {
      const rules = createDefaultRules();
      const handHolder = createMockHandHolder([
        createCard('hearts', 'K'),
        createCard('diamonds', 'K'),
      ]);
      
      expect(canSplit(handHolder, rules, 1)).toBe(true);
    });

    it('should not allow split when cards have different ranks', () => {
      const rules = createDefaultRules();
      const handHolder = createMockHandHolder([
        createCard('hearts', 'K'),
        createCard('diamonds', 'Q'),
      ]);
      
      expect(canSplit(handHolder, rules, 1)).toBe(false);
    });

    it('should check splitAces rule', () => {
      const handHolder = createMockHandHolder([
        createCard('hearts', 'A'),
        createCard('diamonds', 'A'),
      ]);
      
      const rulesWithSplitAces: BlackjackRules = {
        ...createDefaultRules(),
        splitAces: true,
      };
      expect(canSplit(handHolder, rulesWithSplitAces, 1)).toBe(true);
      
      const rulesWithoutSplitAces: BlackjackRules = {
        ...createDefaultRules(),
        splitAces: false,
      };
      expect(canSplit(handHolder, rulesWithoutSplitAces, 1)).toBe(false);
    });

    it('should check maxSplitHands limit', () => {
      const rules: BlackjackRules = {
        ...createDefaultRules(),
        maxSplitHands: 3,
      };
      const handHolder = createMockHandHolder([
        createCard('hearts', '8'),
        createCard('diamonds', '8'),
      ]);
      
      expect(canSplit(handHolder, rules, 2)).toBe(true);
      expect(canSplit(handHolder, rules, 3)).toBe(false);
    });

    it('should not allow split with more than 2 cards', () => {
      const rules = createDefaultRules();
      const handHolder = createMockHandHolder([
        createCard('hearts', '8'),
        createCard('diamonds', '8'),
        createCard('clubs', '8'),
      ]);
      
      expect(canSplit(handHolder, rules, 1)).toBe(false);
    });
  });

  describe('canSurrender', () => {
    it('should return true when surrender is allowed', () => {
      const rules: BlackjackRules = {
        ...createDefaultRules(),
        surrenderAllowed: true,
      };
      expect(canSurrender(rules)).toBe(true);
    });

    it('should return false when surrender is not allowed', () => {
      const rules: BlackjackRules = {
        ...createDefaultRules(),
        surrenderAllowed: false,
      };
      expect(canSurrender(rules)).toBe(false);
    });
  });

  describe('calculatePayout', () => {
    it('should calculate normal win payout', () => {
      const rules = createDefaultRules();
      const payout = calculatePayout('win', 100, false, rules);
      expect(payout).toBe(100);
    });

    it('should calculate blackjack payout', () => {
      const rules: BlackjackRules = {
        ...createDefaultRules(),
        blackjackPayout: 1.5,
      };
      const payout = calculatePayout('win', 100, true, rules);
      expect(payout).toBe(150);
    });

    it('should calculate blackjack payout with 6:5 ratio', () => {
      const rules: BlackjackRules = {
        ...createDefaultRules(),
        blackjackPayout: 1.2,
      };
      const payout = calculatePayout('win', 100, true, rules);
      expect(payout).toBe(120);
    });

    it('should calculate push payout', () => {
      const rules = createDefaultRules();
      const payout = calculatePayout('push', 100, false, rules);
      expect(payout).toBe(0);
    });

    it('should calculate loss payout', () => {
      const rules = createDefaultRules();
      const payout = calculatePayout('lose', 100, false, rules);
      expect(payout).toBe(-100);
    });
  });
});