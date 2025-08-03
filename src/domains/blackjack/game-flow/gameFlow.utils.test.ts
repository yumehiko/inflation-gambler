import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createGameFlow,
  canStartGame,
  canStartBetting,
  canDealCards,
  canStartPlayerTurn,
  canStartDealerTurn,
  canSettle,
  startBettingPhase,
  collectBets,
  dealInitialCards,
  checkBlackjacks,
  processPlayerTurn,
  processDealerTurn,
  settleGame,
  getNextPlayer,
  isGameComplete,
  calculatePayout,
} from './gameFlow.utils';
import { GameFlow, GameConfig, PlayerConfig } from './gameFlow.types';
import { Player } from '../player/player.types';
import { Dealer } from '../dealer/dealer.types';
import { Brain } from '../brain/brain.types';
import { Card } from '../../core/card/card.types';

const mockBrain: Brain = {
  type: 'human',
  makeDecision: vi.fn().mockResolvedValue('stand'),
  decideBet: vi.fn().mockResolvedValue(100),
};

const mockPlayerConfig: PlayerConfig = {
  id: 'player1',
  name: 'Test Player',
  brain: mockBrain,
  initialChips: 1000,
};

const mockGameConfig: GameConfig = {
  playerConfigs: [mockPlayerConfig],
  minBet: 10,
  maxBet: 500,
  deckCount: 1,
};

const mockCard: Card = {
  suit: 'spades',
  rank: 'A',
  faceUp: true,
};

const mockPlayer: Player = {
  id: 'player1',
  name: 'Test Player',
  hand: { cards: [], value: 0, softValue: undefined, isBust: false, isBlackjack: false },
  brain: mockBrain,
  chips: 1000,
  currentBet: 0,
  isActive: false,
  hasStood: false,
  hasBusted: false,
};

const mockDealer: Dealer = {
  id: 'dealer',
  hand: { cards: [], value: 0, softValue: undefined, isBust: false, isBlackjack: false },
  isShowingHoleCard: false,
};

describe('gameFlow.utils', () => {
  describe('createGameFlow', () => {
    it('should create a new game flow', () => {
      const gameFlow = createGameFlow(mockGameConfig);

      expect(gameFlow.phase).toBe('waiting');
      expect(gameFlow.playerIds).toEqual(['player1']);
      expect(gameFlow.dealerId).toBe('dealer');
      expect(gameFlow.currentPlayerId).toBeNull();
      expect(gameFlow.deck.length).toBeGreaterThan(0);
      expect(gameFlow.history).toEqual([]);
    });

    it('should create deck with correct number of cards', () => {
      const gameFlow = createGameFlow({ ...mockGameConfig, deckCount: 2 });
      expect(gameFlow.deck.length).toBe(104); // 52 * 2
    });
  });

  describe('phase validation functions', () => {
    let gameFlow: GameFlow;

    beforeEach(() => {
      gameFlow = createGameFlow(mockGameConfig);
    });

    it('canStartGame should return true when in waiting phase', () => {
      expect(canStartGame(gameFlow)).toBe(true);
      gameFlow = { ...gameFlow, phase: 'betting' };
      expect(canStartGame(gameFlow)).toBe(false);
    });

    it('canStartBetting should return true when in waiting phase', () => {
      expect(canStartBetting(gameFlow)).toBe(true);
      gameFlow = { ...gameFlow, phase: 'dealing' };
      expect(canStartBetting(gameFlow)).toBe(false);
    });

    it('canDealCards should return true when in betting phase', () => {
      gameFlow = { ...gameFlow, phase: 'betting' };
      expect(canDealCards(gameFlow)).toBe(true);
    });

    it('canStartPlayerTurn should return true when in dealing phase', () => {
      gameFlow = { ...gameFlow, phase: 'dealing' };
      expect(canStartPlayerTurn(gameFlow)).toBe(true);
    });

    it('canStartDealerTurn should return true when in playing phase', () => {
      gameFlow = { ...gameFlow, phase: 'playing' };
      expect(canStartDealerTurn(gameFlow)).toBe(true);
    });

    it('canSettle should return true when in dealerTurn phase', () => {
      gameFlow = { ...gameFlow, phase: 'dealerTurn' };
      expect(canSettle(gameFlow)).toBe(true);
    });
  });

  describe('startBettingPhase', () => {
    it('should change phase to betting and add event', () => {
      const gameFlow = createGameFlow(mockGameConfig);
      const updatedFlow = startBettingPhase(gameFlow);

      expect(updatedFlow.phase).toBe('betting');
      expect(updatedFlow.history).toHaveLength(1);
      expect(updatedFlow.history[0].type).toBe('game_started');
    });
  });

  describe('collectBets', () => {
    it('should collect bets from all players', async () => {
      const gameFlow = { ...createGameFlow(mockGameConfig), phase: 'betting' as const };
      const players = [mockPlayer];
      
      const updatedFlow = await collectBets(gameFlow, players);

      expect(updatedFlow.history).toContainEqual(
        expect.objectContaining({
          type: 'bet_placed',
          playerId: 'player1',
          amount: 100,
        })
      );
    });
  });

  describe('dealInitialCards', () => {
    it('should deal 2 cards to each player and dealer', () => {
      const gameFlow = { ...createGameFlow(mockGameConfig), phase: 'dealing' as const };
      const players = [mockPlayer];
      
      const updatedFlow = dealInitialCards(gameFlow, mockDealer, players);

      // Each player gets 2 cards + dealer gets 2 cards
      const cardDealtEvents = updatedFlow.history.filter(e => e.type === 'card_dealt');
      expect(cardDealtEvents).toHaveLength(4);
    });

    it('should reduce deck size after dealing', () => {
      const gameFlow = { ...createGameFlow(mockGameConfig), phase: 'dealing' as const };
      const initialDeckSize = gameFlow.deck.length;
      const players = [mockPlayer];
      
      const updatedFlow = dealInitialCards(gameFlow, mockDealer, players);

      expect(updatedFlow.deck.length).toBe(initialDeckSize - 4);
    });
  });

  describe('checkBlackjacks', () => {
    it('should check for blackjack for each player', () => {
      const gameFlow = { ...createGameFlow(mockGameConfig), phase: 'dealing' as const };
      const playerWithBlackjack = {
        ...mockPlayer,
        hand: { cards: [], value: 21, softValue: undefined, isBust: false, isBlackjack: true },
      };
      
      const updatedFlow = checkBlackjacks(gameFlow, mockDealer, [playerWithBlackjack]);

      expect(updatedFlow.history).toContainEqual(
        expect.objectContaining({
          type: 'blackjack_checked',
          playerId: 'player1',
          hasBlackjack: true,
        })
      );
    });
  });

  describe('processPlayerTurn', () => {
    it('should process player decision', async () => {
      const gameFlow = { ...createGameFlow(mockGameConfig), phase: 'playing' as const };
      
      const updatedFlow = await processPlayerTurn(gameFlow, mockPlayer);

      expect(updatedFlow.history).toContainEqual(
        expect.objectContaining({
          type: 'player_action',
          playerId: 'player1',
          action: 'stand',
        })
      );
    });

    it('should add busted event if player busts', async () => {
      const bustedPlayer = {
        ...mockPlayer,
        hasBusted: true,
      };
      const gameFlow = { ...createGameFlow(mockGameConfig), phase: 'playing' as const };
      
      const updatedFlow = await processPlayerTurn(gameFlow, bustedPlayer);

      expect(updatedFlow.history).toContainEqual(
        expect.objectContaining({
          type: 'player_busted',
          playerId: 'player1',
        })
      );
    });
  });

  describe('processDealerTurn', () => {
    it('should add dealer turn started event', async () => {
      const gameFlow = { ...createGameFlow(mockGameConfig), phase: 'dealerTurn' as const };
      
      const updatedFlow = await processDealerTurn(gameFlow);

      expect(updatedFlow.history).toContainEqual(
        expect.objectContaining({
          type: 'dealer_turn_started',
        })
      );
    });
  });

  describe('settleGame', () => {
    it('should calculate settlements and change phase to finished', () => {
      const gameFlow = { ...createGameFlow(mockGameConfig), phase: 'settlement' as const };
      const playerWithBet = { ...mockPlayer, currentBet: 100 };
      
      const updatedFlow = settleGame(gameFlow, mockDealer, [playerWithBet]);

      expect(updatedFlow.phase).toBe('finished');
      expect(updatedFlow.history).toContainEqual(
        expect.objectContaining({
          type: 'settlement_completed',
          results: expect.any(Array),
        })
      );
    });
  });

  describe('getNextPlayer', () => {
    it('should return next active player', () => {
      const gameFlow = {
        ...createGameFlow(mockGameConfig),
        phase: 'playing' as const,
        playerIds: ['player1', 'player2'],
        currentPlayerId: 'player1',
      };

      const nextPlayer = getNextPlayer(gameFlow);
      expect(nextPlayer).toBe('player2');
    });

    it('should return null if no more players', () => {
      const gameFlow = {
        ...createGameFlow(mockGameConfig),
        phase: 'playing' as const,
        playerIds: ['player1'],
        currentPlayerId: 'player1',
      };

      const nextPlayer = getNextPlayer(gameFlow);
      expect(nextPlayer).toBeNull();
    });
  });

  describe('isGameComplete', () => {
    it('should return true when phase is finished', () => {
      const gameFlow = { ...createGameFlow(mockGameConfig), phase: 'finished' as const };
      expect(isGameComplete(gameFlow)).toBe(true);
    });

    it('should return false for other phases', () => {
      const gameFlow = { ...createGameFlow(mockGameConfig), phase: 'playing' as const };
      expect(isGameComplete(gameFlow)).toBe(false);
    });
  });

  describe('calculatePayout', () => {
    it('should calculate win payout', () => {
      const player = { ...mockPlayer, currentBet: 100, hand: { cards: [], value: 20, softValue: undefined, isBust: false, isBlackjack: false } };
      const dealer = { ...mockDealer, hand: { cards: [], value: 18, softValue: undefined, isBust: false, isBlackjack: false } };
      
      const result = calculatePayout(player, dealer);
      
      expect(result.outcome).toBe('win');
      expect(result.payout).toBe(200); // bet + win
    });

    it('should calculate blackjack payout', () => {
      const player = { 
        ...mockPlayer, 
        currentBet: 100, 
        hand: { cards: [mockCard, mockCard], value: 21, softValue: 21, isBust: false, isBlackjack: true } 
      };
      const dealer = { ...mockDealer, hand: { cards: [], value: 20, softValue: undefined, isBust: false, isBlackjack: false } };
      
      const result = calculatePayout(player, dealer);
      
      expect(result.outcome).toBe('blackjack');
      expect(result.payout).toBe(250); // bet + 1.5x
    });

    it('should calculate push', () => {
      const player = { ...mockPlayer, currentBet: 100, hand: { cards: [], value: 20, softValue: undefined, isBust: false, isBlackjack: false } };
      const dealer = { ...mockDealer, hand: { cards: [], value: 20, softValue: undefined, isBust: false, isBlackjack: false } };
      
      const result = calculatePayout(player, dealer);
      
      expect(result.outcome).toBe('push');
      expect(result.payout).toBe(100); // bet returned
    });

    it('should calculate loss', () => {
      const player = { ...mockPlayer, currentBet: 100, hand: { cards: [], value: 18, softValue: undefined, isBust: false, isBlackjack: false } };
      const dealer = { ...mockDealer, hand: { cards: [], value: 20, softValue: undefined, isBust: false, isBlackjack: false } };
      
      const result = calculatePayout(player, dealer);
      
      expect(result.outcome).toBe('lose');
      expect(result.payout).toBe(0);
    });
  });
});