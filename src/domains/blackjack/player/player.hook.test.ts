import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePlayer } from './player.hook';
import { usePlayerStore } from './player.store';
import { Brain } from '../brain/brain.types';

describe('player.hook', () => {
  const mockBrain: Brain = {
    type: 'human',
    makeDecision: async () => 'stand',
    decideBet: async () => 100,
  };

  beforeEach(() => {
    usePlayerStore.setState({
      players: [],
      activePlayerId: null,
    });
  });

  describe('usePlayer', () => {
    it('should return player data and actions', () => {
      const { result } = renderHook(() => usePlayer('player1'));

      expect(result.current.player).toBeUndefined();
      expect(result.current.isActive).toBe(false);
      expect(result.current.isHuman).toBe(false);
      expect(result.current.canAct).toBe(false);
      expect(typeof result.current.placeBet).toBe('function');
      expect(typeof result.current.stand).toBe('function');
      expect(typeof result.current.updateHand).toBe('function');
    });

    it('should return player data when player exists', () => {
      const store = usePlayerStore.getState();
      store.addPlayer('player1', 'John', mockBrain, 1000);

      const { result } = renderHook(() => usePlayer('player1'));

      expect(result.current.player?.name).toBe('John');
      expect(result.current.isHuman).toBe(true);
    });

    it('should update when player becomes active', () => {
      const store = usePlayerStore.getState();
      store.addPlayer('player1', 'John', mockBrain, 1000);

      const { result } = renderHook(() => usePlayer('player1'));

      expect(result.current.isActive).toBe(false);
      expect(result.current.canAct).toBe(false);

      act(() => {
        store.setActivePlayer('player1');
      });

      expect(result.current.isActive).toBe(true);
      expect(result.current.canAct).toBe(true);
    });

    it('should place bet', () => {
      const store = usePlayerStore.getState();
      store.addPlayer('player1', 'John', mockBrain, 1000);

      const { result } = renderHook(() => usePlayer('player1'));

      act(() => {
        result.current.placeBet(100);
      });

      expect(result.current.player?.currentBet).toBe(100);
      expect(result.current.player?.chips).toBe(900);
    });

    it('should stand', () => {
      const store = usePlayerStore.getState();
      store.addPlayer('player1', 'John', mockBrain, 1000);
      store.setActivePlayer('player1');

      const { result } = renderHook(() => usePlayer('player1'));

      expect(result.current.canAct).toBe(true);

      act(() => {
        result.current.stand();
      });

      expect(result.current.player?.hasStood).toBe(true);
      expect(result.current.canAct).toBe(false);
    });

    it('should update hand', () => {
      const store = usePlayerStore.getState();
      store.addPlayer('player1', 'John', mockBrain, 1000);

      const { result } = renderHook(() => usePlayer('player1'));

      const newHand = {
        cards: [],
        value: 21,
        isBust: false,
        isBlackjack: true,
      };

      act(() => {
        result.current.updateHand(newHand);
      });

      expect(result.current.player?.hand.value).toBe(21);
      expect(result.current.player?.hand.isBlackjack).toBe(true);
    });
  });
});