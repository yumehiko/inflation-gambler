import { describe, it, expect } from 'vitest';
import { createPlayer, isHuman, canAct, updatePlayerHand, placeBet, requestBet, winBet, loseBet } from './player.utils';
import { Player } from './player.types';
import { Hand } from '../hand/hand.types';
import { Brain } from '../brain/brain.types';
import { Card } from '../../core/card/card.types';

describe('player.utils', () => {
  const mockHumanBrain: Brain = {
    type: 'human',
    makeDecision: async () => 'stand',
    decideBet: async () => 100,
  };

  const mockCpuBrain: Brain = {
    type: 'cpu-easy',
    makeDecision: async () => 'hit',
    decideBet: async () => 50,
  };

  describe('createPlayer', () => {
    it('should create a new player with default values', () => {
      const player = createPlayer('player1', 'John', mockHumanBrain, 1000);

      expect(player).toEqual({
        id: 'player1',
        name: 'John',
        hand: {
          cards: [],
          value: 0,
          isBust: false,
          isBlackjack: false,
        },
        brain: mockHumanBrain,
        chips: 1000,
        currentBet: 0,
        isActive: false,
        hasStood: false,
        hasBusted: false,
      });
    });
  });

  describe('isHuman', () => {
    it('should return true for human player', () => {
      const player = createPlayer('player1', 'John', mockHumanBrain, 1000);
      expect(isHuman(player)).toBe(true);
    });

    it('should return false for CPU player', () => {
      const player = createPlayer('player1', 'CPU', mockCpuBrain, 1000);
      expect(isHuman(player)).toBe(false);
    });
  });

  describe('canAct', () => {
    it('should return true when player is active and has not stood or busted', () => {
      const player: Player = {
        ...createPlayer('player1', 'John', mockHumanBrain, 1000),
        isActive: true,
      };
      expect(canAct(player)).toBe(true);
    });

    it('should return false when player is not active', () => {
      const player = createPlayer('player1', 'John', mockHumanBrain, 1000);
      expect(canAct(player)).toBe(false);
    });

    it('should return false when player has stood', () => {
      const player: Player = {
        ...createPlayer('player1', 'John', mockHumanBrain, 1000),
        isActive: true,
        hasStood: true,
      };
      expect(canAct(player)).toBe(false);
    });

    it('should return false when player has busted', () => {
      const player: Player = {
        ...createPlayer('player1', 'John', mockHumanBrain, 1000),
        isActive: true,
        hasBusted: true,
      };
      expect(canAct(player)).toBe(false);
    });
  });

  describe('updatePlayerHand', () => {
    it('should update player hand', () => {
      const player = createPlayer('player1', 'John', mockHumanBrain, 1000);
      const newHand: Hand = {
        cards: [{ suit: 'hearts', rank: 'A' } as Card],
        value: 11,
        softValue: 1,
        isBust: false,
        isBlackjack: false,
      };

      const updatedPlayer = updatePlayerHand(player, newHand);

      expect(updatedPlayer.hand).toEqual(newHand);
      expect(updatedPlayer.hasBusted).toBe(false);
    });

    it('should set hasBusted to true when hand is bust', () => {
      const player = createPlayer('player1', 'John', mockHumanBrain, 1000);
      const bustHand: Hand = {
        cards: [],
        value: 22,
        isBust: true,
        isBlackjack: false,
      };

      const updatedPlayer = updatePlayerHand(player, bustHand);

      expect(updatedPlayer.hasBusted).toBe(true);
    });
  });

  describe('placeBet', () => {
    it('should place bet and deduct from chips', () => {
      const player = createPlayer('player1', 'John', mockHumanBrain, 1000);
      const updatedPlayer = placeBet(player, 100);

      expect(updatedPlayer.currentBet).toBe(100);
      expect(updatedPlayer.chips).toBe(900);
    });

    it('should throw error when bet exceeds chips', () => {
      const player = createPlayer('player1', 'John', mockHumanBrain, 100);
      expect(() => placeBet(player, 200)).toThrow('Insufficient chips');
    });

    it('should throw error when bet is negative', () => {
      const player = createPlayer('player1', 'John', mockHumanBrain, 1000);
      expect(() => placeBet(player, -100)).toThrow('Invalid bet amount');
    });
  });

  describe('requestBet', () => {
    it('should call brain decideBet with correct context', async () => {
      const mockBetAmount = 250;
      const mockBrain: Brain = {
        type: 'human',
        makeDecision: async () => 'stand',
        decideBet: async (context) => {
          expect(context.chips).toBe(1000);
          expect(context.minBet).toBe(10);
          expect(context.maxBet).toBe(500);
          return mockBetAmount;
        },
      };
      
      const player = createPlayer('player1', 'John', mockBrain, 1000);
      const betAmount = await requestBet(player, 10, 500);
      
      expect(betAmount).toBe(mockBetAmount);
    });

    it('should work with CPU brain', async () => {
      const player = createPlayer('cpu1', 'CPU', mockCpuBrain, 1000);
      const betAmount = await requestBet(player, 10, 500);
      
      expect(betAmount).toBe(50); // mockCpuBrain returns 50
    });
  });

  describe('winBet', () => {
    it('should add winnings to chips with 1:1 payout', () => {
      const player: Player = {
        ...createPlayer('player1', 'John', mockHumanBrain, 1000),
        currentBet: 100,
        chips: 900,
      };
      const updatedPlayer = winBet(player, 1);

      expect(updatedPlayer.chips).toBe(1100); // 900 + 100 (original bet) + 100 (winnings)
      expect(updatedPlayer.currentBet).toBe(0);
    });

    it('should add winnings to chips with 3:2 payout for blackjack', () => {
      const player: Player = {
        ...createPlayer('player1', 'John', mockHumanBrain, 1000),
        currentBet: 100,
        chips: 900,
      };
      const updatedPlayer = winBet(player, 1.5);

      expect(updatedPlayer.chips).toBe(1150); // 900 + 100 (original bet) + 150 (winnings)
      expect(updatedPlayer.currentBet).toBe(0);
    });
  });

  describe('loseBet', () => {
    it('should reset current bet to 0', () => {
      const player: Player = {
        ...createPlayer('player1', 'John', mockHumanBrain, 1000),
        currentBet: 100,
        chips: 900,
      };
      const updatedPlayer = loseBet(player);

      expect(updatedPlayer.chips).toBe(900); // No change
      expect(updatedPlayer.currentBet).toBe(0);
    });
  });
});