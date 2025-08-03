import { create } from 'zustand';
import { GameFlow, GameConfig } from './gameFlow.types';
import { Decision } from '../brain/brain.types';
import { usePlayerStore } from '../player/player.store';
import { useDealerStore } from '../dealer/dealer.store';
import {
  createGameFlow,
  canStartGame,
  canDealCards,
  canStartPlayerTurn,
  canSettle,
  startBettingPhase,
  collectBets,
  dealInitialCards,
  checkBlackjacks,
  processPlayerTurn,
  processDealerTurn,
  settleGame,
  getNextPlayer,
} from './gameFlow.utils';

type GameFlowStore = {
  game: GameFlow | null;
  
  // ゲーム管理
  initializeGame: (config: GameConfig) => void;
  startGame: () => Promise<void>;
  
  // フェーズ進行
  proceedToNextPhase: () => Promise<void>;
  
  // 個別アクション
  handlePlayerAction: (playerId: string, action: Decision) => Promise<void>;
  
  // リセット
  resetGame: () => void;
};

export const useGameFlowStore = create<GameFlowStore>((set, get) => ({
  game: null,

  initializeGame: (config) => {
    const newGame = createGameFlow(config);
    set({ game: newGame });
  },

  startGame: async () => {
    const { game } = get();
    if (!game) {
      throw new Error('Game not initialized');
    }

    if (!canStartGame(game)) {
      throw new Error('Cannot start game in current phase');
    }

    const updatedGame = startBettingPhase(game);
    set({ game: updatedGame });
  },

  proceedToNextPhase: async () => {
    const { game } = get();
    if (!game) {
      throw new Error('Game not initialized');
    }

    const playerStore = usePlayerStore.getState();
    const dealerStore = useDealerStore.getState();
    const players = playerStore.players;
    const dealer = dealerStore.dealer;

    if (!dealer) {
      throw new Error('Dealer not initialized');
    }

    let updatedGame = game;

    switch (game.phase) {
      case 'betting':
        if (canDealCards(game)) {
          // Collect bets from all players
          updatedGame = await collectBets(game, players);
          // Deal initial cards
          updatedGame = dealInitialCards(updatedGame, dealer, players);
          // Check for blackjacks
          updatedGame = checkBlackjacks(updatedGame, dealer, players);
          // Set phase to playing
          updatedGame = { ...updatedGame, phase: 'playing', currentPlayerId: players[0]?.id || null };
        }
        break;

      case 'dealing':
        if (canStartPlayerTurn(game)) {
          updatedGame = { ...updatedGame, phase: 'playing', currentPlayerId: players[0]?.id || null };
        }
        break;

      case 'playing':
        if (game.currentPlayerId) {
          const currentPlayer = players.find(p => p.id === game.currentPlayerId);
          if (currentPlayer) {
            updatedGame = await processPlayerTurn(game, currentPlayer);
            
            // Check if there are more players
            const nextPlayerId = getNextPlayer(updatedGame);
            if (nextPlayerId) {
              updatedGame = { ...updatedGame, currentPlayerId: nextPlayerId };
              playerStore.setActivePlayer(nextPlayerId);
            } else {
              // All players done, move to dealer turn
              updatedGame = await processDealerTurn(updatedGame);
              updatedGame = { ...updatedGame, phase: 'dealerTurn', currentPlayerId: null };
              playerStore.setActivePlayer(null);
            }
          }
        }
        break;

      case 'dealerTurn':
        if (canSettle(game)) {
          updatedGame = settleGame(updatedGame, dealer, players);
        }
        break;

      case 'settlement':
        updatedGame = { ...updatedGame, phase: 'finished' };
        break;

      case 'finished':
        // Game is complete
        break;
    }

    set({ game: updatedGame });
  },

  handlePlayerAction: async (playerId) => {
    const { game } = get();
    if (!game) {
      throw new Error('Game not initialized');
    }

    if (game.phase !== 'playing') {
      throw new Error('Cannot handle player action in current phase');
    }

    const playerStore = usePlayerStore.getState();
    const player = playerStore.players.find(p => p.id === playerId);
    
    if (!player) {
      throw new Error('Player not found');
    }

    // Process the player turn with the action
    const updatedGame = await processPlayerTurn(game, player);
    set({ game: updatedGame });
  },

  resetGame: () => {
    set({ game: null });
  },
}));