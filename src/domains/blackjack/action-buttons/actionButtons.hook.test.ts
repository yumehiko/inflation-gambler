import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useActionButtons } from './actionButtons.hook';
import { useActionButtonsStore } from './actionButtons.store';
import type { DecisionContext } from '../brain/brain.types';

describe('actionButtons.hook', () => {
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
    it('should return props with initial values', () => {
      const { result } = renderHook(() => 
        useActionButtons('player1')
      );

      expect(result.current.participantId).toBe('player1');
      expect(result.current.canHit).toBe(true);
      expect(result.current.canStand).toBe(true);
      expect(result.current.canDouble).toBe(false);
      expect(result.current.canSplit).toBe(false);
      expect(result.current.canSurrender).toBe(false);
      expect(result.current.disabled).toBe(true); // No pending action
      expect(result.current.isWaitingForAction).toBe(false);
    });
  });

  describe('when action is requested', () => {
    it('should enable buttons based on context', () => {
      const { result: storeResult } = renderHook(() => useActionButtonsStore());
      const { result: hookResult } = renderHook(() => 
        useActionButtons('player1')
      );

      act(() => {
        storeResult.current.requestAction(mockContext);
      });

      expect(hookResult.current.disabled).toBe(false);
      expect(hookResult.current.isWaitingForAction).toBe(true);
      expect(hookResult.current.canDouble).toBe(true);
      expect(hookResult.current.canSplit).toBe(false);
      expect(hookResult.current.canSurrender).toBe(true);
    });
  });

  describe('onAction', () => {
    it('should submit action to store', async () => {
      const { result: storeResult } = renderHook(() => useActionButtonsStore());
      const { result: hookResult } = renderHook(() => 
        useActionButtons('player1')
      );

      let actionPromise: Promise<string>;
      act(() => {
        actionPromise = storeResult.current.requestAction(mockContext);
      });

      act(() => {
        hookResult.current.onAction({ type: 'hit' });
      });

      const decision = await actionPromise!;
      expect(decision).toBe('hit');
      expect(hookResult.current.disabled).toBe(true);
      expect(hookResult.current.isWaitingForAction).toBe(false);
    });

    it('should call external onAction callback', () => {
      const mockOnAction = vi.fn();
      const { result: storeResult } = renderHook(() => useActionButtonsStore());
      const { result: hookResult } = renderHook(() => 
        useActionButtons('player1', mockOnAction)
      );

      act(() => {
        storeResult.current.requestAction(mockContext);
      });

      act(() => {
        hookResult.current.onAction({ type: 'stand' });
      });

      expect(mockOnAction).toHaveBeenCalledWith({ type: 'stand' });
    });

    it('should only call external callback when no pending action', () => {
      const mockOnAction = vi.fn();
      const { result: hookResult } = renderHook(() => 
        useActionButtons('player1', mockOnAction)
      );

      // No pending action, but external callback should still work
      act(() => {
        hookResult.current.onAction({ type: 'hit' });
      });

      expect(mockOnAction).toHaveBeenCalledWith({ type: 'hit' });
    });
  });

  describe('button availability', () => {
    it('should reflect context restrictions', () => {
      const { result: storeResult } = renderHook(() => useActionButtonsStore());
      const { result: hookResult } = renderHook(() => 
        useActionButtons('player1')
      );

      const restrictedContext: DecisionContext = {
        ...mockContext,
        canDouble: false,
        canSplit: true,
        canSurrender: false,
      };

      act(() => {
        storeResult.current.requestAction(restrictedContext);
      });

      expect(hookResult.current.canDouble).toBe(false);
      expect(hookResult.current.canSplit).toBe(true);
      expect(hookResult.current.canSurrender).toBe(false);
    });
  });
});