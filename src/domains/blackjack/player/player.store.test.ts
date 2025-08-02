import { describe, it, expect, beforeEach } from 'vitest';
import { usePlayerStore } from './player.store';
import { Brain } from '../brain/brain.types';
import { Hand } from '../hand/hand.types';

describe('player.store', () => {
  const mockBrain: Brain = {
    type: 'human',
    makeDecision: () => 'stand',
  };

  beforeEach(() => {
    usePlayerStore.setState({
      players: [],
      activePlayerId: null,
    });
  });

  describe('addPlayer', () => {
    it('should add a new player', () => {
      const store = usePlayerStore.getState();
      store.addPlayer('player1', 'John', mockBrain, 1000);

      const players = usePlayerStore.getState().players;
      expect(players).toHaveLength(1);
      expect(players[0].name).toBe('John');
      expect(players[0].chips).toBe(1000);
    });
  });

  describe('removePlayer', () => {
    it('should remove a player by id', () => {
      const store = usePlayerStore.getState();
      store.addPlayer('player1', 'John', mockBrain, 1000);
      store.addPlayer('player2', 'Jane', mockBrain, 1500);

      store.removePlayer('player1');

      const players = usePlayerStore.getState().players;
      expect(players).toHaveLength(1);
      expect(players[0].name).toBe('Jane');
    });

    it('should clear active player if removed player was active', () => {
      const store = usePlayerStore.getState();
      store.addPlayer('player1', 'John', mockBrain, 1000);
      store.setActivePlayer('player1');

      store.removePlayer('player1');

      expect(usePlayerStore.getState().activePlayerId).toBeNull();
    });
  });

  describe('setActivePlayer', () => {
    it('should set the active player and update isActive flag', () => {
      const store = usePlayerStore.getState();
      store.addPlayer('player1', 'John', mockBrain, 1000);
      store.addPlayer('player2', 'Jane', mockBrain, 1500);

      store.setActivePlayer('player2');

      const state = usePlayerStore.getState();
      expect(state.activePlayerId).toBe('player2');
      expect(state.players[0].isActive).toBe(false);
      expect(state.players[1].isActive).toBe(true);
    });
  });

  describe('updatePlayer', () => {
    it('should update a specific player', () => {
      const store = usePlayerStore.getState();
      store.addPlayer('player1', 'John', mockBrain, 1000);

      const newHand: Hand = {
        cards: [],
        value: 21,
        isBust: false,
        isBlackjack: true,
      };

      store.updatePlayer('player1', { hand: newHand });

      const player = usePlayerStore.getState().players[0];
      expect(player.hand.value).toBe(21);
      expect(player.hand.isBlackjack).toBe(true);
    });
  });

  describe('placeBetForPlayer', () => {
    it('should place bet for a specific player', () => {
      const store = usePlayerStore.getState();
      store.addPlayer('player1', 'John', mockBrain, 1000);

      store.placeBetForPlayer('player1', 100);

      const player = usePlayerStore.getState().players[0];
      expect(player.currentBet).toBe(100);
      expect(player.chips).toBe(900);
    });

    it('should not place bet if insufficient chips', () => {
      const store = usePlayerStore.getState();
      store.addPlayer('player1', 'John', mockBrain, 100);

      store.placeBetForPlayer('player1', 200);

      const player = usePlayerStore.getState().players[0];
      expect(player.currentBet).toBe(0);
      expect(player.chips).toBe(100);
    });
  });

  describe('resetAllPlayers', () => {
    it('should reset all players to initial state', () => {
      const store = usePlayerStore.getState();
      store.addPlayer('player1', 'John', mockBrain, 1000);
      store.addPlayer('player2', 'Jane', mockBrain, 1500);

      // Modify players
      store.placeBetForPlayer('player1', 100);
      store.updatePlayer('player1', { hasStood: true });
      store.setActivePlayer('player2');

      store.resetAllPlayers();

      const players = usePlayerStore.getState().players;
      expect(players[0].currentBet).toBe(0);
      expect(players[0].hasStood).toBe(false);
      expect(players[0].hasBusted).toBe(false);
      expect(players[0].isActive).toBe(false);
      expect(players[0].hand.cards).toHaveLength(0);
    });
  });

  describe('getActivePlayer', () => {
    it('should return the active player', () => {
      const store = usePlayerStore.getState();
      store.addPlayer('player1', 'John', mockBrain, 1000);
      store.addPlayer('player2', 'Jane', mockBrain, 1500);
      store.setActivePlayer('player2');

      const activePlayer = store.getActivePlayer();
      expect(activePlayer?.name).toBe('Jane');
    });

    it('should return null if no active player', () => {
      const store = usePlayerStore.getState();
      store.addPlayer('player1', 'John', mockBrain, 1000);

      const activePlayer = store.getActivePlayer();
      expect(activePlayer).toBeNull();
    });
  });

  describe('getPlayerById', () => {
    it('should return player by id', () => {
      const store = usePlayerStore.getState();
      store.addPlayer('player1', 'John', mockBrain, 1000);
      store.addPlayer('player2', 'Jane', mockBrain, 1500);

      const player = store.getPlayerById('player2');
      expect(player?.name).toBe('Jane');
    });

    it('should return undefined if player not found', () => {
      const store = usePlayerStore.getState();
      store.addPlayer('player1', 'John', mockBrain, 1000);

      const player = store.getPlayerById('player3');
      expect(player).toBeUndefined();
    });
  });
});