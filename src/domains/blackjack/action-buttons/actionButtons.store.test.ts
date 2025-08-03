import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useActionButtonsStore } from './actionButtons.store';
import type { DecisionContext } from '../brain/brain.types';

describe('actionButtons.store', () => {
  const mockContext: DecisionContext = {
    hand: {
      cards: [],
      value: 15,
      isBust: false,
      isBlackjack: false,
    },
    dealerUpCard: { suit: 'hearts', rank: '10' },
    canDouble: true,
    canSplit: false,
    canSurrender: true,
    canInsurance: false,
  };

  beforeEach(() => {
    const { result } = renderHook(() => useActionButtonsStore());
    act(() => {
      result.current.reset();
    });
  });

  describe('initial state', () => {
    it('should have null pendingAction', () => {
      const { result } = renderHook(() => useActionButtonsStore());
      expect(result.current.pendingAction).toBeNull();
    });

    it('should have null resolveAction', () => {
      const { result } = renderHook(() => useActionButtonsStore());
      expect(result.current.resolveAction).toBeNull();
    });

    it('should have null rejectAction', () => {
      const { result } = renderHook(() => useActionButtonsStore());
      expect(result.current.rejectAction).toBeNull();
    });
  });

  describe('requestAction', () => {
    it('should return a promise and set pendingAction', async () => {
      const { result } = renderHook(() => useActionButtonsStore());
      
      let actionPromise: Promise<string>;
      act(() => {
        actionPromise = result.current.requestAction(mockContext);
      });
      
      expect(result.current.pendingAction).toEqual(mockContext);
      expect(result.current.resolveAction).not.toBeNull();
      expect(result.current.rejectAction).not.toBeNull();
      
      // Promise should be pending
      const raceResult = await Promise.race([
        actionPromise!.then(() => 'resolved'),
        new Promise(resolve => setTimeout(() => resolve('pending'), 10)),
      ]);
      expect(raceResult).toBe('pending');
    });
  });

  describe('submitAction', () => {
    it('should resolve the pending action promise with hit', async () => {
      const { result } = renderHook(() => useActionButtonsStore());
      
      let actionPromise: Promise<string>;
      act(() => {
        actionPromise = result.current.requestAction(mockContext);
      });
      
      act(() => {
        result.current.submitAction('hit');
      });
      
      const decision = await actionPromise!;
      expect(decision).toBe('hit');
      expect(result.current.pendingAction).toBeNull();
      expect(result.current.resolveAction).toBeNull();
      expect(result.current.rejectAction).toBeNull();
    });

    it('should resolve with different action types', async () => {
      const { result } = renderHook(() => useActionButtonsStore());
      
      const actionTypes = ['stand', 'double', 'split', 'surrender', 'insurance'] as const;
      
      for (const actionType of actionTypes) {
        let actionPromise: Promise<string>;
        act(() => {
          actionPromise = result.current.requestAction(mockContext);
        });
        
        act(() => {
          result.current.submitAction(actionType);
        });
        
        const decision = await actionPromise!;
        expect(decision).toBe(actionType);
      }
    });

    it('should do nothing if no pending action', () => {
      const { result } = renderHook(() => useActionButtonsStore());
      
      act(() => {
        result.current.submitAction('hit');
      });
      
      expect(result.current.pendingAction).toBeNull();
    });
  });

  describe('cancelAction', () => {
    it('should reject the pending action promise', async () => {
      const { result } = renderHook(() => useActionButtonsStore());
      
      let actionPromise: Promise<string>;
      act(() => {
        actionPromise = result.current.requestAction(mockContext);
      });
      
      act(() => {
        result.current.cancelAction();
      });
      
      await expect(actionPromise!).rejects.toThrow('Action cancelled');
      expect(result.current.pendingAction).toBeNull();
      expect(result.current.resolveAction).toBeNull();
      expect(result.current.rejectAction).toBeNull();
    });

    it('should do nothing if no pending action', () => {
      const { result } = renderHook(() => useActionButtonsStore());
      
      act(() => {
        result.current.cancelAction();
      });
      
      expect(result.current.pendingAction).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset all state', async () => {
      const { result } = renderHook(() => useActionButtonsStore());
      
      act(() => {
        result.current.requestAction(mockContext);
      });
      
      expect(result.current.pendingAction).toEqual(mockContext);
      
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.pendingAction).toBeNull();
      expect(result.current.resolveAction).toBeNull();
      expect(result.current.rejectAction).toBeNull();
    });
  });
});