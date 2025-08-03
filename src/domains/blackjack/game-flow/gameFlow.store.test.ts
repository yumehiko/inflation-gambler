import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameFlowStore } from './gameFlow.store';
import { GameConfig } from './gameFlow.types';
import { Brain } from '../brain/brain.types';

// Mock the utils module
vi.mock('./gameFlow.utils', () => ({
  createGameFlow: vi.fn((config: GameConfig) => ({
    id: 'test-game',
    phase: 'waiting',
    playerIds: config.playerConfigs.map((p) => p.id),
    dealerId: 'dealer',
    currentPlayerId: null,
    deck: [],
    history: [],
  })),
  canStartGame: vi.fn(() => true),
  canStartBetting: vi.fn(() => true),
  canDealCards: vi.fn(() => true),
  canStartPlayerTurn: vi.fn(() => true),
  canStartDealerTurn: vi.fn(() => true),
  canSettle: vi.fn(() => true),
  startBettingPhase: vi.fn((game) => ({ ...game, phase: 'betting' })),
  collectBets: vi.fn(async (game) => ({ ...game })),
  dealInitialCards: vi.fn((game) => ({ ...game, phase: 'dealing' })),
  checkBlackjacks: vi.fn((game) => ({ ...game })),
  processPlayerTurn: vi.fn(async (game) => ({ ...game })),
  processDealerTurn: vi.fn(async (game) => ({ ...game, phase: 'dealerTurn' })),
  settleGame: vi.fn((game) => ({ ...game, phase: 'finished' })),
  getNextPlayer: vi.fn(() => null),
  isGameComplete: vi.fn((game) => game.phase === 'finished'),
}));

// Mock player and dealer stores
vi.mock('../player/player.store', () => ({
  usePlayerStore: {
    getState: vi.fn(() => ({
      players: [
        {
          id: 'player1',
          name: 'Test Player',
          hand: { cards: [], value: 0, soft: false },
          chips: 1000,
          currentBet: 0,
          isActive: false,
          hasStood: false,
          hasBusted: false,
          brain: {
            type: 'human',
            makeDecision: vi.fn().mockResolvedValue('stand'),
            decideBet: vi.fn().mockResolvedValue(100),
          },
        },
      ],
      activePlayerId: null,
      setActivePlayer: vi.fn(),
    })),
  },
}));

vi.mock('../dealer/dealer.store', () => ({
  useDealerStore: {
    getState: vi.fn(() => ({
      dealer: {
        id: 'dealer',
        hand: { cards: [], value: 0, soft: false },
        isShowingHoleCard: false,
      },
    })),
  },
}));

const mockBrain: Brain = {
  type: 'human',
  makeDecision: vi.fn().mockResolvedValue('stand'),
  decideBet: vi.fn().mockResolvedValue(100),
};

const mockGameConfig: GameConfig = {
  playerConfigs: [
    {
      id: 'player1',
      name: 'Test Player',
      brain: mockBrain,
      initialChips: 1000,
    },
  ],
  minBet: 10,
  maxBet: 500,
  deckCount: 1,
};

describe('gameFlow.store', () => {
  beforeEach(() => {
    const store = useGameFlowStore.getState();
    store.resetGame();
    vi.clearAllMocks();
  });

  describe('initializeGame', () => {
    it('should initialize a new game', () => {
      const { result } = renderHook(() => useGameFlowStore());

      act(() => {
        result.current.initializeGame(mockGameConfig);
      });

      expect(result.current.game).not.toBeNull();
      expect(result.current.game?.phase).toBe('waiting');
      expect(result.current.game?.playerIds).toEqual(['player1']);
    });
  });

  describe('startGame', () => {
    it('should start the game and move to betting phase', async () => {
      const { result } = renderHook(() => useGameFlowStore());

      act(() => {
        result.current.initializeGame(mockGameConfig);
      });

      await act(async () => {
        await result.current.startGame();
      });

      expect(result.current.game?.phase).toBe('betting');
    });

    it('should throw error if game is not initialized', async () => {
      const { result } = renderHook(() => useGameFlowStore());

      await expect(act(async () => {
        await result.current.startGame();
      })).rejects.toThrow('Game not initialized');
    });
  });

  describe('proceedToNextPhase', () => {
    it('should proceed from betting to dealing', async () => {
      const { result } = renderHook(() => useGameFlowStore());

      act(() => {
        result.current.initializeGame(mockGameConfig);
      });

      await act(async () => {
        await result.current.startGame();
      });

      await act(async () => {
        await result.current.proceedToNextPhase();
      });

      expect(result.current.game?.phase).toBe('playing');
    });

    it('should handle player turns', async () => {
      const { result } = renderHook(() => useGameFlowStore());

      // Set up game in playing phase
      act(() => {
        useGameFlowStore.setState({
          game: {
            id: 'test-game',
            phase: 'playing',
            playerIds: ['player1'],
            dealerId: 'dealer',
            currentPlayerId: 'player1',
            deck: [],
            history: [],
          },
        });
      });

      await act(async () => {
        await result.current.proceedToNextPhase();
      });

      // Should process player turn
      expect(vi.mocked(await import('./gameFlow.utils')).processPlayerTurn).toHaveBeenCalled();
    });

    it('should move to dealer turn when all players are done', async () => {
      const { result } = renderHook(() => useGameFlowStore());

      // Mock getNextPlayer to return null (no more players)
      vi.mocked(await import('./gameFlow.utils')).getNextPlayer.mockReturnValueOnce(null);

      act(() => {
        useGameFlowStore.setState({
          game: {
            id: 'test-game',
            phase: 'playing',
            playerIds: ['player1'],
            dealerId: 'dealer',
            currentPlayerId: 'player1',
            deck: [],
            history: [],
          },
        });
      });

      await act(async () => {
        await result.current.proceedToNextPhase();
      });

      expect(result.current.game?.phase).toBe('dealerTurn');
    });

    it('should settle game after dealer turn', async () => {
      const { result } = renderHook(() => useGameFlowStore());

      act(() => {
        useGameFlowStore.setState({
          game: {
            id: 'test-game',
            phase: 'dealerTurn',
            playerIds: ['player1'],
            dealerId: 'dealer',
            currentPlayerId: null,
            deck: [],
            history: [],
          },
        });
      });

      await act(async () => {
        await result.current.proceedToNextPhase();
      });

      expect(result.current.game?.phase).toBe('finished');
    });
  });

  describe('handlePlayerAction', () => {
    it('should handle player action and update game', async () => {
      const { result } = renderHook(() => useGameFlowStore());

      act(() => {
        useGameFlowStore.setState({
          game: {
            id: 'test-game',
            phase: 'playing',
            playerIds: ['player1'],
            dealerId: 'dealer',
            currentPlayerId: 'player1',
            deck: [],
            history: [],
          },
        });
      });

      await act(async () => {
        await result.current.handlePlayerAction('player1', 'hit');
      });

      expect(vi.mocked(await import('./gameFlow.utils')).processPlayerTurn).toHaveBeenCalled();
    });

    it('should throw error if no game', async () => {
      const { result } = renderHook(() => useGameFlowStore());

      await expect(act(async () => {
        await result.current.handlePlayerAction('player1', 'hit');
      })).rejects.toThrow('Game not initialized');
    });

    it('should throw error if not in playing phase', async () => {
      const { result } = renderHook(() => useGameFlowStore());

      act(() => {
        useGameFlowStore.setState({
          game: {
            id: 'test-game',
            phase: 'betting',
            playerIds: ['player1'],
            dealerId: 'dealer',
            currentPlayerId: null,
            deck: [],
            history: [],
          },
        });
      });

      await expect(act(async () => {
        await result.current.handlePlayerAction('player1', 'hit');
      })).rejects.toThrow('Cannot handle player action in current phase');
    });
  });

  describe('resetGame', () => {
    it('should reset game to null', () => {
      const { result } = renderHook(() => useGameFlowStore());

      act(() => {
        result.current.initializeGame(mockGameConfig);
      });

      expect(result.current.game).not.toBeNull();

      act(() => {
        result.current.resetGame();
      });

      expect(result.current.game).toBeNull();
    });
  });
});