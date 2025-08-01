import { describe, it, expect } from 'vitest';
import { Card } from '../../core/card/card.types';
import { createHand } from '../hand/hand.utils';
import {
  createDealer,
  shouldHit,
  dealCard,
  revealHoleCard,
} from './dealer.utils';

describe('dealer.utils', () => {
  describe('createDealer', () => {
    it('空のハンドでディーラーを作成する', () => {
      const dealer = createDealer();
      
      expect(dealer.id).toBe('dealer');
      expect(dealer.hand.cards).toEqual([]);
      expect(dealer.hand.value).toBe(0);
      expect(dealer.isShowingHoleCard).toBe(false);
    });
  });

  describe('shouldHit', () => {
    it('ハンドの値が16以下の場合はtrueを返す', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: '10' },
        { suit: 'spades', rank: '6' },
      ];
      const hand = createHand(cards);
      
      expect(shouldHit(hand)).toBe(true);
    });

    it('ハンドの値が17以上の場合はfalseを返す', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: '10' },
        { suit: 'spades', rank: '7' },
      ];
      const hand = createHand(cards);
      
      expect(shouldHit(hand)).toBe(false);
    });

    it('ソフト17（Aと6）の場合はtrueを返す', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: 'A' },
        { suit: 'spades', rank: '6' },
      ];
      const hand = createHand(cards);
      
      expect(shouldHit(hand)).toBe(true);
    });

    it('ハード17の場合はfalseを返す', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: '10' },
        { suit: 'spades', rank: '3' },
        { suit: 'diamonds', rank: '4' },
      ];
      const hand = createHand(cards);
      
      expect(shouldHit(hand)).toBe(false);
    });
  });

  describe('dealCard', () => {
    it('通常のカードを配る（表向き）', () => {
      const dealer = createDealer();
      const card: Card = { suit: 'hearts', rank: '10' };
      
      const newDealer = dealCard(dealer, card, false);
      
      expect(newDealer.hand.cards).toHaveLength(1);
      expect(newDealer.hand.cards[0]).toEqual({ ...card, faceUp: true });
      expect(newDealer.hand.value).toBe(10);
    });

    it('ホールカードを配る（裏向き）', () => {
      const dealer = createDealer();
      const card: Card = { suit: 'hearts', rank: 'K' };
      
      const newDealer = dealCard(dealer, card, true);
      
      expect(newDealer.hand.cards).toHaveLength(1);
      expect(newDealer.hand.cards[0]).toEqual({ ...card, faceUp: false });
      expect(newDealer.hand.value).toBe(10);
      expect(newDealer.isShowingHoleCard).toBe(false);
    });

    it('複数のカードを順番に配る', () => {
      let dealer = createDealer();
      const card1: Card = { suit: 'hearts', rank: '10' };
      const card2: Card = { suit: 'spades', rank: 'A' };
      
      dealer = dealCard(dealer, card1, false);
      dealer = dealCard(dealer, card2, true);
      
      expect(dealer.hand.cards).toHaveLength(2);
      expect(dealer.hand.cards[0].faceUp).toBe(true);
      expect(dealer.hand.cards[1].faceUp).toBe(false);
      expect(dealer.hand.value).toBe(21);
    });
  });

  describe('revealHoleCard', () => {
    it('ホールカードを公開する', () => {
      let dealer = createDealer();
      const card1: Card = { suit: 'hearts', rank: '10' };
      const card2: Card = { suit: 'spades', rank: 'A' };
      
      dealer = dealCard(dealer, card1, false);
      dealer = dealCard(dealer, card2, true);
      
      const revealedDealer = revealHoleCard(dealer);
      
      expect(revealedDealer.isShowingHoleCard).toBe(true);
      expect(revealedDealer.hand.cards[0].faceUp).toBe(true);
      expect(revealedDealer.hand.cards[1].faceUp).toBe(true);
    });

    it('カードがない場合でも正常に動作する', () => {
      const dealer = createDealer();
      const revealedDealer = revealHoleCard(dealer);
      
      expect(revealedDealer.isShowingHoleCard).toBe(true);
      expect(revealedDealer.hand.cards).toEqual([]);
    });
  });
});