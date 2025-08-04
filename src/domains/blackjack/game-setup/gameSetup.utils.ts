import type { GameSetupConfig, CPUPlayerConfig } from './gameSetup.types';
import type { PlayerConfig, GameConfig } from '../game-flow/gameFlow.types';
import type { Brain } from '../brain/brain.types';
import { createHumanBrain, createRandomBrain, createBasicStrategyBrain } from '../brain/brain.utils';
import { createHumanResolver } from '../brain/humanBrain.utils';

export const validateSetupConfig = (config: GameSetupConfig): boolean => {
  if (config.cpuCount < 0 || config.cpuCount > 5) {
    return false;
  }
  
  if (config.userChips < config.minBet) {
    return false;
  }
  
  if (config.maxBet < config.minBet) {
    return false;
  }
  
  return true;
};

export const getRandomCPUName = (existingNames: string[]): string => {
  const prefixes = ['Bot', 'AI', 'CPU', 'Player'];
  let attempt = 0;
  
  while (attempt < 1000) {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(Math.random() * 100) + 1;
    const name = `${prefix} ${number}`;
    
    if (!existingNames.includes(name)) {
      return name;
    }
    
    attempt++;
  }
  
  // フォールバック: タイムスタンプを使用
  return `CPU ${Date.now()}`;
};

export const getRandomCPUBrain = (): Brain => {
  const brainTypes = ['random', 'basic'] as const;
  const type = brainTypes[Math.floor(Math.random() * brainTypes.length)];
  
  switch (type) {
    case 'basic':
      return createBasicStrategyBrain();

    default:
      return createRandomBrain();
  }
};

export const getRandomCPUChips = (): number => {
  // 500から3000の範囲で100の倍数を返す
  const min = 5;
  const max = 30;
  const multiplier = 100;
  
  return (Math.floor(Math.random() * (max - min + 1)) + min) * multiplier;
};

export const generateCPUPlayers = (count: number): CPUPlayerConfig[] => {
  const players: CPUPlayerConfig[] = [];
  const usedNames: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const name = getRandomCPUName(usedNames);
    usedNames.push(name);
    
    players.push({
      id: `cpu-${i + 1}`,
      name,
      brain: getRandomCPUBrain(),
      chips: getRandomCPUChips(),
    });
  }
  
  return players;
};

export const createPlayerConfigs = (setupConfig: GameSetupConfig): PlayerConfig[] => {
  const configs: PlayerConfig[] = [];
  
  // ユーザーを最初に追加
  configs.push({
    id: setupConfig.userId,
    name: setupConfig.userName,
    brain: createHumanBrain(createHumanResolver()),
    initialChips: setupConfig.userChips,
  });
  
  // CPUプレイヤーを追加
  const cpuPlayers = generateCPUPlayers(setupConfig.cpuCount);
  cpuPlayers.forEach((cpu) => {
    configs.push({
      id: cpu.id,
      name: cpu.name,
      brain: cpu.brain,
      initialChips: cpu.chips,
    });
  });
  
  return configs;
};

export const createGameConfig = (setupConfig: GameSetupConfig): GameConfig => {
  return {
    playerConfigs: createPlayerConfigs(setupConfig),
    minBet: setupConfig.minBet,
    maxBet: setupConfig.maxBet,
    deckCount: setupConfig.deckCount,
  };
};