import { create } from 'zustand';
import { Player } from './player.types';
import { Brain } from '../brain/brain.types';
import { Card } from '../../core/card/card.types';
import { createPlayer, placeBet, dealCard } from './player.utils';
import { getGameFlowAPI } from '../game-flow/gameFlow.hook';
import { GameFlowEvent, GameFlowEventListener } from '../game-flow/gameFlowEvents.types';

type PlayerStore = {
  players: Player[];
  activePlayerId: string | null;
  eventListener: GameFlowEventListener | null;
  
  // Actions
  addPlayer: (id: string, name: string, brain: Brain, chips: number) => void;
  removePlayer: (id: string) => void;
  setActivePlayer: (id: string | null) => void;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  placeBetForPlayer: (id: string, amount: number) => void;
  dealCardToPlayer: (id: string, card: Card) => void;
  resetAllPlayers: () => void;
  
  // Event handling
  startListeningToEvents: () => void;
  stopListeningToEvents: () => void;
  
  // Selectors
  getActivePlayer: () => Player | null;
  getPlayerById: (id: string) => Player | undefined;
};

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  players: [],
  activePlayerId: null,
  eventListener: null,

  addPlayer: (id, name, brain, chips) => {
    set((state) => ({
      players: [...state.players, createPlayer(id, name, brain, chips)],
    }));
  },

  removePlayer: (id) => {
    set((state) => ({
      players: state.players.filter((p) => p.id !== id),
      activePlayerId: state.activePlayerId === id ? null : state.activePlayerId,
    }));
  },

  setActivePlayer: (id) => {
    set((state) => ({
      activePlayerId: id,
      players: state.players.map((player) => ({
        ...player,
        isActive: player.id === id,
      })),
    }));
  },

  updatePlayer: (id, updates) => {
    set((state) => ({
      players: state.players.map((player) =>
        player.id === id ? { ...player, ...updates } : player
      ),
    }));
  },

  placeBetForPlayer: (id, amount) => {
    set((state) => {
      const player = state.players.find((p) => p.id === id);
      if (!player) return state;

      try {
        const updatedPlayer = placeBet(player, amount);
        return {
          players: state.players.map((p) =>
            p.id === id ? updatedPlayer : p
          ),
        };
      } catch {
        // Handle insufficient chips or invalid bet silently
        return state;
      }
    });
  },

  dealCardToPlayer: (id, card) => {
    set((state) => {
      const player = state.players.find((p) => p.id === id);
      if (!player) return state;

      const updatedPlayer = dealCard(player, card);
      return {
        players: state.players.map((p) =>
          p.id === id ? updatedPlayer : p
        ),
      };
    });
  },

  resetAllPlayers: () => {
    set((state) => ({
      players: state.players.map((player) => ({
        ...player,
        hand: {
          cards: [],
          value: 0,
          isBust: false,
          isBlackjack: false,
        },
        currentBet: 0,
        isActive: false,
        hasStood: false,
        hasBusted: false,
      })),
      activePlayerId: null,
    }));
  },

  getActivePlayer: () => {
    const state = get();
    if (!state.activePlayerId) return null;
    return state.players.find((p) => p.id === state.activePlayerId) || null;
  },

  getPlayerById: (id) => {
    return get().players.find((p) => p.id === id);
  },

  startListeningToEvents: () => {
    const { eventListener } = get();
    
    // 既にリスナーが登録されている場合は何もしない
    if (eventListener) return;
    
    const listener: GameFlowEventListener = (event: GameFlowEvent) => {
      const store = get();
      
      switch (event.type) {
        case 'card_dealt':
          // プレイヤーにカードが配られた
          if (event.receiverId !== 'dealer') {
            const player = store.getPlayerById(event.receiverId);
            if (player && !player.hand.cards.some(c => 
              c.suit === event.card.suit && c.rank === event.card.rank
            )) {
              store.dealCardToPlayer(event.receiverId, event.card);
            }
          }
          break;
          
        case 'bet_placed':
          // ベットが置かれた
          store.placeBetForPlayer(event.playerId, event.amount);
          break;
          
        case 'player_busted':
          // プレイヤーがバストした
          store.updatePlayer(event.playerId, { hasBusted: true });
          break;
          
        case 'player_stood':
          // プレイヤーがスタンドした
          store.updatePlayer(event.playerId, { hasStood: true });
          break;
      }
    };
    
    // イベントエミッターに登録
    const gameFlowAPI = getGameFlowAPI();
    const emitter = gameFlowAPI.getEventEmitter();
    emitter.on(listener);
    
    set({ eventListener: listener });
  },

  stopListeningToEvents: () => {
    const { eventListener } = get();
    
    if (eventListener) {
      const gameFlowAPI = getGameFlowAPI();
      const emitter = gameFlowAPI.getEventEmitter();
      emitter.off(eventListener);
      
      set({ eventListener: null });
    }
  },
}));