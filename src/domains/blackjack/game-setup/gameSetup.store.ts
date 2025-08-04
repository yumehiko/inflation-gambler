import { create } from 'zustand';
import type { GameSetupStore, GameSetupConfig } from './gameSetup.types';
import { validateSetupConfig, createGameConfig } from './gameSetup.utils';
import { getGameFlowAPI } from '../game-flow/gameFlow.hook';

export const useGameSetupStore = create<GameSetupStore>((set, get) => ({
  isGameActive: false,
  config: null,
  
  setupGame: (config: GameSetupConfig) => {
    if (!validateSetupConfig(config)) {
      throw new Error('Invalid game setup configuration');
    }
    
    set({ config });
  },
  
  startGame: async () => {
    const { config } = get();
    
    if (!config) {
      throw new Error('Game setup not configured');
    }
    
    // 先にゲームをアクティブにする
    set({ isGameActive: true });
    console.log('Game is now active');
    
    // GameConfigを作成してGameFlowを初期化
    const gameConfig = createGameConfig(config);
    const gameFlowAPI = getGameFlowAPI();
    await gameFlowAPI.startNewGame(gameConfig);
    
    // ベット収集フェーズを開始
    await gameFlowAPI.proceedGame();
  },
  
  endGame: () => {
    set({ isGameActive: false });
  },
  
  resetSetup: () => {
    set({
      isGameActive: false,
      config: null,
    });
  },
}));