import { describe, it, expect, beforeEach } from 'vitest';
import { Card } from '../../core/card/card.types';
import { useDealerStore } from './dealer.store';

describe('dealer.store', () => {
  beforeEach(() => {
    useDealerStore.setState({
      dealer: null,
    });
  });

  describe('initializeDealer', () => {
    it('新しいディーラーを初期化する', () => {
      const { initializeDealer } = useDealerStore.getState();
      
      initializeDealer();
      
      const { dealer } = useDealerStore.getState();
      expect(dealer).not.toBeNull();
      expect(dealer?.id).toBe('dealer');
      expect(dealer?.hand.cards).toEqual([]);
      expect(dealer?.isShowingHoleCard).toBe(false);
    });
  });

  describe('dealCardToDealer', () => {
    it('ディーラーにカードを配る', () => {
      const { initializeDealer, dealCardToDealer } = useDealerStore.getState();
      const card: Card = { suit: 'hearts', rank: '10' };
      
      initializeDealer();
      dealCardToDealer(card, false);
      
      const { dealer } = useDealerStore.getState();
      expect(dealer?.hand.cards).toHaveLength(1);
      expect(dealer?.hand.cards[0]).toEqual({ ...card, faceUp: true });
    });

    it('ディーラーにホールカードを配る', () => {
      const { initializeDealer, dealCardToDealer } = useDealerStore.getState();
      const card: Card = { suit: 'spades', rank: 'A' };
      
      initializeDealer();
      dealCardToDealer(card, true);
      
      const { dealer } = useDealerStore.getState();
      expect(dealer?.hand.cards).toHaveLength(1);
      expect(dealer?.hand.cards[0]).toEqual({ ...card, faceUp: false });
    });

    it('ディーラーが初期化されていない場合は何もしない', () => {
      const { dealCardToDealer } = useDealerStore.getState();
      const card: Card = { suit: 'hearts', rank: '10' };
      
      dealCardToDealer(card, false);
      
      const { dealer } = useDealerStore.getState();
      expect(dealer).toBeNull();
    });
  });

  describe('revealDealerHoleCard', () => {
    it('ディーラーのホールカードを公開する', () => {
      const { initializeDealer, dealCardToDealer, revealDealerHoleCard } = useDealerStore.getState();
      const card1: Card = { suit: 'hearts', rank: '10' };
      const card2: Card = { suit: 'spades', rank: 'A' };
      
      initializeDealer();
      dealCardToDealer(card1, false);
      dealCardToDealer(card2, true);
      revealDealerHoleCard();
      
      const { dealer } = useDealerStore.getState();
      expect(dealer?.isShowingHoleCard).toBe(true);
      expect(dealer?.hand.cards[0].faceUp).toBe(true);
      expect(dealer?.hand.cards[1].faceUp).toBe(true);
    });

    it('ディーラーが初期化されていない場合は何もしない', () => {
      const { revealDealerHoleCard } = useDealerStore.getState();
      
      revealDealerHoleCard();
      
      const { dealer } = useDealerStore.getState();
      expect(dealer).toBeNull();
    });
  });

  describe('shouldDealerHit', () => {
    it('ディーラーがヒットすべきかを判定する', () => {
      const { initializeDealer, dealCardToDealer, shouldDealerHit } = useDealerStore.getState();
      const card1: Card = { suit: 'hearts', rank: '10' };
      const card2: Card = { suit: 'spades', rank: '6' };
      
      initializeDealer();
      dealCardToDealer(card1, false);
      dealCardToDealer(card2, false);
      
      expect(shouldDealerHit()).toBe(true);
    });

    it('ディーラーが17以上の場合はfalseを返す', () => {
      const { initializeDealer, dealCardToDealer, shouldDealerHit } = useDealerStore.getState();
      const card1: Card = { suit: 'hearts', rank: '10' };
      const card2: Card = { suit: 'spades', rank: '7' };
      
      initializeDealer();
      dealCardToDealer(card1, false);
      dealCardToDealer(card2, false);
      
      expect(shouldDealerHit()).toBe(false);
    });

    it('ディーラーが初期化されていない場合はfalseを返す', () => {
      const { shouldDealerHit } = useDealerStore.getState();
      
      expect(shouldDealerHit()).toBe(false);
    });
  });

  describe('resetDealer', () => {
    it('ディーラーをリセットする', () => {
      const { initializeDealer, dealCardToDealer, resetDealer } = useDealerStore.getState();
      const card: Card = { suit: 'hearts', rank: '10' };
      
      initializeDealer();
      dealCardToDealer(card, false);
      resetDealer();
      
      const { dealer } = useDealerStore.getState();
      expect(dealer).toBeNull();
    });
  });
});