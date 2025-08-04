import type { Brain } from '../brain/brain.types';

export type GameSetupConfig = {
  userId: string;
  userName: string;
  userChips: number;
  cpuCount: number;
  minBet: number;
  maxBet: number;
  deckCount: number;
};

export type CPUPlayerConfig = {
  id: string;
  name: string;
  brain: Brain;
  chips: number;
};

export type GameSetupState = {
  isGameActive: boolean;
  config: GameSetupConfig | null;
};

export type GameSetupActions = {
  setupGame: (config: GameSetupConfig) => void;
  startGame: () => void;
  endGame: () => void;
  resetSetup: () => void;
};

export type GameSetupStore = GameSetupState & GameSetupActions;