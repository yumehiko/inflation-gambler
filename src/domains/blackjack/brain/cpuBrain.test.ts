import { describe, it, expect, vi } from 'vitest';
import { 
  createEasyCpuBrain, 
  createNormalCpuBrain, 
  createHardCpuBrain,
  createCpuBrain 
} from './cpuBrain';
import type { Card } from '../../core/card/card.types';
import type { Hand } from '../hand/hand.types';
import type { DecisionContext, BrainType } from './brain.types';

describe('cpuBrain', () => {
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

  describe('createEasyCpuBrain', () => {
    it('should create cpu-easy brain with correct type', () => {
      const brain = createEasyCpuBrain();
      expect(brain.type).toBe('cpu-easy');
    });

    it('should make random but valid decisions', async () => {
      const brain = createEasyCpuBrain();
      const context: DecisionContext = {
        hand: createMockHand([createMockCard('10'), createMockCard('5')], 15),
        dealerUpCard: createMockCard('7'),
        canDouble: true,
        canSplit: false,
        canSurrender: true,
        canInsurance: false,
      };

      // Run multiple times to check randomness
      const decisions = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const decision = await brain.makeDecision(context);
        decisions.add(decision);
        expect(['hit', 'stand', 'double', 'surrender']).toContain(decision);
      }

      // Should make at least 2 different decisions (showing randomness)
      expect(decisions.size).toBeGreaterThanOrEqual(2);
    });

    it('should only make valid decisions based on context', async () => {
      const brain = createEasyCpuBrain();
      const context: DecisionContext = {
        hand: createMockHand([createMockCard('10'), createMockCard('7')], 17),
        dealerUpCard: createMockCard('A'),
        canDouble: false,
        canSplit: false,
        canSurrender: false,
        canInsurance: true,
      };

      // Run multiple times
      for (let i = 0; i < 50; i++) {
        const decision = await brain.makeDecision(context);
        // Only hit, stand, and insurance should be possible
        expect(['hit', 'stand', 'insurance']).toContain(decision);
      }
    });

    it('should have bias towards safe plays on good hands', async () => {
      const brain = createEasyCpuBrain();
      const context: DecisionContext = {
        hand: createMockHand([createMockCard('10'), createMockCard('10')], 20),
        dealerUpCard: createMockCard('6'),
        canDouble: true,
        canSplit: true,
        canSurrender: true,
        canInsurance: false,
      };

      let standCount = 0;
      const iterations = 100;
      
      for (let i = 0; i < iterations; i++) {
        const decision = await brain.makeDecision(context);
        if (decision === 'stand') standCount++;
      }

      // Should mostly stand on 20
      expect(standCount / iterations).toBeGreaterThan(0.7);
    });
  });

  describe('createNormalCpuBrain', () => {
    it('should create cpu-normal brain with correct type', () => {
      const brain = createNormalCpuBrain();
      expect(brain.type).toBe('cpu-normal');
    });

    it('should follow basic strategy', async () => {
      const brain = createNormalCpuBrain();
      
      // Test basic strategy decision: always hit on 8 or less
      const context1: DecisionContext = {
        hand: createMockHand([createMockCard('5'), createMockCard('3')], 8),
        dealerUpCard: createMockCard('10'),
        canDouble: true,
        canSplit: false,
        canSurrender: false,
        canInsurance: false,
      };
      expect(await brain.makeDecision(context1)).toBe('hit');

      // Test basic strategy decision: stand on hard 17+
      const context2: DecisionContext = {
        hand: createMockHand([createMockCard('10'), createMockCard('7')], 17),
        dealerUpCard: createMockCard('A'),
        canDouble: false,
        canSplit: false,
        canSurrender: false,
        canInsurance: false,
      };
      expect(await brain.makeDecision(context2)).toBe('stand');

      // Test basic strategy decision: always split Aces
      const context3: DecisionContext = {
        hand: createMockHand([createMockCard('A'), createMockCard('A')], 12, 12),
        dealerUpCard: createMockCard('10'),
        canDouble: false,
        canSplit: true,
        canSurrender: false,
        canInsurance: false,
      };
      expect(await brain.makeDecision(context3)).toBe('split');
    });
  });

  describe('createHardCpuBrain', () => {
    it('should create cpu-hard brain with correct type', () => {
      const brain = createHardCpuBrain();
      expect(brain.type).toBe('cpu-hard');
    });

    it('should use basic strategy by default', async () => {
      // Use a fixed RNG value that won't trigger deviations
      const mockRng = vi.fn().mockReturnValue(0.0); // Neutral count
      const brain = createHardCpuBrain(mockRng);
      
      // Test that it follows basic strategy when no card counting info
      const context: DecisionContext = {
        hand: createMockHand([createMockCard('8'), createMockCard('8')], 16),
        dealerUpCard: createMockCard('10'),
        canDouble: false,
        canSplit: true,
        canSurrender: false,
        canInsurance: false,
      };
      
      // Basic strategy says always split 8s
      expect(await brain.makeDecision(context)).toBe('split');
    });

    it('should make conservative decisions with high remaining deck value', async () => {
      // Simulate high card rich deck (positive count)
      const mockRng = vi.fn().mockReturnValue(0.9); // High value simulating positive count
      const brain = createHardCpuBrain(mockRng);
      
      const context: DecisionContext = {
        hand: createMockHand([createMockCard('10'), createMockCard('6')], 16),
        dealerUpCard: createMockCard('10'),
        canDouble: false,
        canSplit: false,
        canSurrender: true,
        canInsurance: false,
      };
      
      // Should be more likely to surrender/stand with high count on 16 vs 10
      const decision = await brain.makeDecision(context);
      expect(['surrender', 'stand']).toContain(decision);
    });

    it('should make aggressive decisions with low remaining deck value', async () => {
      // Simulate low card rich deck (negative count)
      const mockRng = vi.fn().mockReturnValue(0.1); // Low value simulating negative count
      const brain = createHardCpuBrain(mockRng);
      
      const context: DecisionContext = {
        hand: createMockHand([createMockCard('10'), createMockCard('2')], 12),
        dealerUpCard: createMockCard('3'),
        canDouble: false,
        canSplit: false,
        canSurrender: false,
        canInsurance: false,
      };
      
      // Should be more likely to hit with negative count on 12 vs 3
      const decision = await brain.makeDecision(context);
      expect(decision).toBe('hit');
    });

    it('should take insurance with high count vs dealer Ace', async () => {
      // Simulate very high card rich deck
      const mockRng = vi.fn().mockReturnValue(0.95);
      const brain = createHardCpuBrain(mockRng);
      
      const context: DecisionContext = {
        hand: createMockHand([createMockCard('10'), createMockCard('10')], 20),
        dealerUpCard: createMockCard('A'),
        canDouble: false,
        canSplit: false,
        canSurrender: false,
        canInsurance: true,
      };
      
      // Should take insurance with very high count
      const decision = await brain.makeDecision(context);
      expect(decision).toBe('insurance');
    });
  });

  describe('createCpuBrain', () => {
    it('should create easy CPU brain', () => {
      const brain = createCpuBrain('cpu-easy');
      expect(brain.type).toBe('cpu-easy');
    });

    it('should create normal CPU brain', () => {
      const brain = createCpuBrain('cpu-normal');
      expect(brain.type).toBe('cpu-normal');
    });

    it('should create hard CPU brain', () => {
      const brain = createCpuBrain('cpu-hard');
      expect(brain.type).toBe('cpu-hard');
    });

    it('should throw error for invalid brain type', () => {
      expect(() => createCpuBrain('invalid' as BrainType)).toThrow('Invalid CPU brain type: invalid. Valid types are: cpu-easy, cpu-normal, cpu-hard');
    });

    it('should throw error for human brain type', () => {
      expect(() => createCpuBrain('human' as BrainType)).toThrow('Invalid CPU brain type: human. Valid types are: cpu-easy, cpu-normal, cpu-hard');
    });
  });
});