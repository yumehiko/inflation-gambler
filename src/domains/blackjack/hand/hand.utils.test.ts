import { describe, it, expect } from 'vitest';
import { Card } from '../../core/card/card.types';
import { calculateHandValue, isBust, isBlackjack, createHand, addCardToHand, calculateVisibleValue } from './hand.utils';

describe('hand.utils', () => {
  describe('calculateHandValue', () => {
    it('数字カードの合計値を正しく計算する', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: '2' },
        { suit: 'diamonds', rank: '5' },
        { suit: 'spades', rank: '7' },
      ];
      expect(calculateHandValue(cards)).toBe(14);
    });

    it('絵札（J,Q,K）を10として計算する', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: 'J' },
        { suit: 'diamonds', rank: 'Q' },
        { suit: 'spades', rank: 'K' },
      ];
      expect(calculateHandValue(cards)).toBe(30);
    });

    it('エースを11として計算する（バーストしない場合）', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: 'A' },
        { suit: 'diamonds', rank: '5' },
      ];
      expect(calculateHandValue(cards)).toBe(16);
    });

    it('エースを1として計算する（11だとバーストする場合）', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: 'A' },
        { suit: 'diamonds', rank: '10' },
        { suit: 'spades', rank: '6' },
      ];
      expect(calculateHandValue(cards)).toBe(17);
    });

    it('複数のエースがある場合、最適な値を計算する', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: 'A' },
        { suit: 'diamonds', rank: 'A' },
        { suit: 'spades', rank: '9' },
      ];
      expect(calculateHandValue(cards)).toBe(21);
    });

    it('空の手札は0を返す', () => {
      expect(calculateHandValue([])).toBe(0);
    });
  });

  describe('isBust', () => {
    it('21を超える場合はtrueを返す', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: '10' },
        { suit: 'diamonds', rank: '9' },
        { suit: 'spades', rank: '5' },
      ];
      expect(isBust(cards)).toBe(true);
    });

    it('21以下の場合はfalseを返す', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: '10' },
        { suit: 'diamonds', rank: '9' },
      ];
      expect(isBust(cards)).toBe(false);
    });

    it('21ちょうどの場合はfalseを返す', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: 'A' },
        { suit: 'diamonds', rank: 'K' },
      ];
      expect(isBust(cards)).toBe(false);
    });
  });

  describe('isBlackjack', () => {
    it('A + 10の組み合わせはtrueを返す', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: 'A' },
        { suit: 'diamonds', rank: '10' },
      ];
      expect(isBlackjack(cards)).toBe(true);
    });

    it('A + Kの組み合わせはtrueを返す', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: 'A' },
        { suit: 'diamonds', rank: 'K' },
      ];
      expect(isBlackjack(cards)).toBe(true);
    });

    it('3枚以上のカードで21の場合はfalseを返す', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: '7' },
        { suit: 'diamonds', rank: '7' },
        { suit: 'spades', rank: '7' },
      ];
      expect(isBlackjack(cards)).toBe(false);
    });

    it('2枚でも21でない場合はfalseを返す', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: '10' },
        { suit: 'diamonds', rank: '9' },
      ];
      expect(isBlackjack(cards)).toBe(false);
    });
  });

  describe('createHand', () => {
    it('カードから正しいHandオブジェクトを作成する', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: '10' },
        { suit: 'diamonds', rank: '9' },
      ];
      const hand = createHand(cards);
      
      expect(hand.cards).toEqual(cards);
      expect(hand.value).toBe(19);
      expect(hand.isBust).toBe(false);
      expect(hand.isBlackjack).toBe(false);
    });

    it('ブラックジャックの手札を正しく作成する', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: 'A' },
        { suit: 'diamonds', rank: 'K' },
      ];
      const hand = createHand(cards);
      
      expect(hand.value).toBe(21);
      expect(hand.isBlackjack).toBe(true);
      expect(hand.isBust).toBe(false);
    });

    it('バーストした手札を正しく作成する', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: '10' },
        { suit: 'diamonds', rank: '9' },
        { suit: 'spades', rank: '5' },
      ];
      const hand = createHand(cards);
      
      expect(hand.value).toBe(24);
      expect(hand.isBust).toBe(true);
      expect(hand.isBlackjack).toBe(false);
    });

    it('softハンド（エースを含む）の場合、softValueを設定する', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: 'A' },
        { suit: 'diamonds', rank: '6' },
      ];
      const hand = createHand(cards);
      
      expect(hand.value).toBe(17);
      expect(hand.softValue).toBe(7);
    });
  });

  describe('addCardToHand', () => {
    it('手札にカードを追加して新しいHandを返す', () => {
      const initialHand = createHand([
        { suit: 'hearts', rank: '10' },
      ]);
      const newCard: Card = { suit: 'diamonds', rank: '9' };
      const newHand = addCardToHand(initialHand, newCard);

      expect(newHand.cards).toHaveLength(2);
      expect(newHand.cards[1]).toEqual(newCard);
      expect(newHand.value).toBe(19);
    });

    it('元のHandオブジェクトは変更されない（イミュータブル）', () => {
      const initialHand = createHand([
        { suit: 'hearts', rank: '10' },
      ]);
      const newCard: Card = { suit: 'diamonds', rank: '9' };
      const newHand = addCardToHand(initialHand, newCard);

      expect(initialHand.cards).toHaveLength(1);
      expect(initialHand.value).toBe(10);
      expect(newHand).not.toBe(initialHand);
    });
  });

  describe('calculateVisibleValue', () => {
    it('すべてのカードが表向きの場合、通常の値を返す', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: '10', faceUp: true },
        { suit: 'diamonds', rank: '9', faceUp: true },
      ];
      expect(calculateVisibleValue(cards)).toBe(19);
    });

    it('faceUpが未定義の場合は表向きとして扱う', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: '10' },
        { suit: 'diamonds', rank: '9' },
      ];
      expect(calculateVisibleValue(cards)).toBe(19);
    });

    it('裏向きのカードは計算に含めない', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: '10', faceUp: true },
        { suit: 'diamonds', rank: '9', faceUp: false },
      ];
      expect(calculateVisibleValue(cards)).toBe(10);
    });

    it('すべてのカードが裏向きの場合は0を返す', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: '10', faceUp: false },
        { suit: 'diamonds', rank: '9', faceUp: false },
      ];
      expect(calculateVisibleValue(cards)).toBe(0);
    });

    it('エースを含む表向きカードのみで計算する', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: 'A', faceUp: true },
        { suit: 'diamonds', rank: '5', faceUp: true },
        { suit: 'spades', rank: 'K', faceUp: false },
      ];
      expect(calculateVisibleValue(cards)).toBe(16);
    });

    it('表向きカードのみでバーストする場合も正しく計算する', () => {
      const cards: Card[] = [
        { suit: 'hearts', rank: '10', faceUp: true },
        { suit: 'diamonds', rank: '9', faceUp: true },
        { suit: 'spades', rank: '5', faceUp: true },
        { suit: 'clubs', rank: 'K', faceUp: false },
      ];
      expect(calculateVisibleValue(cards)).toBe(24);
    });
  });
});