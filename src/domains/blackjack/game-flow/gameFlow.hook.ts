import { useGameFlowStore } from './gameFlow.store';
import { GameConfig, GamePhase } from './gameFlow.types';

export const useGameFlow = () => {
  const {
    game,
    initializeGame,
    startGame,
    proceedToNextPhase,
    handlePlayerAction,
    resetGame,
    getEventEmitter,
  } = useGameFlowStore();

  const isGameComplete = game?.phase === 'finished' || false;
  const currentPhase = game?.phase || null;

  return {
    game,
    initializeGame,
    startGame,
    proceedToNextPhase,
    handlePlayerAction,
    resetGame,
    isGameComplete,
    currentPhase,
    getEventEmitter,
  };
};

// 非Reactコンテキスト用のAPI
export const getGameFlowAPI = () => {
  const store = useGameFlowStore.getState();

  return {
    startNewGame: async (config: GameConfig): Promise<void> => {
      store.initializeGame(config);
      await store.startGame();
    },
    getCurrentPhase: (): GamePhase | null => {
      return store.game?.phase || null;
    },
    proceedGame: async (): Promise<void> => {
      await store.proceedToNextPhase();
    },
    getEventEmitter: () => {
      return store.getEventEmitter();
    },
  };
};