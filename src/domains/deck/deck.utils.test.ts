import { describe, it, expect } from 'vitest';
import { Card } from '../card/card.types';
import { Deck } from './deck.types';
import {
  createDeck,
  shuffleDeck,
  drawCard,
} from './deck.utils';

describe('deck utils', () => {
  describe('createDeck', () => {
    it('52枚のカードを持つデッキを作成する', () => {
      const deck = createDeck();
      expect(deck).toHaveLength(52);
    });

    it('各スートが13枚ずつ含まれる', () => {
      const deck = createDeck();
      const suits = ['hearts', 'diamonds', 'spades', 'clubs'] as const;
      
      suits.forEach(suit => {
        const cardsOfSuit = deck.filter(card => card.suit === suit);
        expect(cardsOfSuit).toHaveLength(13);
      });
    });

    it('各ランクが4枚ずつ含まれる', () => {
      const deck = createDeck();
      const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;
      
      ranks.forEach(rank => {
        const cardsOfRank = deck.filter(card => card.rank === rank);
        expect(cardsOfRank).toHaveLength(4);
      });
    });

    it('重複するカードが存在しない', () => {
      const deck = createDeck();
      const cardStrings = deck.map(card => `${card.suit}-${card.rank}`);
      const uniqueCardStrings = new Set(cardStrings);
      expect(uniqueCardStrings.size).toBe(52);
    });
  });

  describe('shuffleDeck', () => {
    it('デッキの枚数が変わらない', () => {
      const deck = createDeck();
      const shuffled = shuffleDeck(deck);
      expect(shuffled).toHaveLength(52);
    });

    it('元のデッキを変更しない（純粋関数）', () => {
      const deck = createDeck();
      const originalDeck = [...deck];
      shuffleDeck(deck);
      expect(deck).toEqual(originalDeck);
    });

    it('シャッフル後のデッキに同じカードがすべて含まれる', () => {
      const deck = createDeck();
      const shuffled = shuffleDeck(deck);
      
      deck.forEach(card => {
        const found = shuffled.find(c => c.suit === card.suit && c.rank === card.rank);
        expect(found).toBeDefined();
      });
    });

    it('複数回シャッフルすると異なる結果になる（確率的）', () => {
      const deck = createDeck();
      const shuffled1 = shuffleDeck(deck);
      const shuffled2 = shuffleDeck(deck);
      
      // すべてのカードが同じ位置にある確率は極めて低い
      const samePositions = shuffled1.filter((card, index) => 
        card.suit === shuffled2[index].suit && card.rank === shuffled2[index].rank
      ).length;
      
      // 52枚すべてが同じ位置にある可能性は天文学的に低いので、
      // 半分以上が異なる位置にあることを期待
      expect(samePositions).toBeLessThan(26);
    });
  });

  describe('drawCard', () => {
    it('デッキから1枚カードを引く', () => {
      const deck = createDeck();
      const result = drawCard(deck);
      
      expect(result.card).toBeDefined();
      expect(result.remainingDeck).toHaveLength(51);
    });

    it('引いたカードが残りのデッキに含まれない', () => {
      const deck = createDeck();
      const { card, remainingDeck } = drawCard(deck);
      
      const found = remainingDeck.find(c => 
        c.suit === card.suit && c.rank === card.rank
      );
      expect(found).toBeUndefined();
    });

    it('元のデッキを変更しない（純粋関数）', () => {
      const deck = createDeck();
      const originalDeck = [...deck];
      drawCard(deck);
      expect(deck).toEqual(originalDeck);
    });

    it('空のデッキから引こうとするとエラーを投げる', () => {
      const emptyDeck: Deck = [];
      expect(() => drawCard(emptyDeck)).toThrow('Cannot draw from an empty deck');
    });

    it('複数回カードを引くと異なるカードが引かれる', () => {
      let deck = createDeck();
      const drawnCards: Card[] = [];
      
      for (let i = 0; i < 5; i++) {
        const { card, remainingDeck } = drawCard(deck);
        drawnCards.push(card);
        deck = remainingDeck;
      }
      
      // 引いた5枚がすべて異なることを確認
      const uniqueCards = new Set(drawnCards.map(c => `${c.suit}-${c.rank}`));
      expect(uniqueCards.size).toBe(5);
      expect(deck).toHaveLength(47);
    });
  });
});