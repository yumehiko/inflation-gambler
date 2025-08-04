import { useGameSetupStore } from './gameSetup.store';
import type { GameSetupConfig } from './gameSetup.types';

export const useGameSetup = () => {
  const { 
    isGameActive, 
    config,
    setupGame,
    startGame,
    endGame,
    resetSetup,
  } = useGameSetupStore();

  const setupAndStartGame = async (gameConfig: GameSetupConfig) => {
    console.log('setupAndStartGame called');
    setupGame(gameConfig);
    console.log('setupGame completed');
    await startGame();
    console.log('startGame completed, isGameActive:', isGameActive);
  };

  return {
    isGameActive,
    config,
    setupGame,
    startGame,
    endGame,
    resetSetup,
    setupAndStartGame,
  };
};

export const getGameSetupAPI = () => {
  const store = useGameSetupStore.getState();
  
  return {
    setupGame: store.setupGame,
    startGame: store.startGame,
    endGame: store.endGame,
    resetSetup: store.resetSetup,
    isGameActive: () => store.isGameActive,
    getConfig: () => store.config,
  };
};