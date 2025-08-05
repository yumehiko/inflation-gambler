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
import { GameFlowEventEmitter } from './gameFlowEvents.types';
import { createEventEmitter } from './gameFlowEvents.utils';
import { mapGameEventToFlowEvent } from './gameFlowEventMapper.utils';

import { GamePhase } from './gameFlow.types';

type GameFlowStore = {
  game: GameFlow | null;
  eventEmitter: GameFlowEventEmitter;
  
  // ゲーム管理
  initializeGame: (config: GameConfig) => void;
  startGame: () => Promise<void>;
  
  // フェーズ進行
  proceedToNextPhase: () => Promise<void>;
  
  // 個別アクション
  handlePlayerAction: (playerId: string, action: Decision) => Promise<void>;
  
  // リセット
  resetGame: () => void;
  
  // 開発・テスト用
  setPhase: (phase: GamePhase) => void;
  
  // イベントAPI
  getEventEmitter: () => GameFlowEventEmitter;
};

export const useGameFlowStore = create<GameFlowStore>((set, get) => ({
  game: null,
  eventEmitter: createEventEmitter(),

  initializeGame: (config) => {
    // GameFlowを作成
    const newGame = createGameFlow(config);
    
    // プレイヤーストアを初期化
    const playerStore = usePlayerStore.getState();
    playerStore.resetAllPlayers();
    
    // 各プレイヤーを追加
    config.playerConfigs.forEach(pc => {
      playerStore.addPlayer(pc.id, pc.name, pc.brain, pc.initialChips);
    });
    
    // ディーラーストアを初期化
    const dealerStore = useDealerStore.getState();
    dealerStore.initializeDealer();
    
    // イベントリスナーを開始
    playerStore.startListeningToEvents();
    dealerStore.startListeningToEvents();
    
    // GameFlowを設定
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

    console.log('proceedToNextPhase called, current phase:', game.phase);

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
        console.log('Processing betting phase');
        if (canDealCards(game)) {
          // Collect bets from all players
          console.log('Collecting bets from players:', players);
          updatedGame = await collectBets(game, players);
          
          // Emit bet placed events
          const emitter = get().eventEmitter;
          for (const player of players) {
            const betEvent = updatedGame.history.find(
              e => e.type === 'bet_placed' && e.playerId === player.id
            );
            if (betEvent) {
              const flowEvent = mapGameEventToFlowEvent(betEvent);
              if (flowEvent) {
                emitter.emit(flowEvent);
              }
            }
          }
          
          // Deal initial cards
          updatedGame = dealInitialCards(updatedGame, dealer, players);
          
          // Emit card dealt events
          const cardEvents = updatedGame.history.filter(e => e.type === 'card_dealt');
          console.log('Card events:', cardEvents);
          
          for (const event of cardEvents) {
            const flowEvent = mapGameEventToFlowEvent(event);
            if (flowEvent) {
              emitter.emit(flowEvent);
            }
          }
          
          // Log updated player states
          const updatedPlayers = playerStore.players;
          console.log('Updated players after dealing:', updatedPlayers.map(p => ({
            id: p.id,
            hand: p.hand,
            currentBet: p.currentBet
          })));
          
          // Log updated dealer state
          const updatedDealer = dealerStore.dealer;
          console.log('Updated dealer after dealing:', updatedDealer);
          
          // Check for blackjacks
          updatedGame = checkBlackjacks(updatedGame, dealer, players);
          // Set phase to playing and activate first player
          const firstPlayerId = players[0]?.id || null;
          updatedGame = { ...updatedGame, phase: 'playing', currentPlayerId: firstPlayerId };
          
          // Activate the first player
          if (firstPlayerId) {
            playerStore.setActivePlayer(firstPlayerId);
          }
          
          console.log('Betting phase complete, moved to playing');
          
          // Continue processing turns
          set({ game: updatedGame });
          // Recursively process the next phase
          await get().proceedToNextPhase();
        }
        break;

      case 'dealing':
        if (canStartPlayerTurn(game)) {
          updatedGame = { ...updatedGame, phase: 'playing', currentPlayerId: players[0]?.id || null };
        }
        break;

      case 'playing':
        if (game.currentPlayerId) {
          // Get the latest player state from the store
          const latestPlayer = playerStore.getPlayerById(game.currentPlayerId);
          if (latestPlayer) {
            // Record the history length before processing the turn
            const historyLengthBeforeTurn = game.history.length;
            
            updatedGame = await processPlayerTurn(game, latestPlayer);
            
            // Only process NEW events added during this turn
            const newEvents = updatedGame.history.slice(historyLengthBeforeTurn);
            
            // Emit events to listeners
            const emitter = get().eventEmitter;
            for (const event of newEvents) {
              const flowEvent = mapGameEventToFlowEvent(event);
              if (flowEvent) {
                emitter.emit(flowEvent);
              }
            }
            
            // Check if there are more players
            const nextPlayerId = getNextPlayer(updatedGame);
            if (nextPlayerId) {
              updatedGame = { ...updatedGame, currentPlayerId: nextPlayerId };
              playerStore.setActivePlayer(nextPlayerId);
              
              // Continue to next player's turn
              set({ game: updatedGame });
              // Recursively process the next phase
              await get().proceedToNextPhase();
              return;
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

    // Record the history length before processing the turn
    const historyLengthBeforeTurn = game.history.length;

    // Process the player turn with the action
    const updatedGame = await processPlayerTurn(game, player);
    
    // Only process NEW events added during this turn
    const newEvents = updatedGame.history.slice(historyLengthBeforeTurn);
    
    // Emit events to listeners
    const emitter = get().eventEmitter;
    for (const event of newEvents) {
      const flowEvent = mapGameEventToFlowEvent(event);
      if (flowEvent) {
        emitter.emit(flowEvent);
      }
    }
    
    set({ game: updatedGame });
  },

  resetGame: () => {
    // イベントリスナーを停止
    const playerStore = usePlayerStore.getState();
    const dealerStore = useDealerStore.getState();
    
    playerStore.stopListeningToEvents();
    dealerStore.stopListeningToEvents();
    
    // ゲームをリセット
    set({ game: null });
  },

  setPhase: (phase: GamePhase) => {
    const { game } = get();
    if (!game) {
      throw new Error('Game not initialized');
    }
    
    // 開発・テスト用：フェーズを直接設定
    set({ game: { ...game, phase } });
  },

  getEventEmitter: () => {
    return get().eventEmitter;
  },
}));