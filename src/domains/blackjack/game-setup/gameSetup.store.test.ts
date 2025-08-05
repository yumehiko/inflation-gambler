import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameSetupStore } from './gameSetup.store';
import type { GameSetupConfig } from './gameSetup.types';

vi.mock('./gameSetup.utils', () => ({
  validateSetupConfig: vi.fn().mockReturnValue(true),
  createGameConfig: vi.fn().mockImplementation(config => ({
    playerConfigs: [],
    minBet: config.minBet,
    maxBet: config.maxBet,
    deckCount: config.deckCount,
  })),
}));
vi.mock('../game-flow/gameFlow.hook', () => ({
  getGameFlowAPI: vi.fn().mockReturnValue({
    startNewGame: vi.fn(),
    getCurrentPhase: vi.fn(),
    proceedGame: vi.fn(),
  }),
}));

const mockSetupConfig: GameSetupConfig = {
  userId: 'user-1',
  userName: 'Player',
  userChips: 1000,
  cpuCount: 2,
  minBet: 10,
  maxBet: 1000,
  deckCount: 6,
};

describe('gameSetup.store', () => {
  beforeEach(() => {
    useGameSetupStore.setState({
      isGameActive: false,
      config: null,
    });
  });
  
  describe('初期状態', () => {
    it('ゲームは非アクティブで設定はnull', () => {
      const { result } = renderHook(() => useGameSetupStore());
      
      expect(result.current.isGameActive).toBe(false);
      expect(result.current.config).toBeNull();
    });
  });
  
  describe('setupGame', () => {
    it('有効な設定でゲームをセットアップする', () => {
      const { result } = renderHook(() => useGameSetupStore());
      
      act(() => {
        result.current.setupGame(mockSetupConfig);
      });
      
      expect(result.current.config).toEqual(mockSetupConfig);
      expect(result.current.isGameActive).toBe(false);
    });
    
    it('無効な設定の場合エラーをスローする', async () => {
      const { validateSetupConfig } = await import('./gameSetup.utils');
      vi.mocked(validateSetupConfig).mockReturnValueOnce(false);
      
      const { result } = renderHook(() => useGameSetupStore());
      const invalidConfig = { ...mockSetupConfig, cpuCount: -1 };
      
      expect(() => {
        act(() => {
          result.current.setupGame(invalidConfig);
        });
      }).toThrow('Invalid game setup configuration');
    });
  });
  
  describe('startGame', () => {
    it('設定がある場合ゲームを開始する', async () => {
      const { result } = renderHook(() => useGameSetupStore());
      
      act(() => {
        result.current.setupGame(mockSetupConfig);
      });
      
      await act(async () => {
        await result.current.startGame();
      });
      
      expect(result.current.isGameActive).toBe(true);
    });
    
    it('設定がない場合エラーをスローする', async () => {
      const { result } = renderHook(() => useGameSetupStore());
      
      await expect(act(async () => {
        await result.current.startGame();
      })).rejects.toThrow('Game setup not configured');
    });
    
    it('GameFlowを初期化する', async () => {
      const mockGameFlowAPI = {
        startNewGame: vi.fn(),
        getCurrentPhase: vi.fn(),
        proceedGame: vi.fn(),
        getEventEmitter: vi.fn(),
      };
      
      const { getGameFlowAPI } = await import('../game-flow/gameFlow.hook');
      vi.mocked(getGameFlowAPI).mockReturnValue(mockGameFlowAPI);
      
      const { result } = renderHook(() => useGameSetupStore());
      
      act(() => {
        result.current.setupGame(mockSetupConfig);
      });
      
      await act(async () => {
        await result.current.startGame();
      });
      
      expect(mockGameFlowAPI.startNewGame).toHaveBeenCalledWith(
        expect.objectContaining({
          playerConfigs: expect.any(Array),
          minBet: 10,
          maxBet: 1000,
          deckCount: 6,
        })
      );
    });
  });
  
  describe('endGame', () => {
    it('ゲームを終了する', async () => {
      const { result } = renderHook(() => useGameSetupStore());
      
      act(() => {
        result.current.setupGame(mockSetupConfig);
      });
      
      await act(async () => {
        await result.current.startGame();
      });
      
      expect(result.current.isGameActive).toBe(true);
      
      act(() => {
        result.current.endGame();
      });
      
      expect(result.current.isGameActive).toBe(false);
    });
  });
  
  describe('resetSetup', () => {
    it('設定とゲーム状態をリセットする', async () => {
      const { result } = renderHook(() => useGameSetupStore());
      
      act(() => {
        result.current.setupGame(mockSetupConfig);
      });
      
      await act(async () => {
        await result.current.startGame();
      });
      
      expect(result.current.config).not.toBeNull();
      expect(result.current.isGameActive).toBe(true);
      
      act(() => {
        result.current.resetSetup();
      });
      
      expect(result.current.config).toBeNull();
      expect(result.current.isGameActive).toBe(false);
    });
  });
});