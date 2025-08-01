import { describe, it, expect } from 'vitest';
import {
  createHandHolder,
  updateHandHolderStatus,
  canPerformAction,
  getAvailableActions,
  addCardToHandHolder,
  canSplit,
  canDouble,
} from './handHolder.utils';
import { HandHolder, HandHolderStatus } from './handHolder.types';
import { Card } from '../../core/card/card.types';
import { createHand } from '../hand/hand.utils';

describe('handHolder.utils', () => {
  const createCard = (rank: string, suit: string): Card => ({
    rank: rank as Card['rank'],
    suit: suit as Card['suit'],
    faceUp: true,
  });

  describe('createHandHolder', () => {
    it('should create a dealer HandHolder', () => {
      const holder = createHandHolder('dealer-1', 'dealer');
      
      expect(holder).toEqual({
        id: 'dealer-1',
        type: 'dealer',
        hand: createHand([]),
        status: 'waiting',
      });
    });

    it('should create a participant HandHolder', () => {
      const holder = createHandHolder('player-1', 'participant');
      
      expect(holder).toEqual({
        id: 'player-1',
        type: 'participant',
        hand: createHand([]),
        status: 'waiting',
      });
    });
  });

  describe('updateHandHolderStatus', () => {
    it('should update status to blackjack when hand is blackjack', () => {
      const holder = createHandHolder('player-1', 'participant');
      const cards = [createCard('A', 'spades'), createCard('K', 'hearts')];
      const hand = createHand(cards);
      const holderWithCards: HandHolder = { ...holder, hand };

      const updated = updateHandHolderStatus(holderWithCards);
      
      expect(updated.status).toBe('blackjack');
    });

    it('should update status to bust when hand is bust', () => {
      const holder = createHandHolder('player-1', 'participant');
      const cards = [
        createCard('K', 'spades'),
        createCard('Q', 'hearts'),
        createCard('5', 'diamonds'),
      ];
      const hand = createHand(cards);
      const holderWithCards: HandHolder = { ...holder, hand };

      const updated = updateHandHolderStatus(holderWithCards);
      
      expect(updated.status).toBe('bust');
    });

    it('should keep active status when hand is playable', () => {
      const holder = createHandHolder('player-1', 'participant');
      const cards = [createCard('7', 'spades'), createCard('8', 'hearts')];
      const hand = createHand(cards);
      const holderWithCards: HandHolder = { ...holder, hand, status: 'active' };

      const updated = updateHandHolderStatus(holderWithCards);
      
      expect(updated.status).toBe('active');
    });

    it('should not change waiting or stand status', () => {
      const holder = createHandHolder('player-1', 'participant');
      
      const waitingHolder = { ...holder, status: 'waiting' as HandHolderStatus };
      expect(updateHandHolderStatus(waitingHolder).status).toBe('waiting');
      
      const standHolder = { ...holder, status: 'stand' as HandHolderStatus };
      expect(updateHandHolderStatus(standHolder).status).toBe('stand');
    });
  });

  describe('canPerformAction', () => {
    it('should return true for hit when status is active and not bust', () => {
      const holder: HandHolder = {
        id: 'player-1',
        type: 'participant',
        hand: createHand([createCard('7', 'spades'), createCard('8', 'hearts')]),
        status: 'active',
      };

      expect(canPerformAction(holder, 'hit')).toBe(true);
    });

    it('should return false for hit when status is bust', () => {
      const holder: HandHolder = {
        id: 'player-1',
        type: 'participant',
        hand: createHand([]),
        status: 'bust',
      };

      expect(canPerformAction(holder, 'hit')).toBe(false);
    });

    it('should return true for stand when status is active', () => {
      const holder: HandHolder = {
        id: 'player-1',
        type: 'participant',
        hand: createHand([createCard('7', 'spades'), createCard('8', 'hearts')]),
        status: 'active',
      };

      expect(canPerformAction(holder, 'stand')).toBe(true);
    });

    it('should return true for double when participant has exactly 2 cards and status is active', () => {
      const holder: HandHolder = {
        id: 'player-1',
        type: 'participant',
        hand: createHand([createCard('5', 'spades'), createCard('6', 'hearts')]),
        status: 'active',
      };

      expect(canPerformAction(holder, 'double')).toBe(true);
    });

    it('should return false for double when dealer', () => {
      const holder: HandHolder = {
        id: 'dealer-1',
        type: 'dealer',
        hand: createHand([createCard('5', 'spades'), createCard('6', 'hearts')]),
        status: 'active',
      };

      expect(canPerformAction(holder, 'double')).toBe(false);
    });

    it('should return true for split when participant has matching rank cards', () => {
      const holder: HandHolder = {
        id: 'player-1',
        type: 'participant',
        hand: createHand([createCard('8', 'spades'), createCard('8', 'hearts')]),
        status: 'active',
      };

      expect(canPerformAction(holder, 'split')).toBe(true);
    });
  });

  describe('getAvailableActions', () => {
    it('should return all available actions for a participant with splittable hand', () => {
      const holder: HandHolder = {
        id: 'player-1',
        type: 'participant',
        hand: createHand([createCard('8', 'spades'), createCard('8', 'hearts')]),
        status: 'active',
      };

      const actions = getAvailableActions(holder);
      
      expect(actions).toEqual({
        canHit: true,
        canStand: true,
        canDouble: true,
        canSplit: true,
      });
    });

    it('should return limited actions for dealer', () => {
      const holder: HandHolder = {
        id: 'dealer-1',
        type: 'dealer',
        hand: createHand([createCard('7', 'spades'), createCard('8', 'hearts')]),
        status: 'active',
      };

      const actions = getAvailableActions(holder);
      
      expect(actions).toEqual({
        canHit: true,
        canStand: true,
        canDouble: false,
        canSplit: false,
      });
    });

    it('should return no actions when bust', () => {
      const holder: HandHolder = {
        id: 'player-1',
        type: 'participant',
        hand: createHand([]),
        status: 'bust',
      };

      const actions = getAvailableActions(holder);
      
      expect(actions).toEqual({
        canHit: false,
        canStand: false,
        canDouble: false,
        canSplit: false,
      });
    });
  });

  describe('addCardToHandHolder', () => {
    it('should add card and update status', () => {
      const holder = createHandHolder('player-1', 'participant');
      const activeHolder = { ...holder, status: 'active' as HandHolderStatus };
      const card = createCard('A', 'spades');

      const updated = addCardToHandHolder(activeHolder, card);
      
      expect(updated.hand.cards).toHaveLength(1);
      expect(updated.hand.cards[0]).toEqual(card);
    });

    it('should update status to blackjack when achieving blackjack', () => {
      const holder: HandHolder = {
        id: 'player-1',
        type: 'participant',
        hand: createHand([createCard('A', 'spades')]),
        status: 'active',
      };
      const card = createCard('K', 'hearts');

      const updated = addCardToHandHolder(holder, card);
      
      expect(updated.status).toBe('blackjack');
    });

    it('should update status to bust when exceeding 21', () => {
      const holder: HandHolder = {
        id: 'player-1',
        type: 'participant',
        hand: createHand([createCard('K', 'spades'), createCard('Q', 'hearts')]),
        status: 'active',
      };
      const card = createCard('5', 'diamonds');

      const updated = addCardToHandHolder(holder, card);
      
      expect(updated.status).toBe('bust');
    });
  });

  describe('canSplit', () => {
    it('should return true when two cards have same rank', () => {
      const cards = [createCard('8', 'spades'), createCard('8', 'hearts')];
      expect(canSplit(cards)).toBe(true);
    });

    it('should return false when two cards have different ranks', () => {
      const cards = [createCard('8', 'spades'), createCard('9', 'hearts')];
      expect(canSplit(cards)).toBe(false);
    });

    it('should return false when not exactly 2 cards', () => {
      expect(canSplit([createCard('8', 'spades')])).toBe(false);
      expect(canSplit([
        createCard('8', 'spades'),
        createCard('8', 'hearts'),
        createCard('8', 'diamonds'),
      ])).toBe(false);
    });

    it('should return true for face cards with same rank', () => {
      const cards = [createCard('K', 'spades'), createCard('K', 'hearts')];
      expect(canSplit(cards)).toBe(true);
    });

    it('should return false for different face cards', () => {
      const cards = [createCard('K', 'spades'), createCard('Q', 'hearts')];
      expect(canSplit(cards)).toBe(false);
    });
  });

  describe('canDouble', () => {
    it('should return true when exactly 2 cards', () => {
      const cards = [createCard('5', 'spades'), createCard('6', 'hearts')];
      expect(canDouble(cards)).toBe(true);
    });

    it('should return false when not exactly 2 cards', () => {
      expect(canDouble([createCard('5', 'spades')])).toBe(false);
      expect(canDouble([
        createCard('5', 'spades'),
        createCard('6', 'hearts'),
        createCard('2', 'diamonds'),
      ])).toBe(false);
    });
  });
});