import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameFlow, getGameFlowAPI } from './gameFlow.hook';
import { GameConfig } from './gameFlow.types';
import { Brain } from '../brain/brain.types';
import { useGameFlowStore } from './gameFlow.store';

// Mock the store
vi.mock('./gameFlow.store', () => ({
  useGameFlowStore: Object.assign(
    vi.fn(() => ({
      game: null,
      initializeGame: vi.fn(),
      startGame: vi.fn(),
      proceedToNextPhase: vi.fn(),
      handlePlayerAction: vi.fn(),
      resetGame: vi.fn(),
    })),
    {
      getState: vi.fn(() => ({
        game: null,
        initializeGame: vi.fn(),
        startGame: vi.fn(),
        proceedToNextPhase: vi.fn(),
        handlePlayerAction: vi.fn(),
        resetGame: vi.fn(),
      })),
    }
  ),
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

describe('gameFlow.hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useGameFlow', () => {
    it('should return game state and functions', () => {
      const { result } = renderHook(() => useGameFlow());

      expect(result.current.game).toBeNull();
      expect(typeof result.current.initializeGame).toBe('function');
      expect(typeof result.current.startGame).toBe('function');
      expect(typeof result.current.proceedToNextPhase).toBe('function');
      expect(typeof result.current.handlePlayerAction).toBe('function');
      expect(typeof result.current.resetGame).toBe('function');
      expect(result.current.isGameComplete).toBe(false);
      expect(result.current.currentPhase).toBeNull();
    });

    it('should calculate isGameComplete based on game state', () => {
      const mockStore = {
        game: {
          id: 'test-game',
          phase: 'finished' as const,
          playerIds: [],
          dealerId: 'dealer',
          currentPlayerId: null,
          deck: [],
          history: [],
        },
        initializeGame: vi.fn(),
        startGame: vi.fn(),
        proceedToNextPhase: vi.fn(),
        handlePlayerAction: vi.fn(),
        resetGame: vi.fn(),
      };

      vi.mocked(useGameFlowStore).mockReturnValue(mockStore);

      const { result } = renderHook(() => useGameFlow());
      expect(result.current.isGameComplete).toBe(true);
      expect(result.current.currentPhase).toBe('finished');
    });

    it('should call store functions', async () => {
      const mockStore = {
        game: null,
        initializeGame: vi.fn(),
        startGame: vi.fn(),
        proceedToNextPhase: vi.fn(),
        handlePlayerAction: vi.fn(),
        resetGame: vi.fn(),
      };

      vi.mocked(useGameFlowStore).mockReturnValue(mockStore);

      const { result } = renderHook(() => useGameFlow());

      act(() => {
        result.current.initializeGame(mockGameConfig);
      });
      expect(mockStore.initializeGame).toHaveBeenCalledWith(mockGameConfig);

      await act(async () => {
        await result.current.startGame();
      });
      expect(mockStore.startGame).toHaveBeenCalled();

      await act(async () => {
        await result.current.proceedToNextPhase();
      });
      expect(mockStore.proceedToNextPhase).toHaveBeenCalled();

      await act(async () => {
        await result.current.handlePlayerAction('player1', 'hit');
      });
      expect(mockStore.handlePlayerAction).toHaveBeenCalledWith('player1', 'hit');

      act(() => {
        result.current.resetGame();
      });
      expect(mockStore.resetGame).toHaveBeenCalled();
    });
  });

  describe('getGameFlowAPI', () => {
    it('should return API functions', () => {
      const api = getGameFlowAPI();

      expect(typeof api.startNewGame).toBe('function');
      expect(typeof api.getCurrentPhase).toBe('function');
      expect(typeof api.proceedGame).toBe('function');
    });

    it('should start new game', async () => {
      const mockStore = {
        initializeGame: vi.fn(),
        startGame: vi.fn().mockResolvedValue(undefined),
      };

      vi.mocked(useGameFlowStore).getState = vi.fn().mockReturnValue(mockStore as unknown as ReturnType<typeof useGameFlowStore.getState>);

      const api = getGameFlowAPI();
      await api.startNewGame(mockGameConfig);

      expect(mockStore.initializeGame).toHaveBeenCalledWith(mockGameConfig);
      expect(mockStore.startGame).toHaveBeenCalled();
    });

    it('should get current phase', () => {
      const mockStore = {
        game: {
          id: 'test-game',
          phase: 'playing' as const,
          playerIds: [],
          dealerId: 'dealer',
          currentPlayerId: null,
          deck: [],
          history: [],
        },
      };

      vi.mocked(useGameFlowStore).getState = vi.fn().mockReturnValue(mockStore as unknown as ReturnType<typeof useGameFlowStore.getState>);

      const api = getGameFlowAPI();
      const phase = api.getCurrentPhase();

      expect(phase).toBe('playing');
    });

    it('should return null for phase when no game', () => {
      const mockStore = { game: null };

      vi.mocked(useGameFlowStore).getState = vi.fn().mockReturnValue(mockStore as unknown as ReturnType<typeof useGameFlowStore.getState>);

      const api = getGameFlowAPI();
      const phase = api.getCurrentPhase();

      expect(phase).toBeNull();
    });

    it('should proceed game', async () => {
      const mockStore = {
        proceedToNextPhase: vi.fn().mockResolvedValue(undefined),
      };

      vi.mocked(useGameFlowStore).getState = vi.fn().mockReturnValue(mockStore as unknown as ReturnType<typeof useGameFlowStore.getState>);

      const api = getGameFlowAPI();
      await api.proceedGame();

      expect(mockStore.proceedToNextPhase).toHaveBeenCalled();
    });
  });
});