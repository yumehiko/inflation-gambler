import { describe, expect, it, vi } from 'vitest';
import { 
  generateCPUPlayers,
  createPlayerConfigs,
  createGameConfig,
  validateSetupConfig,
  getRandomCPUName,
  getRandomCPUBrain,
  getRandomCPUChips,
} from './gameSetup.utils';
import type { GameSetupConfig } from './gameSetup.types';

vi.mock('../brain/brain.utils', () => ({
  createHumanBrain: vi.fn().mockReturnValue({
    type: 'human',
    makeDecision: vi.fn(),
    decideBet: vi.fn(),
  }),
  createRandomBrain: vi.fn().mockReturnValue({
    type: 'random',
    makeDecision: vi.fn(),
    decideBet: vi.fn(),
  }),
  createBasicStrategyBrain: vi.fn().mockReturnValue({
    type: 'basic',
    makeDecision: vi.fn(),
    decideBet: vi.fn(),
  }),
}));

describe('gameSetup.utils', () => {
  describe('validateSetupConfig', () => {
    it('有効な設定の場合trueを返す', () => {
      const config: GameSetupConfig = {
        userId: 'user-1',
        userName: 'Player',
        userChips: 1000,
        cpuCount: 3,
        minBet: 10,
        maxBet: 1000,
        deckCount: 6,
      };
      
      expect(validateSetupConfig(config)).toBe(true);
    });
    
    it('CPUカウントが0未満の場合falseを返す', () => {
      const config: GameSetupConfig = {
        userId: 'user-1',
        userName: 'Player',
        userChips: 1000,
        cpuCount: -1,
        minBet: 10,
        maxBet: 1000,
        deckCount: 6,
      };
      
      expect(validateSetupConfig(config)).toBe(false);
    });
    
    it('CPUカウントが5を超える場合falseを返す', () => {
      const config: GameSetupConfig = {
        userId: 'user-1',
        userName: 'Player',
        userChips: 1000,
        cpuCount: 6,
        minBet: 10,
        maxBet: 1000,
        deckCount: 6,
      };
      
      expect(validateSetupConfig(config)).toBe(false);
    });
    
    it('ユーザーチップが最小ベット未満の場合falseを返す', () => {
      const config: GameSetupConfig = {
        userId: 'user-1',
        userName: 'Player',
        userChips: 5,
        cpuCount: 3,
        minBet: 10,
        maxBet: 1000,
        deckCount: 6,
      };
      
      expect(validateSetupConfig(config)).toBe(false);
    });
    
    it('最大ベットが最小ベット未満の場合falseを返す', () => {
      const config: GameSetupConfig = {
        userId: 'user-1',
        userName: 'Player',
        userChips: 1000,
        cpuCount: 3,
        minBet: 100,
        maxBet: 50,
        deckCount: 6,
      };
      
      expect(validateSetupConfig(config)).toBe(false);
    });
  });
  
  describe('getRandomCPUName', () => {
    it('既存の名前と重複しない名前を返す', () => {
      const existingNames = ['Bot 1', 'Bot 2'];
      const name = getRandomCPUName(existingNames);
      
      expect(existingNames).not.toContain(name);
      expect(name).toMatch(/^(Bot|AI|CPU|Player) \d+$/);
    });
    
    it('全ての名前が使用済みの場合、ユニークな名前を生成する', () => {
      const existingNames = Array.from({ length: 100 }, (_, i) => `Bot ${i + 1}`);
      const name = getRandomCPUName(existingNames);
      
      expect(existingNames).not.toContain(name);
      expect(name).toBeTruthy();
    });
  });
  
  describe('getRandomCPUBrain', () => {
    it('有効なBrainオブジェクトを返す', () => {
      const brain = getRandomCPUBrain();
      
      expect(brain).toHaveProperty('type');
      expect(brain).toHaveProperty('makeDecision');
      expect(brain).toHaveProperty('decideBet');
      expect(['random', 'basic']).toContain(brain.type);
    });
  });
  
  describe('getRandomCPUChips', () => {
    it('500から3000の範囲で100の倍数を返す', () => {
      const chips = getRandomCPUChips();
      
      expect(chips).toBeGreaterThanOrEqual(500);
      expect(chips).toBeLessThanOrEqual(3000);
      expect(chips % 100).toBe(0);
    });
  });
  
  describe('generateCPUPlayers', () => {
    it('指定された数のCPUプレイヤーを生成する', () => {
      const players = generateCPUPlayers(3);
      
      expect(players).toHaveLength(3);
      players.forEach((player, index) => {
        expect(player.id).toBe(`cpu-${index + 1}`);
        expect(player.name).toMatch(/^(Bot|AI|CPU|Player) \d+$/);
        expect(player.brain).toBeTruthy();
        expect(player.chips).toBeGreaterThanOrEqual(500);
        expect(player.chips).toBeLessThanOrEqual(3000);
      });
    });
    
    it('0人の場合空配列を返す', () => {
      const players = generateCPUPlayers(0);
      
      expect(players).toEqual([]);
    });
    
    it('各CPUプレイヤーは異なる名前を持つ', () => {
      const players = generateCPUPlayers(5);
      const names = players.map(p => p.name);
      const uniqueNames = new Set(names);
      
      expect(uniqueNames.size).toBe(5);
    });
  });
  
  describe('createPlayerConfigs', () => {
    it('ユーザーとCPUプレイヤーの設定を作成する', () => {
      const setupConfig: GameSetupConfig = {
        userId: 'user-1',
        userName: 'Player',
        userChips: 1000,
        cpuCount: 2,
        minBet: 10,
        maxBet: 1000,
        deckCount: 6,
      };
      
      const configs = createPlayerConfigs(setupConfig);
      
      expect(configs).toHaveLength(3);
      
      // ユーザー設定の確認
      expect(configs[0]).toEqual({
        id: 'user-1',
        name: 'Player',
        brain: expect.objectContaining({ type: 'human' }),
        initialChips: 1000,
      });
      
      // CPUプレイヤー設定の確認
      expect(configs[1].id).toBe('cpu-1');
      expect(configs[2].id).toBe('cpu-2');
    });
  });
  
  describe('createGameConfig', () => {
    it('ゲーム設定を作成する', () => {
      const setupConfig: GameSetupConfig = {
        userId: 'user-1',
        userName: 'Player',
        userChips: 1000,
        cpuCount: 2,
        minBet: 10,
        maxBet: 1000,
        deckCount: 6,
      };
      
      const gameConfig = createGameConfig(setupConfig);
      
      expect(gameConfig).toEqual({
        playerConfigs: expect.any(Array),
        minBet: 10,
        maxBet: 1000,
        deckCount: 6,
      });
      
      expect(gameConfig.playerConfigs).toHaveLength(3);
    });
  });
});