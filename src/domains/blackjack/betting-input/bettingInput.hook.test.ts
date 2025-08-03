import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useBettingInput } from './bettingInput.hook';
import { useBettingInputStore } from './bettingInput.store';

describe('bettingInput.hook', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useBettingInputStore());
    act(() => {
      result.current.reset();
    });
  });

  describe('initial state', () => {
    it('should return props with initial values', () => {
      const { result } = renderHook(() => 
        useBettingInput(1000, 10, 500)
      );

      expect(result.current.balance).toBe(1000);
      expect(result.current.minBet).toBe(10);
      expect(result.current.maxBet).toBe(500);
      expect(result.current.currentBet).toBe(10);
      expect(result.current.disabled).toBe(true); // No pending bet
    });
  });

  describe('when bet is requested', () => {
    it('should enable input when pendingBet is set', () => {
      const { result: storeResult } = renderHook(() => useBettingInputStore());
      const { result: hookResult } = renderHook(() => 
        useBettingInput(1000, 10, 500)
      );

      act(() => {
        storeResult.current.requestBet({
          chips: 1000,
          minBet: 10,
          maxBet: 500,
        });
      });

      expect(hookResult.current.disabled).toBe(false);
      expect(hookResult.current.currentBet).toBe(10);
    });
  });

  describe('onBetChange', () => {
    it('should update currentBet', () => {
      const { result: storeResult } = renderHook(() => useBettingInputStore());
      const { result: hookResult } = renderHook(() => 
        useBettingInput(1000, 10, 500)
      );

      act(() => {
        storeResult.current.requestBet({
          chips: 1000,
          minBet: 10,
          maxBet: 500,
        });
      });

      act(() => {
        hookResult.current.onBetChange(250);
      });

      expect(hookResult.current.currentBet).toBe(250);
    });
  });

  describe('onBetConfirm', () => {
    it('should submit bet to store and disable input', async () => {
      const { result: storeResult } = renderHook(() => useBettingInputStore());
      const { result: hookResult } = renderHook(() => 
        useBettingInput(1000, 10, 500)
      );

      let betPromise: Promise<number>;
      act(() => {
        betPromise = storeResult.current.requestBet({
          chips: 1000,
          minBet: 10,
          maxBet: 500,
        });
      });

      act(() => {
        hookResult.current.onBetChange(250);
      });

      act(() => {
        hookResult.current.onBetConfirm();
      });

      const betAmount = await betPromise!;
      expect(betAmount).toBe(250);
      expect(hookResult.current.disabled).toBe(true);
    });

    it('should call external onBetConfirm callback', () => {
      const mockOnBetConfirm = vi.fn();
      const { result: storeResult } = renderHook(() => useBettingInputStore());
      const { result: hookResult } = renderHook(() => 
        useBettingInput(1000, 10, 500, mockOnBetConfirm)
      );

      act(() => {
        storeResult.current.requestBet({
          chips: 1000,
          minBet: 10,
          maxBet: 500,
        });
      });

      act(() => {
        hookResult.current.onBetChange(250);
      });

      act(() => {
        hookResult.current.onBetConfirm();
      });

      expect(mockOnBetConfirm).toHaveBeenCalledWith(250);
    });

    it('should only call external callback when no pending bet', () => {
      const mockOnBetConfirm = vi.fn();
      const { result: hookResult } = renderHook(() => 
        useBettingInput(1000, 10, 500, mockOnBetConfirm)
      );

      // No pending bet, but external callback should still work
      act(() => {
        hookResult.current.onBetChange(100);
      });

      act(() => {
        hookResult.current.onBetConfirm();
      });

      expect(mockOnBetConfirm).toHaveBeenCalledWith(100);
    });
  });
});