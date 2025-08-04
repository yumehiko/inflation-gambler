import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameSetup, getGameSetupAPI } from './gameSetup.hook';
import { useGameSetupStore } from './gameSetup.store';
import type { GameSetupConfig } from './gameSetup.types';

vi.mock('./gameSetup.store', () => ({
  useGameSetupStore: Object.assign(
    vi.fn(() => ({
      isGameActive: false,
      config: null,
      setupGame: vi.fn(),
      startGame: vi.fn(),
      endGame: vi.fn(),
      resetSetup: vi.fn(),
    })),
    {
      getState: vi.fn(() => ({
        isGameActive: false,
        config: null,
        setupGame: vi.fn(),
        startGame: vi.fn(),
        endGame: vi.fn(),
        resetSetup: vi.fn(),
      })),
    }
  ),
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

describe('gameSetup.hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('useGameSetup', () => {
    it('storeの状態とアクションを返す', () => {
      const mockStore = {
        isGameActive: true,
        config: mockSetupConfig,
        setupGame: vi.fn(),
        startGame: vi.fn(),
        endGame: vi.fn(),
        resetSetup: vi.fn(),
      };
      
      vi.mocked(useGameSetupStore).mockReturnValue(mockStore);
      
      const { result } = renderHook(() => useGameSetup());
      
      expect(result.current.isGameActive).toBe(true);
      expect(result.current.config).toEqual(mockSetupConfig);
      expect(result.current.setupGame).toBe(mockStore.setupGame);
      expect(result.current.startGame).toBe(mockStore.startGame);
      expect(result.current.endGame).toBe(mockStore.endGame);
      expect(result.current.resetSetup).toBe(mockStore.resetSetup);
    });
    
    it('setupAndStartGameがセットアップとゲーム開始を実行する', () => {
      const mockStore = {
        isGameActive: false,
        config: null,
        setupGame: vi.fn(),
        startGame: vi.fn(),
        endGame: vi.fn(),
        resetSetup: vi.fn(),
      };
      
      vi.mocked(useGameSetupStore).mockReturnValue(mockStore);
      
      const { result } = renderHook(() => useGameSetup());
      
      act(() => {
        result.current.setupAndStartGame(mockSetupConfig);
      });
      
      expect(mockStore.setupGame).toHaveBeenCalledWith(mockSetupConfig);
      expect(mockStore.startGame).toHaveBeenCalled();
    });
  });
  
  describe('getGameSetupAPI', () => {
    it('storeのメソッドを返す', () => {
      const mockStore = {
        isGameActive: true,
        config: mockSetupConfig,
        setupGame: vi.fn(),
        startGame: vi.fn(),
        endGame: vi.fn(),
        resetSetup: vi.fn(),
      };
      
      vi.mocked(useGameSetupStore).getState = vi.fn().mockReturnValue(mockStore);
      
      const api = getGameSetupAPI();
      
      expect(api.setupGame).toBe(mockStore.setupGame);
      expect(api.startGame).toBe(mockStore.startGame);
      expect(api.endGame).toBe(mockStore.endGame);
      expect(api.resetSetup).toBe(mockStore.resetSetup);
    });
    
    it('isGameActiveを返す', () => {
      const mockStore = {
        isGameActive: true,
        config: mockSetupConfig,
        setupGame: vi.fn(),
        startGame: vi.fn(),
        endGame: vi.fn(),
        resetSetup: vi.fn(),
      };
      
      vi.mocked(useGameSetupStore).getState = vi.fn().mockReturnValue(mockStore);
      
      const api = getGameSetupAPI();
      
      expect(api.isGameActive()).toBe(true);
    });
    
    it('getConfigを返す', () => {
      const mockStore = {
        isGameActive: true,
        config: mockSetupConfig,
        setupGame: vi.fn(),
        startGame: vi.fn(),
        endGame: vi.fn(),
        resetSetup: vi.fn(),
      };
      
      vi.mocked(useGameSetupStore).getState = vi.fn().mockReturnValue(mockStore);
      
      const api = getGameSetupAPI();
      
      expect(api.getConfig()).toEqual(mockSetupConfig);
    });
  });
});