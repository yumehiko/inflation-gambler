import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Card } from '../../core/card/card.types';
import { useDealer } from './dealer.hook';
import { useDealerStore } from './dealer.store';

describe('dealer.hook', () => {
  beforeEach(() => {
    useDealerStore.setState({
      dealer: null,
    });
  });

  describe('useDealer', () => {
    it('ディーラーの初期状態を返す', () => {
      const { result } = renderHook(() => useDealer());
      
      expect(result.current.dealer).toBeNull();
    });

    it('ディーラーを初期化できる', () => {
      const { result } = renderHook(() => useDealer());
      
      act(() => {
        result.current.initializeDealer();
      });
      
      expect(result.current.dealer).not.toBeNull();
      expect(result.current.dealer?.id).toBe('dealer');
      expect(result.current.dealer?.hand.cards).toEqual([]);
    });

    it('ディーラーにカードを配れる', () => {
      const { result } = renderHook(() => useDealer());
      const card: Card = { suit: 'hearts', rank: '10' };
      
      act(() => {
        result.current.initializeDealer();
        result.current.dealCard(card, false);
      });
      
      expect(result.current.dealer?.hand.cards).toHaveLength(1);
      expect(result.current.dealer?.hand.cards[0]).toEqual({ ...card, faceUp: true });
    });

    it('ホールカードを公開できる', () => {
      const { result } = renderHook(() => useDealer());
      const card1: Card = { suit: 'hearts', rank: '10' };
      const card2: Card = { suit: 'spades', rank: 'A' };
      
      act(() => {
        result.current.initializeDealer();
        result.current.dealCard(card1, false);
        result.current.dealCard(card2, true);
        result.current.revealHoleCard();
      });
      
      expect(result.current.dealer?.isShowingHoleCard).toBe(true);
      expect(result.current.dealer?.hand.cards[1].faceUp).toBe(true);
    });

    it('ディーラーがヒットすべきかを判定できる', () => {
      const { result } = renderHook(() => useDealer());
      const card1: Card = { suit: 'hearts', rank: '10' };
      const card2: Card = { suit: 'spades', rank: '6' };
      
      act(() => {
        result.current.initializeDealer();
        result.current.dealCard(card1, false);
        result.current.dealCard(card2, false);
      });
      
      expect(result.current.shouldHit()).toBe(true);
    });

    it('ディーラーをリセットできる', () => {
      const { result } = renderHook(() => useDealer());
      
      act(() => {
        result.current.initializeDealer();
        result.current.reset();
      });
      
      expect(result.current.dealer).toBeNull();
    });
  });
});