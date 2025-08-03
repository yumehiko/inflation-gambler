import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useBettingInputStore } from './bettingInput.store';

describe('bettingInput.store', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useBettingInputStore());
    act(() => {
      result.current.reset();
    });
  });

  describe('initial state', () => {
    it('should have null pendingBet', () => {
      const { result } = renderHook(() => useBettingInputStore());
      expect(result.current.pendingBet).toBeNull();
    });

    it('should have null resolveBet', () => {
      const { result } = renderHook(() => useBettingInputStore());
      expect(result.current.resolveBet).toBeNull();
    });

    it('should have null rejectBet', () => {
      const { result } = renderHook(() => useBettingInputStore());
      expect(result.current.rejectBet).toBeNull();
    });
  });

  describe('requestBet', () => {
    it('should return a promise and set pendingBet', async () => {
      const { result } = renderHook(() => useBettingInputStore());
      
      let betPromise: Promise<number>;
      act(() => {
        betPromise = result.current.requestBet({
          chips: 1000,
          minBet: 10,
          maxBet: 500,
        });
      });
      
      expect(result.current.pendingBet).toBe(10);
      expect(result.current.resolveBet).not.toBeNull();
      expect(result.current.rejectBet).not.toBeNull();
      
      // Promise should be pending
      const raceResult = await Promise.race([
        betPromise!.then(() => 'resolved'),
        new Promise(resolve => setTimeout(() => resolve('pending'), 10)),
      ]);
      expect(raceResult).toBe('pending');
    });
  });

  describe('submitBet', () => {
    it('should resolve the pending bet promise', async () => {
      const { result } = renderHook(() => useBettingInputStore());
      
      let betPromise: Promise<number>;
      act(() => {
        betPromise = result.current.requestBet({
          chips: 1000,
          minBet: 10,
          maxBet: 500,
        });
      });
      
      act(() => {
        result.current.submitBet(250);
      });
      
      const betAmount = await betPromise!;
      expect(betAmount).toBe(250);
      expect(result.current.pendingBet).toBeNull();
      expect(result.current.resolveBet).toBeNull();
      expect(result.current.rejectBet).toBeNull();
    });

    it('should do nothing if no pending bet', () => {
      const { result } = renderHook(() => useBettingInputStore());
      
      act(() => {
        result.current.submitBet(100);
      });
      
      expect(result.current.pendingBet).toBeNull();
    });
  });

  describe('cancelBet', () => {
    it('should reject the pending bet promise', async () => {
      const { result } = renderHook(() => useBettingInputStore());
      
      let betPromise: Promise<number>;
      act(() => {
        betPromise = result.current.requestBet({
          chips: 1000,
          minBet: 10,
          maxBet: 500,
        });
      });
      
      act(() => {
        result.current.cancelBet();
      });
      
      await expect(betPromise!).rejects.toThrow('Bet cancelled');
      expect(result.current.pendingBet).toBeNull();
      expect(result.current.resolveBet).toBeNull();
      expect(result.current.rejectBet).toBeNull();
    });

    it('should do nothing if no pending bet', () => {
      const { result } = renderHook(() => useBettingInputStore());
      
      act(() => {
        result.current.cancelBet();
      });
      
      expect(result.current.pendingBet).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset all state', async () => {
      const { result } = renderHook(() => useBettingInputStore());
      
      act(() => {
        result.current.requestBet({
          chips: 1000,
          minBet: 10,
          maxBet: 500,
        });
      });
      
      expect(result.current.pendingBet).toBe(10);
      
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.pendingBet).toBeNull();
      expect(result.current.resolveBet).toBeNull();
      expect(result.current.rejectBet).toBeNull();
    });
  });
});