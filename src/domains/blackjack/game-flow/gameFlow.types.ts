import { Card } from '../../core/card/card.types';
import { Brain } from '../brain/brain.types';
import { Decision } from '../brain/brain.types';

export type GamePhase = 
  | 'waiting'      // ゲーム開始待ち
  | 'betting'      // ベット受付中
  | 'dealing'      // カード配布中
  | 'playing'      // プレイヤーアクション中
  | 'dealerTurn'   // ディーラーターン
  | 'settlement'   // 精算中
  | 'finished';    // ゲーム終了

export type GameFlow = {
  readonly id: string;
  readonly phase: GamePhase;
  readonly playerIds: string[];
  readonly dealerId: string;
  readonly currentPlayerId: string | null;
  readonly deck: Card[];
  readonly history: GameEvent[];
};

export type GameEvent = 
  | { type: 'game_started'; timestamp: number }
  | { type: 'bet_placed'; playerId: string; amount: number; timestamp: number }
  | { type: 'card_dealt'; receiverId: string; card: Card; timestamp: number }
  | { type: 'blackjack_checked'; playerId: string; hasBlackjack: boolean; timestamp: number }
  | { type: 'player_action'; playerId: string; action: Decision; timestamp: number }
  | { type: 'player_busted'; playerId: string; timestamp: number }
  | { type: 'dealer_turn_started'; timestamp: number }
  | { type: 'settlement_completed'; results: SettlementResult[]; timestamp: number };

export type SettlementResult = {
  playerId: string;
  outcome: 'win' | 'lose' | 'push' | 'blackjack';
  payout: number;
};

export type GameConfig = {
  playerConfigs: PlayerConfig[];
  minBet: number;
  maxBet: number;
  deckCount: number;
};

export type PlayerConfig = {
  id: string;
  name: string;
  brain: Brain;
  initialChips: number;
};